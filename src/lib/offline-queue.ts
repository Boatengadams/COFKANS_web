/**
 * Try the online action first; on network failure, run the offline fallback
 * (typically a local-storage queue) so the user never blocks on bad signal.
 */
export interface OnlineResult { status: 'ok' | 'queued'; error?: unknown }

export async function tryOnlineThenQueue<T>(
  _kind: string,
  _payload: T,
  online: () => Promise<void>,
): Promise<OnlineResult> {
  try {
    await online();
    return { status: 'ok' };
  } catch (error) {
    try {
      const queue = JSON.parse(localStorage.getItem('cofkans_offline_queue') ?? '[]');
      queue.push({ kind: _kind, payload: _payload, at: Date.now() });
      localStorage.setItem('cofkans_offline_queue', JSON.stringify(queue));
    } catch { /* localStorage unavailable — give up silently */ }
    return { status: 'queued', error };
  }
}
