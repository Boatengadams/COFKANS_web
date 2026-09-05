/**
 * Multi-Branch Module — transfer & alert hooks.
 */
import { useCallback } from 'react';
import type { Transfer, StockAlert } from '../types/transfer';
import {
  listTransfers, listDriverTransfers, listOutgoingTransfers, listAlerts,
} from '../services/transferService';
import { useStoreSync } from './useStoreSync';

/** Live list of all transfers. */
export function useTransfers(): Transfer[] {
  const [transfers] = useStoreSync(useCallback(() => listTransfers(), []));
  return transfers;
}

/** Live transfers a driver can claim or already owns. */
export function useDriverTransfers(driverId: string): Transfer[] {
  const [transfers] = useStoreSync(
    useCallback(() => listDriverTransfers(driverId), [driverId]),
  );
  return transfers;
}

/** Live transfers leaving a branch (Front Desk view). */
export function useOutgoingTransfers(fromBranch: string): Transfer[] {
  const [transfers] = useStoreSync(
    useCallback(() => listOutgoingTransfers(fromBranch), [fromBranch]),
  );
  return transfers;
}

/** Live list of branch stock alerts. */
export function useStockAlerts(): StockAlert[] {
  const [alerts] = useStoreSync(useCallback(() => listAlerts(), []));
  return alerts;
}
