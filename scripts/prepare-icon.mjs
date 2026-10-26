import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'src/assets/workmemo-icon.png'));
const size = source.readUInt32BE(16);
if (!source.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  || size !== source.readUInt32BE(20)) throw new Error('The icon master must be a square PNG.');
const temporary = join(root, 'src-tauri/target/icon-preparation');
const output = join(temporary, 'generated');
mkdirSync(temporary, { recursive: true });
const inset = Math.round(size * 0.04);
const side = size - inset * 2;
const radius = Math.round(size * 0.185);
// Keep the selected C pixels intact. The black tile provides contrast on light desktops.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><clipPath id="tile"><rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${radius}"/></clipPath></defs><rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${radius}" fill="#000"/><image width="${size}" height="${size}" clip-path="url(#tile)" href="data:image/png;base64,${source.toString('base64')}"/></svg>`;
const canvas = join(temporary, 'icon.svg');
writeFileSync(canvas, svg, 'utf8');
const result = spawnSync(process.execPath, [join(root, 'node_modules/@tauri-apps/cli/tauri.js'), 'icon', canvas, '--output', output], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) throw new Error('Native icon conversion failed.');
const names = ['128x128.png', '128x128@2x.png', '32x32.png', 'icon.icns', 'icon.ico', 'icon.png',
  'Square107x107Logo.png', 'Square142x142Logo.png', 'Square150x150Logo.png', 'Square284x284Logo.png',
  'Square30x30Logo.png', 'Square310x310Logo.png', 'Square44x44Logo.png', 'Square71x71Logo.png', 'Square89x89Logo.png', 'StoreLogo.png'];
for (const name of names) copyFileSync(join(output, name), join(root, 'src-tauri/icons', name));
copyFileSync(join(output, '128x128@2x.png'), join(root, 'public/workmemo.png'));
console.log('Native icons and the header/favicon asset now use the selected original C.');
