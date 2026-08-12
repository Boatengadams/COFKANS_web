/**
 * Multi-Branch Module — master catalog hook.
 */
import { useCallback } from 'react';
import { listCatalog, type MasterProduct } from '../services/catalogService';
import { useStoreSync } from './useStoreSync';

/** Live master product list (re-reads on any store change). */
export function useCatalog(): MasterProduct[] {
  const [catalog] = useStoreSync(useCallback(() => listCatalog(), []));
  return catalog;
}
