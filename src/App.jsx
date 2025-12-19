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
      setMessagesByClient(p => ({ ...p, [activeClientId]: [] }));
    }
  }, [activeClientId, messagesByClient]);

  const handleSend = () => {
    if (!draftMessage.trim() || isSending) return;

    const text = draftMessage.trim();
    const clientId = activeClientId;

    setDraftMessage('');
    setIsSending(true);

    setMessagesByClient(p => ({
      ...p,
      [clientId]: [
        ...(p[clientId] ?? []),
        { id: crypto.randomUUID(), role: 'user', text },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `Gemini reply for "${clientId}" based on:\n${text}`,
        },
      ],
    }));

    setIsSending(false);
  };

  return (
    <div className="flex h-full w-full bg-[#f3f4f6] px-3 py-3 text-neutral-900">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col rounded-xl border border-black/10 bg-white">

        <main className="flex min-h-0 flex-1 flex-col p-4">

          {/* Chat History */}
          <div className="mb-3">
            <div className="relative inline-block">
              <button
                onClick={() => setIsHistoryOpen(v => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-700"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Chat history
                <span className="text-xs">▾</span>
              </button>

              {isHistoryOpen && (
                <div className="absolute left-0 z-50 mt-2 w-60 rounded-lg border border-black/15 bg-white p-1 text-xs shadow-md">
                  {clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setActiveClientId(client.id);
                        setIsHistoryOpen(false);
                      }}
                      className={`block w-full rounded-md px-3 py-2 text-left hover:bg-neutral-100 ${
                        activeClientId === client.id ? 'bg-neutral-100 font-medium' : ''
                      }`}
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Header */}
          <header className="mb-2 rounded-lg border border-black/10 bg-[#f5f7fa] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700">
            {clients.find(c => c.id === activeClientId)?.name}
          </header>

          {/* Soft divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-2" />

          {/* Messages (scrollbar on outer edge) */}
          <section
            className="flex-1 overflow-y-auto py-4"
            style={{ scrollbarGutter: 'stable' }}
          >
            <div className="px-4">
              <div className="mx-auto max-w-3xl space-y-3 pt-2">
                {activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#0e0e0e] to-[#262626] text-white shadow-md'
                          : 'bg-gradient-to-br from-[#f3f4f6] to-white text-neutral-900 border border-black/10'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </section>

          {/* Composer */}
          <section className="border-t border-black/15 pt-3">
            <div className="mx-auto max-w-3xl">
              <div className="relative grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-black/20 bg-white px-3 py-2">

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
                  className="w-full resize-none bg-transparent text-sm outline-none"
                />

                <div className="relative">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSend}
                      disabled={!draftMessage.trim() || isSending}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white disabled:opacity-50"
                    >
                      Send
                    </button>

                    <button
                      onClick={() => setIsSendModeOpen(v => !v)}
                      className="rounded-md border border-black/20 px-2 py-1 text-[11px]"
                    >
                      {sendMode} ▴
                    </button>
                  </div>

                  {isSendModeOpen && (
                    <div className="absolute bottom-full right-0 mb-1 max-h-28 w-28 overflow-auto rounded-md border border-black/15 bg-white text-xs shadow-md">
                      {['Go', 'Sumit', 'New'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            setSendMode(mode);
                            setIsSendModeOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left hover:bg-neutral-100"
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
