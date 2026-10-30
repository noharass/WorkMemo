import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] ?? join(root, 'docs', 'THIRD-PARTY-LICENSES.txt'));
const metadata = spawnSync('cargo', ['metadata', '--locked', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc', '--manifest-path', join(root, 'src-tauri', 'Cargo.toml')], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
if (metadata.status !== 0) throw new Error(metadata.stderr || 'Unable to read Cargo metadata');
const sections = ['WorkMemo third-party dependency notices',
  'Collected from locally installed package archives. Cargo entries include build and cross-platform dependencies; not every listed package is linked into the Windows executable.', ''];
let count = 0;
const supplemental = {
  'tauri-plugin@2.7.2': ['tauri-plugin-MIT.txt', 'https://github.com/tauri-apps/tauri/blob/59b63ab500da9859f12d8888c3298bc29bba0b92/LICENSE-MIT'],
  '@ant-design/icons-svg@4.6.0': ['ant-design-icons-MIT.txt', 'https://github.com/ant-design/ant-design-icons/blob/7f2516ac91226d2b41f93b35cb5197c8d94f7189/LICENSE'],
  'is-mobile@5.0.0': ['is-mobile-MIT.txt', 'https://github.com/juliangruber/is-mobile/blob/2708dd8f07d91f354a46b8dff3053abb6b840067/Readme.md'],
  'alloc-stdlib@0.3.0': ['alloc-stdlib-BSD-3-Clause.txt', 'https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE'],
  'selectors@0.38.0': ['MPL-2.0.txt', 'https://www.mozilla.org/en-US/MPL/2.0/'],
  'webview2-com@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-sys@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-macros@0.8.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
};
function collect(label, directory, license, repository, supplement, source) {
  sections.push(`=== ${label} ===`, `Declared license: ${license || 'not specified'}`, `Repository: ${typeof repository === 'string' ? repository : repository?.url || 'see package manifest'}`);
  if (source) sections.push(`Package source archive (unmodified): ${source}`);
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(^|[-_.])(licen[cs]e|copying|notice)([-_.]|$)/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!files.length) {
    if (!supplement) throw new Error(`Missing license text for ${label}; review the package before distribution.`);
    sections.push(`Supplemental license source: ${supplement[1]}`, readFileSync(join(root, 'scripts', 'third-party-licenses', supplement[0]), 'utf8'));
  }
  for (const file of files) sections.push(`--- ${file.name} ---`, readFileSync(join(directory, file.name), 'utf8'));
  sections.push('');
  count += 1;
}
const graph = JSON.parse(metadata.stdout);
const resolved = new Set(graph.resolve.nodes.map((node) => node.id));
for (const pkg of graph.packages.filter((pkg) => pkg.source && resolved.has(pkg.id)).sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`))) {
  collect(`Cargo ${pkg.name} ${pkg.version}`, dirname(pkg.manifest_path), pkg.license, pkg.repository, supplemental[`${pkg.name}@${pkg.version}`], `https://crates.io/api/v1/crates/${pkg.name}/${pkg.version}/download`);
}
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
for (const [path, entry] of Object.entries(lock.packages).filter(([path, entry]) => path && (!entry.dev || path === "node_modules/tailwindcss")).sort()) {
  const directory = join(root, path);
  const pkg = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  collect(`npm ${pkg.name} ${entry.version}`, directory, pkg.license, pkg.repository, supplemental[`${pkg.name}@${entry.version}`]);
}
const audioManifest=JSON.parse(readFileSync(join(root,'src-tauri','sounds','manifest.json'),'utf8'));
sections.push('=== Audio: Kenney Interface Sounds 1.0 ===','Declared license: CC0-1.0',`Source: ${audioManifest.source}`,`Processing: ${audioManifest.processing}`, ...audioManifest.sounds.map(item=>`${item.theme}/${item.cue}: ${item.source} -> ${item.file}`),readFileSync(join(root,'src-tauri','sounds','source','LICENSE.txt'),'utf8'),'');
mkdirSync(dirname(destination), { recursive: true });
const output = `${sections.join('\n')}\n`;
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== output) writeFileSync(destination, output, 'utf8');
console.log(`Collected dependency notices for ${count} package versions.`);
