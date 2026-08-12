// Hubtel SMS API (Ghana) — stubbed for demo mode.
// Real endpoint: POST https://sms.hubtel.com/v1/messages/send
//   Auth: Basic base64(clientId:clientSecret)
//   Body: { From, To, Content, RegisteredDelivery: true }
// Pricing: GH₵ 0.04 per SMS segment (160 chars GSM-7 / 70 chars Unicode).

export interface SmsRecipient {
  customerId: string;
  customerName: string;
  phone: string; // E.164 or 0XXXXXXXXX
}

export type SmsDeliveryStatus = 'queued' | 'delivered' | 'failed';

export interface SmsDeliveryReport {
  recipientId: string;
  phone: string;
  status: SmsDeliveryStatus;
  segments: number;
  cost: number;       // GH₵
  reason?: string;
  at: number;
}

export interface SendCampaignRequest {
  senderId: string;   // e.g. "Cofkans" (max 11 chars, alphanumeric)
  content: string;
  recipients: SmsRecipient[];
}

const CHARS_PER_SEGMENT_GSM = 160;
const COST_PER_SEGMENT_GHS = 0.04;

export function estimateCost(content: string, recipientCount: number) {
  const segments = Math.max(1, Math.ceil(content.length / CHARS_PER_SEGMENT_GSM));
  return {
    segments,
    perRecipient: +(segments * COST_PER_SEGMENT_GHS).toFixed(4),
    total: +(segments * COST_PER_SEGMENT_GHS * recipientCount).toFixed(2),
  };
}

export function isValidSenderId(s: string): boolean {
  return /^[A-Za-z0-9]{1,11}$/.test(s);
}

export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return '+' + digits;
  if (digits.startsWith('0') && digits.length === 10) return '+233' + digits.slice(1);
  return phone;
}

/** Simulate sending — in production, replace with fetch() to Hubtel. */
export async function sendCampaign(req: SendCampaignRequest): Promise<SmsDeliveryReport[]> {
  if (!isValidSenderId(req.senderId)) {
    throw new Error('Sender ID must be 1–11 alphanumeric characters.');
  }
  const segments = Math.max(1, Math.ceil(req.content.length / CHARS_PER_SEGMENT_GSM));
  // Simulate network
  await new Promise(r => setTimeout(r, 500 + req.recipients.length * 30));
  return req.recipients.map(r => {
    // Simulated 92% delivery rate
    const ok = Math.random() > 0.08;
    const cost = ok ? +(segments * COST_PER_SEGMENT_GHS).toFixed(4) : 0;
    return {
      recipientId: r.customerId,
      phone: normalisePhone(r.phone),
      status: ok ? 'delivered' : 'failed',
      segments,
      cost,
      reason: ok ? undefined : pick(['INVALID_NUMBER', 'OPTED_OUT', 'NETWORK_TIMEOUT']),
      at: Date.now(),
    };
  });
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
