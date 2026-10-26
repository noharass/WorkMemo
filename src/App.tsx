import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import "./App.css";

interface AppInfo {
  name: string;
  version: string;
}

type Connection =
  | { status: "checking" }
  | { status: "ready"; info: AppInfo }
  | { status: "error"; message: string }
  | { status: "browser" };

function App() {
  const [connection, setConnection] = useState<Connection>({ status: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!isTauri()) {
      setConnection({ status: "browser" });
      return;
    }
    setConnection({ status: "checking" });
    invoke<AppInfo>("app_info")
      .then((info) => {
        if (!cancelled) setConnection({ status: "ready", info });
      })
      .catch((error: unknown) => {
        if (!cancelled) setConnection({ status: "error", message: String(error) });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const statusText = {
    checking: "正在检查桌面连接",
    ready: "桌面连接正常",
    error: "桌面连接失败",
    browser: "浏览器预览模式",
  }[connection.status];

  return (
    <main className="workspace">
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">w.</span>
        <div>
          <span className="brand-name">WorkMemo</span>
          <span className="brand-caption">留住每一份投入</span>
        </div>
        <span className="stage">初始版本</span>
      </header>
      <section className="welcome" aria-labelledby="welcome-title">
        <span className="eyebrow">你的桌面工作手记</span>
        <h1 id="welcome-title">专注当下，<br />让工作留下痕迹。</h1>
        <p className="intro">一个轻巧、安静的本地空间，<br />用来记录工作，也看见自己的积累。</p>
      </section>
      <section className="connection-card" aria-labelledby="connection-title">
        <div className="card-heading">
          <h2 id="connection-title">基础连接检查</h2>
          <span className={`status-dot ${connection.status}`} aria-hidden="true" />
        </div>
        <p className="connection-status" role="status" aria-live="polite">{statusText}</p>
        <p className="connection-detail">
          {connection.status === "ready"
            ? `${connection.info.name} ${connection.info.version} · 已连接本地 Rust 服务`
            : connection.status === "browser"
              ? "请打开桌面应用，验证原生窗口与本地服务。"
              : connection.status === "error"
                ? "未能连接本地服务，请重试或重新打开应用。"
                : "正在确认界面与本地服务可以正常通信。"}
        </p>
        {connection.status === "error" && (
          <details className="error-detail">
            <summary>查看错误详情</summary><pre>{connection.message}</pre>
          </details>
        )}
        <button type="button" onClick={() => setAttempt((value) => value + 1)}
          disabled={connection.status === "checking"}>
          {connection.status === "checking" ? "检查中…" : "重新检查"}
          <span aria-hidden="true">↗</span>
        </button>
      </section>
      <footer>
        <span className="footer-line" aria-hidden="true" />
        <p>当前为基础工程验收版<br /><span>工作计时与记录将在后续阶段接入</span></p>
      </footer>
    </main>
  );
}

export default App;
