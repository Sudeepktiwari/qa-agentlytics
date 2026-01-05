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
const PRICING = {
  free: {
    name: "Free",
    price: "$0",
    id: "free",
    amount: 0,
    totalLeads: 20,
    creditsPerMonth: 500,
  },
  growth: {
    name: "Growth",
    price: "$49",
    id: "growth",
    amount: 49,
    totalLeads: 25_000,
    creditsPerMonth: 7_000,
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH,
  },
  scale: {
    name: "Scale",
    price: "$99",
    id: "scale",
    amount: 99,
    totalLeads: 100_000,
    creditsPerMonth: 16_000,
    razorpayPlanId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_SCALE,
  },
} as const;

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
  const [currentPlan, setCurrentPlan] = useState("free"); // In a real app, fetch this from API

  const handleSubscribe = async (planKey: keyof typeof PRICING) => {
    if (planKey === "free") return;
    if (!email) {
      alert("Please log in to subscribe");
      return;
    }

    setLoading(true);
    const plan = PRICING[planKey] as any;

    try {
      if (!plan.razorpayPlanId) {
        throw new Error("Subscription plan ID not configured");
      }

      // 1. Create Subscription
      const res = await fetch("/api/admin/subscription/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.razorpayPlanId }),
      });

      const subscription = await res.json();

      if (!res.ok) throw new Error(subscription.error);

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Agentlytics",
        description: `${plan.name} Plan Subscription`,
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
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert("Subscription successful!");
              setCurrentPlan(planKey);
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
                  <span>{plan.totalLeads.toLocaleString()} Leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Sparkles" />
                  <span>
                    {plan.creditsPerMonth.toLocaleString()} Credits/mo
                  </span>
                </div>
              </div>

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
