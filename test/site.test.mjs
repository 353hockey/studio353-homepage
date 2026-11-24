import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { violations } from './guard.mjs';
import { rowHTML, mount } from '../preview/site.js';

const at = p => fileURLToPath(new URL(p, import.meta.url));
const readFolder = dir => Object.fromEntries(
  readdirSync(dir).map(f => [f, readFileSync(`${dir}/${f}`, 'utf8')]));

test('guard rejects navigation-affecting code', () => {
  for (const css of ['a{position:fixed}', 'a{z-index:99}', 'a{color:red!important}', 'a{margin-top:-1px}',
                     'a{top:-5px}', 'a{position: sticky}', 'a{transform:translateY(-9px)}', 'a{margin:-4px 0}', 'a{inset:-2px}'])
    assert.equal(violations({ 'site.css': ':host{contain: layout paint}' + css }).length, 1, css);
  for (const js of ['document.body.append(x)', 'document.head.append(x)', 'document.querySelector("header")',
                    'document.documentElement.style.x=1', 'location.href="/"', 'document.createElement("style")',
                    'host.getRootNode()', 'window.open("/")', 'const d = document;', 'host.ownerDocument.body', 'globalThis.x=1'])
    assert.ok(violations({ 'site.js': js }).length >= 1, js);
});
test('guard passes the real preview files', () =>
  assert.deepEqual(violations(readFolder(at('../preview'))), []));
test('rowHTML escapes and omits empty parts', () => {
  const html = rowHTML({ title: 'A & "B" <c>', client: '', roles: ['Editor'], year: 2026, vimeo: '1196707346', vertical: true, href: '' });
  assert.match(html, /A &amp; &quot;B&quot; &lt;c&gt;/);
  assert.doesNotMatch(html, /<a\b/);
  assert.match(html, /Editor · 2026/);
  assert.doesNotMatch(html, /> ·|· </);
});
test('mount leaves the plain text alone when CSS fails', async () => {
  let attached = false;
  const host = { attachShadow() { attached = true; } };
  assert.equal(await mount(host, async () => { throw new Error('offline'); }), false);
  assert.equal(attached, false);
});
test('stylesheet seals the container so nothing can paint over the navigation', () =>
  assert.match(readFileSync(at('../preview/site.css'), 'utf8'), /:host\s*\{[^}]*contain:\s*layout paint/));
test('guard rejects a stylesheet that is not sealed', () =>
  assert.equal(violations({ 'site.css': 'p{color:red}' }).filter(v => v.includes('sealed')).length, 1));
test('snippets are identical apart from the copy, and carry no page-wide code', () => {
  const [p, l] = ['preview', 'live'].map(n => readFileSync(at(`../snippets/${n}.html`), 'utf8'));
  assert.equal(p.replace('/preview/site.js', '/live/site.js'), l);
  assert.match(p, /src="https:\/\/353hockey\.github\.io\/studio353-homepage\/preview\/site\.js"/);
  assert.doesNotMatch(p, /<style|<link|<iframe/);
  assert.equal(p.match(/<script/g).length, 1);
});
test('mount leaves the plain text alone when building the page fails', async () => {
  let attached = false;
  const host = { attachShadow() { attached = true; } };
  assert.equal(await mount(host, async () => '', [{ title: 'broken project with no roles' }]), false);
  assert.equal(attached, false);
});
test('mount works when no project has a video', async () => {
  const root = {}; 
  const host = { attachShadow: () => root, closest: () => null, style: { setProperty() {} } };
  assert.equal(await mount(host, async () => '', [{ title: 'A', client: '', roles: [], year: 2026, vimeo: '', href: '' }]), true);
  assert.doesNotMatch(root.innerHTML, /<iframe/);
});
test('guard catches the bypasses found in review', () => {
  for (const css of [':host{contain: layout paint} :host{contain:none}', ':host{contain: layout paint} a{position:/**/fixed}',
                     ':host{contain: layout paint} a{translate:0 -200px}', '/* :host{contain: layout paint} */ a{color:red}'])
    assert.ok(violations({ 'site.css': css }).length >= 1, css);
  for (const js of ["host.style.cssText='position:fixed'", "const s=host.closest('section');s.style.x=1", 'section.hidden=true',
                    'host.offsetParent.remove()', "import('https://x.y/z.js')", "import x from 'https://x.y/z.js'", 'host.closest("body")', 'd.showModal()', 'd.requestFullscreen()', 'd.showPopover()', 'const h = `<style>b{position:fixed}</style>`'])
    assert.ok(violations({ 'site.js': js }).length >= 1, js);
  assert.ok(violations({ 'x.mjs': '' }).length >= 1);
});
test('live passes the guard too', () => assert.deepEqual(violations(readFolder(at('../live'))), []));
test('mount seals the container with priority over page styles', async () => {
  const set = []; const host = { attachShadow: () => ({}), closest: () => null, style: { setProperty: (...a) => set.push(a) } };
  await mount(host, async () => '', []);
  assert.deepEqual(set, [['contain', 'layout paint', 'important']]);
});
test('rowHTML links only to https', () =>
  assert.doesNotMatch(rowHTML({ title: 'A', client: '', roles: [], year: 2026, vimeo: '', href: 'javascript:alert(1)' }), /<a\b/));
