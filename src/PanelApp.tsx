import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { DraftContext, Surface, type Draft, useDraft } from "./Drafts";
import { AppearanceSettings } from "./AppearanceSettings";
import { MonitoringSettings } from "./MonitoringSettings";
import { HistoryPanel } from "./HistoryPanel";
import { SettlementPanel } from "./SettlementPanel";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { useWorkSession } from "./useWorkSession";
import { DraftController } from "./draftController";
import { UiDialog } from "./UiDialog";

type Report = {
  source: string | null;
  conflict_ids: number[];
  skipped_active_ids: number[];
  records: number;
  pending: number;
  active: number;
  imported: number;
  duplicates: number;
  conflicts: number;
  skipped_active: number;
  backup: string | null;
};
function DataPanel({ onClose }: { onClose: () => void }) {
  const [report, setReport] = useState<Report | null>(null);
  const [restoreInfo, setRestoreInfo] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [include, setInclude] = useState(false);
  const [action, setAction] = useState<"import" | "restore" | null>(null);
  useDraft(
    "data-operation",
    false,
    busy,
    async () => false,
    () => {},
  );
  async function run(command: string, args?: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<Report | string | null>(command, args);
      if (command === "preview_migration") {
        setReport(result as Report | null);
        setMessage(result ? "请核对预览记录后确认导入。" : "未发现预览数据。");
      } else if (command === "inspect_backup") {
        if (result) {
          setRestoreInfo(result as Report);
          setAction("restore");
        }
      } else if (command === "import_preview") {
        const r = result as Report;
        setMessage(
          `导入 ${r.imported}，重复跳过 ${r.duplicates}，冲突 ${r.conflicts}，未结束冲突 ${r.skipped_active}（${r.skipped_active_ids.join(",")}），冲突记录 ${r.conflict_ids.join(",")}。备份：${r.backup}`,
        );
      } else if (result) setMessage(String(result));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (isTauri()) void run("preview_migration");
  }, []);
  return (
    <Surface title="数据管理" onClose={onClose}>
      <h3>从预览版迁移</h3>
      <p className="hint">
        先从托盘退出预览版。正式版原记录保留，重复导入会跳过；已导入记录有变化时列为冲突。两边都有未结束任务时，冲突任务留在原处。
      </p>
      {report && (
        <p>
          来源：{report.source}
          <br />
          记录 {report.records} · 待补全 {report.pending} · 未结束{" "}
          {report.active}
        </p>
      )}
      <label>
        <input
          type="checkbox"
          checked={include}
          disabled={busy}
          onChange={(e) => setInclude(e.target.checked)}
        />
        同时导入预览监测配置（默认保留正式配置；导入后先保持监测关闭）
      </label>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("preview_migration");
          }}
        >
          重新检查
        </button>
        <button disabled={busy || !report} onClick={() => setAction("import")}>
          备份并合并预览记录
        </button>
      </div>
      <h3>备份与恢复</h3>
      <p className="hint">
        完整备份包含工作数据库、监测配置、外观及布局，不含连接令牌和浏览器注册。恢复会整体替换当前快照，恢复前自动备份原数据；正在计时时请先暂停。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("create_backup");
          }}
        >
          创建备份…
        </button>
        <button
          disabled={busy}
          className="secondary"
          onClick={() => {
            void run("inspect_backup");
          }}
        >
          从备份恢复…
        </button>
      </div>
      {busy && <p role="status">正在处理，请勿退出…</p>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <UiDialog
        open={action !== null}
        onClose={() => setAction(null)}
        title="确认数据操作"
        id="confirm-data"
      >
        <p>
          {action === "import"
            ? "先备份当前数据，再合并预览记录；不会覆盖正式记录。"
            : `将从 ${restoreInfo?.backup} 恢复记录 ${restoreInfo?.records} 条（待补全 ${restoreInfo?.pending}，未结束 ${restoreInfo?.active}），替换当前数据。原数据会先自动备份。`}
        </p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setAction(null)}>
            取消
          </button>
          <button
            onClick={() => {
              const a = action;
              setAction(null);
              void run(
                a === "import" ? "import_preview" : "restore_backup",
                a === "import" ? { includeConfig: include } : undefined,
              );
            }}
          >
            确认并{action === "import" ? "导入" : "恢复备份"}
          </button>
        </div>
      </UiDialog>
    </Surface>
  );
}
function LayoutPanel({ onClose }: { onClose: () => void }) {
  const [density, setDensity] = useState("comfortable");
  const [saved, setSaved] = useState("comfortable");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void invoke<{ density: string }>("get_layout_settings")
      .then((v) => {
        setDensity(v.density);
        setSaved(v.density);
      })
      .catch((e) => setError(String(e)));
  }, []);
  async function save() {
    setBusy(true);
    try {
      await invoke("set_layout_density", { density });
      setSaved(density);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", density !== saved, busy, save, () => setDensity(saved));
  return (
    <Surface
      title="布局设置"
      onClose={onClose}
      actions={
        <button
          disabled={busy}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <label>
        显示间距
        <select value={density} onChange={(e) => setDensity(e.target.value)}>
          <option value="comfortable">舒展</option>
          <option value="compact">紧凑</option>
        </select>
      </label>
      <p className="hint">
        窗口尺寸和位置在关闭或退出时记住；恢复时限制在当前显示器工作区内。
      </p>
      <button
        className="secondary"
        onClick={() => {
          void invoke("reset_window_layout")
            .then(() => {
              setDensity("comfortable");
              setSaved("comfortable");
            })
            .catch((e) => setError(String(e)));
        }}
      >
        恢复所有窗口默认布局
      </button>
      {error && <p className="error-banner">{error}</p>}
    </Surface>
  );
}
export function PanelApp({ panel }: { panel: string }) {
  const [density, setDensity] = useState<"compact" | "comfortable">(
    "comfortable",
  );
  useEffect(() => {
    if (!isTauri()) return;
    const load = () => {
      void invoke<{ density: "compact" | "comfortable" }>("get_layout_settings")
        .then((v) => setDensity(v.density))
        .catch(() => {});
    };
    load();
    const p = listen("workmemo:layout-changed", load);
    return () => {
      void p.then((f) => f());
    };
  }, []);
  const appearance = useAppearance();
  const session = useWorkSession();
  const [section, setSection] = useState(
    new URLSearchParams(window.location.search).get("section") ?? "monitor",
  );
  const [version, setVersion] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(false);
  const [saving, setSaving] = useState(false);
  const drafts = useRef(new DraftController());
  const registry = { current: drafts.current.entries };
  const next = useRef<(() => void) | null>(null);
  const register = useCallback((id: string, d: Draft | null) => {
    if (d) registry.current.set(id, d);
    else registry.current.delete(id);
    const dirty = [...registry.current.values()].some((x) => x.dirty || x.busy);
    setHasDraft(dirty);
    if (isTauri())
      void invoke("set_window_dirty", { dirty }).catch((e) =>
        setError(String(e)),
      );
  }, []);
  const change = useCallback((action: () => void) => {
    if ([...registry.current.values()].some((d) => d.busy)) {
      setError("正在保存，请稍候。");
      return;
    }
    if ([...registry.current.values()].some((d) => d.dirty)) {
      next.current = action;
      setDecision(true);
    } else action();
  }, []);
  const close = useCallback(
    () =>
      change(() => {
        void invoke("close_panel").catch((e) => setError(String(e)));
      }),
    [change],
  );
  async function saveAll() {
    if (drafts.current.busy) return;
    setSaving(true);
    try {
      if (!(await drafts.current.save())) return;
      setDecision(false);
      const action = next.current;
      next.current = null;
      action?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveAll();
      }
    };
    window.addEventListener("keydown", key);
    const unsubs: Promise<() => void>[] = [];
    if (isTauri()) {
      unsubs.push(listen("workmemo:request-close", close));
      unsubs.push(
        listen<string>("workmemo:settings-section", (e) =>
          change(() =>
            setSection(
              ["appearance", "layout", "data"].includes(e.payload)
                ? e.payload
                : "monitor",
            ),
          ),
        ),
      );
      unsubs.push(
        listen("workmemo:data-changed", () => {
          if (![...registry.current.values()].some((d) => d.dirty))
            setVersion((v) => v + 1);
        }),
      );
      unsubs.push(
        listen("workmemo:appearance-changed", () => {
          if (![...registry.current.values()].some((d) => d.dirty))
            void appearance.reload();
        }),
      );
    }
    return () => {
      window.removeEventListener("keydown", key);
      for (const p of unsubs) void p.then((f) => f());
    };
  }, [change, close]);
  return (
    <DraftContext.Provider value={register}>
      <DesktopWindow
        density={density}
        appearanceStyle={themeStyle(appearance.current)}
        navigation={
          <nav aria-label="二级窗口">
            <strong>
              {panel === "settings"
                ? "设置"
                : panel === "history"
                  ? "历史与统计"
                  : "待补全"}
            </strong>
          </nav>
        }
      >
        <div className="panel-app">
          {panel === "settings" && (
            <nav className="settings-tabs">
              {[
                ["appearance", "外观"],
                ["monitor", "监测"],
                ["layout", "布局"],
                ["data", "数据管理"],
              ].map(([id, label]) => (
                <button
                  className="secondary"
                  aria-pressed={section === id}
                  key={id}
                  onClick={() => change(() => setSection(id))}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          {hasDraft && (
            <p className="draft-indicator">有未保存修改 · Ctrl+S 保存</p>
          )}
          {panel === "history" ? (
            <HistoryPanel
              open
              onClose={close}
              refreshKey={String(version)}
              onDeleted={session.recordDeleted}
            />
          ) : panel === "settlement" ? (
            <SettlementPanel
              open
              onClose={close}
              refreshKey={String(version)}
              busy={session.busy}
              onSave={session.settle}
              beforeChange={change}
            />
          ) : section === "appearance" ? (
            <AppearanceSettings appearance={appearance} onClose={close} />
          ) : section === "monitor" ? (
            <MonitoringSettings
              key={version}
              open
              onClose={close}
              onSaved={() => setVersion((v) => v + 1)}
            />
          ) : section === "layout" ? (
            <LayoutPanel onClose={close} />
          ) : (
            <DataPanel onClose={close} />
          )}
          <UiDialog
            open={decision}
            onClose={() => {
              next.current = null;
              setDecision(false);
            }}
            title="保留未保存的修改？"
            id="draft-decision"
          >
            <p>保存成功后再离开；放弃只撤销本次输入，不删除已保存记录。</p>
            <div className="settings-actions">
              <button
                disabled={saving}
                onClick={() => {
                  void saveAll();
                }}
              >
                保存并继续
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  if (!drafts.current.discard()) return;
                  setDecision(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  next.current = null;
                  setDecision(false);
                }}
              >
                继续编辑
              </button>
            </div>
          </UiDialog>
        </div>
      </DesktopWindow>
    </DraftContext.Provider>
  );
}
