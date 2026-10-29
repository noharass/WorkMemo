import { formatDuration, type Snapshot, type WorkRecord } from "./types.ts";

interface ViewInput {
  native: boolean;
  loading: boolean;
  snapshot: Snapshot | null;
  connectionError: string;
  savedId: number | null;
}

export function confirmedFinish(snapshot: Snapshot | null, id: number | null): WorkRecord | null {
  if (id === null || !snapshot || snapshot.active) return null;
  return snapshot.recent_records.find((record) => record.id === id
    && record.status === "FINISHED" && record.end_time !== null) ?? null;
}

// A read started before a confirmed deletion may arrive after it. Never revive that record.
export function reconcileDeleted(snapshot: Snapshot, deleted: ReadonlySet<number>): Snapshot {
  return { ...snapshot, recent_records: snapshot.recent_records.filter((record) => !deleted.has(record.id)) };
}

export function workView({ native, loading, snapshot, connectionError, savedId }: ViewInput) {
  const finished = confirmedFinish(snapshot, savedId);
  const record = snapshot?.active ?? finished;
  const mode = !native ? "preview" : loading ? "loading"
    : connectionError || !snapshot ? "unavailable"
    : snapshot.active ? (snapshot.active.is_paused ? "paused" : "working")
    : finished ? "finished" : "ready";
  const labels = { preview: "桌面预览", loading: "正在读取", unavailable: "暂不可用",
    paused: record?.recovery_pending ? "上次任务待恢复" : record?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲自动暂停" : record?.pause_reason === "AWAY" ? "离页自动暂停" : record?.pause_reason === "MONITOR" ? "监测中断暂停" : record?.pause_reason === "MANUAL" ? "手动暂停" : "已暂停",
    working: record?.control_mode === "AUTO" ? "自动记录中" : "手动计时中", finished: finished?.settlement_status === "PENDING" ? "计时已保存，待补全" : "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: record?.pause_reason === "IDLE_PAUSE" ? (record.control_mode === "MANUAL" ? "暂停期间不计时；新键鼠操作后继续原任务" : "暂停期间不计时；返回工作页面操作后继续原任务") : "暂停期间不计时", working: "暂计工时；空闲暂停或结束会扣除最后输入后的尾段",
    finished: "本次有效工作时长", ready: "选择类别即可开始，工作量稍后填写" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
