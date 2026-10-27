import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
await build({
  configFile: false,
  root,
  plugins: [tailwindcss()],
  build: {
    target: 'chrome120',
    outDir: resolve(root, 'src-tauri/target/extension-popup'),
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(root, 'browser-extension/popup.js'),
      output: { entryFileNames: 'popup.js', assetFileNames: 'popup.[ext]' },
    },
  },
});
