import { projects } from './projects.js';

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function rowHTML(p) {
  const meta = [p.client, ...p.roles, p.year].filter(Boolean).map(esc).join(' · ');
  const title = /^https:\/\//.test(p.href)
    ? `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title);
  return `<li>${title}<p>${meta}</p></li>`;
}

// Full width of the Squarespace section, whatever grid column the block sits in.
export function fit(host) {
  const section = host.closest('section');
  if (!section) return;
  const apply = () => {
    host.style.marginLeft = '0px';
    const box = section.getBoundingClientRect();
    host.style.width = `${section.clientWidth}px`;
    host.style.marginLeft = `${box.left - host.getBoundingClientRect().left}px`;
  };
  apply();
  new ResizeObserver(() => setTimeout(apply)).observe(section);
}

async function loadSiteCSS() {
  const res = await fetch(new URL('./site.css', import.meta.url));
  if (!res.ok) throw new Error(`site.css ${res.status}`);
  return res.text();
}

function pageHTML(css, list) {
  const film = list.find(p => p.vimeo);
  return `<style>${css}</style><main>
    <h1>Placeholder: preview copy 2</h1>
    ${film ? `<iframe title="${esc(film.title)}" allow="autoplay"
      src="https://player.vimeo.com/video/${esc(film.vimeo)}?background=1&autoplay=1&loop=1&muted=1&playsinline=1"></iframe>` : ''}
    <ul>${list.map(rowHTML).join('')}</ul></main>`;
}

// The plain text in the snippet stays visible unless everything needed is ready.
export async function mount(host, loadCSS = loadSiteCSS, list = projects) {
  let html;
  try { html = pageHTML(await loadCSS(), list); } catch { return false; }
  // Nothing inside can paint outside the container, even if page styles disagree.
  host.style.setProperty('contain', 'layout paint', 'important');
  host.attachShadow({ mode: 'open' }).innerHTML = html;
  fit(host);
  return true;
}

if (typeof document !== 'undefined') {
  const host = document.getElementById('s353-portfolio');
  if (host && !host.dataset.mounted) { host.dataset.mounted = '1'; mount(host); }
}
