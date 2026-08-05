# Portfolio · Srivathsan Venkateswaran

A single-page static portfolio (plain HTML/CSS/JS, no build step) designed as an
Indian transit network: a station-board hero, a platform-edge tactile strip, a
departures-board concourse, and four colored "lines": Engineering (blue),
Markets (amber), Travel (green), and the Story Layer (magenta).

One route spine runs down the whole page. It changes colour at each interchange,
fills in behind you as you scroll, and lights up each station marker as you pass
it. The line ends at a buffer stop in the terminus.

## Run locally

```sh
python3 -m http.server 3000
# open http://localhost:3000
```

## Deploy to Vercel (free)

```sh
npm i -g vercel   # once
vercel            # from this directory, accept defaults
vercel --prod
```

Or push this folder to a GitHub repo and import it at vercel.com/new.
No framework preset or build command needed (it's a static site).

## Facts to verify before going live

Some details were inferred from public profiles. Correct in `index.html` if off:

- **Dates**: the engineering timeline is now confirmed: Zoho internship (Jul 2022),
  Caterpillar as intern (Jan – Jun 2023), SE1 (Jul 2023 – Apr 2025), SE2
  (May 2025 – Mar 2026), then SILQ from Mar 2026. College "2019 – 2023" and the
  social media era "2019 – 2023" are still as originally written.
- **Burrito live URL**: currently `burrito-finance.vercel.app` (from the repo README).
- **The city marquee** in the Travel section: swap in places you've actually been.
- **Board detail**: "6.7 m above MSL" is Chennai's elevation, in the style of a real station board.
