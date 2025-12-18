import { useEffect, useMemo, useRef, useState } from 'react';
import sendIcon from './assets/send(1).svg';
import './App.css';

function App() {
  const [clients] = useState([
    { id: 'master', name: 'Master onboarding' },
    { id: 'client-1', name: 'Client 1' },
    { id: 'client-2', name: 'Client 2' },
    { id: 'client-3', name: 'Client 3' },
    { id: 'client-4', name: 'Client 4' },
  ]);

  const [activeClientId, setActiveClientId] = useState('master');
  const [draftMessage, setDraftMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState('Go');
  const [isSendModeOpen, setIsSendModeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [messagesByClient, setMessagesByClient] = useState({});

  const activeMessages = useMemo(
    () => messagesByClient[activeClientId] ?? [],
    [messagesByClient, activeClientId]
  );

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [activeMessages, activeClientId]);

  useEffect(() => {
    if (!messagesByClient[activeClientId]) {
      setMessagesByClient((p) => ({ ...p, [activeClientId]: [] }));
    }
  }, [activeClientId, messagesByClient]);

  const handleSend = async () => {
    if (!draftMessage.trim() || isSending) return;

    const text = draftMessage.trim();
    const clientId = activeClientId;

    setDraftMessage('');
    setIsSending(true);

    setMessagesByClient((p) => ({
      ...p,
      [clientId]: [
        ...(p[clientId] ?? []),
        {
          id: crypto.randomUUID(),
          role: 'user',
          text,
          createdAt: Date.now(),
        },
      ],
    }));

    try {
      setMessagesByClient((p) => ({
        ...p,
        [clientId]: [
          ...(p[clientId] ?? []),
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: `Gemini reply for "${clientId}" based on: ${text}`,
            createdAt: Date.now() + 1,
          },
        ],
      }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="
      flex h-full w-full px-4 py-4 text-neutral-900
      bg-[radial-gradient(circle_at_top_left,#eef2ff,transparent_45%),radial-gradient(circle_at_bottom_right,#f0fdf4,transparent_40%),#f6f7f9]
    ">
      <div className="
        mx-auto flex h-full w-full max-w-7xl flex-col rounded-[32px]
        border border-black/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.75))]
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
      ">
        <main className="flex min-h-0 flex-1 flex-col rounded-[28px] p-4">

          {/* History */}
          <div className="mb-4">
            <div className="relative inline-block">
              <button
                onClick={() => setIsHistoryOpen(v => !v)}
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-black/15
                  bg-[linear-gradient(180deg,#ffffff,#f5f5f5)]
                  px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]
                  text-neutral-700 shadow-sm hover:shadow-md
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Chat history
                <span>{isHistoryOpen ? '▴' : '▾'}</span>
              </button>

              {isHistoryOpen && (
                <div className="
                  absolute left-0 z-50 mt-2 w-64 max-h-72 overflow-y-auto
                  rounded-2xl border border-black/15 bg-white p-2 text-xs
                  shadow-[0_16px_40px_rgba(0,0,0,0.18)]
                ">
                  {clients.filter(c => c.id !== 'master').map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setActiveClientId(client.id);
                        setIsHistoryOpen(false);
                      }}
                      className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-[11px] text-neutral-700 hover:bg-neutral-100"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Header */}
          <header className="
            mb-4 rounded-2xl border border-black/15
            bg-[linear-gradient(135deg,#f8fafc,#eef2ff)]
            px-5 py-4
          ">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-700">
              {clients.find(c => c.id === activeClientId)?.name}
            </span>
          </header>

          {/* Messages */}
          <section className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto max-w-3xl space-y-3">
              {activeMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-3xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[linear-gradient(135deg,#0f0f0f,#262626)] text-white shadow-md'
                        : 'bg-white text-neutral-900 border border-black/15 shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </section>

          {/* Composer */}
          <section className="border-t border-black/15 px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <div className="
                flex h-12 items-center gap-3 rounded-full
                border border-black/15
                bg-[linear-gradient(180deg,#ffffff,#f3f4f6)]
                px-4 shadow-sm
              ">
                <textarea
                  rows={1}
                  placeholder="Message"
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="h-full flex-1 resize-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 leading-[3rem] outline-none"
                />

                <div className="
                  relative inline-flex h-9 items-center rounded-full
                  bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]
                  text-white shadow-md
                ">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draftMessage.trim() || isSending}
                    className="flex h-9 items-center gap-2 rounded-l-full px-4 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSending ? 'Sending' : 'Send'}
                    <img src={sendIcon} className="h-3.5 w-3.5 invert" />
                  </button>

                  <div className="h-5 w-px bg-white/40" />

                  <button
                    type="button"
                    onClick={() => setIsSendModeOpen(v => !v)}
                    className="flex h-9 items-center gap-1 rounded-r-full px-3 text-[11px] font-semibold uppercase tracking-wider"
                  >
                    {sendMode}
                    <span className="text-xs">{isSendModeOpen ? '▴' : '▾'}</span>
                  </button>

                  {isSendModeOpen && (
                    <div className="
                      absolute bottom-full right-0 z-50 mb-2 w-36 rounded-xl
                      border border-black/15 bg-white py-1 text-xs text-neutral-700
                      shadow-[0_14px_40px_rgba(0,0,0,0.18)]
                    ">
                      {['Go', 'Sumit', 'New'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            setSendMode(mode);
                            setIsSendModeOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left hover:bg-neutral-100"
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
