# 第一阶段完整源码
这是第一阶段（提交 22cfacc）的历史源码快照，保留当时完整内容。后续实现请查看对应阶段源码文档及项目实际文件；第二阶段见 PHASE-2-SOURCE.md。

## NEW FILE — E:\WorkMemo\.gitattributes

````
* text=auto eol=lf
*.png binary
*.ico binary
*.icns binary

````

## NEW FILE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 当前仅获准完成第一阶段：最小工程、环境准备、桌面启动和基础构建验证。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，后续使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 阶段进度见 `docs/PHASE-1.md`，启动方式见 `README.md`。

## GitHub 同步约定

- 用户已授权：每个明确完成的开发步骤或阶段，在完成适当检查并记录结果后，创建 Git 提交并推送到 `origin`；不需要重复询问是否推送。
- 本项目仓库为 `https://github.com/noharass/WorkMemo`，默认分支 `main`。修改远程地址、公开范围或进行破坏性操作需要新的明确授权。
- 提交身份只在当前仓库设置，使用用户提供的身份；不修改全局 Git 身份。
- 推送前检查暂存区，不提交依赖目录、构建产物、本地工作数据库、凭据或环境私密配置。
- 验收受限或未通过的项目必须如实记录。保存当前开发进度不代表相关功能已经验收通过。
- 不强制推送。远程有新提交时，先检查并安全整合，不能覆盖远程历史。
- 推送后比较本地提交和远程分支的提交标识，并检查工作区状态，确认同步结果。
- 认证、网络或冲突导致推送失败时，保留本地提交并明确报告，不声称已同步，也不将凭据写入文件或远程 URL。

````

## NEW FILE — E:\WorkMemo\package.json

````
{
  "name": "workmemo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^6.0.2",
    "typescript": "~6.0.3",
    "vite": "^8.0.16",
    "@tauri-apps/cli": "^2"
  }
}

````

## NEW FILE — E:\WorkMemo\index.html

````
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WorkMemo</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

````

## NEW FILE — E:\WorkMemo\tsconfig.json

````
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

````

## NEW FILE — E:\WorkMemo\tsconfig.node.json

````
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}

````

## NEW FILE — E:\WorkMemo\vite.config.ts

````
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error type error without @types/node package
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));

````

## NEW FILE — E:\WorkMemo\src\main.tsx

````
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

````

## NEW FILE — E:\WorkMemo\src\vite-env.d.ts

````
/// <reference types="vite/client" />

````

## NEW FILE — E:\WorkMemo\src\App.tsx

````
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

````

## NEW FILE — E:\WorkMemo\src\App.css

````
:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: #f5f3ee;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --text-muted: #71766f;
  --accent: #3b6551;
  --line: #dedfd5;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button { font: inherit; }
