import type { Snapshot, WorkNotice } from "./types.ts";

/** Old settlement reminders never mask a new candidate or an active task. */
export function islandView(snapshot: Snapshot | null, storedNotice: WorkNotice | null) {
  const active = snapshot?.active ?? null;
  const candidate = active ? null : snapshot?.monitoring.start_candidate ?? null;
  const notice = candidate ? null : storedNotice?.kind === "idle"
    ? active?.id === storedNotice.record.id ? storedNotice : null
    : active ? null : storedNotice;
  const key = candidate ? `candidate:${candidate.id}` : notice ? `${notice.kind}:${notice.record.id}` : "";
  return { active, candidate, notice, key };
}
