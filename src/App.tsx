import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { workloadLabel, type TodayWorkload as Today } from "./workload";
export default function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[]>([]);
  const [todayError, setTodayError] = useState("");
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (today.length < 2 || hover) return;
    const timer = window.setInterval(() => setSlide((s) => s + 1), 4000);
    return () => clearInterval(timer);
  }, [today.length, hover]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  const item = today.length ? today[slide % today.length] : null;
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="工作数据中心"
            aria-label="历史与统计"
            onClick={() => {
              void dashboard.open();
            }}
          >
            <Icon name="chart" />
          </button>
          <button
            className="nav-button"
            title="外观"
            aria-label="外观设置"
            onClick={() => panel("appearance")}
          >
            <Icon name="palette" />
          </button>
          <button
            className="nav-button"
            title="布局"
            aria-label="布局设置"
            onClick={() => panel("layout")}
          >
            <Icon name="layout" />
          </button>
          <button
            className="nav-button"
            title="监测设置"
            aria-label="监测设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button
          className="workload-carousel"
          aria-label="打开当天工作量详情"
          title={todayError || "点击查看当天全部工作详情"}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          onClick={() => {
            void dashboard.open("today");
          }}
        >
          {todayError ? (
            <span>数量暂不可用</span>
          ) : item ? (
            <>
              <WorkBadge
                category={item.category}
                presentation={presentation.current}
              />
              <strong>{workloadLabel(item).main}</strong>
              {workloadLabel(item).pending && (
                <small>{workloadLabel(item).pending}</small>
              )}
            </>
          ) : (
            <span>今天还没有工作记录</span>
          )}
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {candidate && !active && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>准备开始工作？</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={session.busy}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>
              <button
                className="secondary"
                disabled={session.busy}
                onClick={() => {
                  void session.browse();
                }}
              >
                仅浏览
              </button>
            </div>
          </section>
        )}
        {monitor?.browsing_only && (
          <section className="browse-banner" aria-label="仅浏览">
            <span>
              {monitor.browse_ready ? "工作页面已就绪" : "仅浏览 · 当前不计时"}
            </span>
            <button
              disabled={
                unavailable ||
                !monitor.browse_ready ||
                !!active?.recovery_pending
              }
              onClick={() => {
                void session.confirmWork(null);
              }}
            >
              {active ? "继续记录" : "开始记录"}
            </button>
          </section>
        )}
        {(!compact || active) && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {!active &&
          !candidate &&
          !monitor?.browsing_only &&
          (session.snapshot || !session.native) && (
            <section className="form-card" aria-label="手动开始工作">
              <WorkForm
                minimal={compact}
                disabled={unavailable}
                starting={session.pending === "start_task"}
                onStart={session.start}
              />
            </section>
          )}
        {!active && !candidate && monitor?.browsing_only && <details className="switch-panel"><summary>手动开始工作</summary><WorkForm minimal={compact} disabled={unavailable} starting={session.pending==="start_task"} onStart={session.start}/></details>}
        {active?.is_paused && (
          <details className="switch-panel">
            <summary>开始另一项工作</summary>
            <WorkForm
              minimal={compact}
              switching
              disabled={unavailable}
              onStart={async (input) => {
                setSwitchRequest({
                  input,
                  id: active.id,
                  category: active.category,
                });
                return false;
              }}
            />
          </details>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
          {!monitor?.browsing_only && (
            <button
              className="text-button"
              disabled={unavailable}
              onClick={() => {
                void session.browse();
              }}
            >
              仅浏览
            </button>
          )}
          <span className="monitor-caption" title={monitor?.message}>
            {monitor?.message || "正在读取状态…"}
          </span>
        </div>
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) setSwitchRequest(null);
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
