export type ChatRole = 'user' | 'ai' | 'agent' | 'system';
export type SessionStatus = 'ai' | 'queued' | 'live' | 'resolved';
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';
export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Message {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
  authorName?: string;
  confidence?: number;
  flagged?: { reason: string; severity: ThreatSeverity };
  attachment?: { url: string; name: string; kind: 'image' | 'file'; size?: number };
  followUps?: { id: string; label: string; prompt: string }[];
}

export type ChatUserRole = 'guest' | 'customer' | 'admin' | 'technician' | 'driver' | 'support_agent';

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerRole: ChatUserRole;
  status: SessionStatus;
  startedAt: number;
  resolvedAt?: number;
  assignedAgentId?: string;
  assignedAgentName?: string;
  messages: Message[];
  satisfaction?: 1 | 2 | 3 | 4 | 5;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: AgentStatus;
  activeSessionId?: string;
  resolvedToday: number;
  avgResponseSec: number;
  rating: number;
}

export interface ThreatLog {
  id: string;
  at: number;
  input: string;
  reason: string;
  severity: ThreatSeverity;
  riskScore: number;
  blocked: boolean;
  sessionId?: string;
  customerId?: string;
}

export interface FeatureSuggestion {
  id: string;
  customerId: string;
  customerName: string;
  text: string;
  at: number;
  votes: number;
}

// ===== AI Support Center extensions =====

export type KbStatus = 'pending' | 'approved' | 'rejected';
export type KbKind = 'faq' | 'response' | 'troubleshoot' | 'workflow';

export interface KbSubmission {
  id: string;
  kind: KbKind;
  question: string;
  answer: string;
  tags: string[];
  submittedBy: string;        // agent id
  submittedByName: string;
  submittedAt: number;
  status: KbStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  uses: number;               // times surfaced by AI
}

export type TestCategory = 'product' | 'troubleshoot' | 'jailbreak' | 'pii' | 'sql' | 'scope';

export interface TrainingTest {
  id: string;
  category: TestCategory;
  prompt: string;
  expect: 'answer' | 'block' | 'escalate';
  hint?: string;             // substring that should appear in safe response
}

export interface TrainingRun {
  id: string;
  at: number;
  results: {
    testId: string;
    category: TestCategory;
    passed: boolean;
    response: string;
    note?: string;
  }[];
  passed: number;
  failed: number;
}

