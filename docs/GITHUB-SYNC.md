# GitHub 同步说明

仓库：https://github.com/noharass/WorkMemo
本地目录：E:\WorkMemo
分支：main

用户已授权在每个明确完成的开发步骤或阶段完成适当检查后提交并推送。后续开发遵守 AGENTS.md 中的同步约定。

## 本次准备

- 检查远程仓库：可访问，首次连接时尚无任何分支提交。
- 使用用户提供的姓名与邮箱，仅配置当前仓库的 Git 提交身份。
- 将 origin 指向用户提供的仓库。
- 首次提交包含现有完整源码、依赖锁文件、产品规范、交付文档与浏览器预览截图。
- 不上传 node_modules、dist、Rust target、可执行文件、本地数据库或私密环境配置。
- 不改变任何已有业务功能；未完成的原生窗口和独立启动验收仍保留为待验收。

## PowerShell 操作

```powershell
Set-Location 'E:\WorkMemo'
git status --short
git add .
git diff --cached --check
git diff --cached --stat
git commit -m "chore: initialize WorkMemo desktop foundation"
git push -u origin main
```

## 同步核验

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

本地 HEAD 与远程 main 的提交标识应一致；工作区应无未提交修改。只有实际推送成功并核验后，才能在交付中报告同步完成。

后续提交应围绕实际完成的步骤命名，不重复使用初始化提交标题。如远程存在新提交，先检查和整合，不使用强制推送覆盖历史。
