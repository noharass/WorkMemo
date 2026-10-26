import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Snapshot, StartInput } from "./types";
import { confirmedFinish } from "./workView";

type WorkCommand = "start_task" | "pause_task" | "resume_task" | "finish_task";

export function useWorkSession() {
  const native = isTauri();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(native);
  const [pending, setPending] = useState<WorkCommand | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [commandError, setCommandError] = useState("");
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const polling = useRef(false);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    if (!native || busyRef.current || polling.current) return;
    polling.current = true;
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>("get_snapshot");
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
        setConnectionError("");
      }
    } catch (error: unknown) {
      if (mounted.current && request === revision.current) setConnectionError(String(error));
    } finally {
      polling.current = false;
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native]);

  useEffect(() => {
    mounted.current = true;
    if (!native) return () => { mounted.current = false; };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 1000);
    const onFocus = () => { void refresh(); };
    const onVisibility = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    let stopped = false;
    let unlisten: UnlistenFn | undefined;
    void listen<string>("workmemo:storage-error", ({ payload }) => {
      if (!stopped) setCommandError(`保存失败，已阻止关闭：${payload}`);
    }).then((unsubscribe) => {
      if (stopped) unsubscribe(); else unlisten = unsubscribe;
    }).catch((error: unknown) => {
      if (!stopped) setCommandError(`无法接收保存错误通知：${String(error)}`);
    });
    return () => {
      stopped = true;
      mounted.current = false;
      revision.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unlisten?.();
    };
  }, [native, refresh]);

  const run = useCallback(async (command: WorkCommand, args: Record<string, unknown>) => {
    if (!native || busyRef.current) return false;
    busyRef.current = true;
    setPending(command);
    setCommandError("");
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>(command, args);
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
        setConnectionError("");
        if (command === "start_task") setSavedId(null);
        if (command === "finish_task") {
          const id = typeof args.id === "number" ? args.id : null;
          setSavedId(confirmedFinish(data, id)?.id ?? null);
        }
      }
      return true;
    } catch (error: unknown) {
      if (mounted.current) setCommandError(String(error));
      return false;
    } finally {
      busyRef.current = false;
      if (mounted.current) { setPending(null); setLoading(false); }
    }
  }, [native]);

  return {
    native, snapshot, loading, busy: pending !== null, pending, savedId,
    connectionError, commandError, refresh,
    start: (input: StartInput) => run("start_task", { input }),
    pause: (id: number) => run("pause_task", { id }),
    resume: (id: number) => run("resume_task", { id }),
    finish: (id: number) => run("finish_task", { id }),
  };
}
