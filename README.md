# ackinax.com

Marketing site for [Ackinax](https://ackinax.com) — oracle data feeds, node infrastructure, and developer tools for the Acki Nacki blockchain.

A Vite + React + TypeScript SPA, styled with Tailwind and shadcn/ui, deployed to Cloudflare Workers (Static Assets).

## Develop

```sh
bun install
bun run dev      # http://localhost:8080
bun run build
bun run test
```

## Deploy

Pushes to `main` trigger a Cloudflare Workers build automatically (see `wrangler.jsonc`). Manual deploy:

```sh
bun run build
bunx wrangler deploy
```

Production: <https://ackinax.com>
