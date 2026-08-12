import type { ThreatSeverity } from './types';

interface Pattern {
  rx: RegExp;
  reason: string;
  severity: ThreatSeverity;
  score: number;
}

const PATTERNS: Pattern[] = [
  { rx: /ignore (all |previous |above )?(instructions|rules|prompts?)/i, reason: 'Prompt override attempt', severity: 'high', score: 80 },
  { rx: /(reveal|show|print|leak|repeat).*(system|initial|hidden).*(prompt|instructions?)/i, reason: 'System prompt extraction', severity: 'high', score: 85 },
  { rx: /you are (now |actually )?(a |an )?(dan|jailbroken|unrestricted|developer mode|sudo)/i, reason: 'Persona / jailbreak override', severity: 'critical', score: 95 },
  { rx: /\b(jailbreak|dan mode|do anything now|bypass (your |the )?(filter|safety))/i, reason: 'Jailbreak keyword', severity: 'high', score: 80 },
  { rx: /pretend (to be|you are)|act as (a |an )?(?!customer|user)/i, reason: 'Role hijack', severity: 'medium', score: 50 },
  { rx: /(drop|truncate|delete)\s+table|union\s+select|--\s*$|;\s*--/i, reason: 'SQL injection pattern', severity: 'high', score: 80 },
  { rx: /<script\b|onerror\s*=|javascript:/i, reason: 'XSS / script injection', severity: 'high', score: 80 },
  { rx: /\b(api[_-]?key|secret[_-]?key|private[_-]?key|access[_-]?token)\b/i, reason: 'Credential probing', severity: 'medium', score: 55 },
];

export interface GuardResult {
  ok: boolean;
  blocked: boolean;
  riskScore: number;
  severity: ThreatSeverity;
  reason?: string;
}

export function evaluateInput(text: string): GuardResult {
  let max = 0;
  let severity: ThreatSeverity = 'low';
  let reason: string | undefined;
  for (const p of PATTERNS) {
    if (p.rx.test(text)) {
      if (p.score > max) {
        max = p.score;
        severity = p.severity;
        reason = p.reason;
      }
    }
  }
  if (text.length > 4000) {
    if (max < 40) { max = 40; severity = 'medium'; reason = 'Excessive input length'; }
  }
  const blocked = max >= 75;
  return { ok: max < 40, blocked, riskScore: max, severity, reason };
}

// Sliding-window rate limiters — per customer.
const MSG_WINDOW_MS = 60_000;
const MSG_MAX = 20;
const msgHits = new Map<string, number[]>();

const AI_WINDOW_MS = 60_000;
const AI_MAX = 8;
const AI_BURST_WINDOW_MS = 6_000;
const AI_BURST_MAX = 2;
const aiHits = new Map<string, number[]>();

export function rateLimit(customerId: string): { ok: boolean; retryInSec: number } {
  const now = Date.now();
  const arr = (msgHits.get(customerId) ?? []).filter(t => now - t < MSG_WINDOW_MS);
  if (arr.length >= MSG_MAX) {
    return { ok: false, retryInSec: Math.ceil((MSG_WINDOW_MS - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  msgHits.set(customerId, arr);
  return { ok: true, retryInSec: 0 };
}

// Stricter limiter applied only to AI responses — prevents abuse / cost runaway.
export function aiRateLimit(customerId: string): { ok: boolean; retryInSec: number; reason?: string } {
  const now = Date.now();
  const arr = (aiHits.get(customerId) ?? []).filter(t => now - t < AI_WINDOW_MS);
  const recent = arr.filter(t => now - t < AI_BURST_WINDOW_MS);
  if (recent.length >= AI_BURST_MAX) {
    return { ok: false, retryInSec: Math.ceil((AI_BURST_WINDOW_MS - (now - recent[0])) / 1000), reason: 'burst' };
  }
  if (arr.length >= AI_MAX) {
    return { ok: false, retryInSec: Math.ceil((AI_WINDOW_MS - (now - arr[0])) / 1000), reason: 'window' };
  }
  arr.push(now);
  aiHits.set(customerId, arr);
  return { ok: true, retryInSec: 0 };
}
