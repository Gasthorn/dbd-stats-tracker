/** A friend is considered "online" if their last heartbeat is more recent than this. */
export const ONLINE_THRESHOLD_MS = 100_000;

export function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
}
