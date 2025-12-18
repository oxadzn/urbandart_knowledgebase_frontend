import { useEffect, useMemo, useRef, useState } from 'react';
import sendIcon from './assets/send(1).svg';
import './App.css';

type ClientId = string;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: number;
};

type ClientChannel = {
  id: ClientId;
  name: string;
};

function App() {
  const [clients, setClients] = useState<ClientChannel[]>([
    { id: 'master', name: 'Master onboarding' },
    { id: 'client-1', name: 'Client 1' },
    { id: 'client-2', name: 'Client 2' },
    { id: 'client-3', name: 'Client 3' },
    { id: 'client-4', name: 'Client 4' },
  ]);

  const [activeClientId, setActiveClientId] = useState<ClientId>('master');
  const [draftMessage, setDraftMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState<'Go' | 'Sumit' | 'New'>('Go');
  const [isSendModeOpen, setIsSendModeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [messagesByClient, setMessagesByClient] = useState<
    Record<ClientId, ChatMessage[]>
  >({});

  const activeMessages = useMemo(
    () => messagesByClient[activeClientId] ?? [],
    [messagesByClient, activeClientId],
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [activeMessages, activeClientId]);

  useEffect(() => {
    if (!messagesByClient[activeClientId]) {
      setMessagesByClient((prev) => ({ ...prev, [activeClientId]: [] }));
    }
  }, [activeClientId, messagesByClient]);

  const handleSend = async () => {
    if (!draftMessage.trim() || isSending) return;

    const text = draftMessage.trim();
    const clientId = activeClientId;

    setDraftMessage('');
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      createdAt: Date.now(),
    };

    setMessagesByClient((prev) => ({
      ...prev,
      [clientId]: [...(prev[clientId] ?? []), userMessage],
    }));

    try {
      const fakeResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `Gemini reply for "${clientId}" based on: ${text}`,
        createdAt: Date.now() + 1,
      };

      setMessagesByClient((prev) => ({
        ...prev,
        [clientId]: [...(prev[clientId] ?? []), fakeResponse],
      }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full w-full px-3 py-3 text-neutral-50 md:px-6 md:py-6">
      <div className="flex h-full min-h-0 w-full flex-col gap-4 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(24,19,16,0.95),rgba(5,6,8,0.98)),radial-gradient(circle_at_bottom_right,rgba(68,52,42,0.7),rgba(5,6,8,1))] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.9)] backdrop-blur-3xl md:max-w-7xl md:flex-row md:gap-6 md:rounded-[32px] md:p-4 md:shadow-[0_40px_120px_rgba(0,0,0,0.9)] mx-auto">
        {/* Main chat area */}
        <main className="flex min-h-0 flex-1 flex-col rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(17,17,17,0.98),_rgba(10,10,10,0.98)),_radial-gradient(circle_at_bottom,_rgba(68,52,42,0.8),_transparent_70%)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 md:rounded-3xl md:p-5 md:shadow-[0_24px_70px_rgba(0,0,0,0.95)]">
          {/* Global history toggle, separate from header */}
          <div className="mb-3 flex justify-start px-1 md:mb-4 md:px-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHistoryOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#26201b,#15110d)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-50 shadow-[0_10px_28px_rgba(0,0,0,0.9)] ring-1 ring-white/15 hover:bg-white/5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span>Chat history</span>
                <span className="text-xs">{isHistoryOpen ? '▴' : '▾'}</span>
              </button>
              {isHistoryOpen && (
                <div className="absolute left-0 z-20 mt-2 w-64 rounded-2xl bg-[linear-gradient(135deg,rgba(18,13,11,0.98),rgba(9,8,7,0.98))] p-2 text-xs text-neutral-100 shadow-[0_22px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 max-h-72 overflow-y-auto">
                  <div className="pb-1 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    Previous chats
                  </div>
                  {clients
                    .filter((c) => c.id !== 'master')
                    .map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setActiveClientId(client.id);
                          setIsHistoryOpen(false);
                        }}
                        className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-white/5 ${
                          client.id === activeClientId
                            ? 'bg-white/10 text-neutral-50'
                            : 'text-neutral-300'
                        }`}
                      >
                        <span className="truncate text-[11px]">
                          {client.name}
                        </span>
                      </button>
                    ))}
                  <div className="mt-2 border-t border-white/10 pt-2 text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                    System
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveClientId('master');
                      setIsHistoryOpen(false);
                    }}
                    className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-white/5 ${
                      activeClientId === 'master'
                        ? 'bg-white/10 text-neutral-50'
                        : 'text-neutral-300'
                    }`}
                  >
                    <span className="truncate text-[11px]">
                      Master onboarding
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <header className="flex-shrink-0 flex flex-col gap-3 rounded-2xl bg-[linear-gradient(135deg,rgba(26,22,19,0.95),rgba(15,15,15,0.95))] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.8)] ring-1 ring-white/10 md:flex-row md:items-center md:justify-between md:px-6 md:py-4 md:rounded-2xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-300 md:text-[13px]">
                {clients.find((c) => c.id === activeClientId)?.name ??
                  'Current client'}
              </span>
              <span className="inline-flex w-max rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] text-neutral-200 md:text-[11px]">
                Chat
              </span>
            </div>
          </header>

          {/* Messages */}
          <section className="flex-1 min-h-0 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-[#4a372c] scrollbar-track-transparent md:px-8 md:py-6">
            <div className="mx-auto max-w-3xl space-y-3 md:space-y-4">
              {activeMessages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#3f342b] bg-[radial-gradient(circle_at_top,_rgba(58,46,38,0.9),_rgba(24,19,16,0.95))] px-6 py-8 text-sm text-neutral-300 backdrop-blur-md">
                  Start by asking a question about{' '}
                  <span className="font-medium text-neutral-200">
                    {clients.find((c) => c.id === activeClientId)?.name ??
                      'this client'}
                  </span>
                  . Gemini will answer using that restaurant&apos;s Firebase
                  data only.
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-3xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'bg-neutral-900 text-neutral-50'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </section>

          {/* Composer */}
          <section className="flex-shrink-0 border-t border-white/10 px-3 py-3 md:px-8 md:py-4">
            <div className="mx-auto flex max-w-3xl flex-col">
              <div className="flex items-end gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(24,19,16,0.98),rgba(12,10,9,1))] px-4 py-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl ring-1 ring-white/10 md:gap-3 md:rounded-3xl md:px-5 md:py-3">
                <textarea
                  rows={1}
                  placeholder={`Message – ${
                    clients.find((c) => c.id === activeClientId)?.name ??
                    'current client'
                  }`}
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full resize-none bg-transparent text-[13px] leading-[1.6] text-[#f5eee1] placeholder:text-[#a89f91] pt-1 pb-0.5 outline-none md:pt-1.5 md:pb-1"
                />
                <div className="relative inline-flex shrink-0 items-stretch rounded-full bg-[#f4ede1] text-slate-950 shadow-[0_0_20px_rgba(0,0,0,0.7)]">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draftMessage.trim() || isSending}
                    className="flex items-center gap-1.5 rounded-l-full border-r border-black/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] disabled:cursor-not-allowed disabled:opacity-60 md:px-4 md:text-[11px]"
                  >
                    <span>{isSending ? 'Sending' : 'Send'}</span>
                    <img
                      src={sendIcon}
                      alt=""
                      className="h-3.5 w-3.5 filter-none"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSendModeOpen((v) => !v)}
                    className="flex items-center gap-1 rounded-r-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] md:text-[11px]"
                  >
                    <span>{sendMode}</span>
                    <span className="text-xs">{isSendModeOpen ? '▴' : '▾'}</span>
                  </button>
                  {isSendModeOpen && (
                    <div className="absolute bottom-full right-0 z-20 mb-2 w-40 rounded-2xl bg-[#1c1714] py-2 text-[12px] text-neutral-100 shadow-[0_18px_40px_rgba(0,0,0,0.9)] ring-1 ring-white/10 md:w-36">
                      {(['Go', 'Sumit', 'New'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setSendMode(mode);
                            setIsSendModeOpen(false);
                          }}
                          className={`block w-full px-4 py-2.5 text-left text-[12px] md:text-[11px] hover:bg-white/10 ${
                            sendMode === mode
                              ? 'text-white'
                              : 'text-neutral-300'
                          }`}
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
