import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES } from "./types";

export interface CategoryNames { revision: number; names: Record<string, string> }
export const DEFAULT_CATEGORY_NAMES: CategoryNames = {
  revision: 0, names: Object.fromEntries(CATEGORIES.map(key => [key, key])),
};
const CategoryContext = createContext({
  current: DEFAULT_CATEGORY_NAMES, loaded: false,
  accept: (_value: CategoryNames) => {},
  reload: async (): Promise<CategoryNames | null> => null,
});
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(DEFAULT_CATEGORY_NAMES);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const accept = useCallback((value: CategoryNames) => {
    if (!value || !CATEGORIES.every(key => typeof value.names?.[key] === "string")) return;
    setCurrent(value); setLoaded(true); setError("");
  }, []);
  const reload = useCallback(async () => {
    if (!isTauri()) return null; // Browser dashboard receives names from authenticated /api/meta.
    try {
      const value = await invoke<CategoryNames>("get_category_names");
      accept(value); return value;
    } catch (failure) { setError(String(failure)); return null; }
  }, [accept]);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const listeners = ["workmemo:categories-changed", "workmemo:data-changed"].map(event =>
      listen(event, () => { void reload(); }));
    return () => { listeners.forEach(p => { void p.then(unlisten => unlisten()).catch(() => {}); }); };
  }, [reload]);
  return <CategoryContext.Provider value={{ current, loaded, accept, reload }}>
    {error && <div className="error-banner" role="alert">工作名称读取失败：{error}<button type="button" onClick={() => { void reload(); }}>重新读取名称</button></div>}
    {children}
  </CategoryContext.Provider>;
}
export function useCategoryNames() {
  const context = useContext(CategoryContext);
  const name = useCallback((key: string) => context.current.names[key] ?? key, [context.current]);
  return { ...context, name };
}
