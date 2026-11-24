import { sections } from './projects.js';

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ratio = p => (p.vertical ? 9 / 16 : 16 / 9);
const filmHTML = p => `<span class="film" style="--r:${ratio(p)}"${p.vimeo ? ` data-vimeo="${esc(p.vimeo)}"` : ''}></span>`;

export function tileHTML(p) {
  const shape = p.vertical ? 'tall' : p.large ? 'large' : 'wide';
  const body = `<span class="frame" style="--r:${ratio(p)}">${filmHTML(p)}</span><h2>${esc(p.title)}</h2><p>${[p.client, p.year].filter(Boolean).map(esc).join(', ')}</p>`;
  return `<li class="${shape}">${/^https:\/\//.test(p.href) ? `<a href="${esc(p.href)}" target="_blank" rel="noopener">${body}</a>` : body}</li>`;
}

export const pageFor = (hash, list) => (list.some(s => `#${s.id}` === hash) ? hash.slice(1) : 'landing');

export function pageHTML(list, id) {
  const section = list.find(s => s.id === id);
  if (!section) {
    return `<div class="split" style="--n:${list.length}">${list.map(s =>
      `<a class="column" href="#${esc(s.id)}">${filmHTML(s.film ?? {})}<span class="word">${esc(s.name)}</span></a>`).join('')}</div>`;
  }
  return `<div class="work"><div class="bar"><h1 tabindex="-1">${esc(section.name)}</h1><a href="#">Back</a></div>${
    section.projects.length ? `<ul class="grid">${section.projects.map(tileHTML).join('')}</ul>`
      : `<p class="none">${esc(section.name)} projects are on the way.</p>`}</div>`;
}

// Films load near the screen and unload when they leave. Blue shows until one is really playing.
const VIMEO = 'https://player.vimeo.com';
function playFilms(root) {
  const films = root.querySelectorAll('.film[data-vimeo]');
  if (!films.length) return () => {};
  const observer = new IntersectionObserver(entries => entries.forEach(({ target: film, isIntersecting }) => {
    if (!isIntersecting) { film.innerHTML = ''; return; }
    if (film.firstChild) return;
    film.innerHTML = `<iframe src="${VIMEO}/video/${film.dataset.vimeo}?background=1&autoplay=1&loop=1&muted=1&playsinline=1" allow="autoplay" tabindex="-1" aria-hidden="true"></iframe>`;
    const frame = film.firstChild;
    const on = () => frame.classList.add('on');
    frame.addEventListener('load', () => {
      frame.contentWindow?.postMessage('{"method":"addEventListener","value":"playProgress"}', VIMEO);
      setTimeout(on, 4000);
    });
    frame.reveal = on;
  }), { rootMargin: '25% 0px' });
  films.forEach(f => observer.observe(f));
  const onMessage = e => {
    if (e.origin !== VIMEO || !String(e.data).includes('layProgress')) return;
    for (const frame of root.querySelectorAll('iframe')) if (frame.contentWindow === e.source) frame.reveal();
  };
  addEventListener('message', onMessage);
  return () => { observer.disconnect(); removeEventListener('message', onMessage); };
}

// Full width of the Squarespace section, and the landing page fills what is left below the menu.
export function fit(host) {
  const section = host.closest('section');
  if (!section) return;
  const apply = () => {
    host.style.marginLeft = '0px';
    const box = section.getBoundingClientRect();
    host.style.width = `${section.clientWidth}px`;
    host.style.marginLeft = `${box.left - host.getBoundingClientRect().left}px`;
    host.style.setProperty('--above', `${Math.round(host.getBoundingClientRect().y + scrollY)}px`);
  };
  apply();
  new ResizeObserver(() => setTimeout(apply)).observe(section);
}

async function loadSiteCSS() {
  const res = await fetch(new URL('./site.css', import.meta.url));
  if (!res.ok) throw new Error(`site.css ${res.status}`);
  return res.text();
}

// The plain text in the snippet stays visible unless everything needed is ready.
export async function mount(host, loadCSS = loadSiteCSS, list = sections) {
  let css, first;
  const current = () => pageFor(typeof location === 'undefined' ? '' : location.hash, list);
  try {
    css = await loadCSS();
    list.forEach(s => pageHTML(list, s.id));
    first = pageHTML(list, current());
  } catch { return false; }
  // Nothing inside can paint outside the container, even if page styles disagree.
  host.style.setProperty('contain', 'layout paint', 'important');
  const root = host.attachShadow({ mode: 'open' });
  const draw = html => { root.innerHTML = `<style>${css}</style>${html}`; return playFilms(root); };
  let stop = draw(first), shown = current();
  fit(host);
  if (typeof location !== 'undefined') addEventListener('hashchange', () => {
    if (current() === shown) return;
    stop();
    shown = current();
    stop = draw(pageHTML(list, shown));
    scrollTo(0, 0);
    root.querySelector('h1, a')?.focus({ preventScroll: true });
  });
  return true;
}

if (typeof document !== 'undefined') {
  const host = document.getElementById('s353-portfolio');
  if (host && !host.dataset.mounted) {
    host.dataset.mounted = '1';
    // Own family name, so the navigation's EB Garamond is never replaced.
    document.fonts.add(new FontFace('S353 Garamond', 'url(https://fonts.gstatic.com/s/ebgaramond/v33/SlGFmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7e8QL99U6i1hGFJRvw.woff2)', { style: 'italic', display: 'swap' }));
    mount(host);
  }
}
