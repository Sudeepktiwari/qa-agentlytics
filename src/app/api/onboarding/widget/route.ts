import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const API_BASE = '${baseUrl}';
  var el = document.currentScript || document.querySelector('script[src*="/api/onboarding/widget"]');
  var apiKey = '';
  var chatTitle = 'Onboarding Assistant';
  try { if (el && typeof el.getAttribute === 'function') { apiKey = el.getAttribute('data-api-key') || ''; chatTitle = el.getAttribute('data-chat-title') || 'Onboarding Assistant'; } } catch (e) {}

  if (!apiKey || !apiKey.startsWith('ak_')) {
    throw new Error('API key required');
  }

  var state = (function() {
    const raw = localStorage.getItem('onboarding_state');
    try { return raw ? JSON.parse(raw) : { step: 'registration', reg: {}, authToken: null, authApiKey: null, init: {} }; } catch { return { step: 'registration', reg: {}, authToken: null, authApiKey: null, init: {} }; }
  })();
  function saveState() { localStorage.setItem('onboarding_state', JSON.stringify(state)); }

  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;';
  var panel = document.createElement('div');
  panel.style.cssText = 'width:70vw;max-width:800px;height:70vh;max-height:720px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden;';
  var header = document.createElement('div');
  header.style.cssText = 'padding:12px 16px;background:#10b981;color:#fff;font-weight:600;display:flex;align-items:center;justify-content:space-between;';
  header.textContent = chatTitle;
  var messages = document.createElement('div');
  messages.style.cssText = 'flex:1;padding:14px;overflow:auto;font-size:14px;color:#374151;background:#f9fafb;';
  var actions = document.createElement('div');
  actions.style.cssText = 'padding:8px 12px;border-top:1px solid #e5e7eb;background:#fff;display:flex;gap:8px;flex-wrap:wrap;';
  var inputBar = document.createElement('div');
  inputBar.style.cssText = 'padding:10px;border-top:1px solid #e5e7eb;background:#fff;display:flex;gap:8px;';
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message';
  input.style.cssText = 'flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;';
  var sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.cssText = 'padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#10b981;color:#fff;font-weight:600;';
  inputBar.appendChild(input); inputBar.appendChild(sendBtn);
  panel.appendChild(header); panel.appendChild(messages); panel.appendChild(actions); panel.appendChild(inputBar); container.appendChild(panel); document.body.appendChild(container);

  function clearActions() { while (actions.firstChild) actions.removeChild(actions.firstChild); }
  function addAction(label, onClick) { var b = document.createElement('button'); b.textContent = label; b.style.cssText = 'padding:8px 12px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#374151;font-weight:600;'; b.onclick = onClick; actions.appendChild(b); return b; }
  function addBubble(role, text) { var row = document.createElement('div'); row.style.cssText = 'display:flex;margin-bottom:10px;'; var bubble = document.createElement('div'); bubble.textContent = text; if (role === 'user') { row.style.justifyContent = 'flex-end'; bubble.style.cssText = 'max-width:70%;background:#10b981;color:#fff;padding:10px 12px;border-radius:14px 14px 2px 14px;'; } else { row.style.justifyContent = 'flex-start'; bubble.style.cssText = 'max-width:70%;background:#fff;color:#374151;padding:10px 12px;border-radius:14px 14px 14px 2px;border:1px solid #e5e7eb;'; } row.appendChild(bubble); messages.appendChild(row); messages.scrollTop = messages.scrollHeight; }

  function renderRegistrationIntro() {
    messages.innerHTML = '';
    clearActions();
    addBubble('bot', "Welcome! Let's get you set up.");
    addBubble('bot', 'Please share your name, email, and a password (min 8 chars). You can type them together like: Name: Jane, Email: jane@example.com, Password: hunter2');
    var wrap = document.createElement('div');
    wrap.style.cssText = 'margin:8px 0;padding:10px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;display:grid;grid-template-columns:1fr;gap:8px;';
    var name = document.createElement('input'); name.type = 'text'; name.placeholder = 'Name'; name.value = state.reg.name || ''; name.style.cssText = 'padding:10px;border:1px solid #e5e7eb;border-radius:8px;';
    var email = document.createElement('input'); email.type = 'email'; email.placeholder = 'Email'; email.value = state.reg.email || ''; email.style.cssText = 'padding:10px;border:1px solid #e5e7eb;border-radius:8px;';
    var password = document.createElement('input'); password.type = 'password'; password.placeholder = 'Password (min 8 chars)'; password.value = state.reg.password || ''; password.style.cssText = 'padding:10px;border:1px solid #e5e7eb;border-radius:8px;';
    wrap.appendChild(name); wrap.appendChild(email); wrap.appendChild(password);
    messages.appendChild(wrap);
    addAction('Review', function(){ state.reg = { name: name.value.trim(), email: email.value.trim(), password: password.value }; saveState(); renderRegistrationConfirm(); });
    addAction('Submit', function(){ state.reg = { name: name.value.trim(), email: email.value.trim(), password: password.value }; saveState(); submitRegistration(); });
    if (state.reg && state.reg.name && state.reg.email && state.reg.password) { addAction('Use saved details', function(){ renderRegistrationConfirm(); }); }
    state.step = 'reg_collect'; saveState();
  }

  function renderRegistrationConfirm() {
    messages.innerHTML = '';
    clearActions();
    addBubble('bot', 'Please review your details:');
    addBubble('bot', 'Name: ' + (state.reg.name || ''));
    addBubble('bot', 'Email: ' + (state.reg.email || ''));
    addBubble('bot', 'Password: ' + (state.reg.password ? '********' : ''));
    addAction('Confirm and Submit', submitRegistration);
    addAction('Edit Details', function(){ renderRegistrationIntro(); });
    state.step = 'reg_confirm'; saveState();
  }

  async function submitRegistration() {
    clearActions(); addBubble('bot', 'Submitting registration...');
    const res = await fetch(API_BASE + '/api/onboarding/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action: 'register', payload: state.reg }) });
    const data = await res.json();
    if (!data.success) { addBubble('bot', 'Registration failed: ' + (data.error || '')); addAction('Edit Details', function(){ renderRegistrationIntro(); }); return; }
    state.authToken = data.authToken || null; state.authApiKey = data.authApiKey || null; saveState();
    var fields = Array.isArray(data.initialFields) ? data.initialFields : [];
    renderInitialSetup(fields);
  }

  var setupFieldsCache = [];
  function renderInitialSetup(fields) {
    messages.innerHTML = '';
    clearActions();
  setupFieldsCache = Array.isArray(fields) ? fields.filter(function(f){ return !!f && (f.required === true || f.required === 'true'); }) : [];
  try {
    setupFieldsCache.forEach(function(f){
      var key = String(f.key || '');
      var lk = key.toLowerCase();
      if (!state.init[key]) {
        if (lk.includes('email') && state.reg.email) { state.init[key] = state.reg.email; }
        else if (lk.includes('name') && state.reg.name) { state.init[key] = state.reg.name; }
      }
    });
    saveState();
  } catch {}
  if (!setupFieldsCache || setupFieldsCache.length === 0) { addBubble('bot', 'Registration complete. No initial setup required.'); clearActions(); addAction('Close', function(){ container.remove(); }); state.step = 'complete'; saveState(); return; }
  addBubble('bot', "Let's complete your initial setup.");
    state.step = 'setup_collect'; saveState();
    askNextSetupField();
  }

  function renderInitialConfirm(fields) {
    messages.innerHTML = '';
    clearActions();
    addBubble('bot', 'Please review your setup details:');
    fields.forEach(function(f){ addBubble('bot', (f.label || f.key) + ': ' + (state.init[f.key] || '')); });
    addAction('Confirm and Submit', function(){ submitInitialSetup(fields); });
    addAction('Edit Details', function(){ renderInitialSetup(fields); });
    state.step = 'setup_confirm'; saveState();
  }

  async function submitInitialSetup(fields) {
    clearActions(); addBubble('bot', 'Submitting initial setup...');
    var payload = Object.assign({}, state.init, state.authToken ? { __authToken: state.authToken } : {}, state.authApiKey ? { __apiKey: state.authApiKey } : {});
    const res = await fetch(API_BASE + '/api/onboarding/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action: 'initial_setup', payload }) });
    const data = await res.json();
    if (!data.success) { addBubble('bot', 'Initial setup failed: ' + (data.error || '')); addAction('Edit Details', function(){ renderInitialSetup(fields); }); return; }
    addBubble('bot', 'Onboarding complete.');
    clearActions(); addAction('Close', function(){ container.remove(); });
  state.step = 'complete'; saveState();
  }

  function parseRegFromText(t) { var out = { name: state.reg.name || '', email: state.reg.email || '', password: state.reg.password || '' }; var lower = t.toLowerCase(); function extractAfter(label) { var idx = lower.indexOf(label); if (idx < 0) return null; var rest = t.slice(idx + label.length); var j = 0; while (j < rest.length && (rest[j] === ':' || rest[j] === '-' || rest[j] === ' ')) j++; rest = rest.slice(j); var endComma = rest.indexOf(','); var endNl = rest.indexOf('\\\\n'); var end = -1; if (endComma >= 0 && endNl >= 0) end = Math.min(endComma, endNl); else end = endComma >= 0 ? endComma : endNl; var value = end >= 0 ? rest.slice(0, end) : rest; return value.trim(); } function extractEmail(txt) { var best = null; var token = ''; for (var i = 0; i < txt.length; i++) { var ch = txt[i]; if (ch === ' ' || ch === ',' || ch === '\\\\n') { if (token) { if (token.indexOf('@') >= 0 && token.indexOf('.') >= 0) { best = token; } token = ''; } } else { token += ch; } } if (!best && token && token.indexOf('@') >= 0 && token.indexOf('.') >= 0) best = token; return best ? best.trim() : null; } var nm = extractAfter('name'); if (nm) out.name = nm; var em = extractEmail(t); if (em) out.email = em; var pw = extractAfter('password'); if (pw) out.password = pw; if (!out.name && lower.indexOf('email') === -1 && lower.indexOf('password') === -1) { out.name = t.trim(); } return out; }
  function askNextSetupField() { var pending = setupFieldsCache.find(function(f){ return !state.init[f.key]; }); if (!pending) { renderInitialConfirm(setupFieldsCache); return; } addBubble('bot', (pending.label || pending.key) + ':'); clearActions(); }
  function handleUserMessage(text) { addBubble('user', text); if (state.step === 'reg_collect') { var next = parseRegFromText(text); state.reg = next; saveState(); var missing = []; if (!state.reg.name) missing.push('name'); if (!state.reg.email) missing.push('email'); if (!state.reg.password || String(state.reg.password).length < 8) missing.push('password'); if (missing.length === 0) { renderRegistrationConfirm(); } else { addBubble('bot', 'Missing: ' + missing.join(', ') + '.'); } return; } if (state.step === 'setup_collect') { var f = setupFieldsCache.find(function(ff){ return !state.init[ff.key]; }); if (f) { state.init[f.key] = text.trim(); saveState(); askNextSetupField(); return; } } }
  sendBtn.onclick = function(){ var t = input.value.trim(); if (!t) return; input.value = ''; handleUserMessage(t); };
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); } });

  if (state.step === 'registration' && state.reg && state.reg.name && state.reg.email && state.reg.password) { renderRegistrationConfirm(); }
  else if (state.step === 'setup_collect' || state.step === 'setup_confirm') { fetch(API_BASE + '/api/onboarding/chat', { method:'POST', headers:{ 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action:'get_initial_fields' }) }).then(function(r){ return r.json(); }).then(function(d){ var fs = Array.isArray(d.fields)? d.fields: []; var onlyReq = fs.filter(function(f){ return !!f && (f.required === true || f.required === 'true'); }); if (state.step === 'setup_confirm') { renderInitialConfirm(onlyReq); } else { renderInitialSetup(onlyReq); } }).catch(function(){ renderInitialSetup([]); }); }
  else { renderRegistrationIntro(); }
})();
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      ...corsHeaders,
    },
  });
}
