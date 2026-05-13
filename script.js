const API_KEY = "brother or sister, put your API key here 🙏";
const chatBox  = document.getElementById('chat');
const inputEl  = document.getElementById('msg');
const welcome  = document.getElementById('welcome');
const themeBtn = document.getElementById('themeBtn');
const modal    = document.getElementById('modal');

let history = JSON.parse(localStorage.getItem('chatHistory_v2')) || [
  { role: "system", content: "You are BongcongAI, a helpful and friendly AI assistant. Reply in Bengali if user writes in Bengali. Reply in English if user writes in English. Be concise, warm, and helpful." }
];
let isDark    = localStorage.getItem('theme') !== 'light';
let isLoading = false;

applyTheme();
renderHistory();

function applyTheme() {
  document.documentElement.classList.toggle('light', !isDark);
  document.body.classList.toggle('light', !isDark);
  themeBtn.textContent = isDark ? '☀️' : '🌙';
}
themeBtn.onclick = () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
};

function renderHistory() {
  const msgs = history.filter(m => m.role !== 'system');
  if (!msgs.length) { welcome.style.display = 'flex'; return; }
  welcome.style.display = 'none';
  chatBox.innerHTML = '';
  msgs.forEach(m => appendBubble(m.role, m.content, false));
  scrollDown();
}

function appendBubble(role, content, animate = true) {
  welcome.style.display = 'none';
  const isUser = role === 'user';
  const time   = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const row = document.createElement('div');
  row.className = [
    'flex gap-[10px] items-end',
    isUser ? 'flex-row-reverse' : '',
    animate ? 'animate-fade-up' : 'no-anim'
  ].join(' ');

  
  const av = document.createElement('div');
  av.className = 'w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-medium';
  if (isUser) {
    av.classList.add('border-soft', 'bg-hover', 'text-muted');
  } else {
    av.classList.add(
      'bg-gradient-to-br',
      'from-[var(--color-accent)]',
      'to-[var(--color-accent2)]',
      'shadow-[0_2px_10px_rgba(99,179,237,.3)]',
      'text-white'
    );
  }
  av.textContent = isUser ? '👤' : '✦';

  const col    = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.classList.add('max-w-[75%]', 'px-4', 'py-3', 'text-[14.5px]', 'leading-[1.65]', 'text-pri');

  if (isUser) {
    bubble.classList.add(
      'border-user',
      'rounded-[18px]', 'rounded-br-[4px]',
      'bg-gradient-to-br',
      'from-[rgba(99,179,237,.15)]',
      'to-[rgba(159,122,234,.1)]'
    );
  } else {
    bubble.classList.add('border-soft', 'bg-ai-bub', 'rounded-[18px]', 'rounded-bl-[4px]');
  }
  bubble.textContent = content;

  const timeEl = document.createElement('div');
  timeEl.className = ['text-[11px] mt-1 px-1 text-dim', isUser ? 'text-right' : ''].join(' ');
  timeEl.textContent = time;

  col.appendChild(bubble);
  col.appendChild(timeEl);
  row.appendChild(av);
  row.appendChild(col);
  chatBox.appendChild(row);
}

function appendTyping() {
  const row = document.createElement('div');
  row.className = 'flex gap-[10px] items-end animate-fade-up';
  row.id = 'typingRow';

  const av = document.createElement('div');
  av.className = 'w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-[13px] text-white bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent2)] shadow-[0_2px_10px_rgba(99,179,237,.3)]';
  av.textContent = '✦';

  const bub = document.createElement('div');
  bub.className = 'border-soft bg-ai-bub px-[18px] py-[14px] rounded-[18px] rounded-bl-[4px] flex gap-[5px] items-center';
  bub.innerHTML = `
    <div class="w-[6px] h-[6px] rounded-full bg-[var(--color-accent)] animate-typing"></div>
    <div class="w-[6px] h-[6px] rounded-full bg-[var(--color-accent)] animate-typing2"></div>
    <div class="w-[6px] h-[6px] rounded-full bg-[var(--color-accent)] animate-typing3"></div>`;

  row.appendChild(av);
  row.appendChild(bub);
  chatBox.appendChild(row);
  scrollDown();
}

function removeTyping() { document.getElementById('typingRow')?.remove(); }
function scrollDown()   { chatBox.scrollTop = chatBox.scrollHeight; }

async function sendMsg() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  inputEl.value = '';
  inputEl.style.height = 'auto';
  isLoading = true;

  history.push({ role: 'user', content: text });
  saveHistory();
  appendBubble('user', text);
  appendTyping();
  scrollDown();

  try {
    const res  = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: history })
    });
    const data = await res.json();
    removeTyping();

    if (data.choices?.[0]) {
      const reply = data.choices[0].message.content;
      history.push({ role: 'assistant', content: reply });
      saveHistory();
      appendBubble('assistant', reply);
    } else {
      showError('কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করো।');
    }
  } catch {
    removeTyping();
    showError('Error হয়েছে। API key বা নেট কানেকশন চেক করো।');
  }

  isLoading = false;
  scrollDown();
}

function showError(msg) {
  const div = document.createElement('div');
  div.className = 'text-center text-[13px] px-4 py-2 rounded-[10px] my-1 text-danger bg-[rgba(252,129,129,.08)] border border-[rgba(252,129,129,.15)]';
  div.textContent = msg;
  chatBox.appendChild(div);
}

function saveHistory() { localStorage.setItem('chatHistory_v2', JSON.stringify(history)); }
function quickSend(t)  { inputEl.value = t; sendMsg(); }

document.getElementById('clearBtn').onclick = () => modal.classList.replace('hidden', 'flex');
function closeModal() { modal.classList.replace('flex', 'hidden'); }
function confirmClear() {
  history = [history[0]];
  saveHistory();
  chatBox.innerHTML = '';
  welcome.style.display = 'flex';
  chatBox.appendChild(welcome);
  closeModal();
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
});
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});
document.getElementById('sendBtn').onclick = sendMsg;