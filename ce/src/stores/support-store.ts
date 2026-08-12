import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_AGENTS, pickAvailableAgent } from '@/lib/support/agents';
import { evaluateInput, rateLimit, aiRateLimit } from '@/lib/support/ai-guard';
import { ask, generateFollowUps } from '@/lib/support/gemini';
import { isOpen, estimatedReplyMinutes } from '@/lib/support/business-hours';
import type {
  AgentStatus,
  ChatSession,
  ChatUserRole,
  FeatureSuggestion,
  KbKind,
  KbStatus,
  KbSubmission,
  Message,
  SupportAgent,
  ThreatLog,
  TrainingRun,
} from '@/lib/support/types';

interface SupportState {
  agents: SupportAgent[];
  sessions: ChatSession[];
  threats: ThreatLog[];
  suggestions: FeatureSuggestion[];
  activeSessionId: string | null;
  kb: KbSubmission[];
  trainingRuns: TrainingRun[];

  startSession: (customerId: string, customerName: string, customerEmail?: string, role?: ChatUserRole) => string;
  setActive: (id: string | null) => void;
  sendUserMessage: (sessionId: string, text: string, attachment?: Message['attachment']) => Promise<void>;
  escalate: (sessionId: string, reason: string) => void;
  agentSend: (sessionId: string, agentId: string, text: string) => void;
  setAgentStatus: (agentId: string, status: AgentStatus) => void;
  rateSession: (sessionId: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  closeSession: (sessionId: string) => void;
  suggestFeature: (customerId: string, customerName: string, text: string) => void;
  voteSuggestion: (id: string) => void;

  submitKb: (input: {
    kind: KbKind; question: string; answer: string; tags: string[];
    submittedBy: string; submittedByName: string;
  }) => void;
  reviewKb: (id: string, status: KbStatus, reviewerId: string) => void;
  deleteKb: (id: string) => void;
  incrementKbUse: (id: string) => void;
  recordTrainingRun: (run: TrainingRun) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const greet = (name: string, role: ChatUserRole): Message => {
  const first = name.split(' ')[0];
  const text = (() => {
    switch (role) {
      case 'driver':
        return `Hi ${first} 👋 I'm Vanessa, Cofkans' assistant for drivers. I can help with routes, delivery handoffs, earnings, vehicle issues or app problems. What do you need?`;
      case 'technician':
        return `Hi ${first} 👋 I'm Vanessa, Cofkans' assistant for technicians. I can help with job assignments, parts lookup, install procedures, customer notes or scheduling. What's up?`;
      case 'support_agent':
        return `Hi ${first} 👋 I'm Vanessa — agent mode active. I can pull KB entries, draft replies, look up customer history, or coach on tricky conversations. What do you need?`;
      case 'admin':
        return `Hi ${first} 👋 I'm Vanessa — admin mode. I can answer ops questions, summarise threats, surface KB gaps or pull quick analytics. What would you like?`;
      case 'guest':
        return `Hi there 👋 I'm Vanessa, your Cofkans concierge. I can help you find the right lighting, solar, inverter or smart-home setup, check delivery, or book an install — and I'm here 24/7. What are you working on today? (Tip: sign in for personalised order help, or tap "Call customer service" for our phone line.)`;
      case 'customer':
      default:
        return `Hi ${first} 👋 I'm Vanessa, your personal Cofkans concierge. Ask me about products, pricing, your orders, delivery or installation — or let me recommend the perfect fit for your space. How can I help today?`;
    }
  })();
  return { id: uid(), role: 'ai', authorName: 'Vanessa', text, at: Date.now() };
};

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      agents: DEMO_AGENTS,
      sessions: [],
      threats: [],
      suggestions: [],
      activeSessionId: null,
      kb: [],
      trainingRuns: [],

      startSession: (customerId, customerName, customerEmail, role = 'customer') => {
        const existing = get().sessions.find(
          s => s.customerId === customerId && s.status !== 'resolved',
        );
        if (existing) {
          set({ activeSessionId: existing.id });
          return existing.id;
        }
        const session: ChatSession = {
          id: uid(),
          customerId,
          customerName,
          customerEmail,
          customerRole: role,
          status: 'ai',
          startedAt: Date.now(),
          messages: [greet(customerName, role)],
        };
        set(s => ({ sessions: [session, ...s.sessions], activeSessionId: session.id }));
        return session.id;
      },

      setActive: id => set({ activeSessionId: id }),

      sendUserMessage: async (sessionId, text, attachment) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Rate limit
        const rl = rateLimit(session.customerId);
        if (!rl.ok) {
          appendMessage(set, sessionId, {
            id: uid(), role: 'system', text: `Slow down — try again in ${rl.retryInSec}s.`, at: Date.now(),
          });
          return;
        }

        // Guard input
        const guard = evaluateInput(text);
        const userMsg: Message = {
          id: uid(), role: 'user', authorName: session.customerName, text, at: Date.now(),
          flagged: guard.reason && guard.riskScore >= 40 ? { reason: guard.reason, severity: guard.severity } : undefined,
          attachment,
        };
        appendMessage(set, sessionId, userMsg);

        if (guard.reason && guard.riskScore >= 40) {
          set(s => ({
            threats: [{
              id: uid(), at: Date.now(), input: text,
              reason: guard.reason!, severity: guard.severity,
              riskScore: guard.riskScore, blocked: guard.blocked,
              sessionId, customerId: session.customerId,
            }, ...s.threats].slice(0, 200),
          }));
        }

        if (guard.blocked) {
          appendMessage(set, sessionId, {
            id: uid(), role: 'ai', authorName: 'Vanessa',
            text: "I can't help with that request. If you have a genuine product or order question I'm happy to help, or I can connect you with a human agent.",
            at: Date.now(),
          });
          return;
        }

        // If a live agent is on the chat, stay quiet so the human leads.
        if (session.status === 'live') return;

        // AI rate-limit — protects against abuse while staying 24/7.
        const ai = aiRateLimit(session.customerId);
        if (!ai.ok) {
          appendMessage(set, sessionId, {
            id: uid(), role: 'system',
            text: ai.reason === 'burst'
              ? `Please wait ${ai.retryInSec}s between AI replies.`
              : `AI reply limit reached — try again in ${ai.retryInSec}s, or tap "Talk to a human".`,
            at: Date.now(),
          });
          return;
        }

        // Ask AI — feed approved KB + user context so replies are personalised by role/name
        const approvedKb = get().kb.filter(k => k.status === 'approved');
        const askCtx = {
          name: session.customerName,
          role: session.customerRole,
          isGuest: session.customerRole === 'guest',
        };
        const res = await ask(text, approvedKb, askCtx);
        const followUps = generateFollowUps(text, askCtx).map(f => ({
          id: uid(), label: f.label, prompt: f.prompt,
        }));
        appendMessage(set, sessionId, {
          id: uid(), role: 'ai', authorName: 'Vanessa',
          text: res.text, at: Date.now(), confidence: res.confidence,
          followUps: followUps.length ? followUps : undefined,
        });

        if (res.kbId) get().incrementKbUse(res.kbId);

        // Only auto-escalate during business hours — outside hours the AI keeps helping 24/7.
        if (res.confidence < 0.4 && isOpen() && session.status === 'ai') {
          get().escalate(sessionId, 'Low AI confidence');
        }
      },

