import { useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES } from "./types";
import { useCategoryNames, type CategoryNames } from "./categoryNames";
import { useDraft } from "./Drafts";

export function CategoryNamesEditor() {
  const categories = useCategoryNames();
  const [draft, setDraft] = useState(categories.current);
  const [baseline, setBaseline] = useState(categories.current);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  useEffect(() => {
    if (!dirty && !busy) { setDraft(categories.current); setBaseline(categories.current); }
  }, [categories.current, dirty, busy]);
  async function save() {
    if (saving.current || !categories.loaded || !isTauri()) return false;
    saving.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const value = await invoke<CategoryNames>("save_category_names", { input: draft });
      categories.accept(value); setDraft(value); setBaseline(value); setNotice("工作名称已保存，历史和网址归属保持一致。");
      return true;
    } catch (failure) { setError(String(failure)); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  useDraft("category-names", dirty, busy, save, () => { setDraft(baseline); setError(""); });
  return <form className="category-names-editor" onSubmit={event => { event.preventDefault(); void save(); }}>
    <h3>工作名称</h3>
    <p className="hint">名称修改会用于已有记录和新记录；四类身份及各自绑定的网址保持不变。每项 1～20 个字符，不能重名。</p>
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((key, index) => <label key={key}>类型 {index + 1}（原名：{key}）
        <input required maxLength={40} value={draft.names[key]} disabled={busy || !categories.loaded}
          onChange={event => { setNotice(""); setDraft({ ...draft, names: { ...draft.names, [key]: event.target.value } }); }} />
      </label>)}
    </div>
    <div className="settings-actions flex gap-2">
      <button type="submit" disabled={busy || !categories.loaded || !isTauri() || !dirty}>{busy ? "正在保存名称…" : "保存工作名称"}</button>
      <button type="button" className="secondary" disabled={busy || !isTauri()} onClick={() => {
        void categories.reload().then(value => { if (value) { setDraft(value); setBaseline(value); setError(""); setNotice(""); } });
      }}>重新读取并放弃名称修改</button>
    </div>
    {error && <p role="alert" className="error-banner">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
  </form>;
}
