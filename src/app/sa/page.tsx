"use client";

import { useEffect, useState } from "react";

export default function SaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<
    { id: string; email: string; apiKey: string | null; blockedAdmin: boolean; blockedApiKey: boolean }[]
  >([]);
  const [authorized, setAuthorized] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sa/accounts", { method: "GET", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
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

  const updateBlock = async (opts: { adminId?: string; apiKey?: string; action: "block" | "unblock" }) => {
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

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm bg-white shadow-sm border border-slate-200 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-4">Super Admin Login</h1>
          <div className="space-y-3">
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Super Admin</h1>
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="px-3 py-2 text-sm bg-slate-800 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Accounts</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-sm text-slate-600">Loading...</p>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-slate-600">No accounts found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="p-2">Admin ID</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">API Key</th>
                      <th className="p-2">Admin Block</th>
                      <th className="p-2">API Key Block</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => (
                      <tr key={a.id} className="border-t border-slate-100">
                        <td className="p-2 font-mono">{a.id}</td>
                        <td className="p-2">{a.email}</td>
                        <td className="p-2 font-mono">{a.apiKey || "-"}</td>
                        <td className="p-2">
                          <span
                            className={
                              a.blockedAdmin
                                ? "px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"
                                : "px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                            }
                          >
                            {a.blockedAdmin ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="p-2">
                          <span
                            className={
                              a.blockedApiKey
                                ? "px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"
                                : "px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                            }
                          >
                            {a.blockedApiKey ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            {a.blockedAdmin ? (
                              <button
                                onClick={() => updateBlock({ adminId: a.id, action: "unblock" })}
                                className="px-2 py-1 text-xs bg-slate-200 rounded"
                              >
                                Unblock Account
                              </button>
                            ) : (
                              <button
                                onClick={() => updateBlock({ adminId: a.id, action: "block" })}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                              >
                                Block Account
                              </button>
                            )}
                            {a.apiKey &&
                              (a.blockedApiKey ? (
                                <button
                                  onClick={() => updateBlock({ apiKey: a.apiKey!, action: "unblock" })}
                                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                                >
                                  Unblock API Key
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateBlock({ apiKey: a.apiKey!, action: "block" })}
                                  className="px-2 py-1 text-xs bg-amber-600 text-white rounded"
                                >
                                  Block API Key
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
