param([switch]$Unregister, [switch]$Check, [switch]$PrepareOnly)
$ErrorActionPreference = 'Stop'
$taskHelper = Join-Path $PSScriptRoot 'workmemo-browser.exe'
if (-not (Test-Path -LiteralPath $taskHelper -PathType Leaf)) { throw '缺少配套组件，请完整解压或重新安装。' }
$taskAction = if ($Unregister) { '--unregister' } elseif ($Check -or $PrepareOnly) { '--check' } else { '--register' }
& $taskHelper $taskAction
if ($LASTEXITCODE -ne 0) { throw '接入失败，请打开软件的监测设置查看连接诊断。' }
