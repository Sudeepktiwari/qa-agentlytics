"use client";

import React, { useEffect, useState } from "react";
import { OnboardingSettings } from "@/lib/adminSettings";
import { parseCurlRegistrationSpec, redactHeadersForLog, extractBodyKeysFromCurl } from "@/lib/curl";

const OnboardingSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<OnboardingSettings>({
    enabled: false,
  });
  const [globalApiKey, setGlobalApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Doc-to-cURL UI state (Registration)
  const [docUrl, setDocUrl] = useState<string>("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [namespace, setNamespace] = useState<string>("docs");
  const [prompt, setPrompt] = useState<string>("");
  const [indexing, setIndexing] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [indexStatus, setIndexStatus] = useState<string>("");
  const [generatedCurl, setGeneratedCurl] = useState<string>("");
  const [hits, setHits] = useState<number>(0);
  const [regenRegistration, setRegenRegistration] = useState<boolean>(false);

  // Doc-to-cURL UI state (Authentication)
  const [authDocUrl, setAuthDocUrl] = useState<string>("");
  const [authDocFile, setAuthDocFile] = useState<File | null>(null);
  const [authNamespace, setAuthNamespace] = useState<string>("auth");
  const [authPrompt, setAuthPrompt] = useState<string>("");
  const [authIndexing, setAuthIndexing] = useState<boolean>(false);
  const [authGenerating, setAuthGenerating] = useState<boolean>(false);
  const [authIndexStatus, setAuthIndexStatus] = useState<string>("");
  const [authGeneratedCurl, setAuthGeneratedCurl] = useState<string>("");
  const [authHits, setAuthHits] = useState<number>(0);
  const [regenAuth, setRegenAuth] = useState<boolean>(false);

  // Doc-to-cURL UI state (Initial Setup)
  const [initialDocUrl, setInitialDocUrl] = useState<string>("");
  const [initialDocFile, setInitialDocFile] = useState<File | null>(null);
  const [initialNamespace, setInitialNamespace] =
    useState<string>("initial-setup");
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [initialIndexing, setInitialIndexing] = useState<boolean>(false);
  const [initialGenerating, setInitialGenerating] = useState<boolean>(false);
  const [initialIndexStatus, setInitialIndexStatus] = useState<string>("");
  const [initialGeneratedCurl, setInitialGeneratedCurl] = useState<string>("");
  const [initialHits, setInitialHits] = useState<number>(0);
  const [regenInitial, setRegenInitial] = useState<boolean>(false);

  // Collapsible sections state
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(false);
  const [authenticationOpen, setAuthenticationOpen] = useState<boolean>(false);
  const [initialSetupOpen, setInitialSetupOpen] = useState<boolean>(false);
  const [embedOpen, setEmbedOpen] = useState<boolean>(false);

  // Completion indicators for headings
  const registrationComplete =
    ((docUrl && docUrl.trim()) || !!docFile) &&
    !!(generatedCurl && generatedCurl.trim());
  const authenticationComplete =
    ((authDocUrl && authDocUrl.trim()) || !!authDocFile) &&
    !!(authGeneratedCurl && authGeneratedCurl.trim());
  const initialSetupComplete =
    ((initialDocUrl && initialDocUrl.trim()) || !!initialDocFile) &&
    !!(initialGeneratedCurl && initialGeneratedCurl.trim());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/onboarding?debug=true", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const ob = data.onboarding || { enabled: false };
          setSettings({ ...ob });
          if (ob.docsUrl) setDocUrl(ob.docsUrl);
          if ((ob as any).authDocsUrl) setAuthDocUrl((ob as any).authDocsUrl);
          if (ob.initialSetupDocsUrl) setInitialDocUrl(ob.initialSetupDocsUrl);
          try {
            console.groupCollapsed("[Onboarding] AI-derived registration spec (load)");
            console.log({
              docsUrl: ob.docsUrl || "",
              headers: (ob as any).registrationHeaders || [],
              body: (ob as any).registrationFields || [],
              response: (ob as any).registrationResponseFields || [],
              parsedBodyKeys: (ob as any).registrationParsed?.bodyKeys || [],
            });
            console.groupEnd();
          } catch {}
          try {
            if (Array.isArray((data as any).debug)) {
              console.groupCollapsed("[Onboarding] Derivation trace (load)");
              for (const entry of (data as any).debug) console.log(entry);
              console.groupEnd();
            }
          } catch {}
          try {
            console.groupCollapsed("[Onboarding] AI-derived auth spec (load)");
            console.log({
              docsUrl: (ob as any).authDocsUrl || "",
              headers: (ob as any).authHeaders || [],
              body: (ob as any).authFields || [],
              response: (ob as any).authResponseFields || [],
              parsedBodyKeys: (ob as any).authParsed?.bodyKeys || [],
            });
            console.groupEnd();
          } catch {}
          try {
            console.groupCollapsed("[Onboarding] AI-derived initial setup spec (load)");
            console.log({
              docsUrl: ob.initialSetupDocsUrl || "",
              headers: (ob as any).initialHeaders || [],
              body: (ob as any).initialFields || [],
              response: (ob as any).initialResponseFields || [],
              parsedBodyKeys: (ob as any).initialParsed?.bodyKeys || [],
            });
            console.groupEnd();
          } catch {}
        } else {
          setError(data.error || "Failed to load onboarding settings");
        }

        // Prefill API key for embed snippet using the admin API key
        try {
          const keyRes = await fetch("/api/auth/api-key", {
            credentials: "include",
          });
          if (keyRes.ok) {
            const keyData = await keyRes.json();
            if (keyData.apiKey) {
              setGlobalApiKey(keyData.apiKey);
            }
          }
        } catch (e) {
          // Non-fatal: embed will show placeholder if not available
        }
      } catch (e) {
        setError("Failed to load onboarding settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Save initial setup fields alongside canonical cURL
      const settingsToSave: any = {
        curlCommand: settings.curlCommand,
        authCurlCommand: (settings as any).authCurlCommand,
        initialSetupCurlCommand: (settings as any).initialSetupCurlCommand,
        docsUrl: docUrl,
        authDocsUrl: authDocUrl,
        initialSetupDocsUrl: initialDocUrl,
        apiBaseUrl: settings.apiBaseUrl,
        registerEndpoint: settings.registerEndpoint,
        method: settings.method,
        apiKey: settings.apiKey,
        authHeaderKey: settings.authHeaderKey,
        idempotencyKeyField: settings.idempotencyKeyField,
        rateLimit: settings.rateLimit,
        registrationFields: (settings as any).registrationFields,
        registrationHeaderFields: (settings as any).registrationHeaderFields,
        registrationHeaders: (settings as any).registrationHeaders,
        registrationResponseFields: (settings as any).registrationResponseFields,
        registrationResponseFieldDefs: (settings as any).registrationResponseFieldDefs,
        authFields: (settings as any).authFields,
        authHeaderFields: (settings as any).authHeaderFields,
        authHeaders: (settings as any).authHeaders,
        authResponseFields: (settings as any).authResponseFields,
        authResponseFieldDefs: (settings as any).authResponseFieldDefs,
        initialFields: (settings as any).initialFields,
        initialHeaderFields: (settings as any).initialHeaderFields,
        initialHeaders: (settings as any).initialHeaders,
        initialResponseFields: (settings as any).initialResponseFields,
        initialResponseFieldDefs: (settings as any).initialResponseFieldDefs,
        regenRegistration,
        regenAuth,
        regenInitial,
      };
      if (regenRegistration) delete settingsToSave.registrationFields;
      if (regenAuth) delete settingsToSave.authFields;
      if (regenInitial) delete settingsToSave.initialFields;
      const res = await fetch("/api/admin/onboarding?debug=true", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onboarding: settingsToSave, debug: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.onboarding);
        setSuccess("Onboarding settings saved successfully");
        setRegenRegistration(false);
        setRegenAuth(false);
        setRegenInitial(false);
        try {
          const ob = data.onboarding || {};
          console.groupCollapsed("[Onboarding] AI-derived specs (save)");
          console.log({
            registration: {
              docsUrl: ob.docsUrl || "",
              headers: (ob as any).registrationHeaders || [],
              body: (ob as any).registrationFields || [],
              response: (ob as any).registrationResponseFields || [],
              parsedBodyKeys: (ob as any).registrationParsed?.bodyKeys || [],
            },
            auth: {
              docsUrl: (ob as any).authDocsUrl || "",
              headers: (ob as any).authHeaders || [],
              body: (ob as any).authFields || [],
              response: (ob as any).authResponseFields || [],
              parsedBodyKeys: (ob as any).authParsed?.bodyKeys || [],
            },
            initial: {
              docsUrl: ob.initialSetupDocsUrl || "",
              headers: (ob as any).initialHeaders || [],
              body: (ob as any).initialFields || [],
              response: (ob as any).initialResponseFields || [],
              parsedBodyKeys: (ob as any).initialParsed?.bodyKeys || [],
            },
          });
          console.groupEnd();
        } catch {}
        try {
          if (Array.isArray((data as any).debug)) {
            console.groupCollapsed("[Onboarding] Derivation trace (save)");
            for (const entry of (data as any).debug) console.log(entry);
            console.groupEnd();
          }
        } catch {}
        setTimeout(() => setSuccess(null), 2500);
      } else {
        setError(data.error || "Failed to save onboarding settings");
      }
    } catch (e) {
      setError("Failed to save onboarding settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setDocFile(files[0]);
    } else {
      setDocFile(null);
    }
  };

  const handleInitialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setInitialDocFile(files[0]);
    } else {
      setInitialDocFile(null);
    }
  };

  const handleAuthFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setAuthDocFile(files[0]);
    } else {
      setAuthDocFile(null);
    }
  };

  const indexDocs = async () => {
    try {
      setError(null);
      setSuccess(null);
      setGeneratedCurl("");
      setIndexStatus("");
      setHits(0);
      setIndexing(true);

      const form = new FormData();
      if (docUrl && docUrl.trim()) form.append("url", docUrl.trim());
      if (docFile) form.append("file", docFile);
      form.append("namespace", namespace || "docs");

      const indexRes = await fetch("/api/index", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const indexJson = await indexRes.json();
      if (!indexRes.ok || !indexJson.ok) {
        throw new Error(indexJson.error || "Failed to index docs");
      }
      setIndexStatus(
        `Indexed ${indexJson.count} chunks from ${indexJson.source}`
      );
    } catch (e: any) {
      setError(e?.message || "Failed to index docs");
    } finally {
      setIndexing(false);
    }

    // Auto-trigger generation
    try {
      setGenerating(true);
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: prompt || "Generate a canonical registration cURL",
          namespace,
          topK: 5,
        }),
      });
      const genJson = await genRes.json();
      if (!genRes.ok || !genJson.success) {
        throw new Error(genJson.error || "Failed to generate cURL");
      }
      setGeneratedCurl(genJson.curl || "");
      setHits(genJson.hits || 0);
      // Auto-populate the cURL field for saving and generate fields if empty
      setSettings((prev) => {
        const next: any = {
          ...prev,
          curlCommand: genJson.curl || prev.curlCommand,
          registrationParsed: (genJson.parsed || (prev as any).registrationParsed) as any,
        };
        const hasNoFields = !((prev as any).registrationFields) || ((prev as any).registrationFields || []).length === 0;
        if (hasNoFields && (genJson.curl || "").length > 0) {
          // Do not derive fields from cURL; fields come from docs via API
        }
        return next;
      });
      setSuccess("Generated cURL from docs. You can review and save it.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to generate cURL");
    } finally {
      setGenerating(false);
    }
  };

  const indexInitialDocs = async () => {
    try {
      setError(null);
      setSuccess(null);
      setInitialGeneratedCurl("");
      setInitialIndexStatus("");
      setInitialHits(0);
      setInitialIndexing(true);

      const form = new FormData();
      if (initialDocUrl && initialDocUrl.trim())
        form.append("url", initialDocUrl.trim());
      if (initialDocFile) form.append("file", initialDocFile);
      form.append("namespace", initialNamespace || "initial-setup");

      const indexRes = await fetch("/api/index", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const indexJson = await indexRes.json();
      if (!indexRes.ok || !indexJson.ok) {
        throw new Error(
          indexJson.error || "Failed to index initial setup docs"
        );
      }
      setInitialIndexStatus(
        `Indexed ${indexJson.count} chunks from ${indexJson.source}`
      );
    } catch (e: any) {
      setError(e?.message || "Failed to index initial setup docs");
    } finally {
      setInitialIndexing(false);
    }

    // Auto-trigger generation for initial setup
    try {
      setInitialGenerating(true);
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: initialPrompt || "Generate a canonical initial setup cURL",
          namespace: initialNamespace,
          topK: 5,
        }),
      });
      const genJson = await genRes.json();
      if (!genRes.ok || !genJson.success) {
        throw new Error(
          genJson.error || "Failed to generate initial setup cURL"
        );
      }
      setInitialGeneratedCurl(genJson.curl || "");
      setInitialHits(genJson.hits || 0);
      // Auto-populate the initial setup cURL field and generate fields if empty
      setSettings((prev) => {
        const next: any = {
          ...prev,
          initialSetupCurlCommand: (genJson.curl || (prev as any).initialSetupCurlCommand) as any,
          initialParsed: (genJson.parsed || (prev as any).initialParsed) as any,
        };
        const hasNoFields = !((prev as any).initialFields) || ((prev as any).initialFields || []).length === 0;
        if (hasNoFields && (genJson.curl || "").length > 0) {
          // Do not derive fields from cURL; fields come from docs via API
        }
        return next;
      });
      setSuccess("Generated initial setup cURL from docs. Review and save it.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to generate initial setup cURL");
    } finally {
      setInitialGenerating(false);
    }
  };

  const indexAuthDocs = async () => {
    try {
      setError(null);
      setSuccess(null);
      setAuthGeneratedCurl("");
      setAuthIndexStatus("");
      setAuthHits(0);
      setAuthIndexing(true);

      const form = new FormData();
      if (authDocUrl && authDocUrl.trim())
        form.append("url", authDocUrl.trim());
      if (authDocFile) form.append("file", authDocFile);
      form.append("namespace", authNamespace || "auth");

      const indexRes = await fetch("/api/index", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const indexJson = await indexRes.json();
      if (!indexRes.ok || !indexJson.ok) {
        throw new Error(
          indexJson.error || "Failed to index authentication docs"
        );
      }
      setAuthIndexStatus(
        `Indexed ${indexJson.count} chunks from ${indexJson.source}`
      );
    } catch (e: any) {
      setError(e?.message || "Failed to index authentication docs");
    } finally {
      setAuthIndexing(false);
    }

    // Auto-trigger generation for authentication
    try {
      setAuthGenerating(true);
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: authPrompt || "Generate a canonical authentication cURL",
          namespace: authNamespace,
          topK: 5,
        }),
      });
      const genJson = await genRes.json();
      if (!genRes.ok || !genJson.success) {
        throw new Error(
          genJson.error || "Failed to generate authentication cURL"
        );
      }
      setAuthGeneratedCurl(genJson.curl || "");
      setAuthHits(genJson.hits || 0);
      // Auto-populate the authentication cURL field and generate fields if empty
      setSettings((prev) => {
        const next: any = {
          ...prev,
          authCurlCommand: (genJson.curl || (prev as any).authCurlCommand) as any,
          authParsed: (genJson.parsed || (prev as any).authParsed) as any,
        };
        const hasNoFields = !((prev as any).authFields) || ((prev as any).authFields || []).length === 0;
        if (hasNoFields && (genJson.curl || "").length > 0) {
          // Do not derive fields from cURL; fields come from docs via API
        }
        return next;
      });
      setSuccess(
        "Generated authentication cURL from docs. Review and save it."
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to generate authentication cURL");
    } finally {
      setAuthGenerating(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "20px",
          fontWeight: "700",
          color: "#2d3748",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🧭 Onboarding Settings
      </h3>

      {loading ? (
        <div style={{ color: "#718096" }}>Loading onboarding settings…</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                border: "1px solid #fc8181",
                color: "#742a2a",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #c6f6d5, #9ae6b4)",
                border: "1px solid #68d391",
                color: "#22543d",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {success}
            </div>
          )}

          {/* Registration */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={registrationOpen}
            onClick={() => setRegistrationOpen(!registrationOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setRegistrationOpen(!registrationOpen);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#f7fafc",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: "#2d3748" }}>
                {registrationOpen ? "▼" : "▶"} Registration
              </span>
              {registrationComplete && (
                <span
                  aria-label="complete"
                  title="Docs indexed and cURL generated"
                  style={{ color: "#38a169" }}
                >
                  ✅
                </span>
              )}
            </div>

            {settings.registrationParsed && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>Parsed Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>Method: {settings.registrationParsed.method}</div>
                  <div>Content-Type: {settings.registrationParsed.contentType}</div>
                  <div style={{ gridColumn: "1 / -1" }}>URL: {settings.registrationParsed.url || ""}</div>
                  <div style={{ gridColumn: "1 / -1" }}>Headers:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(Object.entries(settings.registrationParsed.headersRedacted || {}) as [string, string][]).map(([k, v]) => (
                    <span key={k} style={{ background: "#edf2f7", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}: {v}</span>
                  ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>Body Fields:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(settings.registrationParsed.bodyKeys || []).map((k) => (
                        <span key={k} style={{ background: "#eef2ff", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Registration Body Fields</label>
                {
                  <button
                    onClick={async () => {
                      try {
                        console.groupCollapsed("[Onboarding] Regenerate registration spec");
                        console.log({ docsUrl: docUrl, curlCommand: settings.curlCommand || "" });
                        console.groupEnd();
                      } catch {}
                      try {
                        const res = await fetch(`/api/admin/onboarding?derive=registration&debug=true&docsUrl=${encodeURIComponent(docUrl || "")}&curl=${encodeURIComponent(settings.curlCommand || "")}` , { credentials: "include" });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          const spec = data.spec || { headers: [], body: [], response: [] };
                          const parsed = {
                            ...(settings.registrationParsed || { method: "POST" }),
                            bodyKeys: (spec.body || []).map((f: any) => f.key),
                          } as any;
                          const regBodyKeys = (spec.body || []).map((f: any) => f.key);
                          const regRespKeys = (spec.response || []).filter((k: string) => !regBodyKeys.includes(k));
                          setSettings({
                            ...(settings as any),
                            registrationFields: spec.body,
                            registrationHeaders: spec.headers,
                            registrationHeaderFields: (spec.headers || []).map((h: string) => ({ key: h, label: h, required: true, type: "text" })),
                            registrationResponseFields: regRespKeys,
                            registrationResponseFieldDefs: regRespKeys.map((k: string) => ({ key: k, label: k, required: false, type: "text" })),
                            registrationParsed: parsed,
                          } as any);
                          try {
                            console.groupCollapsed("[Onboarding] Derived registration spec (ui)");
                            console.log(spec);
                            if (Array.isArray((data as any).debug)) {
                              for (const entry of (data as any).debug) console.log(entry);
                            }
                            console.groupEnd();
                          } catch {}
                        } else {
                          alert(data.error || "Failed to derive registration spec");
                        }
                      } catch (e: any) {
                        alert(e?.message || "Failed to derive registration spec");
                      }
                    }}
                  style={{ padding: "6px 10px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}
                  >Regenerate from docs</button>
                }
              </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(((settings as any).registrationFields) || []).map((f: any, idx: number) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1.2fr) minmax(0,1fr) 110px 90px 80px", gap: 8, alignItems: "center" }}>
                    <input value={f.key} onChange={(e) => {
                      const arr = [ ...((settings as any).registrationFields || []) ];
                      arr[idx] = { ...arr[idx], key: e.target.value };
                      setSettings({ ...settings, registrationFields: arr } as any);
                    }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="key" />
                    <input value={f.label} onChange={(e) => {
                      const arr = [ ...((settings as any).registrationFields || []) ];
                      arr[idx] = { ...arr[idx], label: e.target.value };
                      setSettings({ ...settings, registrationFields: arr } as any);
                    }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="label" />
                    <input value={(f as any).defaultValue || ""} onChange={(e) => {
                      const arr = [ ...((settings as any).registrationFields || []) ];
                      arr[idx] = { ...arr[idx], defaultValue: e.target.value } as any;
                      setSettings({ ...settings, registrationFields: arr } as any);
                    }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="default value" />
                    <select value={f.type} onChange={(e) => {
                      const arr = [ ...((settings as any).registrationFields || []) ];
                      arr[idx] = { ...arr[idx], type: e.target.value };
                      setSettings({ ...settings, registrationFields: arr } as any);
                    }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }}>
                      <option value="text">text</option>
                      <option value="email">email</option>
                      <option value="phone">phone</option>
                      <option value="select">select</option>
                      <option value="checkbox">checkbox</option>
                    </select>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                      <input type="checkbox" checked={!!f.required} onChange={(e) => {
                        const arr = [ ...((settings as any).registrationFields || []) ];
                        arr[idx] = { ...arr[idx], required: e.target.checked };
                        setSettings({ ...settings, registrationFields: arr } as any);
                      }} /> required
                    </label>
                    <button onClick={() => {
                      const arr = [ ...((settings as any).registrationFields || []) ];
                      arr.splice(idx, 1);
                      setSettings({ ...settings, registrationFields: arr } as any);
                    }} style={{ padding: "6px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12, justifySelf: "start" }}>Remove</button>
                  </div>
                ))}
                <div>
                  <button onClick={() => {
                    const arr = [ ...((settings as any).registrationFields || []) ];
                    arr.push({ key: "", label: "", required: true, type: "text" });
                    setSettings({ ...settings, registrationFields: arr } as any);
                  }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add field</button>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Registration Headers</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(((settings as any).registrationHeaderFields) || []).map((f: any, i: number) => (
                    <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 100px 90px 80px", gap: 8, alignItems: "center" }}>
                      <input value={f.key} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                        arr[i] = { ...arr[i], key: e.target.value };
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, registrationHeaderFields: arr, registrationHeaders: keys } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="header key (e.g., authorization)" />
                      <input value={f.label || ""} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                        arr[i] = { ...arr[i], label: e.target.value };
                        setSettings({ ...settings, registrationHeaderFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="label" />
                      <input value={(f as any).defaultValue || ""} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                        arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                        setSettings({ ...settings, registrationHeaderFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="default value" />
                      <select value={f.type || "text"} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                        arr[i] = { ...arr[i], type: e.target.value };
                        setSettings({ ...settings, registrationHeaderFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }}>
                        <option value="text">text</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                        <input type="checkbox" checked={!!f.required} onChange={(e) => {
                          const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                          arr[i] = { ...arr[i], required: e.target.checked };
                          setSettings({ ...settings, registrationHeaderFields: arr } as any);
                        }} /> required
                      </label>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                        arr.splice(i, 1);
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, registrationHeaderFields: arr, registrationHeaders: keys } as any);
                      }} style={{ padding: "6px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12, justifySelf: "start" }}>Remove</button>
                    </div>
                  ))}
                  <div>
                    <button onClick={() => {
                      const arr = [ ...(((settings as any).registrationHeaderFields) || []) ];
                      arr.push({ key: "", label: "", required: true, type: "text" });
                      const keys = arr.map((x: any) => x.key);
                      setSettings({ ...settings, registrationHeaderFields: arr, registrationHeaders: keys } as any);
                    }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add header</button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Registration Response Fields</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(((settings as any).registrationResponseFieldDefs || []).filter((f: any) => !(((settings as any).registrationFields || []).some((bf: any) => bf.key === f.key)))).map((f: any, i: number) => (
                    <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 100px 90px 80px", gap: 8, alignItems: "center" }}>
                      <input value={f.key} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                        arr[i] = { ...arr[i], key: e.target.value };
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, registrationResponseFieldDefs: arr, registrationResponseFields: keys } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="response key (e.g., user.id)" />
                      <input value={f.label || ""} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                        arr[i] = { ...arr[i], label: e.target.value };
                        setSettings({ ...settings, registrationResponseFieldDefs: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="label" />
                      <input value={(f as any).defaultValue || ""} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                        arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                        setSettings({ ...settings, registrationResponseFieldDefs: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }} placeholder="default value" />
                      <select value={f.type || "text"} onChange={(e) => {
                        const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                        arr[i] = { ...arr[i], type: e.target.value };
                        setSettings({ ...settings, registrationResponseFieldDefs: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, minWidth: 0 }}>
                        <option value="text">text</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                        <input type="checkbox" checked={!!f.required} onChange={(e) => {
                          const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], required: e.target.checked };
                          setSettings({ ...settings, registrationResponseFieldDefs: arr } as any);
                        }} /> required
                      </label>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                        arr.splice(i, 1);
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, registrationResponseFieldDefs: arr, registrationResponseFields: keys } as any);
                      }} style={{ padding: "6px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12, justifySelf: "start" }}>Remove</button>
                    </div>
                  ))}
                  <div>
                    <button onClick={() => {
                      const arr = [ ...(((settings as any).registrationResponseFieldDefs) || []) ];
                      arr.push({ key: "", label: "", required: false, type: "text" });
                      const keys = arr.map((x: any) => x.key);
                      setSettings({ ...settings, registrationResponseFieldDefs: arr, registrationResponseFields: keys } as any);
                    }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add response field</button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ color: "#718096", fontSize: 12 }}>
              {registrationOpen ? "Collapse" : "Expand"}
            </div>
          </div>
          <div style={{ display: registrationOpen ? "block" : "none" }}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Registration API Document URL (Google Docs or any public page)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/document/d/<DOC_ID>/edit?usp=sharing or https://yourdocs.page"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Or upload a plain text file (.txt or .md)
                </label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Namespace
                  </label>
                  <input
                    type="text"
                    placeholder="docs"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Optional prompt
                </label>
                <textarea
                  placeholder={
                    "POST /users/register with JSON {email, password}; include Content-Type header"
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={indexDocs}
                  disabled={indexing || generating}
                  style={{
                    padding: "10px 14px",
                    background:
                      indexing || generating
                        ? "#a0aec0"
                        : "linear-gradient(135deg, #4299e1, #3182ce)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: indexing || generating ? "not-allowed" : "pointer",
                  }}
                >
                  {indexing
                    ? "Indexing…"
                    : generating
                    ? "Generating cURL…"
                    : "Index docs"}
                </button>
              </div>

              {indexStatus && (
                <div style={{ color: "#4a5568", fontSize: 12, marginTop: 6 }}>
                  {indexStatus}
                </div>
              )}
              {generatedCurl && (
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Generated cURL
                  </label>
                  <textarea
                    value={generatedCurl}
                    readOnly
                    rows={5}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "monospace",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(generatedCurl)
                      }
                      style={{
                        padding: "8px 12px",
                        background: "#2d3748",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      Copy cURL
                    </button>
                    <span style={{ color: "#718096", fontSize: 12 }}>
                      Context hits: {hits}
                    </span>
                  </div>
                </div>
              )}
            </div>

          {/* Canonical registration cURL command */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Canonical registration cURL
              </label>
              <textarea
                placeholder={
                  'curl -X POST https://api.your-service.com/register \\\n+  -H \'Content-Type: application/json\' \\\n+  -H \'Authorization: Bearer <token>\' \\\n+  -d \'{"email":"user@example.com","firstName":"Jane","lastName":"Doe"}\''
                }
                value={settings.curlCommand || ""}
                onChange={(e) => {
                  const curl = e.target.value;
                  let parsed: any = undefined;
                  try {
                    const p = parseCurlRegistrationSpec(curl);
                    const bodyKeys = extractBodyKeysFromCurl(curl);
                    parsed = {
                      method: p.method,
                      url: p.url,
                      contentType: p.contentType,
                      headersRedacted: redactHeadersForLog(p.headers),
                      bodyKeys,
                    };
                  } catch {}
                  const next: any = { ...(settings as any), curlCommand: curl, registrationParsed: parsed };
                  setSettings(next as any);
                }}
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              />
              <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
                Paste the exact cURL used to register a user. We will
                auto-derive method, URL, headers, content type, and required
                fields from it.
              </div>
            </div>
          </div>

          {/* Onboarding Widget Embed */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={embedOpen}
            onClick={() => setEmbedOpen(!embedOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEmbedOpen(!embedOpen);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 24,
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#f7fafc",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: "#2d3748" }}>
                {embedOpen ? "▼" : "▶"} Onboarding Widget Embed
              </span>
            </div>
            <div style={{ color: "#718096", fontSize: 12 }}>
              {embedOpen ? "Collapse" : "Expand"}
            </div>
          </div>
          <div style={{ display: embedOpen ? "block" : "none" }}>
            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Embed snippet
              </label>
              {(() => {
                const origin =
                  typeof window !== "undefined" ? window.location.origin : "";
                const apiKey = settings.apiKey || "<YOUR_API_KEY>";
                const snippet = `<script src="${origin}/api/widget" data-api-key="${apiKey}" data-theme="green" data-onboarding-only="true"></script>`;
                return (
                  <div>
                    <textarea
                      value={snippet}
                      readOnly
                      rows={2}
                      style={{
                        width: "100%",
                        padding: 12,
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        fontSize: 13,
                        fontFamily: "monospace",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginTop: 6,
                      }}
                    >
                      <button
                        onClick={() => navigator.clipboard.writeText(snippet)}
                        style={{
                          padding: "8px 12px",
                          background: "#2d3748",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      >
                        Copy embed
                      </button>
                      <span style={{ color: "#718096", fontSize: 12 }}>
                        Paste into your site to enable onboarding-only widget.
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Authentication */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={authenticationOpen}
            onClick={() => setAuthenticationOpen(!authenticationOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setAuthenticationOpen(!authenticationOpen);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 24,
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#f7fafc",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: "#2d3748" }}>
                {authenticationOpen ? "▼" : "▶"} Authentication
              </span>
              {authenticationComplete && (
                <span
                  aria-label="complete"
                  title="Docs indexed and cURL generated"
                  style={{ color: "#38a169" }}
                >
                  ✅
                </span>
              )}
            </div>
            <div style={{ color: "#718096", fontSize: 12 }}>
              {authenticationOpen ? "Collapse" : "Expand"}
            </div>
          </div>
          <div style={{ display: authenticationOpen ? "block" : "none" }}>
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Authentication API Document URL (Google Docs or any public page)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/document/d/<DOC_ID>/edit?usp=sharing or https://yourdocs.page"
                value={authDocUrl}
                onChange={(e) => setAuthDocUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Or upload a plain text file (.txt or .md)
                </label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleAuthFileChange}
                />
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Namespace
                  </label>
                  <input
                    type="text"
                    placeholder="auth"
                    value={authNamespace}
                    onChange={(e) => setAuthNamespace(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Optional prompt
                </label>
                <textarea
                  placeholder={
                    "POST /auth/login with JSON {email, password}; include Content-Type header"
                  }
                  value={authPrompt}
                  onChange={(e) => setAuthPrompt(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={indexAuthDocs}
                  disabled={authIndexing || authGenerating}
                  style={{
                    padding: "10px 14px",
                    background:
                      authIndexing || authGenerating
                        ? "#a0aec0"
                        : "linear-gradient(135deg, #ed8936, #dd6b20)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor:
                      authIndexing || authGenerating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {authIndexing
                    ? "Indexing…"
                    : authGenerating
                    ? "Generating cURL…"
                    : "Index docs"}
                </button>
              </div>

              {authIndexStatus && (
                <div style={{ color: "#4a5568", fontSize: 12, marginTop: 6 }}>
                  {authIndexStatus}
                </div>
              )}
              {authGeneratedCurl && (
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Generated authentication cURL
                  </label>
                  <textarea
                    value={authGeneratedCurl}
                    readOnly
                    rows={5}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "monospace",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(authGeneratedCurl)
                      }
                      style={{
                        padding: "8px 12px",
                        background: "#2d3748",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      Copy cURL
                    </button>
                    <span style={{ color: "#718096", fontSize: 12 }}>
                      Context hits: {authHits}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {((settings as any).authParsed) && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>Parsed Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>Method: {(settings as any).authParsed?.method}</div>
                  <div>Content-Type: {(settings as any).authParsed?.contentType}</div>
                  <div style={{ gridColumn: "1 / -1" }}>URL: {(settings as any).authParsed?.url || ""}</div>
                  <div style={{ gridColumn: "1 / -1" }}>Headers:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(Object.entries(((settings as any).authParsed?.headersRedacted || {})) as [string, string][]).map(([k, v]) => (
                        <span key={k} style={{ background: "#edf2f7", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}: {v}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>Body Fields:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(((settings as any).authParsed?.bodyKeys || [])).map((k: string) => (
                        <span key={k} style={{ background: "#eef2ff", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Authentication Body Fields</label>
                {
                  <button
                    onClick={async () => {
                      try {
                        console.groupCollapsed("[Onboarding] Regenerate auth spec");
                        console.log({ docsUrl: authDocUrl, curlCommand: (settings as any).authCurlCommand || "" });
                        console.groupEnd();
                      } catch {}
                      try {
                        const res = await fetch(`/api/admin/onboarding?derive=auth&debug=true&docsUrl=${encodeURIComponent(authDocUrl || "")}&curl=${encodeURIComponent((settings as any).authCurlCommand || "")}` , { credentials: "include" });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          const spec = data.spec || { headers: [], body: [], response: [] };
                          const parsed = {
                            ...(settings.authParsed || { method: "POST" }),
                            bodyKeys: (spec.body || []).map((f: any) => f.key),
                          } as any;
                          const authBodyKeys = (spec.body || []).map((f: any) => f.key);
                          const authRespKeys = (spec.response || []).filter((k: string) => !authBodyKeys.includes(k));
                          setSettings({
                            ...(settings as any),
                            authFields: spec.body,
                            authHeaders: spec.headers,
                            authHeaderFields: (spec.headers || []).map((h: string) => ({ key: h, label: h, required: true, type: "text" })),
                            authResponseFields: authRespKeys,
                            authResponseFieldDefs: authRespKeys.map((k: string) => ({ key: k, label: k, required: false, type: "text" })),
                            authParsed: parsed,
                          } as any);
                          try {
                            console.groupCollapsed("[Onboarding] Derived auth spec (ui)");
                            console.log(spec);
                            if (Array.isArray((data as any).debug)) {
                              for (const entry of (data as any).debug) console.log(entry);
                            }
                            console.groupEnd();
                          } catch {}
                        } else {
                          alert(data.error || "Failed to derive auth spec");
                        }
                      } catch (e: any) {
                        alert(e?.message || "Failed to derive auth spec");
                      }
                    }}
                    style={{ padding: "6px 10px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}
                  >Regenerate from docs</button>
                }
              </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(((settings as any).authFields) || []).map((f: any, idx: number) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                      <input value={f.key} onChange={(e) => {
                        const arr = [ ...((settings as any).authFields || []) ];
                        arr[idx] = { ...arr[idx], key: e.target.value };
                        setSettings({ ...settings, authFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="key" />
                      <input value={f.label} onChange={(e) => {
                        const arr = [ ...((settings as any).authFields || []) ];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, authFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                      <input value={(f as any).defaultValue || ""} onChange={(e) => {
                        const arr = [ ...((settings as any).authFields || []) ];
                        arr[idx] = { ...arr[idx], defaultValue: e.target.value } as any;
                        setSettings({ ...settings, authFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                      <select value={f.type} onChange={(e) => {
                        const arr = [ ...((settings as any).authFields || []) ];
                        arr[idx] = { ...arr[idx], type: e.target.value };
                        setSettings({ ...settings, authFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                        <option value="text">text</option>
                        <option value="email">email</option>
                        <option value="phone">phone</option>
                        <option value="select">select</option>
                        <option value="checkbox">checkbox</option>
                      </select>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                      <input type="checkbox" checked={!!f.required} onChange={(e) => {
                        const arr = [ ...((settings as any).authFields || []) ];
                        arr[idx] = { ...arr[idx], required: e.target.checked };
                        setSettings({ ...settings, authFields: arr } as any);
                      }} /> required
                    </label>
                    <button onClick={() => {
                      const arr = [ ...((settings as any).authFields || []) ];
                      arr.splice(idx, 1);
                      setSettings({ ...settings, authFields: arr } as any);
                    }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                  </div>
                ))}
                <div>
                  <button onClick={() => {
                    const arr = [ ...((settings as any).authFields || []) ];
                    arr.push({ key: "", label: "", required: true, type: "text" });
                    setSettings({ ...settings, authFields: arr } as any);
                  }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add field</button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Auth Headers</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(((settings as any).authHeaderFields) || []).map((f: any, i: number) => (
                      <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px 140px auto", gap: 8, alignItems: "center" }}>
                        <input value={f.key} onChange={(e) => {
                          const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                          arr[i] = { ...arr[i], key: e.target.value };
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, authHeaderFields: arr, authHeaders: keys } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="header key (e.g., authorization)" />
                        <input value={f.label || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                          arr[i] = { ...arr[i], label: e.target.value };
                          setSettings({ ...settings, authHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                        <input value={(f as any).defaultValue || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                          arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                          setSettings({ ...settings, authHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                        <select value={f.type || "text"} onChange={(e) => {
                          const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                          arr[i] = { ...arr[i], type: e.target.value };
                          setSettings({ ...settings, authHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                          <option value="text">text</option>
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                          <input type="checkbox" checked={!!f.required} onChange={(e) => {
                            const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                            arr[i] = { ...arr[i], required: e.target.checked };
                            setSettings({ ...settings, authHeaderFields: arr } as any);
                          }} /> required
                        </label>
                        <button onClick={() => {
                          const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                          arr.splice(i, 1);
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, authHeaderFields: arr, authHeaders: keys } as any);
                        }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).authHeaderFields) || []) ];
                        arr.push({ key: "", label: "", required: true, type: "text" });
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, authHeaderFields: arr, authHeaders: keys } as any);
                      }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add header</button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Auth Response Fields</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(((settings as any).authResponseFieldDefs || []).filter((f: any) => !(((settings as any).authFields || []).some((bf: any) => bf.key === f.key)))).map((f: any, i: number) => (
                      <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px 140px auto", gap: 8, alignItems: "center" }}>
                        <input value={f.key} onChange={(e) => {
                          const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], key: e.target.value };
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, authResponseFieldDefs: arr, authResponseFields: keys } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="response key (e.g., token)" />
                        <input value={f.label || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], label: e.target.value };
                          setSettings({ ...settings, authResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                        <input value={(f as any).defaultValue || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                          setSettings({ ...settings, authResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                        <select value={f.type || "text"} onChange={(e) => {
                          const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], type: e.target.value };
                          setSettings({ ...settings, authResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                          <option value="text">text</option>
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                          <input type="checkbox" checked={!!f.required} onChange={(e) => {
                            const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                            arr[i] = { ...arr[i], required: e.target.checked };
                            setSettings({ ...settings, authResponseFieldDefs: arr } as any);
                          }} /> required
                        </label>
                        <button onClick={() => {
                          const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                          arr.splice(i, 1);
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, authResponseFieldDefs: arr, authResponseFields: keys } as any);
                        }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).authResponseFieldDefs) || []) ];
                        arr.push({ key: "", label: "", required: false, type: "text" });
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, authResponseFieldDefs: arr, authResponseFields: keys } as any);
                      }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add response field</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Canonical authentication cURL command */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Canonical authentication cURL
              </label>
              <textarea
                placeholder={
                  'curl -X POST https://api.your-service.com/auth/login \\\n++  -H "Content-Type: application/json" \\\n++  -d "{" + "email":"user@example.com","password":"hunter2"}""'
                }
                value={(settings as any).authCurlCommand || ""}
                onChange={(e) => {
                  const curl = e.target.value;
                  let parsed: any = undefined;
                  try {
                    const p = parseCurlRegistrationSpec(curl);
                    const bodyKeys = extractBodyKeysFromCurl(curl);
                    parsed = {
                      method: p.method,
                      url: p.url,
                      contentType: p.contentType,
                      headersRedacted: redactHeadersForLog(p.headers),
                      bodyKeys,
                    };
                  } catch {}
                  const next: any = { ...(settings as any), authCurlCommand: curl, authParsed: parsed };
                  setSettings(next as any);
                }}
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              />
              <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
                Paste the exact cURL used to authenticate (e.g., login/token
                exchange). Method, URL, and headers are derived.
              </div>
            </div>
          </div>

          {/* Initial Setup */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={initialSetupOpen}
            onClick={() => setInitialSetupOpen(!initialSetupOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setInitialSetupOpen(!initialSetupOpen);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 24,
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#f7fafc",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, color: "#2d3748" }}>
                {initialSetupOpen ? "▼" : "▶"} Initial Setup
              </span>
              {initialSetupComplete && (
                <span
                  aria-label="complete"
                  title="Docs indexed and cURL generated"
                  style={{ color: "#38a169" }}
                >
                  ✅
                </span>
              )}
            </div>
            <div style={{ color: "#718096", fontSize: 12 }}>
              {initialSetupOpen ? "Collapse" : "Expand"}
            </div>
          </div>
          <div style={{ display: initialSetupOpen ? "block" : "none" }}>
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Initial Setup API Document URL (Google Docs or any public page)
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/document/d/<DOC_ID>/edit?usp=sharing or https://yourdocs.page"
                value={initialDocUrl}
                onChange={(e) => setInitialDocUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Or upload a plain text file (.txt or .md)
                </label>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleInitialFileChange}
                />
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Namespace
                  </label>
                  <input
                    type="text"
                    placeholder="initial-setup"
                    value={initialNamespace}
                    onChange={(e) => setInitialNamespace(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    color: "#4a5568",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Optional prompt
                </label>
                <textarea
                  placeholder={
                    "POST /account/setup with JSON {companyName, timezone, preferences}; include Content-Type header"
                  }
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={indexInitialDocs}
                  disabled={initialIndexing || initialGenerating}
                  style={{
                    padding: "10px 14px",
                    background:
                      initialIndexing || initialGenerating
                        ? "#a0aec0"
                        : "linear-gradient(135deg, #805ad5, #6b46c1)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor:
                      initialIndexing || initialGenerating
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {initialIndexing
                    ? "Indexing…"
                    : initialGenerating
                    ? "Generating cURL…"
                    : "Index docs"}
                </button>
              </div>

              {initialIndexStatus && (
                <div style={{ color: "#4a5568", fontSize: 12, marginTop: 6 }}>
                  {initialIndexStatus}
                </div>
              )}
              {initialGeneratedCurl && (
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Generated initial setup cURL
                  </label>
                  <textarea
                    value={initialGeneratedCurl}
                    readOnly
                    rows={5}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "monospace",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(initialGeneratedCurl)
                      }
                      style={{
                        padding: "8px 12px",
                        background: "#2d3748",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      Copy cURL
                    </button>
                    <span style={{ color: "#718096", fontSize: 12 }}>
                      Context hits: {initialHits}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {settings.initialParsed && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>Parsed Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>Method: {settings.initialParsed.method}</div>
                  <div>Content-Type: {settings.initialParsed.contentType}</div>
                  <div style={{ gridColumn: "1 / -1" }}>URL: {settings.initialParsed.url || ""}</div>
                  <div style={{ gridColumn: "1 / -1" }}>Headers:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(Object.entries(settings.initialParsed.headersRedacted || {}) as [string, string][]).map(([k, v]) => (
                        <span key={k} style={{ background: "#edf2f7", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}: {v}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>Body Fields:
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(settings.initialParsed.bodyKeys || []).map((k) => (
                        <span key={k} style={{ background: "#eef2ff", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Initial Setup Body Fields</label>
                {
                  <button
                    onClick={async () => {
                      try {
                        console.groupCollapsed("[Onboarding] Regenerate initial setup spec");
                        console.log({ docsUrl: initialDocUrl, curlCommand: settings.initialSetupCurlCommand || "" });
                        console.groupEnd();
                      } catch {}
                      try {
                        const res = await fetch(`/api/admin/onboarding?derive=initial&debug=true&docsUrl=${encodeURIComponent(initialDocUrl || "")}&curl=${encodeURIComponent(settings.initialSetupCurlCommand || "")}` , { credentials: "include" });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          const spec = data.spec || { headers: [], body: [], response: [] };
                          const parsed = {
                            ...(settings.initialParsed || { method: "POST" }),
                            bodyKeys: (spec.body || []).map((f: any) => f.key),
                          } as any;
                          const initBodyKeys = (spec.body || []).map((f: any) => f.key);
                          const initRespKeys = (spec.response || []).filter((k: string) => !initBodyKeys.includes(k));
                          setSettings({
                            ...(settings as any),
                            initialFields: spec.body,
                            initialHeaders: spec.headers,
                            initialHeaderFields: (spec.headers || []).map((h: string) => ({ key: h, label: h, required: true, type: "text" })),
                            initialResponseFields: initRespKeys,
                            initialResponseFieldDefs: initRespKeys.map((k: string) => ({ key: k, label: k, required: false, type: "text" })),
                            initialParsed: parsed,
                          } as any);
                          try {
                            console.groupCollapsed("[Onboarding] Derived initial setup spec (ui)");
                            console.log(spec);
                            if (Array.isArray((data as any).debug)) {
                              for (const entry of (data as any).debug) console.log(entry);
                            }
                            console.groupEnd();
                          } catch {}
                        } else {
                          alert(data.error || "Failed to derive initial spec");
                        }
                      } catch (e: any) {
                        alert(e?.message || "Failed to derive initial spec");
                      }
                    }}
                    style={{ padding: "6px 10px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}
                  >Regenerate from docs</button>
                }
              </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(((settings as any).initialFields) || []).map((f: any, idx: number) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                      <input value={f.key} onChange={(e) => {
                        const arr = [ ...((settings as any).initialFields || []) ];
                        arr[idx] = { ...arr[idx], key: e.target.value };
                        setSettings({ ...settings, initialFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="key" />
                      <input value={f.label} onChange={(e) => {
                        const arr = [ ...((settings as any).initialFields || []) ];
                        arr[idx] = { ...arr[idx], label: e.target.value };
                        setSettings({ ...settings, initialFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                      <input value={(f as any).defaultValue || ""} onChange={(e) => {
                        const arr = [ ...((settings as any).initialFields || []) ];
                        arr[idx] = { ...arr[idx], defaultValue: e.target.value } as any;
                        setSettings({ ...settings, initialFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                      <select value={f.type} onChange={(e) => {
                        const arr = [ ...((settings as any).initialFields || []) ];
                        arr[idx] = { ...arr[idx], type: e.target.value };
                        setSettings({ ...settings, initialFields: arr } as any);
                      }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                        <option value="text">text</option>
                        <option value="email">email</option>
                        <option value="phone">phone</option>
                        <option value="select">select</option>
                        <option value="checkbox">checkbox</option>
                      </select>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                      <input type="checkbox" checked={!!f.required} onChange={(e) => {
                        const arr = [ ...((settings as any).initialFields || []) ];
                        arr[idx] = { ...arr[idx], required: e.target.checked };
                        setSettings({ ...settings, initialFields: arr } as any);
                      }} /> required
                    </label>
                    <button onClick={() => {
                      const arr = [ ...((settings as any).initialFields || []) ];
                      arr.splice(idx, 1);
                      setSettings({ ...settings, initialFields: arr } as any);
                    }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                  </div>
                ))}
                <div>
                  <button onClick={() => {
                    const arr = [ ...((settings as any).initialFields || []) ];
                    arr.push({ key: "", label: "", required: true, type: "text" });
                    setSettings({ ...settings, initialFields: arr } as any);
                  }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add field</button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Initial Setup Headers</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(((settings as any).initialHeaderFields) || []).map((f: any, i: number) => (
                      <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px 140px auto", gap: 8, alignItems: "center" }}>
                        <input value={f.key} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                          arr[i] = { ...arr[i], key: e.target.value };
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, initialHeaderFields: arr, initialHeaders: keys } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="header key (e.g., x-apikey)" />
                        <input value={f.label || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                          arr[i] = { ...arr[i], label: e.target.value };
                          setSettings({ ...settings, initialHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                        <input value={(f as any).defaultValue || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                          arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                          setSettings({ ...settings, initialHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                        <select value={f.type || "text"} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                          arr[i] = { ...arr[i], type: e.target.value };
                          setSettings({ ...settings, initialHeaderFields: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                          <option value="text">text</option>
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                          <input type="checkbox" checked={!!f.required} onChange={(e) => {
                            const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                            arr[i] = { ...arr[i], required: e.target.checked };
                            setSettings({ ...settings, initialHeaderFields: arr } as any);
                          }} /> required
                        </label>
                        <button onClick={() => {
                          const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                          arr.splice(i, 1);
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, initialHeaderFields: arr, initialHeaders: keys } as any);
                        }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).initialHeaderFields) || []) ];
                        arr.push({ key: "", label: "", required: true, type: "text" });
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, initialHeaderFields: arr, initialHeaders: keys } as any);
                      }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add header</button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Initial Setup Response Fields</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(((settings as any).initialResponseFieldDefs || []).filter((f: any) => !(((settings as any).initialFields || []).some((bf: any) => bf.key === f.key)))).map((f: any, i: number) => (
                      <div key={(f.key || "") + i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px 140px auto", gap: 8, alignItems: "center" }}>
                        <input value={f.key} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], key: e.target.value };
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, initialResponseFieldDefs: arr, initialResponseFields: keys } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="response key (e.g., setup.id)" />
                        <input value={f.label || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], label: e.target.value };
                          setSettings({ ...settings, initialResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="label" />
                        <input value={(f as any).defaultValue || ""} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], defaultValue: e.target.value } as any;
                          setSettings({ ...settings, initialResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} placeholder="default value" />
                        <select value={f.type || "text"} onChange={(e) => {
                          const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                          arr[i] = { ...arr[i], type: e.target.value };
                          setSettings({ ...settings, initialResponseFieldDefs: arr } as any);
                        }} style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}>
                          <option value="text">text</option>
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", fontSize: 13 }}>
                          <input type="checkbox" checked={!!f.required} onChange={(e) => {
                            const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                            arr[i] = { ...arr[i], required: e.target.checked };
                            setSettings({ ...settings, initialResponseFieldDefs: arr } as any);
                          }} /> required
                        </label>
                        <button onClick={() => {
                          const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                          arr.splice(i, 1);
                          const keys = arr.map((x: any) => x.key);
                          setSettings({ ...settings, initialResponseFieldDefs: arr, initialResponseFields: keys } as any);
                        }} style={{ padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button onClick={() => {
                        const arr = [ ...(((settings as any).initialResponseFieldDefs) || []) ];
                        arr.push({ key: "", label: "", required: false, type: "text" });
                        const keys = arr.map((x: any) => x.key);
                        setSettings({ ...settings, initialResponseFieldDefs: arr, initialResponseFields: keys } as any);
                      }} style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}>Add response field</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Canonical initial setup cURL command */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Canonical initial setup cURL
              </label>
              <textarea
                placeholder={
                  'curl -X POST https://api.your-service.com/setup \\n+  -H \'Content-Type: application/json\' \\n+  -H \'Authorization: Bearer <token>\' \\n+  -d \'{"companyName":"ACME","timezone":"America/New_York"}\''
                }
                value={(settings as any).initialSetupCurlCommand || ""}
                onChange={(e) => {
                  const curl = e.target.value;
                  let parsed: any = undefined;
                  try {
                    const p = parseCurlRegistrationSpec(curl);
                    const bodyKeys = extractBodyKeysFromCurl(curl);
                    parsed = {
                      method: p.method,
                      url: p.url,
                      contentType: p.contentType,
                      headersRedacted: redactHeadersForLog(p.headers),
                      bodyKeys,
                    };
                  } catch {}
                  const next: any = { ...(settings as any), initialSetupCurlCommand: curl, initialParsed: parsed };
                  setSettings(next as any);
                }}
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              />
              <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
                Paste the exact cURL used for initial setup. We derive method,
                URL, headers, and fields.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "12px 16px",
                background: saving
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #48bb78, #38a169)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save Onboarding Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingSettingsSection;
