/**
 * Multi-Branch Module — internal hook that re-runs a selector whenever the
 * module store changes. Foundation for the domain hooks below.
 */
import { useEffect, useState, useCallback } from 'react';
import { onStoreChange } from '../services/storage';

/** Subscribe `select()` to store mutations; returns its latest value + refresh. */
export function useStoreSync<T>(select: () => T): [T, () => void] {
  const [value, setValue] = useState<T>(select);
  const refresh = useCallback(() => setValue(select()), [select]);

  useEffect(() => {
    refresh();
    return onStoreChange(refresh);
  }, [refresh]);

  return [value, refresh];
}
