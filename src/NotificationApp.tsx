import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { formatDuration, type Snapshot, type WorkNotice } from "./types";
import "./App.css";

export function NotificationApp() {
  const appearance = useAppearance();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  useEffect(() => {
    let stopped = false;
    let reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      try {
        const [value, current] = await Promise.all([
          invoke<WorkNotice | null>("get_notice"),
          invoke<Snapshot>("get_snapshot"),
        ]);
        if (!stopped) {
          setNotice(value);
          setSnapshot(current);
          setReadError("");
        }
      } catch (failure: unknown) {
        if (!stopped) {
          setSnapshot(null);
          setReadError(String(failure));
        }
      } finally {
        reading = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 1000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);
  const key = notice ? `${notice.kind}:${notice.record.id}` : "";
  useEffect(() => {
    if (key) void appearance.reload();
  }, [key]);
  useEffect(() => {
    let stopped = false;
    let unlisten: (() => void) | undefined;
    void listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    }).then((fn) => {
      if (stopped) fn();
      else unlisten = fn;
    });
    return () => {
      stopped = true;
      unlisten?.();
    };
  }, [appearance.reload]);
  async function later() {
    if (!notice || busy) return;
    setBusy(true);
    setError("");
    try {
      await invoke("defer_notice", { id: notice.record.id, kind: notice.kind });
      setNotice(null);
    } catch (failure: unknown) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }
  async function openSettlement() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      await dashboard.open("pending");
      if (notice)
        await invoke("defer_notice", { id: notice.record.id, kind: "ended" });
      setNotice(null);
    } catch (failure: unknown) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }
  async function intent(action: "confirm_work" | "enter_browsing" | "pause_task" | "resume_task") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setSnapshot(
        await invoke<Snapshot>(
          action,
          action === "confirm_work"
            ? { candidateId: snapshot?.monitoring.start_candidate?.id ?? null }
            : action === "pause_task" || action === "resume_task" ? {id:snapshot?.active?.id} : {},
        ),
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const active = snapshot?.active;
  const monitor = snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";
  if (!notice)
    return (
      <div
        className="desktop-frame island-frame"
        style={themeStyle(appearance.current)}
      >
        <div
          className={`app-shell island-shell ${candidate ? "is-confirming" : ""}`}
        >
          <div className="island-main-row">
            <div
              className="island-drag"
              onMouseDown={(event) => {
                if (event.button === 0)
                  void getCurrentWindow()
                    .startDragging()
                    .catch(() => {});
              }}
              aria-label="拖动状态岛"
            >
              {candidate || active || monitor?.browse_category ? (
                <WorkBadge
                  category={
                    candidate?.category ??
                    active?.category ??
                    monitor?.browse_category ??
                    "开发"
                  }
                  presentation={presentation.current}
                  showName={false}
                />
              ) : (
                <span className="work-symbol">
                  <Icon name="read" />
                </span>
              )}
              <span className="island-info">
                <strong>
                  {candidate?.category ?? active?.category ?? "仅浏览"}
                </strong>
                <small>{snapshot ? state : "状态不可用"}</small>
              </span>
              {active && (
                <strong className="island-time">
                  {formatDuration(active.duration_seconds)}
                </strong>
              )}
            </div>
            {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} title={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || active.recovery_pending} onClick={() => { void intent(active.is_paused ? "resume_task" : "pause_task"); }}><Icon name={active.is_paused ? "play" : "pause"}/></button>}
            {!candidate && monitor?.browsing_only && <button type="button" className="island-start" disabled={busy || !monitor.browse_ready || !!active?.recovery_pending} onClick={() => { void intent("confirm_work"); }}>{active ? "继续" : "开始记录"}</button>}
            <button
              className="island-open"
              aria-label="打开WorkMemo"
              onClick={() => {
                void invoke("show_main", { settlement: false }).catch((e) =>
                  setError(String(e)),
                );
              }}
            >
              <Icon name="open" />
            </button>
          </div>
          {candidate && (
            <div className="island-intent">
              <button
                disabled={
                  busy ||
                  (!candidate && !monitor?.browse_ready) ||
                  !!active?.recovery_pending
                }
                onClick={() => {
                  void intent("confirm_work");
                }}
              >
                {active ? "继续记录" : "开始记录"}
              </button>
              {candidate && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    void intent("enter_browsing");
                  }}
                >
                  仅浏览
                </button>
              )}
            </div>
          )}
          {(error || readError) && (
            <span
              className="island-error"
              role="alert"
              title={[error, readError].filter(Boolean).join("；")}
            >
              !
            </span>
          )}
        </div>
      </div>
    );
  return (
    <div
      className="desktop-frame notice-frame"
      style={themeStyle(appearance.current)}
    >
      <div className="app-shell">
        <header className="notice-titlebar flex items-center gap-3">
          <span
            onMouseDown={(event) => {
              if (event.button === 0)
                void getCurrentWindow()
                  .startDragging()
                  .catch(() => {});
            }}
          >
            WorkMemo 工作提醒
          </span>
          <button
            className="secondary"
            type="button"
            disabled={!notice || busy}
            onClick={() => {
              void later();
            }}
          >
            稍后
          </button>
        </header>
        <main className="notice-content">
          {dashboard.fallback}
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          {readError && (
            <p className="error-banner" role="alert">
              读取状态失败：{readError}
            </p>
          )}
          {notice?.kind === "idle" && (
            <section aria-label="空闲提醒">
              <h1>
                已连续 {formatDuration(notice.idle_warning_seconds)}{" "}
                没有输入活动
              </h1>
              <p>
                到达 {formatDuration(notice.idle_end_seconds)}{" "}
                时将结束本次计时，最后一次输入后的尾段不计入有效工时。恢复操作后会取消此提醒。
              </p>
              <p>当前暂计 {formatDuration(notice.record.duration_seconds)}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void later();
                }}
              >
                知道了，继续稍后处理
              </button>
            </section>
          )}
          {notice?.kind === "ended" && (
            <section aria-label="工作结束提醒">
              <h1>本次工作已结束，请填写工作量</h1>
              <p className="hint">结果已保存。稍后填写不会影响下一段工作。</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void openSettlement();
                }}
              >
                打开待补全窗口填写
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => {
                  void later();
                }}
              >
                稍后填写
              </button>
            </section>
          )}
          {!notice && <p role="status">提醒已处理，正在更新。</p>}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            打开 WorkMemo 待补全列表
          </button>
        </main>
      </div>
    </div>
  );
}