.workspace { max-width: 520px; margin: 0 auto; padding: 28px 30px 24px; }
.brand { display: flex; align-items: center; gap: 11px; }
.brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; background: var(--accent); color: #fff; font: 600 25px Georgia, serif; padding-bottom: 5px; }
.brand-name { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.3px; }
.brand-caption { display: block; margin-top: 3px; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
.stage { margin-left: auto; font-size: 10px; color: var(--text-muted); border: 1px solid var(--line); border-radius: 20px; padding: 5px 9px; }
.welcome { margin-top: 45px; }
.eyebrow { font-size: 10px; letter-spacing: 2px; color: var(--accent); }
h1 { margin: 13px 0 15px; font-size: 30px; line-height: 1.55; font-weight: 600; letter-spacing: -1px; }
.intro { color: var(--text-muted); font-size: 12px; line-height: 1.9; margin: 0; }
.connection-card { margin-top: 28px; padding: 20px; border: 1px solid var(--line); border-radius: 16px; background: #fffdf8; box-shadow: 0 6px 24px #303b3505; }
.card-heading { display: flex; align-items: center; justify-content: space-between; }
h2 { font-size: 11px; font-weight: 500; color: var(--text-muted); margin: 0; letter-spacing: .6px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #a5a89e; }
.status-dot.ready { background: #4c8860; box-shadow: 0 0 0 4px #4c886012; }
.status-dot.error { background: #ac4b3c; }
.connection-status { font-size: 16px; font-weight: 600; margin: 16px 0 7px; }
.connection-detail { font-size: 11px; line-height: 1.8; color: var(--text-muted); margin: 0; }
button { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 19px; padding: 11px 13px; background: var(--accent); color: #fff; border: 1px solid transparent; border-radius: 8px; font-size: 12px; cursor: pointer; transition: background .15s; }
button:hover:not(:disabled) { background: #2c513e; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
button:disabled { opacity: .65; cursor: wait; }
.error-detail { margin-top: 12px; font-size: 11px; color: #974c3e; }
.error-detail summary { cursor: pointer; }
.error-detail pre { white-space: pre-wrap; overflow-wrap: anywhere; }
footer { margin-top: 27px; display: flex; gap: 10px; align-items: flex-start; }
.footer-line { height: 24px; width: 2px; background: #c5d1c3; margin-top: 4px; }
footer p { margin: 0; font-size: 10px; line-height: 1.9; color: var(--text-muted); }
footer p span { color: #878b82; }
@media (max-width: 380px) { .workspace { padding: 22px; } .welcome { margin-top: 28px; } h1 { font-size: 27px; } }
@media (prefers-reduced-motion: reduce) { button { transition: none; } }

````

## NEW FILE — E:\WorkMemo\src-tauri\Cargo.toml

````
[package]
name = "workmemo"
version = "0.1.0"
description = "Local personal work journal and focus timer"
edition = "2024"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "workmemo_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true

````

## NEW FILE — E:\WorkMemo\src-tauri\build.rs

````
fn main() {
    tauri_build::build()
}

````

## NEW FILE — E:\WorkMemo\src-tauri\src\main.rs

````
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    workmemo_lib::run()
}

````

## NEW FILE — E:\WorkMemo\src-tauri\src\lib.rs

````
use serde::Serialize;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_info])
        .run(tauri::generate_context!())
        .expect("WorkMemo failed to start");
}

````

## NEW FILE — E:\WorkMemo\src-tauri\tauri.conf.json

````
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.1.0",
  "identifier": "com.workmemo.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "WorkMemo",
        "width": 440,
        "height": 620,
        "minWidth": 360,
        "minHeight": 500,
        "center": true,
        "backgroundColor": "#F5F3EE"
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}

````

## NEW FILE — E:\WorkMemo\src-tauri\capabilities\default.json

````
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Main window; only the registered app_info command is used in phase 1",
  "windows": ["main"],
  "permissions": []
}

````

## NEW FILE — E:\WorkMemo\.gitignore

````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Local credentials and working data
.env
.env.*
!.env.example
*.db
*.db-shm
*.db-wal
*.sqlite
*.sqlite-shm
*.sqlite-wal
*.sqlite3
*.sqlite3-shm
*.sqlite3-wal

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

````

## NEW FILE — E:\WorkMemo\src-tauri\.gitignore

````
# Generated by Cargo
# will have compiled files and executables
/target/

# Generated by Tauri
# will have schema files for capabilities auto-completion
/gen/schemas

````

## NEW FILE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前是第一阶段的最小桌面工程，接入真实的 React → Tauri IPC → Rust 连接检查。
任务、SQLite、原生透明、换肤、历史和统计尚未实现。

## Windows 环境

- Node.js：使用与 Vite 兼容的版本，本机为 Node 24。
- Rust stable 的 x86_64-pc-windows-msvc 工具链。
- Visual Studio 2022 C++ Build Tools 和 Windows SDK。
- Microsoft Edge WebView2 Runtime。

安装工具链后重新打开 PowerShell，以刷新 PATH。
环境依据：https://v2.tauri.app/start/prerequisites/

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
npm ci
npm run tauri dev
```

原生窗口应显示「桌面连接正常」，「重新检查」会再次调用 Rust。
保留系统标题栏，可拖动、缩放和关闭。

```powershell
npm run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
当前只验证可执行文件构建；正式安装包在后续阶段验收。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面，通过 app_info 命令调用 Rust。
- src-tauri/src/：Rust 入口和连接检查。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：原生权限，当前不申请额外权限。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

## GitHub 同步

仓库：https://github.com/noharass/WorkMemo

每个明确完成的开发步骤或阶段，在检查并记录实际结果后提交、推送到 main。
同步操作不替代阶段验收。当前原生窗口交互、Release 独立启动仍有待验收项，见 docs/PHASE-1.md。
同步规则见 AGENTS.md，操作说明见 docs/GITHUB-SYNC.md。

````
