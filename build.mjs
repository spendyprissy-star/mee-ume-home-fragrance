import esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/advert.bundle.js',
});

console.log('Built dist/advert.bundle.js');
