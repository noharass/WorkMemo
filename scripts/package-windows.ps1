[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if ($env:OS -ne 'Windows_NT') { throw 'This packaging script requires Windows x64.' }
foreach ($tool in @('node', 'npm.cmd', 'cargo')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Missing build tool: $tool. See docs/BUILDING.md." }
}
$nodeMajor = & node -p "process.versions.node.split('.')[0]"
$nodeArch = & node -p 'process.arch'
if ($nodeMajor -ne '24' -or $nodeArch -ne 'x64') { throw 'Use Node.js 24 x64 for this Windows x64 package.' }
$configuration = Get-Content -LiteralPath (Join-Path $taskRoot 'src-tauri/tauri.conf.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$package = Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = [string]$configuration.version
if ($version -notmatch '^\d+\.\d+\.\d+$' -or $version -ne $package.version) { throw 'Invalid or mismatched release version.' }
# Only the executable being overwritten must be stopped. Installed/ZIP copies
# may keep running: packaging reads source resources, never their work database.
$releaseExecutable = [IO.Path]::GetFullPath((Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'))
$running = Get-Process -Name workmemo -ErrorAction SilentlyContinue | Where-Object {
    -not $_.Path -or [IO.Path]::GetFullPath($_.Path) -eq $releaseExecutable
}
if ($running) { throw 'The build output is running or cannot be identified. Close that copy before packaging.' }

Push-Location $taskRoot
try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
    & node 'scripts/collect-licenses.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'Dependency notice collection failed.' }
    & node 'node_modules/@tauri-apps/cli/tauri.js' build --ci --no-binary-patching
    if ($LASTEXITCODE -ne 0) { throw 'Tauri build failed.' }
    $binary = Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'
    $setupName = "WorkMemo_${version}_x64-setup.exe"
    $setup = Join-Path $taskRoot "src-tauri/target/release/bundle/nsis/$setupName"
    if (-not (Test-Path -LiteralPath $setup -PathType Leaf)) { throw "Installer not found: $setup" }
    $output = Join-Path $taskRoot "artifacts/$version"
    [System.IO.Directory]::CreateDirectory($output) | Out-Null
    $notices = Join-Path $output 'THIRD-PARTY-LICENSES.txt'
    Copy-Item -LiteralPath (Join-Path $taskRoot 'docs/THIRD-PARTY-LICENSES.txt') -Destination $notices -Force
    Copy-Item -LiteralPath $setup -Destination (Join-Path $output $setupName) -Force

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipName = "WorkMemo_${version}_windows_x64.zip"
    $zipPath = Join-Path $output $zipName
    $stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
        try {
            foreach ($entry in @(
                @{ Source = $binary; Name = 'WorkMemo/workmemo.exe' },
                @{ Source = (Join-Path $taskRoot 'docs/USER-GUIDE.md'); Name = 'WorkMemo/使用说明.md' },
                @{ Source = $notices; Name = 'WorkMemo/THIRD-PARTY-LICENSES.txt' }
            )) {
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $entry.Source, $entry.Name, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
            $browserResources = Join-Path $taskRoot 'src-tauri/target/browser-resources'
            foreach ($resource in (Get-ChildItem -LiteralPath $browserResources -Recurse -File)) {
                $relative = $resource.FullName.Substring($browserResources.Length + 1).Replace('\','/')
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $resource.FullName, ('WorkMemo/' + $relative), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } finally { $archive.Dispose() }
    } finally { $stream.Dispose() }
    $checksums = foreach ($name in @($setupName, $zipName, 'THIRD-PARTY-LICENSES.txt')) {
        $hash = (Get-FileHash -LiteralPath (Join-Path $output $name) -Algorithm SHA256).Hash.ToLowerInvariant()
        "$hash  $name"
    }
    [System.IO.File]::WriteAllLines((Join-Path $output 'SHA256SUMS.txt'), $checksums, [System.Text.UTF8Encoding]::new($false))
    Write-Output "Delivery files: $output"
} finally { Pop-Location }
