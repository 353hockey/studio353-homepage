import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { violations } from './guard.mjs';
import { tileHTML, pageHTML, pageFor, mount } from '../preview/site.js';
import { sections } from '../preview/projects.js';

const at = p => fileURLToPath(new URL(p, import.meta.url));
const read = p => readFileSync(at(p), 'utf8');
const readFolder = dir => Object.fromEntries(readdirSync(dir).map(f => [f, readFileSync(`${dir}/${f}`, 'utf8')]));
const project = over => ({ title: 'A', client: '', year: 2026, still: '1-a', vertical: false, href: 'https://x.y/', ...over });
const SEAL = ':host{contain: layout paint}';

test('guard rejects navigation-affecting code', () => {
  for (const css of ['a{position:fixed}', 'a{z-index:99}', 'a{color:red!important}', 'a{margin-top:-1px}',
                     'a{top:-5px}', 'a{position: sticky}', 'a{transform:translateY(-90px)}', 'a{margin:-4px 0}', 'a{inset:-2px}'])
    assert.equal(violations({ 'site.css': SEAL + css }).length, 1, css);
  for (const js of ['document.body.append(x)', 'document.head.append(x)', 'document.querySelector("header")',
                    'document.documentElement.style.x=1', 'location.href="/"', 'document.createElement("style")',
                    'host.getRootNode()', 'window.open("/")', 'const d = document;', 'host.ownerDocument.body', 'globalThis.x=1',
                    'location.hash = "x"', 'location.hash="x"', 'location.hash += "x"', 'document.fonts.clear()'])
    assert.ok(violations({ 'site.js': js }).length >= 1, js);
});
test('guard allows a small lift inside the container, but never moves the container', () => {
  assert.deepEqual(violations({ 'site.css': SEAL + 'a{transform:translateY(-12px) scale(1.02)}' }), []);
  for (const css of ['a{transform:translateY(-17px)}', 'a{transform:translateY(-12vh)}', 'a{transform:translateX(-12px)}', 'a{transform:translate(0,-12px)}',
                     ':host{transform:translateY(-12px)}', ':host(:hover){transform:translateY(-12px)}', ':host{translate:0 4px}'])
    assert.ok(violations({ 'site.css': SEAL + css }).length >= 1, css);
});
test('guard allows reading the address hash and adding our own font', () =>
  assert.deepEqual(violations({ 'site.js': "if (location.hash === '#a') document.fonts.add(f);" }), []));
test('guard catches the bypasses found in review', () => {
  for (const css of [SEAL + ' :host{contain:none}', SEAL + ' a{position:/**/fixed}',
                     SEAL + ' a{translate:0 -200px}', '/* ' + SEAL + ' */ a{color:red}'])
    assert.ok(violations({ 'site.css': css }).length >= 1, css);
  for (const js of ["host.style.cssText='position:fixed'", "const s=host.closest('section');s.style.x=1", 'section.hidden=true',
                    'host.offsetParent.remove()', "import('https://x.y/z.js')", "import x from 'https://x.y/z.js'", 'host.closest("body")',
                    'd.showModal()', 'd.requestFullscreen()', 'd.showPopover()', 'const h = `<style>b{position:fixed}</style>`'])
    assert.ok(violations({ 'site.js': js }).length >= 1, js);
  assert.ok(violations({ 'x.mjs': '' }).length >= 1);
});
test('preview passes the guard', () => assert.deepEqual(violations(readFolder(at('../preview'))), []));
test('live passes the guard', () => assert.deepEqual(violations(readFolder(at('../live'))), []));
test('guard rejects a stylesheet that is not sealed', () =>
  assert.equal(violations({ 'site.css': 'p{color:red}' }).filter(v => v.includes('sealed')).length, 1));
test('mount seals the container with priority over page styles', async () => {
  const set = [];
  const host = { attachShadow: () => ({ querySelectorAll: () => [] }), closest: () => null, style: { setProperty: (...a) => set.push(a) } };
  assert.equal(await mount(host, async () => '', []), true);
  assert.deepEqual(set[0], ['contain', 'layout paint', 'important']);
});

