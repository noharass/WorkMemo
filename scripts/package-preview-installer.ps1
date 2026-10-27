[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PortableZip,
    [Parameter(Mandatory=$true)][ValidatePattern('^[0-9a-fA-F]{64}$')][string]$ExpectedSha256,
    [ValidatePattern('^[a-z0-9-]+$')][string]$InstallerRevision = 'r2'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { throw 'Windows x64 is required.' }
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskZipPath = (Resolve-Path -LiteralPath $PortableZip).ProviderPath
if ((Get-FileHash -LiteralPath $taskZipPath -Algorithm SHA256).Hash -ne $ExpectedSha256) { throw 'Portable ZIP checksum mismatch.' }
$taskVersion = (Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if ($taskVersion -notmatch '^\d+\.\d+\.\d+-alpha\.\d+$') { throw 'Expected an alpha version.' }
$taskOutput = Join-Path $taskRoot ('artifacts\' + $taskVersion + '\installer-' + $InstallerRevision)
$taskStaging = Join-Path $taskOutput 'staging'
[IO.Directory]::CreateDirectory((Join-Path $taskStaging 'extension')) | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskNames = @('workmemo-preview.exe','workmemo-browser.exe','Register-Browser.ps1','使用说明.md','THIRD-PARTY-LICENSES.txt','workmemo-browser.profile.json','BUILD-INFO.json')
foreach ($taskName in @('manifest.json','background.js','matching.js','popup.html','popup.js','popup.css','bridge-config.js')) { $taskNames += 'extension/' + $taskName }
$taskZip = [IO.Compression.ZipFile]::OpenRead($taskZipPath)
try {
    if ($taskZip.Entries.Count -ne $taskNames.Count) { throw 'Unexpected portable ZIP entry count.' }
    foreach ($taskName in $taskNames) {
        $taskEntry = $taskZip.GetEntry('WorkMemo-Preview/' + $taskName)
        if ($null -eq $taskEntry) { throw ('Missing portable entry: ' + $taskName) }
        [IO.Compression.ZipFileExtensions]::ExtractToFile($taskEntry, (Join-Path $taskStaging $taskName), $true)
    }
} finally { $taskZip.Dispose() }
$taskInfo = Get-Content -LiteralPath (Join-Path $taskStaging 'BUILD-INFO.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskInfo.version -ne $taskVersion -or $taskInfo.identifier -ne 'com.workmemo.test.monitor' -or $taskInfo.configuration -ne 'release') { throw 'Portable metadata does not match preview release.' }
$taskProfile = Get-Content -LiteralPath (Join-Path $taskStaging 'workmemo-browser.profile.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskProfile.identifier -ne $taskInfo.identifier) { throw 'Browser profile mismatch.' }
$taskLicense = Join-Path $taskRoot 'docs\THIRD-PARTY-LICENSES.txt'
if ((Get-FileHash -LiteralPath $taskLicense).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskStaging 'THIRD-PARTY-LICENSES.txt')).Hash) { throw 'Dependency notices differ from the portable release.' }
$taskPackagingCommit = & git -C $taskRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Unable to identify packaging commit.' }
$taskUtf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $taskStaging 'INSTALLER-BUILD-INFO.json'), (@{version=$taskVersion;application_source_commit=$taskInfo.source_commit;packaging_source_commit=$taskPackagingCommit;portable_sha256=$ExpectedSha256.ToLowerInvariant();identifier=$taskInfo.identifier;runtime_acceptance='pending'} | ConvertTo-Json), $taskUtf8)

# Bundle the exact published app bytes under a separate process name.
$taskBinary = Join-Path $taskRoot 'src-tauri\target\release\workmemo-preview.exe'
[IO.Directory]::CreateDirectory((Split-Path -Parent $taskBinary)) | Out-Null
Copy-Item -LiteralPath (Join-Path $taskStaging 'workmemo-preview.exe') -Destination $taskBinary -Force
$taskResources = @{}
foreach ($taskName in $taskNames) {
    if ($taskName -in @('workmemo-preview.exe','THIRD-PARTY-LICENSES.txt','使用说明.md')) { continue }
    $taskResources[(Join-Path $taskStaging $taskName)] = $taskName
}
$taskResources[(Join-Path $taskRoot 'docs\PREVIEW-INSTALLER-GUIDE.md')] = '使用说明.md'
$taskResources[(Join-Path $taskRoot 'scripts\register-preview-browser.cmd')] = 'Register-Browser.cmd'
$taskResources[(Join-Path $taskStaging 'INSTALLER-BUILD-INFO.json')] = 'INSTALLER-BUILD-INFO.json'
$taskOverlay = @{mainBinaryName='workmemo-preview';bundle=@{resources=$taskResources;windows=@{nsis=@{startMenuFolder='WorkMemo Preview';installerHooks=(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh')}}}}
$taskOverlayPath = Join-Path $taskOutput 'installer.conf.json'
[IO.File]::WriteAllText($taskOverlayPath, ($taskOverlay | ConvertTo-Json -Depth 10), $taskUtf8)
Push-Location $taskRoot
try {
    & npm.cmd run tauri -- bundle --ci --bundles nsis --no-binary-patching --config src-tauri/tauri.preview.conf.json --config $taskOverlayPath
    if ($LASTEXITCODE -ne 0) { throw 'NSIS installer bundling failed.' }
} finally { Pop-Location }
if ((Get-FileHash -LiteralPath $taskBinary).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskStaging 'workmemo-preview.exe')).Hash) { throw 'Bundler changed published application bytes.' }
$taskGeneratedSetup = Join-Path $taskRoot ('src-tauri\target\release\bundle\nsis\WorkMemo Preview_' + $taskVersion + '_x64-setup.exe')
$taskSetupName = 'WorkMemo_' + $taskVersion + '_x64-preview-setup-' + $InstallerRevision + '.exe'
Copy-Item -LiteralPath $taskGeneratedSetup -Destination (Join-Path $taskOutput $taskSetupName) -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'docs\BROWSER-REGISTRATION-FIX.md') -Destination (Join-Path $taskOutput 'REGISTRATION-FIX-GUIDE.md') -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'scripts\register-preview-browser.cmd') -Destination (Join-Path $taskOutput 'Register-Browser.cmd') -Force
$taskChecksums = foreach ($taskName in @($taskSetupName,'REGISTRATION-FIX-GUIDE.md','Register-Browser.cmd')) {
    (Get-FileHash -LiteralPath (Join-Path $taskOutput $taskName)).Hash.ToLowerInvariant() + '  ' + $taskName
}
[IO.File]::WriteAllLines((Join-Path $taskOutput 'REGISTRATION-FIX-SHA256SUMS.txt'), $taskChecksums, $taskUtf8)
Write-Output ('Installer delivery: ' + $taskOutput)
