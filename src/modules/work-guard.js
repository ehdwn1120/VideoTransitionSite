// Native beforeunload covers links, refresh, close and language navigation.
// Browsers choose their own message and may omit it on mobile/app termination.
export function createWorkGuard(target = window) {
  let active = false;
  const warn = event => { event.preventDefault(); event.returnValue = ''; };
  return {
    update(busy, pendingDownload) {
      const next = Boolean(busy || pendingDownload);
      if (next === active) return;
      active = next;
      target[active ? 'addEventListener' : 'removeEventListener']('beforeunload', warn);
    },
  };
}
