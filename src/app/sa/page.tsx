"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Mail,
  Hash,
  RefreshCw,
  LogOut,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRICING } from "@/config/pricing";

export default function SaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<
    {
      id: string;
      email: string;
      apiKey: string | null;
      blockedAdmin: boolean;
      blockedApiKey: boolean;
      planKey?: keyof typeof PRICING;
      creditsUnits?: number;
      leadsUnits?: number;
      usage?: { creditsUsed: number; leadsUsed: number };
      limits?: { creditMonthlyLimit: number; leadTotalLimit: number };
    }[]
  >([]);
  const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [planForms, setPlanForms] = useState<
    Record<
      string,
      {
        planKey: keyof typeof PRICING;
        creditsUnits: number;
        leadsUnits: number;
        saving: boolean;
      }
    >
  >({});

  const isDirty = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    const form = planForms[id];
    if (!account || !form) return false;

    return (
      form.planKey !== (account.planKey || "free") ||
      form.creditsUnits !== (account.creditsUnits || 0) ||
      form.leadsUnits !== (account.leadsUnits || 0)
    );
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sa/accounts", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const newAccounts = data.accounts || [];
        setAccounts(newAccounts);

        const forms: Record<string, any> = {};
        newAccounts.forEach((a: any) => {
          forms[a.id] = {
            planKey: a.planKey || "free",
            creditsUnits: a.creditsUnits || 0,
            leadsUnits: a.leadsUnits || 0,
            saving: false,
          };
        });
        setPlanForms(forms);

        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const setFormValue = (
    adminId: string,
    values: Partial<{
      planKey: keyof typeof PRICING;
      creditsUnits: number;
      leadsUnits: number;
      saving: boolean;
    }>,
  ) => {
    setPlanForms((prev) => {
      const base = prev[adminId] || {
        planKey: "free",
        creditsUnits: 0,
        leadsUnits: 0,
        saving: false,
      };
      return { ...prev, [adminId]: { ...base, ...values } };
    });
  };

  const applyPlan = async (adminId: string) => {
    const form = planForms[adminId] || {
      planKey: "free" as keyof typeof PRICING,
      creditsUnits: 0,
      leadsUnits: 0,
      saving: false,
    };
    setFormValue(adminId, { saving: true });
    setError("");
    try {
      const res = await fetch("/api/sa/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adminId,
          planKey: form.planKey,
          creditsUnits: form.creditsUnits,
          leadsUnits: form.leadsUnits,
        }),
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.error || "Plan update failed");
      }
    } catch {
      setError("Plan update failed");
    } finally {
      setFormValue(adminId, { saving: false });
    }
  };

  const discontinueAccount = async (adminId: string) => {
    if (
      !confirm(
        "Are you sure you want to discontinue this account? This will cancel any active subscription and rename the email.",
      )
    ) {
      return;
    }

    setFormValue(adminId, { saving: true });
    setError("");
    try {
      const res = await fetch("/api/sa/accounts/discontinue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminId }),
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.error || "Discontinue failed");
      }
    } catch {
      setError("Discontinue failed");
    } finally {
      setFormValue(adminId, { saving: false });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sa/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = async (opts: {
    adminId?: string;
    apiKey?: string;
    action: "block" | "unblock";
  }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sa/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(opts),
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm bg-white shadow-xl border border-slate-100 rounded-2xl p-8 transition-all hover:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Super Admin
          </h1>
          <p className="text-center text-slate-500 mb-6 text-sm">
            Sign in to manage accounts
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Super Admin
            </h1>
            <p className="text-slate-500 mt-1">
              Manage users and API access controls
            </p>
          </div>
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats / Search Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Accounts
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {accounts.length}
              </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="relative h-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              Account List
            </h2>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredAccounts.length} results
            </span>
          </div>

          <div className="p-0">
            {loading && accounts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
                <p>Loading accounts...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>No accounts found matching "{searchTerm}"</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Account Details</th>
                        <th className="px-6 py-4">API Key Status</th>
                        <th className="px-6 py-4">Account Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAccounts.map((a) => (
                        <React.Fragment key={a.id}>
                          <tr className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleRow(a.id)}
                                className="flex items-center gap-3 w-full text-left group/btn"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-600 transition-colors">
                                  {a.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 flex items-center gap-2">
                                    {a.email}
                                    {expandedRows.has(a.id) ? (
                                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                                  <Key className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">
                                    {a.apiKey || "No Key"}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit flex items-center gap-1 ${
                                    a.blockedApiKey
                                      ? "bg-red-50 text-red-700 border border-red-100"
                                      : "bg-white text-slate-600 border border-slate-200"
                                  }`}
                                >
                                  {a.blockedApiKey ? (
                                    <>
                                      <Lock className="w-3 h-3" /> Blocked
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      Active
                                    </>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
                                  a.blockedAdmin
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-white text-slate-600 border-slate-200"
                                }`}
                              >
                                {a.blockedAdmin ? (
                                  <>
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Blocked
                                  </>
                                ) : (
                                  <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Active
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 transition-opacity">
                                {a.blockedAdmin ? (
                                  <button
                                    onClick={() =>
                                      updateBlock({
                                        adminId: a.id,
                                        action: "unblock",
                                      })
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    Unblock Acct
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      updateBlock({
                                        adminId: a.id,
                                        action: "block",
                                      })
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                                  >
                                    <Lock className="w-3 h-3" />
                                    Block Acct
                                  </button>
                                )}

                                {a.apiKey &&
                                  (a.blockedApiKey ? (
                                    <button
                                      onClick={() =>
                                        updateBlock({
                                          apiKey: a.apiKey!,
                                          action: "unblock",
                                        })
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm"
                                    >
                                      <Key className="w-3 h-3" />
                                      Enable Key
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        updateBlock({
                                          apiKey: a.apiKey!,
                                          action: "block",
                                        })
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all shadow-sm"
                                    >
                                      <Key className="w-3 h-3" />
                                      Disable Key
                                    </button>
                                  ))}
                                {!a.email.startsWith("DIS_") && (
                                  <button
                                    onClick={() => discontinueAccount(a.id)}
                                    disabled={planForms[a.id]?.saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                    Discontinue
                                  </button>
                                )}
                              </div>
                              <div className="mt-3 flex flex-col items-end gap-3">
                                <div className="flex items-end gap-2">
                                  <div className="flex flex-col text-left gap-1">
                                    <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                      Plan
                                    </label>
                                    <select
                                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs h-[34px]"
                                      value={
                                        (planForms[a.id]?.planKey as string) ||
                                        "free"
                                      }
                                      onChange={(e) =>
                                        setFormValue(a.id, {
                                          planKey: e.target
                                            .value as keyof typeof PRICING,
                                        })
                                      }
                                    >
                                      {(
                                        Object.keys(PRICING) as Array<
                                          keyof typeof PRICING
                                        >
                                      ).map((k) => (
                                        <option key={k} value={k}>
                                          {PRICING[k].name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex flex-col text-left gap-1">
                                    <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                      Add Credits{" "}
                                      <span className="normal-case">
                                        (x<span className="font-bold">1k</span>)
                                      </span>
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs h-[34px]"
                                      placeholder="0"
                                      value={planForms[a.id]?.creditsUnits ?? 0}
                                      onChange={(e) =>
                                        setFormValue(a.id, {
                                          creditsUnits: Math.max(
                                            0,
                                            Number(e.target.value) || 0,
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col text-left gap-1">
                                    <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                      Add Leads{" "}
                                      <span className="normal-case">
                                        (x<span className="font-bold">1k</span>)
                                      </span>
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs h-[34px]"
                                      placeholder="0"
                                      value={planForms[a.id]?.leadsUnits ?? 0}
                                      onChange={(e) =>
                                        setFormValue(a.id, {
                                          leadsUnits: Math.max(
                                            0,
                                            Number(e.target.value) || 0,
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 w-full">
                                  <button
                                    onClick={() => applyPlan(a.id)}
                                    disabled={
                                      planForms[a.id]?.saving || !isDirty(a.id)
                                    }
                                    className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-all h-[34px] whitespace-nowrap shrink-0 ${
                                      isDirty(a.id)
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    }`}
                                  >
                                    {planForms[a.id]?.saving
                                      ? "Saving..."
                                      : "Apply Changes"}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                          {expandedRows.has(a.id) && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={4} className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                      Account ID
                                    </p>
                                    <p className="text-sm font-mono text-slate-700 select-all">
                                      {a.id}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                      Subscription Plan
                                    </p>
                                    <p className="text-sm font-medium text-slate-900 capitalize">
                                      {PRICING[a.planKey || "free"]?.name ||
                                        "Free"}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                      Leads Used
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                      {a.usage?.leadsUsed || 0} /{" "}
                                      {a.limits?.leadTotalLimit === Infinity
                                        ? "∞"
                                        : a.limits?.leadTotalLimit || 0}
                                    </p>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            ((a.usage?.leadsUsed || 0) /
                                              (a.limits?.leadTotalLimit || 1)) *
                                              100,
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                      Credits Used
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                      {a.usage?.creditsUsed || 0} /{" "}
                                      {a.limits?.creditMonthlyLimit || 0}
                                    </p>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            ((a.usage?.creditsUsed || 0) /
                                              (a.limits?.creditMonthlyLimit ||
                                                1)) *
                                              100,
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredAccounts.map((a) => (
                    <div key={a.id} className="p-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 text-lg">
                            {a.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {a.email}
                            </div>
                            <div className="text-xs text-slate-500 font-mono break-all">
                              {a.id}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1.5 ${
                            a.blockedAdmin
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {a.blockedAdmin ? (
                            "Blocked"
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Active
                            </>
                          )}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" /> API Key
                          </span>
                          <span
                            className={`font-medium ${
                              a.blockedApiKey
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {a.blockedApiKey ? "Disabled" : "Active"}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-600 bg-white px-2 py-1.5 rounded border border-slate-100 break-all">
                          {a.apiKey || "No API Key Generated"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {a.blockedAdmin ? (
                          <button
                            onClick={() =>
                              updateBlock({ adminId: a.id, action: "unblock" })
                            }
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                          >
                            <Unlock className="w-4 h-4" /> Unblock Acct
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateBlock({ adminId: a.id, action: "block" })
                            }
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                          >
                            <Lock className="w-4 h-4" /> Block Acct
                          </button>
                        )}

                        {a.apiKey &&
                          (a.blockedApiKey ? (
                            <button
                              onClick={() =>
                                updateBlock({
                                  apiKey: a.apiKey!,
                                  action: "unblock",
                                })
                              }
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                            >
                              <Key className="w-4 h-4" /> Enable Key
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updateBlock({
                                  apiKey: a.apiKey!,
                                  action: "block",
                                })
                              }
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors"
                            >
                              <Key className="w-4 h-4" /> Disable Key
                            </button>
                          ))}

                        {!a.email.startsWith("DIS_") && (
                          <button
                            onClick={() => discontinueAccount(a.id)}
                            disabled={planForms[a.id]?.saving}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" /> Discontinue
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <select
                          className="border border-slate-200 rounded-lg px-2 py-2 text-sm"
                          value={(planForms[a.id]?.planKey as string) || "free"}
                          onChange={(e) =>
                            setFormValue(a.id, {
                              planKey: e.target.value as keyof typeof PRICING,
                            })
                          }
                        >
                          {(
                            Object.keys(PRICING) as Array<keyof typeof PRICING>
                          ).map((k) => (
                            <option key={k} value={k}>
                              {PRICING[k].name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          className="border border-slate-200 rounded-lg px-2 py-2 text-sm"
                          placeholder="Credits x1k"
                          value={planForms[a.id]?.creditsUnits ?? 0}
                          onChange={(e) =>
                            setFormValue(a.id, {
                              creditsUnits: Math.max(
                                0,
                                Number(e.target.value) || 0,
                              ),
                            })
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          className="border border-slate-200 rounded-lg px-2 py-2 text-sm"
                          placeholder="Leads x1k"
                          value={planForms[a.id]?.leadsUnits ?? 0}
                          onChange={(e) =>
                            setFormValue(a.id, {
                              leadsUnits: Math.max(
                                0,
                                Number(e.target.value) || 0,
                              ),
                            })
                          }
                        />
                        <button
                          onClick={() => applyPlan(a.id)}
                          disabled={planForms[a.id]?.saving}
                          className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                        >
                          {planForms[a.id]?.saving ? "Saving..." : "Apply Plan"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {error && (
            <div className="p-4 bg-red-50 border-t border-red-100 text-sm text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