      escalate: (sessionId, reason) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session || session.status === 'live') return;
        const agent = isOpen() ? pickAvailableAgent(get().agents) : null;
        if (agent) {
          set(s => ({
            sessions: s.sessions.map(ss => ss.id === sessionId ? {
              ...ss, status: 'live', assignedAgentId: agent.id, assignedAgentName: agent.name,
              messages: [...ss.messages, {
                id: uid(), role: 'system',
                text: `Connected with ${agent.name} (${reason}).`, at: Date.now(),
              }],
            } : ss),
          }));
        } else {
          const wait = estimatedReplyMinutes();
          set(s => ({
            sessions: s.sessions.map(ss => ss.id === sessionId ? {
              ...ss, status: 'queued',
              messages: [...ss.messages, {
                id: uid(), role: 'system',
                text: isOpen()
                  ? `All agents are busy — you're in the queue (~${wait} min).`
                  : `We're outside hours (Mon–Fri 08:00–17:00 GMT). A human will reply next business day — meanwhile call +1 417 424 5291 for urgent help.`,
                at: Date.now(),
              }],
            } : ss),
          }));
        }
      },

      agentSend: (sessionId, agentId, text) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent) return;
        set(s => ({
          sessions: s.sessions.map(ss => ss.id === sessionId ? {
            ...ss, status: 'live', assignedAgentId: agent.id, assignedAgentName: agent.name,
            messages: [...ss.messages, {
              id: uid(), role: 'agent', authorName: agent.name, text, at: Date.now(),
            }],
          } : ss),
        }));
      },

      setAgentStatus: (agentId, status) => set(s => ({
        agents: s.agents.map(a => a.id === agentId ? { ...a, status } : a),
      })),

      rateSession: (sessionId, rating) => set(s => ({
        sessions: s.sessions.map(ss => ss.id === sessionId ? { ...ss, satisfaction: rating } : ss),
      })),

      closeSession: sessionId => set(s => ({
        sessions: s.sessions.map(ss => ss.id === sessionId ? {
          ...ss, status: 'resolved', resolvedAt: Date.now(),
          messages: [...ss.messages, { id: uid(), role: 'system', text: 'Session resolved.', at: Date.now() }],
        } : ss),
      })),

      suggestFeature: (customerId, customerName, text) => set(s => ({
        suggestions: [{
          id: uid(), customerId, customerName, text, at: Date.now(), votes: 1,
        }, ...s.suggestions],
      })),

      voteSuggestion: id => set(s => ({
        suggestions: s.suggestions.map(sg => sg.id === id ? { ...sg, votes: sg.votes + 1 } : sg),
      })),

      submitKb: ({ kind, question, answer, tags, submittedBy, submittedByName }) =>
        set(s => ({
          kb: [{
            id: uid(), kind, question, answer, tags,
            submittedBy, submittedByName, submittedAt: Date.now(),
            status: 'pending', uses: 0,
          }, ...s.kb],
        })),

      reviewKb: (id, status, reviewerId) => set(s => ({
        kb: s.kb.map(k => k.id === id ? { ...k, status, reviewedBy: reviewerId, reviewedAt: Date.now() } : k),
      })),

      deleteKb: id => set(s => ({ kb: s.kb.filter(k => k.id !== id) })),

      incrementKbUse: id => set(s => ({
        kb: s.kb.map(k => k.id === id ? { ...k, uses: k.uses + 1 } : k),
      })),

      recordTrainingRun: run => set(s => ({
        trainingRuns: [run, ...s.trainingRuns].slice(0, 20),
      })),
    }),
    {
      name: 'cofkans:support',
      partialize: s => ({
        sessions: s.sessions.filter(ss => ss.customerId !== 'guest').slice(0, 30),
        threats: s.threats.slice(0, 100),
        suggestions: s.suggestions,
        agents: s.agents,
        kb: s.kb,
        trainingRuns: s.trainingRuns,
      }),
    },
  ),
);

function appendMessage(
  set: (fn: (s: SupportState) => Partial<SupportState>) => void,
  sessionId: string,
  msg: Message,
) {
  set(s => ({
    sessions: s.sessions.map(ss => ss.id === sessionId ? { ...ss, messages: [...ss.messages, msg] } : ss),
  }));
}
