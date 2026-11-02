/** Serialize native clipping updates; a stale collapse must not release a reopened island. */
export function islandRegionSync(invoke: (command: string, args: Record<string, unknown>) => Promise<unknown>, onError: (error: string) => void) {
  let pending: { height: number; expanded: boolean } | null = null;
  let running = false;
  let latest: { height: number; expanded: boolean } | null = null;
  let stopped = false;
  async function drain() {
    if (running || stopped) return;
    running = true;
    try {
      while (pending && !stopped) {
        const request = pending; pending = null;
        try {
          if (request.expanded) await invoke("hold_island", { holding: true });
          if (stopped || latest !== request) continue;
          await invoke("set_island_region", { height: request.height });
          if (!stopped && latest === request && !request.expanded)
            await invoke("hold_island", { holding: false });
        } catch (error) { if (!stopped) onError(String(error)); }
      }
    } finally { running = false; }
  }
  return {
    update(height: number, expanded: boolean) {
      latest = { height, expanded }; pending = latest; void drain();
    },
    dispose() { stopped = true; pending = null; },
  };
}
