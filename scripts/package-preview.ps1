[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if ($env:OS -ne 'Windows_NT') { throw 'Windows x64 is required.' }
$taskVersion = (Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
$taskConfig = Get-Content -LiteralPath (Join-Path $taskRoot 'src-tauri\tauri.conf.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskVersion -notmatch '^\d+\.\d+\.\d+-alpha\.\d+$' -or $taskVersion -ne $taskConfig.version) { throw 'Expected matching alpha versions.' }
if ((& node -p 'process.versions.node.split(".")[0]') -ne '24' -or (& node -p 'process.arch') -ne 'x64') { throw 'Use Node.js 24 x64.' }
$taskOutput = Join-Path $taskRoot ('artifacts\' + $taskVersion)
[IO.Directory]::CreateDirectory($taskOutput) | Out-Null
Push-Location $taskRoot
try {
    & node scripts/collect-licenses.mjs
    if ($LASTEXITCODE -ne 0) { throw 'License collection failed.' }
    & npm.cmd run tauri -- build --ci --no-bundle --config src-tauri/tauri.preview.conf.json -- --locked --offline
    if ($LASTEXITCODE -ne 0) { throw 'Preview release build failed.' }
    $taskStaging = Join-Path $taskOutput 'portable\WorkMemo-Preview'
    [IO.Directory]::CreateDirectory((Join-Path $taskStaging 'extension')) | Out-Null
    & node scripts/stage-browser-resources.mjs --output $taskStaging --identifier com.workmemo.test.monitor
    if ($LASTEXITCODE -ne 0) { throw 'Browser component staging failed.' }
    $taskCopies = @(
        @{Source='src-tauri\target\release\workmemo.exe';Name='workmemo-preview.exe'},
        @{Source='docs\PREVIEW-GUIDE.md';Name='使用说明.md'},
        @{Source='docs\THIRD-PARTY-LICENSES.txt';Name='THIRD-PARTY-LICENSES.txt'}
    )
    foreach ($taskEntry in $taskCopies) {
        Copy-Item -LiteralPath (Join-Path $taskRoot $taskEntry.Source) -Destination (Join-Path $taskStaging $taskEntry.Name) -Force
    }
    $taskUtf8 = New-Object Text.UTF8Encoding($false)
    $taskCommit = & git rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Unable to identify source commit.' }
    [IO.File]::WriteAllText((Join-Path $taskStaging 'BUILD-INFO.json'), (@{version=$taskVersion;identifier='com.workmemo.test.monitor';source_commit=$taskCommit;configuration='release';prerelease=$true;runtime_acceptance='pending'} | ConvertTo-Json), $taskUtf8)
    $taskNames = @('workmemo-preview.exe','workmemo-browser.exe','Register-Browser.cmd','Register-Browser.ps1','workmemo-browser.profile.json','BUILD-INFO.json','使用说明.md','THIRD-PARTY-LICENSES.txt')
    foreach ($taskName in (Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $PSScriptRoot 'browser-resource-files.json') | ConvertFrom-Json)) { $taskNames += 'extension/' + $taskName }
    $taskZipName = 'WorkMemo_' + $taskVersion + '_windows_x64_preview.zip'
    $taskZipPath = Join-Path $taskOutput $taskZipName
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $taskStream = [IO.File]::Open($taskZipPath, [IO.FileMode]::Create)
    try {
        $taskZip = [IO.Compression.ZipArchive]::new($taskStream, [IO.Compression.ZipArchiveMode]::Create, $true)
        try {
            foreach ($taskName in $taskNames) {
                [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskZip, (Join-Path $taskStaging $taskName), ('WorkMemo-Preview/' + $taskName.Replace('\','/')), [IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } finally { $taskZip.Dispose() }
    } finally { $taskStream.Dispose() }
    Copy-Item -LiteralPath (Join-Path $taskRoot 'docs\PREVIEW-GUIDE.md') -Destination (Join-Path $taskOutput 'PREVIEW-GUIDE.md') -Force
    Copy-Item -LiteralPath (Join-Path $taskRoot 'docs\THIRD-PARTY-LICENSES.txt') -Destination (Join-Path $taskOutput 'THIRD-PARTY-LICENSES.txt') -Force
    $taskChecksums = foreach ($taskName in @($taskZipName,'PREVIEW-GUIDE.md','THIRD-PARTY-LICENSES.txt')) {
        (Get-FileHash -LiteralPath (Join-Path $taskOutput $taskName) -Algorithm SHA256).Hash.ToLowerInvariant() + '  ' + $taskName
    }
    [IO.File]::WriteAllLines((Join-Path $taskOutput 'SHA256SUMS.txt'), $taskChecksums, $taskUtf8)
    Write-Output ('Preview artifacts: ' + $taskOutput)
} finally { Pop-Location }
