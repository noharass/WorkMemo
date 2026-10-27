param(
    [string]$BinaryPath,
    [string]$AppBinaryPath,
    [string]$ProfileId = 'com.workmemo.desktop',
    [string]$OutputDirectory,
    [switch]$Register
)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).ProviderPath
if ($ProfileId -notmatch '^com\.workmemo\.(desktop|test\.[a-z0-9]+([.-][a-z0-9]+)*)$') { throw 'ProfileId 无效。' }
if (-not $BinaryPath) { $BinaryPath = Join-Path $taskRoot 'src-tauri\target\debug\workmemo-browser.exe' }
$taskBinary = (Resolve-Path -LiteralPath $BinaryPath).ProviderPath
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $taskRoot ("artifacts\browser-bridge\" + $ProfileId) }
$taskOutput = [IO.Path]::GetFullPath($OutputDirectory)
[IO.Directory]::CreateDirectory($taskOutput) | Out-Null
$taskExtension = Join-Path $taskOutput 'extension'
[IO.Directory]::CreateDirectory($taskExtension) | Out-Null
$taskUtf8 = New-Object Text.UTF8Encoding($false)
$taskHostName = if ($ProfileId.StartsWith('com.workmemo.test.')) { 'com.workmemo.browser_bridge_test' } else { 'com.workmemo.browser_bridge' }
foreach ($taskFile in @('manifest.json','background.js','matching.js','popup.html','popup.js','popup.css','bridge-config.js')) {
    Copy-Item -LiteralPath (Join-Path $taskRoot ('browser-extension\' + $taskFile)) -Destination (Join-Path $taskExtension $taskFile) -Force
}
[IO.File]::WriteAllText((Join-Path $taskExtension 'bridge-config.js'), ('export const HOST_NAME = "' + $taskHostName + '";' + [Environment]::NewLine), $taskUtf8)
$taskHostBinary = Join-Path $taskOutput 'workmemo-browser.exe'
if ($taskBinary -ne $taskHostBinary) { Copy-Item -LiteralPath $taskBinary -Destination $taskHostBinary -Force }
[IO.File]::WriteAllText((Join-Path $taskOutput 'workmemo-browser.profile.json'), (@{identifier=$ProfileId} | ConvertTo-Json -Compress), $taskUtf8)
$taskExtensionManifest = Get-Content -Raw -LiteralPath (Join-Path $taskExtension 'manifest.json') -Encoding UTF8 | ConvertFrom-Json
$taskHash = [Security.Cryptography.SHA256]::Create()
try { $taskDigest = $taskHash.ComputeHash([Convert]::FromBase64String($taskExtensionManifest.key)) } finally { $taskHash.Dispose() }
$taskExtensionId = -join (0..15 | ForEach-Object { [char](97 + ($taskDigest[$_] -shr 4)); [char](97 + ($taskDigest[$_] -band 15)) })
if ($taskExtensionId -ne 'oljcealhccdhaddceacnokihjefloaih') { throw '扩展标识与原生主机不一致。' }
$taskManifestPath = Join-Path $taskOutput ($taskHostName + '.json')
$taskManifest = @{name=$taskHostName;description='WorkMemo 本地工作页面监测';path=$taskHostBinary;type='stdio';allowed_origins=@('chrome-extension://' + $taskExtensionId + '/')}
[IO.File]::WriteAllText($taskManifestPath, ($taskManifest | ConvertTo-Json -Depth 4), $taskUtf8)
if ($AppBinaryPath) {
    $taskAppSource = (Resolve-Path -LiteralPath $AppBinaryPath).ProviderPath
    $taskAppName = if ($ProfileId.StartsWith('com.workmemo.test.')) { 'workmemo-test.exe' } else { 'workmemo.exe' }
    $taskAppTarget = Join-Path $taskOutput $taskAppName
    if ($taskAppSource -ne $taskAppTarget) { Copy-Item -LiteralPath $taskAppSource -Destination $taskAppTarget -Force }
    Write-Output ('桌面程序：' + $taskAppTarget)
}
if ($Register) {
    $taskRegistryPath = 'Software\Google\Chrome\NativeMessagingHosts\' + $taskHostName
    $taskPrevious = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($taskRegistryPath)
    if ($null -ne $taskPrevious) {
        try { $taskPreviousValue = $taskPrevious.GetValue('') } finally { $taskPrevious.Dispose() }
        if ($taskPreviousValue -and $taskPreviousValue -ne $taskManifestPath) {
            [IO.File]::WriteAllText((Join-Path $taskOutput 'previous-registration.json'), (@{key=$taskRegistryPath;value=$taskPreviousValue} | ConvertTo-Json), $taskUtf8)
        }
    }
    $taskRegistryKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskRegistryPath)
    try { $taskRegistryKey.SetValue('', $taskManifestPath, [Microsoft.Win32.RegistryValueKind]::String) } finally { $taskRegistryKey.Dispose() }
    Write-Output ('已注册当前用户 Chrome 本机主机：' + $taskHostName)
}
Write-Output ('扩展目录：' + $taskExtension)
Write-Output ('扩展 ID：' + $taskExtensionId)
Write-Output ('主机清单：' + $taskManifestPath)
Write-Output ('数据配置：' + $ProfileId)
if (-not $Register) { Write-Output '仅准备文件，尚未修改 Chrome 主机注册。需要接入时使用 -Register。' }
