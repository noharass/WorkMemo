import { useCallback, useEffect, useRef, useState } from "react";
import {emit} from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { defaultHistoryQuery, historyQueryError, type HistoryPage, type HistoryQuery } from "./history";
import type { WorkRecord } from "./types";

export function useHistory(open: boolean, refreshKey: string, onDeleted: (id: number) => Promise<void>) {
  const native = isTauri();
  const [query, setQuery] = useState(defaultHistoryQuery);
  const [result, setResult] = useState<HistoryPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState<WorkRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mounted = useRef(false);
  const visible = useRef(open);
  const revision = useRef(0);
  const deleteBusy = useRef(false);
  visible.current = open;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; revision.current += 1; };
  }, []);

  const reload = useCallback(async () => {
    if (!native || !visible.current || deleteBusy.current) return;
    const request = ++revision.current;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const page = await invoke<HistoryPage>("query_history", { query });
      if (mounted.current && visible.current && request === revision.current) setResult(page);
    } catch (failure: unknown) {
      if (mounted.current && visible.current && request === revision.current) setError(String(failure));
    } finally {
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native, query]);

  useEffect(() => {
    if (open) { void reload(); }
    else {
      revision.current += 1;
      setResult(null);
      setLoading(false);
      setTarget(null);
      setNotice("");
      setError("");
    }
    return () => { revision.current += 1; };
  }, [open, refreshKey, reload]);

  function apply(next: HistoryQuery) {
    if (deleteBusy.current) return;
    const message = historyQueryError(next);
    if (message) { setError(message); return; }
    setNotice("");
    setQuery({ ...next });
  }

  async function remove() {
    if (!native || !target || deleteBusy.current || loading) return;
    deleteBusy.current = true;
    setDeleting(true);
    setDeleteError("");
    const id = target.id;
    let deleted = false;
    try {
      await invoke<void>("delete_record", { id });
      deleted = true;void emit("workmemo:data-changed");
      if (mounted.current) {
        setTarget(null);
        setNotice("记录已删除。");
      }
    } catch (failure: unknown) {
      if (mounted.current) setDeleteError(String(failure));
    } finally {
      deleteBusy.current = false;
      if (mounted.current) setDeleting(false);
    }
    if (deleted) { void onDeleted(id); void reload(); }
  }

  return { native, query, result, loading, error, notice, target, deleting, deleteError, apply, reload, remove,
    chooseDelete: (record: WorkRecord) => { if (!loading && !deleteBusy.current) { setDeleteError(""); setTarget(record); } },
    cancelDelete: () => { if (!deleteBusy.current) setTarget(null); },
  };
}
