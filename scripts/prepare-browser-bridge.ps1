param([string]$BinaryPath, [string]$AppBinaryPath, [string]$ProfileId = 'com.workmemo.desktop', [string]$OutputDirectory, [switch]$Register)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).ProviderPath
if (-not $BinaryPath) { $BinaryPath = Join-Path $taskRoot 'src-tauri\target\debug\workmemo-browser.exe' }
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $taskRoot ('artifacts\browser-bridge\' + $ProfileId) }
$taskOutput = [IO.Path]::GetFullPath($OutputDirectory)
& node (Join-Path $PSScriptRoot 'stage-browser-resources.mjs') --binary $BinaryPath --output $taskOutput --identifier $ProfileId
if ($LASTEXITCODE -ne 0) { throw '配套组件准备失败。' }
if ($AppBinaryPath) {
    $taskName = if ($ProfileId.StartsWith('com.workmemo.test.')) { 'workmemo-test.exe' } else { 'workmemo.exe' }
    Copy-Item -LiteralPath $AppBinaryPath -Destination (Join-Path $taskOutput $taskName) -Force
}
if ($Register) {
    & (Join-Path $taskOutput 'workmemo-browser.exe') --register
    if ($LASTEXITCODE -ne 0) { throw '本机接入失败。' }
}
Write-Output ('配套扩展目录：' + (Join-Path $taskOutput 'extension'))
if (-not $Register) { Write-Output '已准备完整文件；启动配套软件将自动接入，也可运行 Register-Browser.cmd。' }
