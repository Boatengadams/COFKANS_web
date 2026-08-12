import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User as UserIcon, ShieldAlert, ArrowUp, Headphones, Clock, Star, CheckCircle2, Lightbulb, Mic, MicOff, Lock } from 'lucide-react';
import { useSupportStore } from '@/stores/support-store';
import { statusLabel, BUSINESS_HOURS_HUMAN } from '@/lib/support/business-hours';
import type { FirestoreUser } from '@/lib/firestore-schema';
import type { Message } from '@/lib/support/types';

interface Props {
  user: FirestoreUser | null;
  variant: 'widget' | 'fullscreen';
  onExpand?: () => void;
  onClose?: () => void;
}

export function SupportChat({ user, variant, onExpand, onClose }: Props) {
  const sessions = useSupportStore(s => s.sessions);
  const activeId = useSupportStore(s => s.activeSessionId);
  const startSession = useSupportStore(s => s.startSession);
  const send = useSupportStore(s => s.sendUserMessage);
  const escalate = useSupportStore(s => s.escalate);
  const rate = useSupportStore(s => s.rateSession);
  const suggest = useSupportStore(s => s.suggestFeature);
  const setActive = useSupportStore(s => s.setActive);

  const ownerId = user?.uid ?? 'guest';
  // Privacy: each user only ever sees their own session, never anyone else's.
  const session = useMemo(() => {
    const s = sessions.find(s => s.id === activeId) ?? null;
    if (s && s.customerId !== ownerId) return null;
    return s;
  }, [sessions, activeId, ownerId]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const status = statusLabel();
  const voiceSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Ensure session exists
  useEffect(() => {
    if (session) return;
    if (user) {
      const role = (user.role ?? 'customer') as any;
      startSession(user.uid, user.displayName, user.email ?? undefined, role);
    } else {
      startSession('guest', 'Guest', undefined, 'guest');
    }
  }, [session, user, startSession]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session?.messages.length, thinking]);

  if (!session) return null;

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setThinking(true);
    await send(session.id, text);
    setThinking(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) { recognitionRef.current?.stop(); return; }
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new Ctor();
    r.lang = 'en-GH';
    r.interimResults = true;
    r.continuous = false;
    let base = input;
    r.onresult = (ev: any) => {
      let txt = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
      setInput((base ? base + ' ' : '') + txt);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    setListening(true);
    r.start();
  };

  const showRating = session.status === 'resolved' && !session.satisfaction;
  const heightClass = variant === 'widget' ? 'h-[500px]' : 'h-full';

  const lastAi = [...session.messages].reverse().find(m => m.role === 'ai');
  const followUps = !thinking && session.status === 'ai' && lastAi?.followUps ? lastAi.followUps : [];

  const sendFollowUp = async (prompt: string) => {
    setThinking(true);
    await send(session.id, prompt);
    setThinking(false);
  };

  return (
    <div className={`flex flex-col ${heightClass} bg-card text-foreground dark:bg-[#151326]`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 bg-gradient-to-r from-primary/[0.08] via-transparent to-accent/[0.08] dark:from-primary/[0.16] dark:to-accent/[0.10]">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-bold shadow-[0_6px_18px_rgba(124,58,237,.2)]">
            {session.assignedAgentName ? <Headphones className="w-4 h-4" strokeWidth={2.5} /> : <span className="text-sm leading-none">A</span>}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${status.open ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
            {session.assignedAgentName ? session.assignedAgentName : 'Cofkans Support'}
            {!session.assignedAgentName && <CheckCircle2 className="w-3 h-3 text-primary" strokeWidth={2.5} />}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            {session.assignedAgentName
              ? <><Clock className="w-3 h-3" />{status.label} · {BUSINESS_HOURS_HUMAN}</>
              : <><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Cofkans Concierge</span> · Sales & Front Desk · replies in seconds</>}
          </div>
          {user ? (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
              <Lock className="w-2.5 h-2.5" /> Private to {user.displayName.split(' ')[0]} · {(user.role ?? 'customer').replace('_', ' ')}
            </div>
          ) : (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-semibold">
              <UserIcon className="w-2.5 h-2.5" /> Guest session · sign in for personalised help
            </div>
          )}
        </div>
        {variant === 'widget' && onExpand && (
          <button onClick={onExpand} aria-label="Expand" className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <ArrowUp className="w-4 h-4 rotate-45" />
          </button>
        )}
        {onClose && (
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-lg leading-none">×</button>
        )}
      </div>

      {/* Escalation banner */}
      {session.status === 'queued' && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Headphones className="w-3.5 h-3.5" /> You're in the queue — a human will reply soon.
        </div>
      )}
      {session.status === 'live' && (
        <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Connected with {session.assignedAgentName}.
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {session.messages.map(m => <Bubble key={m.id} m={m} />)}
        {thinking && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-primary" /></div>
            <div className="px-3 py-2 rounded-2xl bg-muted text-sm flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '240ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Rating prompt */}
      <AnimatePresence>
        {showRating && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-3 border-t border-border bg-muted/40">
            <div className="text-xs font-bold mb-2">How was the support?</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => rate(session.id, r as 1|2|3|4|5)} className="w-9 h-9 rounded-lg hover:bg-amber-500/15 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature suggestion */}
      <AnimatePresence>
        {showSuggest && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border bg-muted/30">
            <div className="p-3 space-y-2">
              <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)} placeholder="Suggest a feature or product you'd like to see…" className="w-full text-sm bg-card border border-border rounded-lg p-2 resize-none h-16 focus:outline-none focus:border-primary" />
              <div className="flex gap-2">
                <button onClick={() => { if (suggestion.trim()) { suggest(session.customerId, session.customerName, suggestion.trim()); setSuggestion(''); setShowSuggest(false); } }} className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold">Send suggestion</button>
                <button onClick={() => setShowSuggest(false)} className="px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-semibold">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-up drill-down chips */}
      {followUps.length > 0 && (
        <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none border-t border-border/50">
          {followUps.map(f => (
            <button
              key={f.id}
              onClick={() => sendFollowUp(f.prompt)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 whitespace-nowrap"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex gap-2 items-end">
          {voiceSupported && (
            <button
              onClick={toggleVoice}
              aria-label={listening ? 'Stop listening' : 'Voice input'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-muted/50 hover:bg-muted'}`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={listening ? 'Listening…' : session.status === 'ai' ? 'Ask about products, orders, installation…' : 'Type to the agent…'}
            rows={1}
            className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary max-h-32"
          />
          <button
            onClick={submit}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:opacity-90 flex-shrink-0"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          {session.status === 'ai' ? (
            <button onClick={() => escalate(session.id, 'Customer requested')} className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1">
              <Headphones className="w-3 h-3" /> Talk to a human
            </button>
          ) : <span />}
          <button onClick={() => setShowSuggest(v => !v)} className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Suggest a feature
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  if (m.role === 'system') {
    return <div className="text-[11px] text-center text-muted-foreground py-1.5 px-3 rounded-lg bg-muted/50 mx-auto max-w-[90%]">{m.text}</div>;
  }
  const mine = m.role === 'user';
  return (
    <div className={`flex gap-2 items-end ${mine ? 'justify-end' : ''}`}>
      {!mine && (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'agent' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-primary'}`}>
          {m.role === 'agent' ? <Headphones className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
        </div>
      )}
      <div className="max-w-[80%]">
        {!mine && m.authorName && <div className="text-[10px] font-bold text-muted-foreground mb-0.5 ml-0.5">{m.authorName}</div>}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${mine ? 'bg-foreground text-background rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
          {m.text}
        </div>
        {m.flagged && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-500 font-semibold">
            <ShieldAlert className="w-3 h-3" /> Flagged: {m.flagged.reason}
          </div>
        )}
      </div>
      {mine && (
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
