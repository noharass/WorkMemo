[CmdletBinding()]
param([string]$HostBinary)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskVersion = (Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $taskRoot 'package.json') | ConvertFrom-Json).version
if (-not $HostBinary) { $HostBinary = Join-Path $taskRoot ('artifacts\' + $taskVersion + '\portable\WorkMemo-Preview\workmemo-browser.exe') }
$taskHost = (Resolve-Path -LiteralPath $HostBinary).ProviderPath
$taskNsis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
if (-not (Test-Path -LiteralPath $taskNsis)) { throw 'The cached NSIS tool is required.' }
$taskNonce = [Guid]::NewGuid().ToString('N')
$taskDirectory = Join-Path $taskRoot ('artifacts\browser-registration-tests\' + $taskNonce)
$taskInstall = Join-Path $taskDirectory '中文安装 & !'
$taskWorkspace = [IO.Path]::GetFullPath((Join-Path $taskRoot 'artifacts')) + [IO.Path]::DirectorySeparatorChar
if (-not ([IO.Path]::GetFullPath($taskInstall)).StartsWith($taskWorkspace, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe test path.' }
[IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
$taskTestKey = 'Software\WorkMemo\RegistrationTests\' + $taskNonce
$taskActualKey = 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test'
function Read-DefaultValue([string]$Path) {
    $taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($Path)
    if ($null -eq $taskKey) { return $null }
    try { return $taskKey.GetValue('') } finally { $taskKey.Dispose() }
}
$taskBefore = Read-DefaultValue $taskActualKey
$taskTemplate = @'
Unicode true
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
Name "WorkMemo bridge registration test"
OutFile "@SETUP@"
InstallDir "@INSTALL@"
!define WM_BRIDGE_REGISTRY_KEY "@KEY@"
!include "@HOOK@"
Section
  SetRegView 64
  SetOutPath "$INSTDIR"
  File /oname=workmemo-browser.exe "@HOST@"
  File /oname=com.workmemo.browser_bridge_test.json "@MANIFEST@"
  !insertmacro NSIS_HOOK_POSTINSTALL
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd
Section Uninstall
  SetRegView 64
  Delete "$INSTDIR\workmemo-browser.exe"
  Delete "$INSTDIR\com.workmemo.browser_bridge_test.json"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"
  !insertmacro NSIS_HOOK_POSTUNINSTALL
SectionEnd
'@
$taskSetup = Join-Path $taskDirectory 'registration-test.exe'
$taskSource = $taskTemplate.Replace('@SETUP@',$taskSetup).Replace('@INSTALL@',$taskInstall).Replace('@KEY@',$taskTestKey).Replace('@HOOK@',(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh')).Replace('@HOST@',$taskHost).Replace('@MANIFEST@',(Join-Path $taskRoot 'src-tauri\installer\com.workmemo.browser_bridge_test.json'))
$taskNsi = Join-Path $taskDirectory 'registration-test.nsi'
[IO.File]::WriteAllText($taskNsi,$taskSource,(New-Object Text.UTF8Encoding($true)))
& $taskNsis /V2 /INPUTCHARSET UTF8 $taskNsi
if ($LASTEXITCODE -ne 0) { throw 'NSIS test harness compilation failed.' }
function Run-Silent([string]$Path) {
    $taskProcess = Start-Process -FilePath $Path -ArgumentList '/S' -WindowStyle Hidden -Wait -PassThru
    if ($taskProcess.ExitCode -ne 0) { throw ('Test installer failed with exit ' + $taskProcess.ExitCode) }
}
Run-Silent $taskSetup
$taskManifestPath = Join-Path $taskInstall 'com.workmemo.browser_bridge_test.json'
if ((Read-DefaultValue $taskTestKey) -ne $taskManifestPath) { throw 'Installer registered the wrong path.' }
$taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskManifest.path -ne 'workmemo-browser.exe' -or $taskManifest.name -ne 'com.workmemo.browser_bridge_test' -or $taskManifest.allowed_origins.Count -ne 1 -or $taskManifest.allowed_origins[0] -ne 'chrome-extension://oljcealhccdhaddceacnokihjefloaih/') { throw 'Invalid installer host manifest.' }
Run-Silent (Join-Path $taskInstall 'uninstall.exe')
if ((Read-DefaultValue $taskTestKey) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'Owned registration was not removed.' }
Write-Output 'PASS: silent install registers valid relative-path JSON under a Unicode directory; owned uninstall removes it.'

Run-Silent $taskSetup
$taskNewerManifest = Join-Path $taskDirectory 'newer-install\com.workmemo.browser_bridge_test.json'
$taskKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskTestKey)
try { $taskKey.SetValue('',$taskNewerManifest) } finally { $taskKey.Dispose() }
Run-Silent (Join-Path $taskInstall 'uninstall.exe')
if ((Read-DefaultValue $taskTestKey) -ne $taskNewerManifest) { throw 'Old uninstall removed a newer registration.' }
$taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($taskTestKey,$true)
try { $taskKey.DeleteValue('',$false) } finally { $taskKey.Dispose() }
[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKey($taskTestKey,$false)
Write-Output 'PASS: old uninstall preserves a newer directory registration.'

$taskCmdDirectory = Join-Path $taskDirectory '中文修复 & !'
[IO.Directory]::CreateDirectory((Join-Path $taskCmdDirectory 'extension')) | Out-Null
$taskCmd = Join-Path $taskCmdDirectory 'Register-Browser.cmd'
Copy-Item -LiteralPath (Join-Path $taskRoot 'scripts\register-preview-browser.cmd') -Destination $taskCmd
function Run-Prepare {
    $taskInfo = New-Object Diagnostics.ProcessStartInfo
    $taskInfo.FileName = $env:ComSpec
    $taskInfo.Arguments = '/d /s /c ""' + $taskCmd + '" /prepare-only"'
    $taskInfo.UseShellExecute = $false
    $taskInfo.CreateNoWindow = $true
    $taskInfo.RedirectStandardOutput = $true
    $taskInfo.RedirectStandardError = $true
    $taskProcess = New-Object Diagnostics.Process
    $taskProcess.StartInfo = $taskInfo
    [void]$taskProcess.Start()
    $null = $taskProcess.StandardOutput.ReadToEnd()
    $null = $taskProcess.StandardError.ReadToEnd()
    $taskProcess.WaitForExit()
    $taskExitCode = $taskProcess.ExitCode
    $taskProcess.Dispose()
    return $taskExitCode
}
if ((Run-Prepare) -eq 0) { throw 'Missing host files were accepted.' }
Copy-Item -LiteralPath $taskHost -Destination (Join-Path $taskCmdDirectory 'workmemo-browser.exe')
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'workmemo-browser.profile.json'),'{"identifier":"com.workmemo.test.monitor"}')
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'extension\bridge-config.js'),'export const HOST_NAME = "com.workmemo.browser_bridge_test";')
if ((Run-Prepare) -ne 0) { throw 'One-click prepare failed under the Unicode directory.' }
$taskPrepared = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $taskCmdDirectory 'com.workmemo.browser_bridge_test.json') | ConvertFrom-Json
if ($taskPrepared.path -ne 'workmemo-browser.exe' -or $taskPrepared.allowed_origins.Count -ne 1) { throw 'One-click manifest is invalid.' }
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'extension\bridge-config.js'),'export const HOST_NAME = "com.workmemo.browser_bridge";')
if ((Run-Prepare) -eq 0) { throw 'A mismatched source extension was accepted.' }
if ((Read-DefaultValue $taskActualKey) -ne $taskBefore) { throw 'Production Chrome registration changed during tests.' }
Write-Output 'PASS: one-click prepare rejects missing files and mixed extensions, handles Unicode/ampersand paths, and leaves real Chrome registration unchanged.'
Write-Output ('Test evidence directory: ' + $taskDirectory)
