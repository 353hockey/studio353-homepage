# Studio 353 homepage

- `preview/` is the working copy, `live/` is what the homepage loads.
- `./promote.sh` copies preview to live if every check passes.
- `hooks/pre-push` blocks publishing if a check fails. After cloning: `git config core.hooksPath hooks`.
- `snippets/` is what gets pasted into the Squarespace code block.
