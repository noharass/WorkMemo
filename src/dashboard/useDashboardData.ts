import { useEffect, useRef, useState } from "react";
import { useCategoryNames } from "../categoryNames";
import { api, ApiError, type Data, type Meta, type Query } from "./api";

function equal(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function reconcile(previous: Data | null, value: Data): Data {
  if (!previous) return value;
  if (equal(previous, value)) return previous;
  // Keep unchanged chart inputs stable even when only a quantity or active timer changes.
  return {
    ...value,
    trend: equal(previous.trend, value.trend) ? previous.trend : value.trend,
    calendar: equal(previous.calendar, value.calendar)
      ? previous.calendar
      : value.calendar,
    categories: equal(previous.categories, value.categories)
      ? previous.categories
      : value.categories,
    range: equal(previous.range, value.range) ? previous.range : value.range,
  };
}

export function useDashboardData(query: Query, refresh: number) {
  const key = JSON.stringify(query);
  const [snapshot, setSnapshot] = useState<{ key: string; value: Data | null }>(
    { key, value: null },
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const names = useRef("");
  const { accept } = useCategoryNames();
  useEffect(() => {
    let stopped = false;
    let reading = false;
    setError("");
    setRefreshing(true);
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta((previous) =>
          equal(previous, metadata) ? previous : metadata,
        );
        const nameKey = JSON.stringify(metadata.category_names);
        if (names.current !== nameKey) {
          names.current = nameKey;
          accept(metadata.category_names);
        }
        setOnline(true);
        const rows = await api<Data>("query", query);
        if (stopped) return;
        setSnapshot((previous) => {
          const value = reconcile(
            previous.key === key ? previous.value : null,
            rows,
          );
          return previous.key === key && previous.value === value
            ? previous
            : { key, value };
        });
        setUpdatedAt(Date.now());
        setError("");
      } catch (e) {
        if (stopped) return;
        setError(e instanceof Error ? e.message : String(e));
        if (!(e instanceof ApiError) || e.status === 0 || e.status === 403)
          setOnline(false);
      } finally {
        reading = false;
        if (!stopped) setRefreshing(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 2000);
    const focus = () => {
      void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
    // key is the complete serialized request, including pagination and source scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refresh, accept]);
  const data = snapshot.key === key ? snapshot.value : null;
  return {
    data,
    meta,
    error,
    online,
    refreshing,
    updatedAt,
    loading: !data && !error,
  };
}
