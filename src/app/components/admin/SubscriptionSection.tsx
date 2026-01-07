"use client";

import React, { useState } from "react";
import Script from "next/script";

// -----------------------------
// Razorpay Type Definition
// -----------------------------
declare global {
  interface Window {
    Razorpay: any;
  }
}

// -----------------------------
// Pricing Configuration (Mirrors /pricing)
// -----------------------------
import { PRICING, CREDIT_ADDONS, LEAD_ADDONS } from "@/config/pricing";

// -----------------------------
// Icons
// -----------------------------
function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const icons: any = {
    Check: <path d="M20 6L9 17l-5-5" />,
    Users: (
      <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 3.1a4 4 0 0 1 0 7.8 M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z M20 21v-2a4 4 0 0 0-3-3.87" />
    ),
    Sparkles: (
      <path d="M12 2l1.2 3.6L17 7l-3.8 1.4L12 12l-1.2-3.6L7 7l3.8-1.4L12 2z M19 12l.7 2.1L22 15l-2.3.9L19 18l-.7-2.1L16 15l2.3-.9L19 12z" />
    ),
    Shield: <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
}

// -----------------------------
// UI Components
// -----------------------------
function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: any) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: any) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function SubscriptionSection({ email }: { email?: string }) {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usage, setUsage] = useState<{
    leads: number;
    leadsLimit: number;
    limitReached: boolean;
    credits: number;
  } | null>(null);

  // Add-on State per plan
  const [planAddons, setPlanAddons] = useState<
    Record<string, { creditAmount: number; leadAmount: number }>
  >({});

  const getAddons = (planKey: string) => {
    return (
      planAddons[planKey] || {
        creditAmount: 0,
        leadAmount: 0,
      }
    );
  };

  const updateAddon = (
    planKey: string,
    type: "creditAmount" | "leadAmount",
    value: number
  ) => {
    setPlanAddons((prev) => ({
      ...prev,
      [planKey]: {
        ...getAddons(planKey),
        [type]: value,
      },
    }));
  };

  React.useEffect(() => {
    fetch("/api/admin/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.usage) setUsage(data.usage);
        if (data.plan) setCurrentPlan(data.plan);
      })
      .catch((err) =>
        console.error("Failed to fetch subscription status:", err)
      );
  }, []);

  const handleSubscribe = async (planKey: keyof typeof PRICING) => {
    if (planKey === "free") return;
    if (!email) {
      alert("Please log in to subscribe");
      return;
    }

    setLoading(true);
    const plan = PRICING[planKey] as any;

    // Calculate Add-on Quantity (if any)
    const { creditAmount, leadAmount } = getAddons(planKey);

    const addonQuantity =
      creditAmount > 0
        ? Math.floor(creditAmount / CREDIT_ADDONS.UNIT_PRICE_USD)
        : 0;

    const leadAddonQuantity =
      leadAmount > 0 ? Math.floor(leadAmount / LEAD_ADDONS.UNIT_PRICE_USD) : 0;

    try {
      if (!plan.razorpayPlanId) {
        throw new Error("Subscription plan ID not configured");
      }

      // 1. Create Subscription
      const res = await fetch("/api/admin/subscription/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.razorpayPlanId,
          addonQuantity: addonQuantity,
          leadAddonQuantity: leadAddonQuantity,
        }),
      });

      const subscription = await res.json();

      if (!res.ok) throw new Error(subscription.error);

      // 2. Open Razorpay
      const descriptionParts = [`${plan.name} Plan`];
      if (addonQuantity > 0) {
        descriptionParts.push(
          `+ ${addonQuantity * CREDIT_ADDONS.UNIT_CREDITS} Credits`
        );
      }
      if (leadAddonQuantity > 0) {
        descriptionParts.push(
          `+ ${leadAddonQuantity * LEAD_ADDONS.UNIT_LEADS} Leads`
        );
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Agentlytics",
        image: window.location.origin + "/globe.svg",
        description: descriptionParts.join(", "),
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/admin/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planId: plan.id,
                email: email,
                addonQuantity: addonQuantity,
                leadAddonQuantity: leadAddonQuantity,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert("Subscription successful!");
              setCurrentPlan(planKey);
              setPlanAddons((prev) => ({
                ...prev,
                [planKey]: { creditAmount: 0, leadAmount: 0 },
              })); // Reset sliders
            } else {
              alert("Verification failed: " + verifyData.error);
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#2563EB",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to initiate subscription: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {usage && (
        <>
          {!usage.limitReached &&
            usage.leadsLimit > 0 &&
            usage.leads / usage.leadsLimit >= 0.8 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Approaching your lead limit
                  </p>
                  <Button
                    variant="primary"
                    className="h-8 px-3 text-xs"
                    onClick={() =>
                      handleSubscribe(
                        currentPlan === "free" ? "growth" : "scale"
                      )
                    }
                  >
                    Upgrade
                  </Button>
                </div>
                <p className="mt-1 text-xs">
                  {usage.leads.toLocaleString()} of{" "}
                  {usage.leadsLimit.toLocaleString()} lifetime leads used
                </p>
              </div>
            )}
          {usage.limitReached && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Lead limit reached</p>
                <Button
                  variant="primary"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    handleSubscribe(currentPlan === "free" ? "growth" : "scale")
                  }
                >
                  Upgrade
                </Button>
              </div>
              <p className="mt-1 text-xs">Upgrade to capture more leads</p>
            </div>
          )}
        </>
      )}

      {usage && (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Leads Generated
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {usage.leads}
              </span>
              <span className="text-sm text-gray-500">
                / {usage.leadsLimit === Infinity ? "∞" : usage.leadsLimit}
              </span>
            </div>
            {usage.limitReached && (
              <p className="mt-2 text-sm text-red-600">Lead limit reached</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Credit Usage</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {usage.credits}
              </span>
              <span className="text-sm text-gray-500">used this month</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Reset on{" "}
              {new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                1
              ).toLocaleDateString()}
            </p>
          </Card>
        </div>
      )}

      {/* --- Credit Add-on Slider --- */}
      {/* REMOVED GLOBAL SLIDER */}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          Subscription Plan
        </h2>
        <p className="text-sm text-slate-500">
          Manage your subscription and billing details
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(PRICING) as Array<keyof typeof PRICING>).map((key) => {
          const plan = PRICING[key];
          const isCurrent = currentPlan === key;
          const { creditAmount, leadAmount } = getAddons(key);
          const creditAddons =
            (creditAmount / CREDIT_ADDONS.UNIT_PRICE_USD) *
            CREDIT_ADDONS.UNIT_CREDITS;
          const leadAddons =
            (leadAmount / LEAD_ADDONS.UNIT_PRICE_USD) * LEAD_ADDONS.UNIT_LEADS;

          return (
            <Card
              key={key}
              className={`p-6 ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-3xl font-bold mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  </div>
                </div>
                {isCurrent && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Users" />
                  <span>
                    {(plan.totalLeads + leadAddons).toLocaleString()} Lifetime
                    Leads
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Sparkles" />
                  <span>
                    {(plan.creditsPerMonth + creditAddons).toLocaleString()}{" "}
                    Credits/mo
                  </span>
                </div>
              </div>

              {/* Sliders for Paid Plans */}
              {key !== "free" && (
                <div className="mb-6 space-y-4 pt-4 border-t border-gray-100">
                  {/* Credits Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-700">
                        Extra Credits
                      </span>
                      <span className="text-blue-600 font-bold">
                        +{creditAddons.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={CREDIT_ADDONS.MAX_AMOUNT_USD}
                      step={CREDIT_ADDONS.UNIT_PRICE_USD}
                      value={creditAmount}
                      onChange={(e) =>
                        updateAddon(key, "creditAmount", Number(e.target.value))
                      }
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      +${creditAmount}/mo
                    </div>
                  </div>

                  {/* Leads Slider (Scale Only) */}
                  {key === "scale" && (
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium text-gray-700">
                          Extra Leads
                        </span>
                        <span className="text-green-600 font-bold">
                          +{leadAddons.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={LEAD_ADDONS.MAX_AMOUNT_USD}
                        step={LEAD_ADDONS.UNIT_PRICE_USD}
                        value={leadAmount}
                        onChange={(e) =>
                          updateAddon(key, "leadAmount", Number(e.target.value))
                        }
                        className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        +${leadAmount}/one-time
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant={isCurrent ? "outline" : "primary"}
                className="w-full"
                disabled={isCurrent || loading}
                onClick={() => handleSubscribe(key)}
              >
                {isCurrent
                  ? "Active Plan"
                  : loading
                  ? "Processing..."
                  : `Upgrade to ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
