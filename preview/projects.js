// The whole site's content. One section per column on the landing page; add a third to add Film.
// film: the clip behind the word on the landing page.
// vertical: true for 9:16 films. large: true for the two big films in the first row.
const vertical = true, large = true;

export const sections = [
  {
    id: 'sports', name: 'Sports', film: { vimeo: '1196707346', vertical },
    projects: [
      { title: 'Cole Hutson × Chobani', client: 'BU Men’s Hockey', year: 2025, vimeo: '1192638325', large, href: 'https://youtu.be/sKd_z9JtFqY' },
      { title: 'Boston Celtics × Nash Pictures', client: 'Nash Pictures', year: 2024, vimeo: '1192663266', large, href: 'https://www.instagram.com/reel/C8MX-_9uyzg/' },
      { title: 'Hutson × 3rd Round', client: 'Quartexx Hockey', year: 2026, vimeo: '1196707346', vertical, href: 'https://www.instagram.com/reels/DYk-JjvhBCS/' },
      { title: 'Lane Hutson', client: 'Quartexx Hockey', year: 2025, vimeo: '1192481065', vertical, href: 'https://www.instagram.com/p/DPw3BBLkQNu/' },
      { title: 'Montréal Canadiens × NHL', client: '', year: 2025, vimeo: '1192653328', vertical, href: 'https://www.instagram.com/p/DIuHXd5R4kL/?hl=en' },
      { title: 'Jacob Fowler', client: 'Quartexx Hockey', year: 2025, vimeo: '1192633988', vertical, href: 'https://www.instagram.com/reel/DSpvDtTAJSd/' },
      { title: 'Mike Matheson', client: 'Quartexx Hockey', year: 2026, vimeo: '1192658622', vertical, href: 'https://www.instagram.com/reel/DXSXwfaksqo/' },
      { title: 'Alex Newhook × NHL', client: '', year: 2026, vimeo: '1192659727', vertical, href: 'https://x.com/NHL/status/2054287295663026546?s=20' },
      { title: 'The Closer', client: 'Wareham Gatemen', year: 2024, vimeo: '1192647291', href: 'https://www.instagram.com/p/C8mqYJDOoAm/?hl=en' },
      { title: 'When the Lights Go Out', client: 'Wareham Gatemen', year: 2024, vimeo: '1192662148', href: 'https://www.instagram.com/reels/C9huXBfOy81/' },
      { title: 'Carter Meyer × BU Men’s Hockey', client: 'BU Men’s Hockey', year: 2025, vimeo: '1192641688', href: 'https://www.instagram.com/p/DNG1DGLuJoq/' },
    ],
  },
  { id: 'music', name: 'Music', film: null, projects: [] },
];
