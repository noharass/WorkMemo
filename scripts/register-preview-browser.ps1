[CmdletBinding()]
param([switch]$PrepareOnly, [switch]$Unregister)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($PrepareOnly -and $Unregister) { throw 'Choose only one operation.' }
$taskDirectory = [IO.Path]::GetFullPath($PSScriptRoot)
$taskHostName = 'com.workmemo.browser_bridge_test'
$taskKeyPath = 'Software\Google\Chrome\NativeMessagingHosts\' + $taskHostName
$taskManifestPath = Join-Path $taskDirectory ($taskHostName + '.json')
$taskUtf8 = New-Object Text.UTF8Encoding($false)

if ($Unregister) {
    $taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($taskKeyPath, $true)
    if ($null -ne $taskKey) {
        try {
            if ($taskKey.GetValue('') -eq $taskManifestPath) { $taskKey.DeleteValue('', $false) }
            elseif ($taskKey.GetValue('')) { throw 'Registration belongs to another folder; nothing changed.' }
        } finally { $taskKey.Dispose() }
    }
    Write-Output 'Preview host unregistered. Work records are preserved.'
    return
}

$taskHostBinary = Join-Path $taskDirectory 'workmemo-browser.exe'
if (-not (Test-Path -LiteralPath $taskHostBinary -PathType Leaf)) { throw 'Extract the whole ZIP before running this script.' }
$taskManifest = Get-Content -LiteralPath (Join-Path $taskDirectory 'extension\manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskSha = [Security.Cryptography.SHA256]::Create()
try { $taskDigest = $taskSha.ComputeHash([Convert]::FromBase64String($taskManifest.key)) } finally { $taskSha.Dispose() }
$taskExtensionId = -join (0..15 | ForEach-Object { [char](97 + ($taskDigest[$_] -shr 4)); [char](97 + ($taskDigest[$_] -band 15)) })
if ($taskExtensionId -ne 'oljcealhccdhaddceacnokihjefloaih') { throw 'Unexpected extension identity.' }
[IO.File]::WriteAllText((Join-Path $taskDirectory 'workmemo-browser.profile.json'), '{"identifier":"com.workmemo.test.monitor"}', $taskUtf8)
$taskHostManifest = @{name=$taskHostName;description='WorkMemo Preview local browser bridge';path=$taskHostBinary;type='stdio';allowed_origins=@('chrome-extension://' + $taskExtensionId + '/')}
[IO.File]::WriteAllText($taskManifestPath, ($taskHostManifest | ConvertTo-Json -Depth 4), $taskUtf8)
if ($PrepareOnly) { Write-Output ('Prepared local manifest without registration: ' + $taskManifestPath); return }

$taskKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskKeyPath)
try {
    $taskOldValue = $taskKey.GetValue('')
    if ($taskOldValue -and $taskOldValue -ne $taskManifestPath) {
        $taskBackup = Join-Path $taskDirectory ('previous-registration-' + [Guid]::NewGuid().ToString('N') + '.json')
        [IO.File]::WriteAllText($taskBackup, (@{key=$taskKeyPath;value=$taskOldValue} | ConvertTo-Json), $taskUtf8)
    }
    $taskKey.SetValue('', $taskManifestPath, [Microsoft.Win32.RegistryValueKind]::String)
} finally { $taskKey.Dispose() }
Write-Output ('Registered current-user preview host: ' + $taskHostName)
Write-Output ('Load this extension manually in Chrome: ' + (Join-Path $taskDirectory 'extension'))
