# Studio 353 homepage

- `preview/` is the working copy, `live/` is what the homepage loads.
- `./promote.sh` copies preview to live if every check passes.
- `hooks/pre-push` blocks publishing if a check fails. After cloning: `git config core.hooksPath hooks`.
- `snippets/` is what gets pasted into the Squarespace code block.

## Adding a project

Needed: which section, a video link (or an image), title, client or artist, year, and where a click goes.

1. `node lookup.mjs <Vimeo or YouTube link>` prints the image, the shape and a starting title. The title is a file name more often than not, and the year is the upload year: use what the owner gave, and ask if it is missing.
2. Instagram, TikTok and X links have no usable image. Use the Vimeo or YouTube copy for the image and keep the social link as `href`. Otherwise put a JPG (1280px on the long side, under 300 KB) in `images/` and set `still` to `https://353hockey.github.io/studio353-homepage/images/<name>.jpg`.
3. Add the line to its section in `preview/projects.js`. The list order is the page order. Keep the order large, then vertical, then wide, with new work first within its shape. Only two projects per section are `large`. Rows hold 2 large, 6 vertical or 3 wide: if an addition leaves a row part empty, say so and offer a fix.
4. `node --test test/*.test.mjs`, commit, push. Wait for GitHub Pages, then look at the page: the image loads, is not a black or blurry frame, and the click goes to the right place.
5. Once the homepage runs on `live/`: show the preview first, and after a yes run `./promote.sh`, commit and push.

Editing, reordering, removing and swapping an image are the same: change the line, then steps 4 and 5. Visitors see a change within about 10 minutes.
