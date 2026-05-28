/**
 * SOLVY Ecosystem™ — AI Chat Widget
 * Privacy-First FAQ Assistant
 *
 * This widget runs entirely in the browser. No chat logs are sent to any
 * third-party server. All conversation history stays in sessionStorage.
 *
 * To embed: add <script src="/js/components/ai-chat-widget.js"></script> to any page.
 *
 * @version 1.0
 * @author SOLVY Technical Team
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const CONFIG = {
    // Widget appearance
    position: 'bottom-right',
    primaryColor: '#22c55e',
    primaryColorDim: 'rgba(34, 197, 94, 0.15)',
    goldColor: '#f59e0b',
    darkBg: '#0f172a',
    cardBg: '#1e293b',
    borderColor: '#334155',
    textColor: '#e2e8f0',
    mutedColor: '#94a3b8',

    // Behavior
    greeting: "👋 Hi! I'm SOLVY's AI assistant. Ask me about your card, cooperative economics, or data sovereignty.",
    disclaimer: "AI is experimental. For complex issues, contact a human.",
    humanSupportEmail: 'support@ebl.beauty',
    storageKey: 'solvy_chat_history',
    maxHistory: 50,

    // Keywords for escalation to human
    humanKeywords: ['human', 'person', 'real person', 'agent', 'representative', 'lawyer', 'dispute', 'fraud', 'lawsuit', 'HUMAN'],

    // FAQ Knowledge Base
    faq: [
      {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'sup'],
        response: "Hello! I'm SOLVY's AI assistant. How can I help you today?"
      },
      {
        keywords: ['70/20/10', '70 20 10', 'split', 'dividend', 'profit share', 'interchange', 'revenue split'],
        response: "The SOLVY 70/20/10 model works like this:\n\n• **70%** — Member patronage dividends (goes back to you and other members)\n• **20%** — Community development pool (invested in cooperative projects)\n• **10%** — Operations reserve (keeps SOLVY running smoothly)\n\nThis means every time you swipe your SOLVY Card, you're building wealth for the entire cooperative."
      },
      {
        keywords: ['cooperative', 'co-op', 'coop', 'what is a cooperative', 'member owned'],
        response: "A cooperative is a business owned and governed by its members — that's you!\n\nUnlike traditional banks that answer to shareholders, SOLVY answers to its members. You have a vote in how the cooperative operates, and you share in the profits through patronage dividends.\n\nSA Nathan LLC operates as a Texas LLC with cooperative structure, which means our legal structure requires member benefit to come first."
      },
      {
        keywords: ['data sovereignty', 'privacy', 'my data', 'who sees my data', 'local storage', 'indexeddb'],
        response: "🔒 **Your data stays on your device. Period.**\n\n• Your full transaction history lives in your browser's IndexedDB (local storage)\n• Only aggregated, anonymized totals ever leave your device\n• No central server stores your individual transactions\n• Even SOLVY's admin team cannot see your shopping history\n\nThis is enforced by our architecture — not just a promise. You can verify this yourself: open your browser's DevTools → Application → IndexedDB → solvy_local_db."
      },
      {
        keywords: ['card', 'solvy card', 'how does the card work', 'debit card', 'visa'],
        response: "Your SOLVY Card is a Visa debit card issued through our banking partner, Unit.co (Thread Bank).\n\n• Use it anywhere Visa is accepted\n• Interchange fees (about 1.5% per transaction) fund the 70/20/10 member pool\n• Freeze/unfreeze instantly from your dashboard\n• Add to Apple Pay or Google Pay\n\nThe card is more than a payment tool — it's a ownership stake in the cooperative."
      },
      {
        keywords: ['lost card', 'stolen card', 'freeze', 'lock card', 'card missing'],
        response: "If your card is lost or stolen:\n\n1. **Freeze it immediately** from your SOLVY dashboard or banking portal\n2. Go to Banking → Cards → Freeze Card\n3. Contact support if you see unauthorized transactions\n4. Request a replacement card\n\nFreezing stops all transactions instantly. You can unfreeze later if you find the card."
      },
      {
        keywords: ['dispute', 'chargeback', 'wrong charge', 'unauthorized', 'fraud'],
        response: "For transaction disputes or suspected fraud:\n\n1. Document the transaction (date, amount, merchant)\n2. Freeze your card if needed\n3. Email support@ebl.beauty with 'DISPUTE' in the subject line\n4. A human will investigate within 24 hours\n\n⚠️ **Important:** For legal or fraud matters, always request a human agent."
      },
      {
        keywords: ['transactions', 'view transactions', 'my expenses', 'spending history', 'where are my transactions'],
        response: "Your transactions are stored locally on your device.\n\nTo view them:\n• Go to the **Banking** portal → **Transactions** tab\n• Or open the **MAN portal** → **Transactions** page\n\nYour history never leaves your device unless you explicitly opt in to share aggregated, anonymized totals. You remain in full control."
      },
      {
        keywords: ['onboarding', 'sign up', 'join', 'how do i join', 'become a member', 'member application'],
        response: "To become a SOLVY member:\n\n1. Visit the onboarding page and complete the member application\n2. Provide required identity verification (KYC) for banking compliance\n3. Fund your account via ACH, wire, or direct deposit\n4. Your SOLVY Card will be mailed to you\n\nAs a cooperative member, you'll receive patronage dividends based on your card usage."
      },
      {
        keywords: ['contact', 'support', 'email', 'phone', 'help desk', 'reach someone'],
        response: "You can reach SOLVY support:\n\n• 📧 Email: support@ebl.beauty\n• 🤖 AI Assistant: Right here, 24/7\n• 👤 Human: Email support@ebl.beauty — we reply within 24 hours\n\nFor urgent issues (lost card, fraud), email immediately and include 'URGENT' in the subject."
      },
      {
        keywords: ['member pool', 'patronage', 'dividend', 'when do i get paid', 'profit sharing'],
        response: "The Member Pool (70% of interchange revenue) is distributed as patronage dividends.\n\n• Dividends are calculated based on your card usage volume\n• The more you use your SOLVY Card, the larger your share\n• Distributions happen quarterly after launch\n• You can view your estimated contribution in the MAN portal\n\nThis is real cooperative economics — your spending builds collective wealth."
      },
      {
        keywords: ['sovereign fund', 'emergency fund', '10%', 'reserve', 'sovereignitity'],
        response: "The Sovereign Fund (10% of interchange) is the cooperative's emergency reserve and generational wealth builder.\n\n• Held for unexpected cooperative needs\n• Can be deployed for member emergencies via proposal and vote\n• Grows over time as the cooperative scales\n• Members vote on major sovereign fund allocations\n\nThis fund embodies the Sheila Mandate: *'Leave them better than I received.'*"
      },
      {
        keywords: ['vote', 'proposal', 'governance', 'member vote', 'decision', 'threshold'],
        response: "SOLVY is member-governed through the MAN (Mandatory Audit Network) portal.\n\n• Members can propose initiatives (community projects, fund allocations)\n• Proposals require a spending/volume threshold to activate voting\n• Each member gets one vote (one member, one vote)\n• Votes are recorded locally on your device for transparency\n\nVisit the MAN portal to see active proposals and cast your vote."
      },
      {
        keywords: ['unit', 'unit.co', 'thread bank', 'banking partner', 'who is your bank'],
        response: "SOLVY partners with **Unit.co**, a Banking-as-a-Service platform backed by **Thread Bank**.\n\n• Your deposits are FDIC-insured up to $250,000 through Thread Bank\n• Unit.co provides the white-label banking infrastructure\n• SOLVY adds the cooperative layer, member governance, and data sovereignty\n\nThis partnership gives you the security of a real bank with the ownership of a cooperative."
      },
      {
        keywords: ['thank', 'thanks', 'appreciate', 'goodbye', 'bye', 'see you'],
        response: "You're welcome! I'm here 24/7 if you need anything else. Remember: your data is sovereign, your card builds wealth, and you own the cooperative. 💚"
      }
    ]
  };

  // ============================================================
  // KNOWLEDGE BASE ENGINE
  // ============================================================

  function findBestResponse(input) {
    const clean = input.toLowerCase().trim();
    if (!clean) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const item of CONFIG.faq) {
      let score = 0;
      for (const keyword of item.keywords) {
        const kw = keyword.toLowerCase();
        if (clean === kw) {
          score += 10; // exact match
        } else if (clean.includes(kw)) {
          score += 5; // contains keyword
        } else {
          // Check for word overlap
          const inputWords = clean.split(/\s+/);
          const kwWords = kw.split(/\s+/);
          const overlap = inputWords.filter(w => kwWords.includes(w)).length;
          score += overlap * 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    return bestScore >= 2 ? bestMatch : null;
  }

  function checkHumanEscalation(input) {
    const clean = input.toLowerCase();
    return CONFIG.humanKeywords.some(kw => clean.includes(kw.toLowerCase()));
  }

  function generateResponse(input) {
    // Check for human escalation first
    if (checkHumanEscalation(input)) {
      return {
        type: 'human',
        text: "I'll connect you with a human agent. Please provide your email and a brief description of your issue, and a real person will reply within 24 hours."
      };
    }

    // Try FAQ match
    const match = findBestResponse(input);
    if (match) {
      return { type: 'ai', text: match.response };
    }

    // Fallback
    return {
      type: 'ai',
      text: "I'm not sure I understand. Try asking about:\n• Your SOLVY Card\n• The 70/20/10 split\n• Data sovereignty\n• Cooperative economics\n• Lost cards or disputes\n\nOr type **HUMAN** to speak with a real person."
    };
  }

  // ============================================================
  // STORAGE
  // ============================================================

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(CONFIG.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      const trimmed = history.slice(-CONFIG.maxHistory);
      sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(trimmed));
    } catch (e) {
      // sessionStorage might be full or unavailable
    }
  }

  // ============================================================
  // DOM CREATION
  // ============================================================

  function createWidget() {
    // Prevent duplicate widgets
    if (document.getElementById('solvy-chat-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'solvy-chat-widget';
    widget.innerHTML = `
      <style>
        #solvy-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Floating Button */
        .solvy-chat-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .solvy-chat-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
        }
        .solvy-chat-btn.hidden { display: none; }

        /* Chat Window */
        .solvy-chat-window {
          display: none;
          width: 360px;
          max-width: calc(100vw - 40px);
          max-height: 520px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          overflow: hidden;
          flex-direction: column;
        }
        .solvy-chat-window.open { display: flex; }

        /* Header */
        .solvy-chat-header {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .solvy-chat-header-title {
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .solvy-chat-header-status {
          font-size: 0.7rem;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .solvy-chat-header-status::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          display: inline-block;
        }
        .solvy-chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0.8;
          padding: 0;
          width: auto;
        }
        .solvy-chat-close:hover { opacity: 1; }

        /* Messages Area */
        .solvy-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 280px;
          max-height: 380px;
        }

        /* Message Bubbles */
        .solvy-msg {
          max-width: 85%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.85rem;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .solvy-msg.ai {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .solvy-msg.user {
          background: rgba(34, 197, 94, 0.15);
          color: #e2e8f0;
          border: 1px solid rgba(34, 197, 94, 0.3);
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .solvy-msg strong { color: #22c55e; }
        .solvy-msg em { color: #94a3b8; }

        /* Input Area */
        .solvy-chat-input-area {
          padding: 0.75rem 1rem 1rem;
          border-top: 1px solid #334155;
          display: flex;
          gap: 0.5rem;
        }
        .solvy-chat-input {
          flex: 1;
          padding: 0.6rem 0.9rem;
          border-radius: 12px;
          border: 1px solid #334155;
          background: #1e293b;
          color: #e2e8f0;
          font-size: 0.85rem;
          outline: none;
        }
        .solvy-chat-input:focus {
          border-color: #22c55e;
        }
        .solvy-chat-input::placeholder {
          color: #64748b;
        }
        .solvy-chat-send {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .solvy-chat-send:hover { opacity: 0.9; }
        .solvy-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Disclaimer */
        .solvy-chat-disclaimer {
          text-align: center;
          padding: 0.4rem 1rem;
          font-size: 0.65rem;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }

        /* Human Form */
        .solvy-human-form {
          display: none;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 0;
        }
        .solvy-human-form.visible {
          display: flex;
        }
        .solvy-human-form input,
        .solvy-human-form textarea {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #0f172a;
          color: #e2e8f0;
          font-size: 0.8rem;
          font-family: inherit;
          outline: none;
        }
        .solvy-human-form input:focus,
        .solvy-human-form textarea:focus {
          border-color: #22c55e;
        }
        .solvy-human-form button {
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .solvy-human-form .cancel-btn {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
        }

        /* Typing indicator */
        .solvy-typing {
          display: none;
          align-self: flex-start;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          padding: 0.6rem 1rem;
        }
        .solvy-typing.visible { display: flex; }
        .solvy-typing-dots {
          display: flex;
          gap: 4px;
        }
        .solvy-typing-dots span {
          width: 6px;
          height: 6px;
          background: #94a3b8;
          border-radius: 50%;
          animation: solvyTypingBounce 1.4s infinite ease-in-out both;
        }
        .solvy-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .solvy-typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes solvyTypingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .solvy-chat-window {
            width: calc(100vw - 30px);
            right: 15px;
            bottom: 15px;
          }
        }
      </style>

      <button class="solvy-chat-btn" id="solvyChatBtn" title="Chat with SOLVY AI">💬</button>

      <div class="solvy-chat-window" id="solvyChatWindow">
        <div class="solvy-chat-header">
          <div>
            <div class="solvy-chat-header-title">🤖 SOLVY AI</div>
            <div class="solvy-chat-header-status">Online — Privacy First</div>
          </div>
          <button class="solvy-chat-close" id="solvyChatClose">✕</button>
        </div>

        <div class="solvy-chat-messages" id="solvyChatMessages">
          <!-- Messages injected here -->
        </div>

        <div class="solvy-typing" id="solvyTypingIndicator">
          <div class="solvy-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="solvy-chat-input-area">
          <input
            type="text"
            class="solvy-chat-input"
            id="solvyChatInput"
            placeholder="Ask about SOLVY..."
            autocomplete="off"
          >
          <button class="solvy-chat-send" id="solvyChatSend">➤</button>
        </div>

        <div class="solvy-chat-disclaimer">
          ${CONFIG.disclaimer} • No chat logs sent to any server
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    attachEvents();
    renderHistory();
  }

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  function attachEvents() {
    const btn = document.getElementById('solvyChatBtn');
    const window_ = document.getElementById('solvyChatWindow');
    const close = document.getElementById('solvyChatClose');
    const input = document.getElementById('solvyChatInput');
    const send = document.getElementById('solvyChatSend');

    btn.addEventListener('click', () => {
      btn.classList.add('hidden');
      window_.classList.add('open');
      input.focus();
      // Show greeting on first open if no history
      const history = loadHistory();
      if (history.length === 0) {
        addMessage('ai', CONFIG.greeting);
      }
    });

    close.addEventListener('click', () => {
      window_.classList.remove('open');
      btn.classList.remove('hidden');
    });

    send.addEventListener('click', () => handleSend());

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  function handleSend() {
    const input = document.getElementById('solvyChatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage('user', text);
    showTyping(true);

    // Small delay for natural feel
    setTimeout(() => {
      const response = generateResponse(text);
      showTyping(false);

      if (response.type === 'human') {
        addMessage('ai', response.text);
        showHumanForm();
      } else {
        addMessage('ai', response.text);
      }
    }, 600 + Math.random() * 400);
  }

  // ============================================================
  // UI HELPERS
  // ============================================================

  function addMessage(sender, text) {
    const container = document.getElementById('solvyChatMessages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = `solvy-msg ${sender}`;

    // Convert markdown-like formatting to HTML
    let html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    msg.innerHTML = html;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    // Save to history
    const history = loadHistory();
    history.push({ sender, text, time: Date.now() });
    saveHistory(history);
  }

  function renderHistory() {
    const history = loadHistory();
    const container = document.getElementById('solvyChatMessages');
    if (!container || history.length === 0) return;

    container.innerHTML = '';
    for (const item of history) {
      const msg = document.createElement('div');
      msg.className = `solvy-msg ${item.sender}`;
      let html = item.text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      msg.innerHTML = html;
      container.appendChild(msg);
    }
    container.scrollTop = container.scrollHeight;
  }

  function showTyping(show) {
    const el = document.getElementById('solvyTypingIndicator');
    if (el) el.classList.toggle('visible', show);
  }

  function showHumanForm() {
    const container = document.getElementById('solvyChatMessages');
    if (!container) return;

    // Check if form already exists
    if (container.querySelector('.solvy-human-form')) return;

    const form = document.createElement('div');
    form.className = 'solvy-human-form';
    form.innerHTML = `
      <input type="email" placeholder="your@email.com" class="solvy-human-email">
      <textarea placeholder="Describe your issue..." rows="3" class="solvy-human-message"></textarea>
      <button class="solvy-human-submit">📧 Send to Human Support</button>
      <button class="solvy-human-cancel cancel-btn">Cancel</button>
    `;

    form.querySelector('.solvy-human-submit').addEventListener('click', async () => {
      const email = form.querySelector('.solvy-human-email').value.trim();
      const message = form.querySelector('.solvy-human-message').value.trim();

      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }

      const submitBtn = form.querySelector('.solvy-human-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(`${API_BASE}/api/support/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memberEmail: email,
            message: message,
            pageUrl: window.location.pathname + window.location.search
          })
        });

        const result = await response.json();

        if (result.success) {
          form.innerHTML = `<div style="color:#22c55e; font-size:0.85rem; text-align:center; padding:0.5rem;">✅ Ticket ${result.ticketId} created! A human will reply to ${email} within 24 hours.</div>`;

          const history = loadHistory();
          history.push({
            sender: 'ai',
            text: `📧 Human support ticket ${result.ticketId} created for: ${email}`,
            time: Date.now()
          });
          saveHistory(history);
        } else {
          form.innerHTML = `<div style="color:#ef4444; font-size:0.85rem; text-align:center; padding:0.5rem;">❌ ${result.error || 'Failed to send request. Please email support@ebl.beauty directly.'}</div>`;
        }
      } catch (err) {
        console.error('[Chat] Support escalation failed:', err);
        form.innerHTML = `<div style="color:#ef4444; font-size:0.85rem; text-align:center; padding:0.5rem;">❌ Network error. Please email support@ebl.beauty directly.</div>`;
      }
    });

    form.querySelector('.solvy-human-cancel').addEventListener('click', () => {
      form.remove();
    });

    container.appendChild(form);
    container.scrollTop = container.scrollHeight;
  }

  // ============================================================
  // INIT
  // ============================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
