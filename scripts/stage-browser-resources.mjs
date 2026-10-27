import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const extensionFiles = JSON.parse(readFileSync(new URL('./browser-resource-files.json', import.meta.url), 'utf8'));
export function stage({ root, binary, output, identifier, version }) {
  if (!/^com\.workmemo\.(desktop|test\.[a-z0-9_.-]+)$/.test(identifier)) throw new Error('Unsupported profile');
  mkdirSync(join(output, 'extension'), { recursive: true });
  if (resolve(binary) !== resolve(output, 'workmemo-browser.exe')) cpSync(binary, join(output, 'workmemo-browser.exe'));
  writeFileSync(join(output, 'workmemo-browser.profile.json'), JSON.stringify({ identifier }));
  const probe = spawnSync(join(output, 'workmemo-browser.exe'), ['--bridge-info'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (probe.error || probe.status !== 0) throw new Error(`Cannot inspect bridge: ${probe.stderr || probe.error}`);
  const info = JSON.parse(probe.stdout);
  if (info.version !== version || info.identifier !== identifier || info.protocol !== 1) throw new Error('Bridge version/profile mismatch');
  for (const name of extensionFiles) cpSync(join(root, 'browser-extension', name), join(output, 'extension', name));
  const host = identifier === 'com.workmemo.desktop' ? 'com.workmemo.browser_bridge' : 'com.workmemo.browser_bridge_test';
  writeFileSync(join(output, 'extension', 'bridge-config.js'), `export const HOST_NAME = ${JSON.stringify(host)};\n`);
  for (const [source, target] of [['register-preview-browser.cmd', 'Register-Browser.cmd'], ['register-preview-browser.ps1', 'Register-Browser.ps1']]) cpSync(join(root, 'scripts', source), join(output, target));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const base = JSON.parse(readFileSync(join(root, 'src-tauri', 'tauri.conf.json'), 'utf8'));
  const overlay = JSON.parse(process.env.TAURI_CONFIG || '{}');
  const argument = name => { const at = process.argv.indexOf(name); return at < 0 ? undefined : process.argv[at + 1]; };
  const debug = process.argv.includes('--debug');
  const directory = join(root, 'src-tauri', 'target', debug ? 'debug' : 'release');
  stage({ root, binary: argument('--binary') || join(directory, 'workmemo-browser.exe'), output: argument('--output') || (debug ? directory : join(root, 'src-tauri', 'target', 'browser-resources')), identifier: argument('--identifier') || overlay.identifier || base.identifier, version: base.version });
  console.log('Browser resources staged and version/profile checked.');
}