test('tileHTML escapes text and omits empty parts', () => {
  const html = tileHTML(project({ title: 'A & "B" <c>', href: '' }));
  assert.match(html, /A &amp; &quot;B&quot; &lt;c&gt;/);
  assert.doesNotMatch(html, /<a\b/);
  assert.match(html, /<p>2026<\/p>/);
});
test('tileHTML opens https links in a new tab and refuses others', () => {
  assert.match(tileHTML(project()), /<a class="card" href="https:\/\/x\.y\/" target="_blank" rel="noopener">/);
  assert.doesNotMatch(tileHTML(project({ href: 'javascript:alert(1)' })), /<a\b/);
});
test('tileHTML keeps each film in its own shape', () => {
  assert.match(tileHTML(project({ vertical: true })), /class="tall"[\s\S]*--r:0\.5625/);
  assert.match(tileHTML(project({ large: true })), /class="large"[\s\S]*--r:1\.7777/);
  assert.match(tileHTML(project()), /class="wide"[\s\S]*--r:1\.7777/);
});
test('the hover area is the list item and the moving card is inside it, linked or not', () => {
  assert.match(tileHTML(project()), /^<li class="wide"><a class="card" /);
  assert.match(tileHTML(project({ href: '' })), /^<li class="wide"><div class="card">/);
});
test('the hover effect is for real pointers only', () => {
  const css = read('../preview/site.css');
  const outside = css.replace(/@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}/, '')
    .replace(/@media \(prefers-reduced-motion: no-preference\) and \(hover: hover\) and \(pointer: fine\).*/, '');
  assert.notEqual(outside, css);
  assert.doesNotMatch(outside, /translateY|li:hover/);
});
test('landing has one column per section, so a third can be added', () => {
  const three = ['Sports', 'Music', 'Film'].map(name => ({ id: name.toLowerCase(), name, film: null, projects: [] }));
  const html = pageHTML(three, 'landing');
  assert.deepEqual([...html.matchAll(/href="#(\w+)"/g)].map(m => m[1]), ['sports', 'music', 'film']);
  assert.match(html, /--n:3/);
});
test('a section page shows only its own projects and a way back', () => {
  const list = [{ id: 'sports', name: 'Sports', film: null, projects: [project({ title: 'Goal' })] },
                { id: 'music', name: 'Music', film: null, projects: [project({ title: 'Song' })] }];
  const html = pageHTML(list, 'sports');
  assert.match(html, /Goal/); assert.doesNotMatch(html, /Song/); assert.match(html, /href="#"/);
});
test('an empty section says so instead of showing a blank page', () =>
  assert.match(pageHTML([{ id: 'music', name: 'Music', film: null, projects: [] }], 'music'), /Music projects are on the way\./));
test('pageFor falls back to the landing page for unknown addresses', () => {
  const list = [{ id: 'sports' }];
  assert.equal(pageFor('#sports', list), 'sports');
  for (const h of ['', '#', '#nope', '#constructor']) assert.equal(pageFor(h, list), 'landing');
});
test('landing is video only', () => assert.doesNotMatch(pageHTML(sections, 'landing'), /<img|poster=/));
test('work pages are images only, loaded as needed at the right size', () => {
  const html = pageHTML(sections, 'sports');
  assert.doesNotMatch(html, /data-vimeo|<iframe/);
  const imgs = html.match(/<img\b[^>]*>/g);
  assert.equal(imgs.length, 11);
  for (const img of imgs) for (const part of ['loading="lazy"', 'decoding="async"', 'alt=""', 'srcset="', 'sizes="', 'https://i.vimeocdn.com/video/'])
    assert.ok(img.includes(part), part);
});
test('a project without an image shows a blue frame, not a broken image', () =>
  assert.doesNotMatch(tileHTML(project({ still: '' })), /<img/));
test('sports has the 11 current projects, each with an image and a link', () => {
  const sports = sections.find(s => s.id === 'sports').projects;
  assert.equal(sports.length, 11);
  for (const p of sports) { assert.match(p.still, /^\d+-[0-9a-f]{64}$/); assert.match(p.href, /^https:\/\//); }
  assert.equal(new Set(sports.map(p => p.still)).size, 11);
});
for (const [why, css, list] of [['the stylesheet fails', async () => { throw new Error('offline'); }, undefined],
                                ['building the page fails', async () => '', [{ id: 'x' }, null]]])
  test(`mount leaves the plain text alone when ${why}`, async () => {
    let attached = false;
    assert.equal(await mount({ attachShadow() { attached = true; } }, css, list), false);
    assert.equal(attached, false);
  });
test('snippets are identical apart from the copy, and carry no page-wide code', () => {
  const [p, l] = ['preview', 'live'].map(n => read(`../snippets/${n}.html`));
  assert.equal(p.replace('/preview/site.js', '/live/site.js'), l);
  assert.match(p, /src="https:\/\/353hockey\.github\.io\/studio353-homepage\/preview\/site\.js"/);
  assert.doesNotMatch(p, /<style|<link|<iframe/);
  assert.equal(p.match(/<script/g).length, 1);
});
test('a film is never revealed on a timer, only when it plays', () =>
  assert.doesNotMatch(read('../preview/site.js'), /setTimeout\(on/));
test('hovering lifts one project and never changes the others', () => {
  const css = read('../preview/site.css');
  assert.doesNotMatch(css, /grayscale|:has\(|\.lit/);
  for (const rule of css.match(/[^{}]+\{[^{}]*\}/g)) if (/:focus/.test(rule)) assert.doesNotMatch(rule, /transform|--lift/);
  assert.doesNotMatch(read('../preview/site.js'), /pointermove|lightUp/);
});
