/**
 * Turns the single-file build into a body fragment for publishing as an
 * Artifact, which supplies its own <!doctype>/<html>/<head>/<body> wrapper.
 * Keeps the <title>, the inlined <style> blocks and the inlined module script.
 *
 *   npm run build:single && node scripts/make-artifact.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(root, 'dist-single/index.html'), 'utf8');

const pick = (re) => [...src.matchAll(re)].map((m) => m[0]).join('\n');

const title = (src.match(/<title>[\s\S]*?<\/title>/) || [''])[0];
const styles = pick(/<style[^>]*>[\s\S]*?<\/style>/g);
const scripts = pick(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g);
const root_div = (src.match(/<div id="root"[^>]*>[\s\S]*?<\/div>/) || ['<div id="root"></div>'])[0];

if (!scripts.trim()) throw new Error('No inline script found — did build:single run?');

const out = [title, styles, root_div, scripts].filter(Boolean).join('\n');
mkdirSync(resolve(root, 'dist-artifact'), { recursive: true });
writeFileSync(resolve(root, 'dist-artifact/mpuglobal.html'), out);
console.log(`wrote dist-artifact/mpuglobal.html (${(out.length / 1024).toFixed(0)} kB)`);
