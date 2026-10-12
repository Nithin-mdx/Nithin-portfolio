# Nithin Nandakumar — Portfolio

**Live:** https://nithin-nandakumar.netlify.app

Next.js 16 · TypeScript · Tailwind v4 · React Three Fiber · GSAP (ScrollTrigger + SplitText) · Lenis

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production check
```

## Edit content
Everything lives in `data/portfolio.ts`. Search it for `TODO` (NOVA links, ShelfAware & Deck Royale descriptions).

- Project images: replace `public/work/*.svg` (placeholders) with real screenshots; update `image` paths if you change the extension.
- CV: replace `public/Nithin_Nandakumar_CV.pdf` (current file is a placeholder).

## Ask-about-me chat
`app/api/chat/route.ts` — Claude Haiku 5.5 answers visitor questions from `data/portfolio.ts`. Put `ANTHROPIC_API_KEY` in `.env.local` locally (gitignored) and in your host's environment variables. Rate-limited to 20 questions per visitor per 10 minutes.

## Contact form
Create a form at formspree.io, then set `NEXT_PUBLIC_FORMSPREE_ID` (see `.env.example`).
Without it, the form falls back to opening the visitor's mail client.

## Deploy (Netlify)
1. Push this folder to a GitHub repo.
2. app.netlify.com → Add new site → Import an existing project → pick the repo.
   Netlify detects Next.js (build `npm run build`, publish `.next`) — leave the defaults.
3. Site configuration → Environment variables: add `ANTHROPIC_API_KEY` (the chat) and `NEXT_PUBLIC_FORMSPREE_ID` (optional `NEXT_PUBLIC_SITE_URL` for a custom domain).
4. Deploy. Or from the CLI: `npx netlify-cli deploy --build` then `--prod`.

## Deploy (Vercel)
1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo (framework auto-detected).
3. Add env vars `NEXT_PUBLIC_FORMSPREE_ID` and `NEXT_PUBLIC_SITE_URL` (your final URL).
4. Deploy. Or from the CLI: `npx vercel` then `npx vercel --prod`.
