// The whole site's content. One section per column on the landing page; add a third to add Film.
// film: the clip behind the word on the landing page (Vimeo number).
// still: the project's image. Either its Vimeo thumbnail (i.vimeocdn.com/video/<still>-d_640) or a full https address.
// To add a project, see README.md.
// vertical: true for 9:16 work. large: true for the two big images in the first row.
const vertical = true, large = true;

export const sections = [
  {
    id: 'sports', name: 'Sports', film: { vimeo: '1196707346', vertical },
    projects: [
      { title: 'Cole Hutson × Chobani', client: 'BU Men’s Hockey', year: 2025, still: '2157941355-604bc38692fb094e96d1efb274fbb47865b5dadfb6048d47224b7b57f02e288b', large, href: 'https://youtu.be/sKd_z9JtFqY' },
      { title: 'Boston Celtics × Nash Pictures', client: 'Nash Pictures', year: 2024, still: '2157972545-1a3780dd3face50ed9d677390c9301a318edc31069fab1d58dad2ca574302871', large, href: 'https://www.instagram.com/reel/C8MX-_9uyzg/' },
      { title: 'Hutson × 3rd Round', client: 'Quartexx Hockey', year: 2026, still: '2162881538-b7c6cc5e28b7c2865dffc1a7485d0508c05fdeb19b94ae5f45cf54b3de598bf0', vertical, href: 'https://www.instagram.com/reels/DYk-JjvhBCS/' },
      { title: 'Lane Hutson', client: 'Quartexx Hockey', year: 2025, still: '2157745879-e41fb269abf6721addf275d3df8bebb83745e8cb1aaec117a4817ccdf052d9af', vertical, href: 'https://www.instagram.com/p/DPw3BBLkQNu/' },
      { title: 'Montréal Canadiens × NHL', client: '', year: 2025, still: '2157960198-f7b15d75042b4dea50f22173763cc6818e54212950cae9b2738144748d179429', vertical, href: 'https://www.instagram.com/p/DIuHXd5R4kL/?hl=en' },
      { title: 'Jacob Fowler', client: 'Quartexx Hockey', year: 2025, still: '2157935930-3436182f5080f3a3f1c2b3b026685f5a579f405462848149fa94dba41a3c0774', vertical, href: 'https://www.instagram.com/reel/DSpvDtTAJSd/' },
      { title: 'Mike Matheson', client: 'Quartexx Hockey', year: 2026, still: '2157966675-cbbfd408c277469a8d1906455dfd960f555108002bc1fa8f0b7b7c2ed0e7c3e3', vertical, href: 'https://www.instagram.com/reel/DXSXwfaksqo/' },
      { title: 'Alex Newhook × NHL', client: '', year: 2026, still: '2157968048-d943186ecc091c993760b9d0303ecc2a55af9f177e05cf4c893b6f7e6a2d2542', vertical, href: 'https://x.com/NHL/status/2054287295663026546?s=20' },
      { title: 'The Closer', client: 'Wareham Gatemen', year: 2024, still: '2157952634-3a466803b2105adbea8b49e23cf4a6fd30f02ff01660a402e23fde94145789d1', href: 'https://www.instagram.com/p/C8mqYJDOoAm/?hl=en' },
      { title: 'When the Lights Go Out', client: 'Wareham Gatemen', year: 2024, still: '2157971107-a1cb3b8f8fb698e9052b6e5fb23c57909a3e3e2be92b4568bb6af7a0558d3475', href: 'https://www.instagram.com/reels/C9huXBfOy81/' },
      { title: 'Carter Meyer × BU Men’s Hockey', client: 'BU Men’s Hockey', year: 2025, still: '2157945583-81e5277705dda6c7916b3a576a1c360206f4036827fb3f92b424cc46dfc1db90', href: 'https://www.instagram.com/p/DNG1DGLuJoq/' },
    ],
  },
  { id: 'music', name: 'Music', film: null, projects: [] },
];
