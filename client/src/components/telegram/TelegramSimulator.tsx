import React, { useState, useEffect } from 'react';
import { Send, Key, CheckCircle2, Bot, Trash2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const TelegramSimulator: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '👋 Welcome to the Delivery Command Center Telegram Bot Simulator!\nType /start or /help to explore bot commands.',
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState('');
  const [connectingBot, setConnectingBot] = useState(false);
  const [tokenMsg, setTokenMsg] = useState<string | null>(null);

  // Default demo telegram user credentials
  const demoTgUserId = user?.telegram_user_id || `sim_${user?.id || '9999'}`;
  const demoChatId = `chat_${demoTgUserId}`;

  const handleConnectRealBot = async () => {
    try {
      setConnectingBot(true);
      setTokenMsg(null);
      const res = await api.telegram.configureToken(botTokenInput);
      setTokenMsg(res.message);
      setBotTokenInput('');
    } catch (err: any) {
      setTokenMsg(err.message || 'Failed to connect bot.');
    } finally {
      setConnectingBot(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      const res = await api.telegram.generateCode();
      setCode(res.code);
    } finally {
      setGenerating(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setUnlinking(true);
      await api.telegram.unlink();
      await refreshUser();
      setCode(null);
    } finally {
      setUnlinking(false);
    }
  };

  const handleSendCommand = async (cmdToSend?: string) => {
    const text = (cmdToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text, time: timeStr }]);
    if (!cmdToSend) setInputText('');

    try {
      setSending(true);
      const res = await api.telegram.simulateWebhook({
        telegramUserId: demoTgUserId,
        chatId: demoChatId,
        username: user?.username || 'tester',
        text
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: res.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      if (res.actionTaken === 'LINK_SUCCESS') {
        await refreshUser();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `⚠️ Error: ${err.message || 'Webhook failed'}`, time: timeStr }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.2fr)', gap: '1.5rem' }}>
      {/* Left: Account Identity & Linking Code */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Bot size={22} />
          </div>
          <div>
            <h3>Telegram Identity Bridge</h3>
            <p style={{ fontSize: '0.78rem' }}>Link your Telegram account to receive command alerts & status</p>
          </div>
        </div>

        {user?.telegram_user_id ? (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>Identity Linked</span>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleUnlink}
                disabled={unlinking}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                <Trash2 size={12} />
                <span>Unlink</span>
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Telegram UID: <code style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{user.telegram_user_id}</code>
              {user.telegram_username && (
                <div>Username: <strong>@{user.telegram_username}</strong></div>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                const res = await api.telegram.sendDailyUpdate();
                handleSendCommand('/daily');
              }}
              style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.75rem' }}
            >
              🚀 Send Daily Briefing to Telegram Now
            </button>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>
              Account Not Linked
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Generate a verification token and link it via the bot simulator on the right.
            </p>
          </div>
        )}

        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleGenerateCode}
            disabled={generating}
            style={{ width: '100%', gap: '0.5rem' }}
          >
            <Key size={14} />
            <span>{generating ? 'Generating...' : 'Generate Linking Token'}</span>
          </button>

          {code && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your One-Time Verification Code:</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', margin: '0.4rem 0' }}>
                {code}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Click below to test linking in the simulator:
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSendCommand(`/link ${code}`)}
                style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
              >
                Send `/link {code}` into Bot
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            Connect Real Telegram Bot (@BotFather)
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="password"
              placeholder="Paste token from @BotFather..."
              value={botTokenInput}
              onChange={(e) => setBotTokenInput(e.target.value)}
              className="form-input"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={connectingBot || !botTokenInput.trim()}
              onClick={handleConnectRealBot}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {connectingBot ? 'Connecting...' : 'Connect'}
            </button>
          </div>
          {tokenMsg && (
            <div style={{ fontSize: '0.72rem', color: tokenMsg.includes('Failed') ? '#f87171' : '#34d399' }}>
              {tokenMsg}
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Once connected, message your bot directly from your Telegram phone/desktop app!
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          <strong>Source of Truth:</strong> Telegram acts as an ambient communication surface; authorization and project data strictly originate from the command center database.
        </div>
      </div>

      {/* Right: Interactive Telegram Bot Chat Simulator */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '480px', padding: 0, overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '0.85rem 1.25rem', background: '#0a101f', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Command Center Bot</div>
            <div style={{ fontSize: '0.68rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="status-dot dot-AVAILABLE" style={{ width: '5px', height: '5px' }} />
              <span>bot server online</span>
            </div>
          </div>
        </div>

        {/* Quick Command Pills */}
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['/start', '/daily', '/projects', '/profile', '/help'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSendCommand(cmd)}
              disabled={sending}
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-cyan)',
                cursor: 'pointer'
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#070b14' }}>
          {messages.map((m, idx) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  background: isBot ? 'rgba(30, 41, 59, 0.85)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  border: isBot ? '1px solid var(--border-glass)' : 'none',
                  borderRadius: isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.82rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4
                }}
              >
                <div>{m.text}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: '4px' }}>
                  {m.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '0.75rem 1rem', background: '#0a101f', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendCommand();
            }}
            placeholder="Type /start, /projects, /profile, /help..."
            style={{ flex: 1, fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSendCommand()}
            disabled={sending || !inputText.trim()}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
