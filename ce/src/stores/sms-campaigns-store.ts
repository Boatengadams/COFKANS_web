import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendCampaign, estimateCost, type SmsDeliveryReport, type SmsRecipient } from '@/lib/sms/hubtel';

export interface SmsCampaign {
  id: string;
  senderId: string;
  title: string;
  content: string;
  audienceLabel: string;
  recipientCount: number;
  sentAt: number;
  status: 'sending' | 'completed' | 'failed';
  cost: number;
  delivered: number;
  failed: number;
  reports: SmsDeliveryReport[];
}

interface State {
  optedInRecipients: SmsRecipient[];
  campaigns: SmsCampaign[];
  seedOptIns: (recipients: SmsRecipient[]) => void;
  toggleOptIn: (customerId: string, customerName: string, phone: string, optIn: boolean) => void;
  send: (input: { senderId: string; title: string; content: string; audience: SmsRecipient[]; audienceLabel: string }) => Promise<string>;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const INITIAL_RECIPIENTS: SmsRecipient[] = [];

export const useSmsCampaignsStore = create<State>()(
  persist(
    (set, get) => ({
      optedInRecipients: INITIAL_RECIPIENTS,
      campaigns: [],

      seedOptIns: recipients => set(s => ({
        optedInRecipients: dedupe([...s.optedInRecipients, ...recipients]),
      })),

      toggleOptIn: (customerId, customerName, phone, optIn) => set(s => {
        if (optIn) return { optedInRecipients: dedupe([...s.optedInRecipients, { customerId, customerName, phone }]) };
        return { optedInRecipients: s.optedInRecipients.filter(r => r.customerId !== customerId) };
      }),

      send: async ({ senderId, title, content, audience, audienceLabel }) => {
        const id = uid();
        const cost = estimateCost(content, audience.length).total;
        const draft: SmsCampaign = {
          id, senderId, title, content, audienceLabel,
          recipientCount: audience.length,
          sentAt: Date.now(),
          status: 'sending',
          cost,
          delivered: 0,
          failed: 0,
          reports: [],
        };
        set(s => ({ campaigns: [draft, ...s.campaigns] }));
        try {
          const reports = await sendCampaign({ senderId, content, recipients: audience });
          const delivered = reports.filter(r => r.status === 'delivered').length;
          const failed = reports.length - delivered;
          set(s => ({
            campaigns: s.campaigns.map(c => c.id === id
              ? { ...c, reports, delivered, failed, status: 'completed' }
              : c),
          }));
        } catch (err: any) {
          set(s => ({
            campaigns: s.campaigns.map(c => c.id === id
              ? { ...c, status: 'failed', reports: [] }
              : c),
          }));
        }
        return id;
      },
    }),
    { name: 'cofkans:sms-campaigns' },
  ),
);

function dedupe(list: SmsRecipient[]): SmsRecipient[] {
  const seen = new Set<string>();
  return list.filter(r => {
    if (seen.has(r.customerId)) return false;
    seen.add(r.customerId);
    return true;
  });
}
