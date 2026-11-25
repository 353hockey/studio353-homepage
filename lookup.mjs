// node lookup.mjs <Vimeo or YouTube link>: prints what preview/projects.js needs for it.
import { fileURLToPath } from 'node:url';

export const youtubeId = url => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/)?.[1];

export function fromVimeo(v) {
  const still = v.thumbnail_url?.match(/\/video\/(\d+-[0-9a-f]{64})-d/)?.[1];
  if (!still) throw new Error(`Unexpected Vimeo image: ${v.thumbnail_url}`);
  return { title: v.title, year: Number(v.upload_date.slice(0, 4)), still, ...(v.height > v.width && { vertical: true }) };
}

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No public video there (${r.status}). It may be private, or its link incomplete.`);
  return r.json();
}

export async function lookup(url) {
  const id = youtubeId(url);
  if (!id) return fromVimeo(await get(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`));
  const { title } = await get(`https://www.youtube.com/oembed?format=json&url=https://youtu.be/${id}`);
  for (const size of ['maxresdefault', 'hq720', 'hqdefault']) {
    const still = `https://i.ytimg.com/vi/${id}/${size}.jpg`;
    if ((await fetch(still)).ok) return { title, still, ...(/\/shorts\//.test(url) && { vertical: true }), href: `https://youtu.be/${id}` };
  }
  throw new Error('That YouTube video has no image.');
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  lookup(process.argv[2] ?? '').then(p => console.log(p), e => { console.error(e.message); process.exitCode = 1; });
