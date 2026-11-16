[CmdletBinding()]
param([string]$Directory,[string]$PreserveDirectory)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$version=(Get-Content (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if([string]::IsNullOrWhiteSpace($Directory)) { $Directory="artifacts/$version" }
$candidate=[IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($Directory)) { $Directory } else { Join-Path $taskRoot $Directory }))
$setupName="WorkMemo_${version}_x64-setup.exe"
$zipName="WorkMemo_${version}_windows_x64.zip"
$expected=@($setupName,$zipName,'THIRD-PARTY-LICENSES.txt')
function Verify-Checksums([string]$folder,[string[]]$allowed) {
    $seen=@()
    foreach($line in Get-Content -LiteralPath (Join-Path $folder 'SHA256SUMS.txt')) {
        if($line -notmatch '^([a-f0-9]{64})  ([^/\\]+)$') { throw 'Invalid checksum format' }
        $expectedHash=$Matches[1];$name=$Matches[2]
        if($name -notin $allowed -or $name -in $seen) { throw 'Unexpected or duplicate checksum entry' }
        $seen+=$name
        if((Get-FileHash -LiteralPath (Join-Path $folder $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) { throw "Checksum mismatch: $name" }
    }
    if($seen.Count -ne $allowed.Count) { throw 'Incomplete checksum manifest' }
}
Verify-Checksums $candidate $expected
$release=Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'
$info=[Diagnostics.FileVersionInfo]::GetVersionInfo($release)
if($info.ProductVersion -ne $version -or $info.FileVersion -notmatch ('^'+[regex]::Escape($version)+'(?:\.0)?$')) { throw 'Executable version mismatch' }
$reader=[IO.BinaryReader]::new([IO.File]::OpenRead($release))
try {
    if($reader.ReadUInt16() -ne 0x5a4d) { throw 'Invalid DOS signature' }
    $reader.BaseStream.Position=0x3c;$pe=$reader.ReadUInt32();$reader.BaseStream.Position=$pe
    if($reader.ReadUInt32() -ne 0x4550 -or $reader.ReadUInt16() -ne 0x8664) { throw 'Expected Windows x64 executable' }
} finally { $reader.Dispose() }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead((Join-Path $candidate $zipName))
try {
    $entries=@('WorkMemo/workmemo.exe','WorkMemo/使用说明.md','WorkMemo/THIRD-PARTY-LICENSES.txt','WorkMemo/workmemo-browser.exe','WorkMemo/Register-Browser.cmd','WorkMemo/Register-Browser.ps1','WorkMemo/workmemo-browser.profile.json')
    foreach($resource in (Get-Content (Join-Path $PSScriptRoot 'browser-resource-files.json') -Raw -Encoding UTF8 | ConvertFrom-Json)) { $entries+='WorkMemo/extension/'+$resource }
    if(Compare-Object ($entries|Sort-Object) (@($archive.Entries.FullName)|Sort-Object)) { throw 'Unexpected ZIP entries' }
    $stream=$archive.GetEntry('WorkMemo/workmemo.exe').Open();$sha=[Security.Cryptography.SHA256]::Create()
    try { $zipHash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
    if($zipHash -ne (Get-FileHash $release -Algorithm SHA256).Hash.ToLowerInvariant()) { throw 'ZIP executable differs from build output' }
    foreach($entry in $archive.Entries | Where-Object { $_.FullName -eq 'WorkMemo/workmemo-browser.profile.json' -or $_.FullName -eq 'WorkMemo/extension/manifest.json' }) {
        $text=[IO.StreamReader]::new($entry.Open())
        try { $data=$text.ReadToEnd()|ConvertFrom-Json } finally { $text.Dispose() }
        if($entry.FullName.EndsWith('profile.json')) { if($data.identifier -ne 'com.workmemo.desktop') { throw 'Browser profile mismatch' } }
        elseif($data.version_name -ne $version) { throw 'Extension version mismatch' }
    }
    foreach($entry in $archive.Entries) {
        $relative=$entry.FullName.Substring('WorkMemo/'.Length)
        $source=switch($relative) {
            'workmemo.exe' { $release }
            '使用说明.md' { Join-Path $taskRoot 'docs/USER-GUIDE.md' }
            'THIRD-PARTY-LICENSES.txt' { Join-Path $candidate 'THIRD-PARTY-LICENSES.txt' }
            default { Join-Path (Join-Path $taskRoot 'src-tauri/target/browser-resources') $relative }
        }
        $stream=$entry.Open();$sha=[Security.Cryptography.SHA256]::Create()
        try { $hash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
        if($hash -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "ZIP payload differs from source: $relative" }
    }
    $zipCount=$archive.Entries.Count
} finally { $archive.Dispose() }
$originalPreserved=$null
$oldVersion=$null
if(-not [string]::IsNullOrWhiteSpace($PreserveDirectory)) {
    $original=[IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($PreserveDirectory)) { $PreserveDirectory } else { Join-Path $taskRoot $PreserveDirectory }))
    $oldVersion=Split-Path $original -Leaf
    if($oldVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Preserved release directory must end with its version' }
    Verify-Checksums $original @("WorkMemo_${oldVersion}_x64-setup.exe","WorkMemo_${oldVersion}_windows_x64.zip",'THIRD-PARTY-LICENSES.txt')
    $checkpoint=Join-Path $taskRoot 'artifacts/phase-d-published-local-before.json'
    if($oldVersion -eq '0.2.10' -and (Test-Path $checkpoint)) {
        $before=Get-Content $checkpoint -Raw -Encoding UTF8|ConvertFrom-Json
        if((Get-FileHash (Join-Path $original 'SHA256SUMS.txt') -Algorithm SHA256).Hash -ne $before.Hash) { throw 'Original checksum file changed' }
    }
    $originalPreserved=$true
}
$files=foreach($name in @($setupName,$zipName,'THIRD-PARTY-LICENSES.txt','SHA256SUMS.txt')) {
    $file=Get-Item -LiteralPath (Join-Path $candidate $name)
    @{name=$name;bytes=$file.Length;sha256=(Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$receipt=@{version=$version;zip_entries=$zipCount;architecture='x64';checksums_verified=$true;original_local_release_preserved=$originalPreserved;preserved_version=$oldVersion;files=@($files);published=$false}
$receipt|ConvertTo-Json -Depth 5|Set-Content (Join-Path $taskRoot ('artifacts/'+$version+'/package-verification.json')) -Encoding utf8
$receipt|ConvertTo-Json -Depth 5
