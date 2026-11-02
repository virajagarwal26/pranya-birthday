# A Little Universe for Pranya

A mobile-first static birthday website. No paid services, login, database, build step or API is required.

## Personalize it

1. Open `content.js`. Every personal message, memory, caption, quiz question, secret and gift detail is in that one file.
2. All birthday copy is complete; edit `content.js` only when you want to revise a message.
3. Put photos in `assets/`, then change each memory's `image` path in `content.js`, for example `assets/pranya-laughing.jpg`.
4. In each quiz question, `correct: 0` means the first option is correct, `1` means the second, and so on.
5. To link the final gift to something, set `gift.buttonUrl` and edit `gift.buttonLabel`. Leave the URL empty for a text-only reveal.

## Preview locally

You can double-click `index.html`. For the most reliable preview, serve this folder with any basic static web server.

## Free deployment after review

- GitHub Pages: upload these files to a repository, then enable Pages from the main branch.
- Netlify Drop: drag this entire folder into Netlify's deploy drop zone.
- Cloudflare Pages: connect a repository and use this folder as the static output; no build command is needed.

Do not publish private photos, messages or links until everyone shown in them is comfortable with that audience.
