import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { DEFAULT_APPEARANCE, isAppearance, MAX_OPACITY, MIN_OPACITY, THEMES, type Appearance, type ThemeId } from "./themes";

export function useAppearance() {
  const native = isTauri();
  const [saved, setSaved] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [current, setCurrent] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(native);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const mounted = useRef(false);
  const savingRef = useRef(false);
  const revision = useRef(0);

  const reload = useCallback(async () => {
    if (!native || savingRef.current) return;
    const request = ++revision.current;
    setLoading(true);
    try {
      const settings = await invoke<unknown>("get_appearance");
      if (!isAppearance(settings)) throw new Error("外观设置格式或版本不受支持。");
      if (mounted.current && request === revision.current) {
        setSaved(settings); setCurrent(settings); setLoadError("");
      }
    } catch (error: unknown) {
      if (mounted.current && request === revision.current) setLoadError(String(error));
    } finally {
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native]);

  useEffect(() => {
    mounted.current = true;
    if (native) void reload();
    return () => { mounted.current = false; revision.current += 1; };
  }, [native, reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function begin() {
    if (loading || savingRef.current) return;
    setCurrent(saved); setSaveError(""); setNotice(""); setOpen(true);
  }

  function cancel() {
    if (savingRef.current) return;
    setCurrent(saved); setSaveError(""); setOpen(false);
  }

  function selectTheme(theme: ThemeId) {
    if (savingRef.current) return;
    setCurrent({ version: 1, theme, opacity: THEMES[theme].defaultOpacity }); setSaveError("");
  }

  function changeOpacity(opacity: number) {
    if (savingRef.current || !Number.isFinite(opacity)) return;
    setCurrent((previous) => ({ ...previous, opacity: Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, Math.round(opacity))) }));
    setSaveError("");
  }

  async function save() {
    if (!native || savingRef.current || !isAppearance(current)) return false;
    savingRef.current = true; setSaving(true); setSaveError("");
    ++revision.current;
    try {
      const settings = await invoke<unknown>("save_appearance", { settings: current });
      if (!isAppearance(settings)) throw new Error("保存结果格式不正确，请重新打开外观设置确认。");
      if (mounted.current) {
        setSaved(settings); setCurrent(settings); setLoadError(""); setOpen(false);
        setNotice("外观已保存，下次打开自动沿用。");
        return true;
      }
    } catch (error: unknown) {
      if (mounted.current) setSaveError(String(error));return false;
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return {
    native, current, saved, loading, saving, open, loadError, saveError, notice,
    begin, cancel, selectTheme, changeOpacity, reload, save,
    resetOpacity: () => changeOpacity(THEMES[current.theme].defaultOpacity),
  };
}

export type AppearanceController = ReturnType<typeof useAppearance>;
