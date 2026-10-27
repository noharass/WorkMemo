[CmdletBinding()]
param([string]$HostBinary)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if (-not $HostBinary) { $HostBinary = Join-Path $taskRoot 'src-tauri\target\debug\workmemo-browser.exe' }
$taskHost = (Resolve-Path -LiteralPath $HostBinary).ProviderPath
function Run-Process([string]$Path, [string]$Arguments) {
    $taskInfo = New-Object Diagnostics.ProcessStartInfo
    $taskInfo.FileName = $Path; $taskInfo.Arguments = $Arguments
    $taskInfo.UseShellExecute = $false; $taskInfo.CreateNoWindow = $true
    $taskInfo.RedirectStandardOutput = $true; $taskInfo.RedirectStandardError = $true
    $taskProcess = New-Object Diagnostics.Process
    $taskProcess.StartInfo = $taskInfo
    [void]$taskProcess.Start()
    $taskOutput = $taskProcess.StandardOutput.ReadToEnd()
    $taskError = $taskProcess.StandardError.ReadToEnd()
    $taskProcess.WaitForExit()
    $taskCode = $taskProcess.ExitCode; $taskProcess.Dispose()
    return @{Code=$taskCode;Output=$taskOutput;Error=$taskError}
}
$taskProbe = Run-Process $taskHost '--bridge-info'
if ($taskProbe.Code -ne 0 -or -not ($taskProbe.Output | ConvertFrom-Json).test_overrides) { throw 'Tests require a DEBUG helper with private-namespace overrides. Never test registration using a release helper.' }
$taskNonce = [Guid]::NewGuid().ToString('N')
$taskDirectory = Join-Path $taskRoot ('artifacts\browser-registration-tests\' + $taskNonce)
[IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
$taskRegistry = 'Software\WorkMemo\RegistrationTests\' + $taskNonce
$taskData = Join-Path $taskDirectory '用户数据'
$taskNsis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
$taskUtf8 = New-Object Text.UTF8Encoding($false)
function Read-Key([string]$Path) {
    $taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($Path)
    if ($null -eq $taskKey) { return $null }
    try { return $taskKey.GetValue('') } finally { $taskKey.Dispose() }
}
$taskRealBefore = @((Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge'),(Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test')) | ConvertTo-Json -Compress
$taskOldRegistry = $env:WORKMEMO_TEST_REGISTRY_ROOT; $taskOldData = $env:WORKMEMO_TEST_DATA_ROOT
try {
    $env:WORKMEMO_TEST_REGISTRY_ROOT = $taskRegistry; $env:WORKMEMO_TEST_DATA_ROOT = $taskData
    foreach ($taskProfile in @('com.workmemo.desktop','com.workmemo.test.registration')) {
        $taskHostName = if ($taskProfile -eq 'com.workmemo.desktop') { 'com.workmemo.browser_bridge' } else { 'com.workmemo.browser_bridge_test' }
        $taskKeyPath = $taskRegistry + '\' + $taskHostName
        $taskInstall = Join-Path $taskDirectory ($taskProfile + '\中文安装 & !')
        $taskProfileFile = Join-Path $taskDirectory ($taskProfile + '.json')
        [IO.File]::WriteAllText($taskProfileFile, (@{identifier=$taskProfile} | ConvertTo-Json -Compress), $taskUtf8)
        $taskSetup = Join-Path $taskDirectory ($taskProfile + '-setup.exe')
        $taskValues = @{TEST_SETUP=$taskSetup;TEST_INSTALL=$taskInstall;TEST_REGISTRY=$taskRegistry;TEST_DATA=$taskData;TEST_HOOK=(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh');TEST_PROFILE=$taskProfile;TEST_HOST=$taskHost;TEST_PROFILEFILE=$taskProfileFile}
        $taskDefines = @($taskValues.GetEnumerator() | ForEach-Object { '/D' + $_.Key + '=' + $_.Value })
        & $taskNsis /V2 /INPUTCHARSET UTF8 @taskDefines (Join-Path $PSScriptRoot 'browser-registration-test.nsi')
        if ($LASTEXITCODE -ne 0) { throw 'NSIS harness compilation failed.' }
        $taskResult = Run-Process $taskSetup '/S'
        if ($taskResult.Code -ne 0) { throw 'Silent install failed.' }
        $taskManifestPath = Join-Path $taskData ($taskProfile + '\browser-host.json')
        if ((Read-Key $taskKeyPath) -ne $taskManifestPath) { throw 'Installer registered wrong manifest.' }
        $taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($taskManifest.path -ne (Join-Path $taskInstall 'workmemo-browser.exe') -or $taskManifest.allowed_origins.Count -ne 1) { throw 'Invalid absolute helper path or origin.' }
        $taskPortable = Join-Path $taskDirectory ($taskProfile + '\移动后 ZIP & !')
        [IO.Directory]::CreateDirectory($taskPortable) | Out-Null
        Copy-Item -LiteralPath $taskHost -Destination (Join-Path $taskPortable 'workmemo-browser.exe')
        Copy-Item -LiteralPath $taskProfileFile -Destination (Join-Path $taskPortable 'workmemo-browser.profile.json')
        $taskCmd = Join-Path $taskPortable 'Register-Browser.cmd'
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'register-preview-browser.cmd') -Destination $taskCmd
        $taskResult = Run-Process $env:ComSpec ('/d /s /c ""' + $taskCmd + '" /repair"')
        if ($taskResult.Code -ne 0) { throw ('CMD repair failed: ' + $taskResult.Error) }
        $taskResult = Run-Process (Join-Path $taskInstall 'uninstall.exe') '/S'
        Start-Sleep -Milliseconds 600
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -ne $taskManifestPath) { throw 'Old uninstaller removed newer ZIP registration.' }
        $taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($taskManifest.path -ne (Join-Path $taskPortable 'workmemo-browser.exe')) { throw 'ZIP relocation not repaired.' }
        $taskResult = Run-Process (Join-Path $taskPortable 'workmemo-browser.exe') '--unregister'
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'CLI owned unregister failed.' }
        $taskResult = Run-Process $taskSetup '/S'
        $taskResult = Run-Process (Join-Path $taskInstall 'uninstall.exe') '/S'
        Start-Sleep -Milliseconds 600
        if ($taskResult.Code -ne 0 -or (Read-Key $taskKeyPath) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'Owned installer uninstall failed.' }
        Write-Output ('PASS: ' + $taskProfile + ' install / ZIP-CMD repair / relocation / old uninstall protection / owned uninstall.')
    }
} finally {
    $env:WORKMEMO_TEST_REGISTRY_ROOT = $taskOldRegistry; $env:WORKMEMO_TEST_DATA_ROOT = $taskOldData
}
$taskRealAfter = @((Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge'),(Read-Key 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test')) | ConvertTo-Json -Compress
if ($taskRealAfter -ne $taskRealBefore) { throw 'Real Chrome host registration was modified.' }
[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKeyTree($taskRegistry,$false)
Write-Output 'PASS: actual Chrome registrations unchanged. No work database was opened.'
Write-Output ('Evidence: ' + $taskDirectory)
