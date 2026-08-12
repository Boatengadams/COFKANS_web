import type { SupportAgent } from './types';

export const DEMO_AGENTS: SupportAgent[] = [
  {
    id: 'agent-ama',
    name: 'Ama Boateng',
    email: 'ama@cofkans.demo',
    phone: '+233 24 111 1101',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ama&backgroundColor=ffdfbf',
    status: 'online',
    resolvedToday: 12,
    avgResponseSec: 38,
    rating: 4.9,
  },
  {
    id: 'agent-yaw',
    name: 'Yaw Mensah',
    email: 'yaw@cofkans.demo',
    phone: '+233 24 111 1102',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yaw&backgroundColor=c0aede',
    status: 'busy',
    activeSessionId: 'demo-session-1',
    resolvedToday: 9,
    avgResponseSec: 52,
    rating: 4.8,
  },
  {
    id: 'agent-kofi',
    name: 'Kofi Asante',
    email: 'kofi@cofkans.demo',
    phone: '+233 24 111 1103',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kofi&backgroundColor=b6e3f4',
    status: 'away',
    resolvedToday: 7,
    avgResponseSec: 44,
    rating: 4.7,
  },
];

/** Pick the next available agent. Returns null if none online. */
export function pickAvailableAgent(agents: SupportAgent[]): SupportAgent | null {
  const online = agents.filter(a => a.status === 'online');
  if (online.length === 0) return null;
  // Choose the one with fewest assignments + lowest avg response
  return online.sort((a, b) => a.avgResponseSec - b.avgResponseSec)[0];
}
