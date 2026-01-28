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
  var theme = 'blue';
  try { 
    if (el && typeof el.getAttribute === 'function') { 
      apiKey = el.getAttribute('data-api-key') || ''; 
      chatTitle = el.getAttribute('data-chat-title') || 'Onboarding Assistant'; 
      theme = el.getAttribute('data-theme') || 'blue';
    } 
  } catch (e) {}

  if (!apiKey || !apiKey.startsWith('ak_')) {
    throw new Error('API key required');
  }

  var state = (function() {
    const raw = localStorage.getItem('onboarding_state');
    try { return raw ? JSON.parse(raw) : { step: 'registration', reg: {}, authToken: null, authApiKey: null, init: {}, additionalSteps: [], stepIdx: 0, stepData: {} }; } catch { return { step: 'registration', reg: {}, authToken: null, authApiKey: null, init: {}, additionalSteps: [], stepIdx: 0, stepData: {} }; }
  })();
  function saveState() { localStorage.setItem('onboarding_state', JSON.stringify(state)); }
  var sid = (function(){ var s = localStorage.getItem('onboarding_sid'); if (!s) { s = 'sess_' + Math.random().toString(36).slice(2); localStorage.setItem('onboarding_sid', s); } return s; })();

  var primaryColor = '#3b82f6';
  if (theme === 'green') { primaryColor = '#10b981'; }
  else if (theme === 'purple') { primaryColor = '#8b5cf6'; }

  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;';
  var panel = document.createElement('div');
  panel.style.cssText = 'width:70vw;max-width:800px;height:70vh;max-height:720px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden;';
  var header = document.createElement('div');
  header.style.cssText = 'padding:12px 16px;background:' + primaryColor + ';color:#fff;font-weight:600;display:flex;align-items:center;justify-content:space-between;';
  header.textContent = chatTitle;
  var messages = document.createElement('div');
  messages.style.cssText = 'flex:1;padding:14px;overflow:auto;font-size:14px;color:#374151;background:#f9fafb;';
  var actions = document.createElement('div');
  actions.style.cssText = 'padding:8px 12px;border-top:1px solid #e5e7eb;background:#fff;display:flex;gap:8px;flex-wrap:wrap;';
  var inputBar = document.createElement('div');
  inputBar.style.cssText = 'padding:10px;border-top:1px solid #e5e7eb;background:#fff;display:flex;flex-direction:column;gap:8px;';

  var intentContainer = document.createElement('div');
  intentContainer.style.cssText = 'display:flex;gap:12px;font-size:12px;color:#374151;padding-left:4px;';
  intentContainer.innerHTML = '<label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="msg_intent" value="answer" checked> Provide Answer/Data</label><label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="msg_intent" value="question"> Ask a Question</label>';
  
  var inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;gap:8px;width:100%';
  
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message';
  input.style.cssText = 'flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;';
  var sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.cssText = 'padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;background:' + primaryColor + ';color:#fff;font-weight:600;';
  
  inputRow.appendChild(input); inputRow.appendChild(sendBtn);
  inputBar.appendChild(intentContainer);
  inputBar.appendChild(inputRow);
  
  panel.appendChild(header); panel.appendChild(messages); panel.appendChild(actions); panel.appendChild(inputBar); container.appendChild(panel); document.body.appendChild(container);

  function clearActions() { while (actions.firstChild) actions.removeChild(actions.firstChild); }
  function addAction(label, onClick) { var b = document.createElement('button'); b.textContent = label; b.style.cssText = 'padding:8px 12px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#374151;font-weight:600;'; b.onclick = onClick; actions.appendChild(b); return b; }
  function addBubble(role, text) { var row = document.createElement('div'); row.style.cssText = 'display:flex;margin-bottom:10px;'; var bubble = document.createElement('div'); bubble.textContent = text; if (role === 'user') { row.style.justifyContent = 'flex-end'; bubble.style.cssText = 'max-width:70%;background:' + primaryColor + ';color:#fff;padding:10px 12px;border-radius:14px 14px 2px 14px;'; } else { row.style.justifyContent = 'flex-start'; bubble.style.cssText = 'max-width:70%;background:#fff;color:#374151;padding:10px 12px;border-radius:14px 14px 14px 2px;border:1px solid #e5e7eb;'; } row.appendChild(bubble); messages.appendChild(row); messages.scrollTop = messages.scrollHeight; }
  function addQuestionBubble(question, reason) { var row = document.createElement('div'); row.style.cssText = 'display:flex;margin-bottom:10px;'; var bubble = document.createElement('div'); bubble.style.cssText = 'max-width:70%;background:#fff;color:#374151;padding:10px 12px;border-radius:14px 14px 14px 2px;border:1px solid #e5e7eb;display:flex;flex-direction:column;gap:4px;'; var q = document.createElement('div'); q.textContent = question; q.style.cssText = 'font-size:14px;color:#111827;'; var r = document.createElement('div'); r.textContent = reason; r.style.cssText = 'font-size:12px;color:#6b7280;'; bubble.appendChild(q); if (reason && String(reason).trim().length > 0) bubble.appendChild(r); row.style.justifyContent = 'flex-start'; row.appendChild(bubble); messages.appendChild(row); messages.scrollTop = messages.scrollHeight; }

  var typingBubble = null;
  function showTyping() {
    if (typingBubble) return;
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;margin-bottom:10px;justify-content:flex-start;';
    var bubble = document.createElement('div');
    bubble.style.cssText = 'background:#fff;color:#374151;padding:10px 12px;border-radius:14px 14px 14px 2px;border:1px solid #e5e7eb;display:flex;gap:4px;align-items:center;min-width:40px;justify-content:center;';
    
    for (var i = 0; i < 3; i++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:typing 1.4s infinite ease-in-out both;';
        if (i === 1) dot.style.animationDelay = '0.2s';
        if (i === 2) dot.style.animationDelay = '0.4s';
        bubble.appendChild(dot);
    }
    
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    typingBubble = row;
    
    if (!document.getElementById('typing-style')) {
        var style = document.createElement('style');
        style.id = 'typing-style';
        style.innerHTML = '@keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }';
        document.head.appendChild(style);
    }
  }

  function hideTyping() {
    if (typingBubble && typingBubble.parentNode) {
        typingBubble.parentNode.removeChild(typingBubble);
    }
    typingBubble = null;
  }


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
    const regPayload = Object.assign({}, state.reg, { __sessionId: sid });
    const res = await fetch(API_BASE + '/api/onboarding/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action: 'register', payload: regPayload }) });
    const data = await res.json();
    if (!data.success) { addBubble('bot', 'Registration failed: ' + (data.error || '')); addAction('Edit Details', function(){ renderRegistrationIntro(); }); return; }
    state.authToken = data.authToken || null; state.authApiKey = data.authApiKey || null; 
    state.additionalSteps = Array.isArray(data.additionalSteps) ? data.additionalSteps : [];
    saveState();
    var fields = Array.isArray(data.initialFields) ? data.initialFields : [];
    renderInitialSetup(fields);
  }

  var setupFieldsCache = [];
  function renderInitialSetup(fields) {
    setupFieldsCache = Array.isArray(fields) ? fields.filter(function(f){ return !!f; }) : [];
    if (!setupFieldsCache || setupFieldsCache.length === 0) { 
      // No initial setup fields, check for additional steps
      if (state.additionalSteps && state.additionalSteps.length > 0) {
        messages.innerHTML = ''; clearActions();
        addBubble('bot', 'Registration successful.');
        addBubble('bot', 'No initial setup fields configured. Moving to additional steps...');
        setTimeout(function(){ startAdditionalSteps(); }, 2000);
      } else {
        messages.innerHTML = ''; clearActions();
        addBubble('bot', 'Registration complete. No initial setup required.'); clearActions(); addAction('Close', function(){ container.remove(); }); state.step = 'complete'; saveState(); 
      }
      return; 
    }
    messages.innerHTML = '';
    clearActions();
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
    addAction('Skip Initial Setup', function(){ 
      if (state.additionalSteps && state.additionalSteps.length > 0) {
        startAdditionalSteps();
      } else {
        addBubble('bot', 'Onboarding complete.');
        clearActions(); addAction('Close', function(){ container.remove(); });
        state.step = 'complete'; saveState();
      }
    });
    state.step = 'setup_confirm'; saveState();
  }

  async function submitInitialSetup(fields) {
    clearActions(); addBubble('bot', 'Submitting initial setup...');
    var payload = Object.assign(
      {},
      state.init,
      state.authToken ? { __authToken: state.authToken } : {},
      state.authApiKey ? { __apiKey: state.authApiKey } : {},
      state.reg && state.reg.email ? { __userEmail: state.reg.email } : {},
      { __sessionId: sid }
    );
    const res = await fetch(API_BASE + '/api/onboarding/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action: 'initial_setup', payload }) });
    const data = await res.json();
    if (!data.success) { addBubble('bot', 'Initial setup failed: ' + (data.error || '')); addAction('Edit Details', function(){ renderInitialSetup(fields); }); return; }
    
    if (state.additionalSteps && state.additionalSteps.length > 0) {
      startAdditionalSteps();
    } else {
      addBubble('bot', 'Onboarding complete.');
      clearActions(); addAction('Close', function(){ container.remove(); });
      state.step = 'complete'; saveState();
    }
  }

  function startAdditionalSteps() {
    state.stepIdx = 0;
    saveState();
    renderAdditionalStep();
  }

  function renderAdditionalStep() {
    if (!state.additionalSteps || state.stepIdx >= state.additionalSteps.length) {
      addBubble('bot', 'All steps complete. You are ready to go!');
      clearActions(); addAction('Close', function(){ container.remove(); });
      state.step = 'complete'; saveState();
      return;
    }
    var step = state.additionalSteps[state.stepIdx];
    messages.innerHTML = ''; 
    clearActions();
    addBubble('bot', "Step " + (state.stepIdx + 1) + ": " + (step.name || 'Next Step'));
    
    state.step = 'additional_step_collect';
    state.stepData = {};
    saveState();
    
    var fields = Array.isArray(step.fields) ? step.fields : [];
    if (fields.length === 0) {
       addAction('Proceed', function() { submitAdditionalStep(); });
    } else {
       askNextAdditionalField();
    }
  }

  function askNextAdditionalField() {
    var step = state.additionalSteps[state.stepIdx];
    var fields = Array.isArray(step.fields) ? step.fields : [];
    var pending = fields.find(function(f){ return !state.stepData[f.key]; });
    if (!pending) {
      renderAdditionalConfirm();
      return;
    }
    var q = generateQuestion(pending);
    var r = generateReason(pending);
    addQuestionBubble(q, r);
    clearActions();
  }

  function renderAdditionalConfirm() {
     messages.innerHTML = '';
     clearActions();
     var step = state.additionalSteps[state.stepIdx];
     addBubble('bot', 'Review ' + step.name + ':');
     var fields = Array.isArray(step.fields) ? step.fields : [];
     fields.forEach(function(f){ addBubble('bot', (f.label || f.key) + ': ' + (state.stepData[f.key] || '')); });
     addAction('Confirm', submitAdditionalStep);
     addAction('Edit', function(){ 
         state.stepData = {}; saveState(); renderAdditionalStep();
     });
  }

  async function submitAdditionalStep() {
    clearActions(); addBubble('bot', 'Processing step...');
    var step = state.additionalSteps[state.stepIdx];
    var payload = Object.assign(
      {},
      state.stepData,
      state.authToken ? { __authToken: state.authToken } : {},
      state.authApiKey ? { __apiKey: state.authApiKey } : {},
      { __sessionId: sid }
    );
    const res = await fetch(API_BASE + '/api/onboarding/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action: 'additional_step', stepId: step.id, payload }) });
    const data = await res.json();
    if (!data.success) { 
        addBubble('bot', 'Step failed: ' + (data.error || '')); 
        addAction('Retry', function(){ submitAdditionalStep(); });
        addAction('Edit', function(){ state.stepData = {}; saveState(); renderAdditionalStep(); }); 
        return; 
    }
    addBubble('bot', 'Step completed.');
    state.stepIdx++;
    saveState();
    renderAdditionalStep();
  }

  function parseRegFromText(t) { var out = { name: state.reg.name || '', email: state.reg.email || '', password: state.reg.password || '' }; var lower = t.toLowerCase(); function extractAfter(label) { var idx = lower.indexOf(label); if (idx < 0) return null; var rest = t.slice(idx + label.length); var j = 0; while (j < rest.length && (rest[j] === ':' || rest[j] === '-' || rest[j] === ' ')) j++; rest = rest.slice(j); var endComma = rest.indexOf(','); var endNl = rest.indexOf('\\\\n'); var end = -1; if (endComma >= 0 && endNl >= 0) end = Math.min(endComma, endNl); else end = endComma >= 0 ? endComma : endNl; var value = end >= 0 ? rest.slice(0, end) : rest; return value.trim(); } function extractEmail(txt) { var best = null; var token = ''; for (var i = 0; i < txt.length; i++) { var ch = txt[i]; if (ch === ' ' || ch === ',' || ch === '\\\\n') { if (token) { if (token.indexOf('@') >= 0 && token.indexOf('.') >= 0) { best = token; } token = ''; } } else { token += ch; } } if (!best && token && token.indexOf('@') >= 0 && token.indexOf('.') >= 0) best = token; return best ? best.trim() : null; } var nm = extractAfter('name'); if (nm) out.name = nm; var em = extractEmail(t); if (em) out.email = em; var pw = extractAfter('password'); if (pw) out.password = pw; if (!out.name && lower.indexOf('email') === -1 && lower.indexOf('password') === -1) { out.name = t.trim(); } return out; }
  
  function generateQuestion(field) {
    var label = field.label || field.key;
    var l = label.toLowerCase();
    if (l.includes('email') && l.length < 10) return "What is your email address?";
    if (l.includes('name') && l.length < 10) return "What is your full name?";
    if (l.includes('phone') || l.includes('mobile')) return "What is your phone number?";
    if (l.includes('company') || l.includes('organization')) return "What is the name of your company?";
    if (l.includes('api key') || l.includes('apikey')) return "Could you please provide your API Key?";
    if (l.includes('token')) return "Please enter your authentication token.";
    
    var prompts = [
      "Please enter your " + label + ".",
      "What is your " + label + "?",
      "Could you provide your " + label + "?"
    ];
    var idx = label.length % prompts.length;
    return prompts[idx];
  }

  function generateReason(field) {
    if (field.description && field.description.trim().length > 0) return field.description;
    var label = field.label || field.key;
    var l = label.toLowerCase();
    if (l.includes('email')) return "We will use this email to identify the user and send confirmations.";
    if (l.includes('name')) return "This helps personalise the account and communications.";
    if (l.includes('phone') || l.includes('mobile')) return "This lets us contact the user or send SMS notifications if needed.";
    if (l.includes('company') || l.includes('organization')) return "This ties the account and data back to the right organisation.";
    if (l.includes('api key') || l.includes('apikey')) return "The API key is needed so we can call your API securely on your behalf.";
    if (l.includes('token')) return "The token is required to authenticate requests to your API.";
    return "This information is required so your onboarding flow and API integration work correctly.";
  }

  function askNextSetupField() { var pending = setupFieldsCache.find(function(f){ return !state.init[f.key]; }); if (!pending) { renderInitialConfirm(setupFieldsCache); return; } var q = generateQuestion(pending); var r = generateReason(pending); addQuestionBubble(q, r); clearActions(); }
  
  // Add a persistent option to skip initial setup and proceed directly to additional steps
  // This ensures additional APIs can work even if initial steps are not completed.
  addAction('Skip Initial Setup', function(){ 
    if (state.additionalSteps && state.additionalSteps.length > 0) {
      startAdditionalSteps();
    } else {
      // Fetch latest steps in case they were not loaded yet
      fetch(API_BASE + '/api/onboarding/chat', { method:'POST', headers:{ 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action:'get_initial_fields' }) })
        .then(function(r){ return r.json(); })
        .then(function(d){
          state.additionalSteps = d.additionalSteps || [];
          saveState();
          if (state.additionalSteps.length > 0) { startAdditionalSteps(); }
          else { addBubble('bot', 'No additional steps are configured.'); }
        }).catch(function(){
          addBubble('bot', 'Could not load additional steps.');
        });
    }
  });
  
  function handleUserMessage(text) { 
    addBubble('user', text); 

    var messageType = 'answer';
    try {
        var checked = intentContainer.querySelector('input[name="msg_intent"]:checked');
        if (checked) messageType = checked.value;
    } catch(e) {}

    if (messageType === 'question') {
       showTyping();
       fetch(API_BASE + '/api/onboarding/chat', { method:'POST', headers:{ 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action:'answer_question', payload:{ question: text } }) })
       .then(function(r){ return r.json(); })
       .then(function(d){
           hideTyping();
           if (d.success && d.answer) {
               addBubble('bot', d.answer);
           } else {
               addBubble('bot', d.error || "I couldn't find an answer to that question.");
           }
           
           if (state.step === 'reg_collect') {
               var missing = []; if (!state.reg.name) missing.push('name'); if (!state.reg.email) missing.push('email'); if (!state.reg.password || String(state.reg.password).length < 8) missing.push('password'); 
               if (missing.length > 0) { addBubble('bot', 'Still missing: ' + missing.join(', ') + '.'); }
           } else if (state.step === 'reg_confirm') {
               renderRegistrationConfirm();
           } else if (state.step === 'setup_collect') { 
               askNextSetupField(); 
           } else if (state.step === 'setup_confirm') {
               renderInitialConfirm(setupFieldsCache);
           } else if (state.step === 'additional_step_collect') { 
               askNextAdditionalField(); 
           }
       })
       .catch(function(){ 
           hideTyping();
           addBubble('bot', "Sorry, I encountered an error processing your question.");
           if (state.step === 'setup_collect') { askNextSetupField(); }
           else if (state.step === 'additional_step_collect') { askNextAdditionalField(); }
           else if (state.step === 'setup_confirm') { renderInitialConfirm(setupFieldsCache); }
       });
       return;
    }

    processInput(text);

    function processInput(text) {
        if (state.step === 'reg_collect') { var next = parseRegFromText(text); state.reg = next; saveState(); var missing = []; if (!state.reg.name) missing.push('name'); if (!state.reg.email) missing.push('email'); if (!state.reg.password || String(state.reg.password).length < 8) missing.push('password'); if (missing.length === 0) { renderRegistrationConfirm(); } else { addBubble('bot', 'Missing: ' + missing.join(', ') + '.'); } return; } 
        if (state.step === 'setup_collect') { var f = setupFieldsCache.find(function(ff){ return !state.init[ff.key]; }); if (f) { state.init[f.key] = text.trim(); saveState(); askNextSetupField(); return; } } 
        if (state.step === 'additional_step_collect') {
            var step = state.additionalSteps[state.stepIdx];
            var fields = Array.isArray(step.fields) ? step.fields : [];
            var f = fields.find(function(ff){ return !state.stepData[ff.key]; });
            if (f) {
                state.stepData[f.key] = text.trim();
                saveState();
                askNextAdditionalField();
                return;
            }
        }
    }
  }
  
  sendBtn.onclick = function(){ var t = input.value.trim(); if (!t) return; input.value = ''; handleUserMessage(t); };
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); } });

  if (state.step === 'registration' && state.reg && state.reg.name && state.reg.email && state.reg.password) { renderRegistrationConfirm(); }
  else if (state.step === 'setup_collect' || state.step === 'setup_confirm') { fetch(API_BASE + '/api/onboarding/chat', { method:'POST', headers:{ 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action:'get_initial_fields' }) }).then(function(r){ return r.json(); }).then(function(d){ 
      state.additionalSteps = d.additionalSteps || []; saveState();
      var fs = Array.isArray(d.fields)? d.fields: []; if (state.step === 'setup_confirm') { renderInitialConfirm(fs); } else { renderInitialSetup(fs); } }).catch(function(){ renderInitialSetup([]); }); }
  else if (state.step === 'additional_step_collect') {
       fetch(API_BASE + '/api/onboarding/chat', { method:'POST', headers:{ 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ action:'get_initial_fields' }) }).then(function(r){ return r.json(); }).then(function(d){ 
          state.additionalSteps = d.additionalSteps || []; saveState();
          renderAdditionalStep();
       });
  }
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
