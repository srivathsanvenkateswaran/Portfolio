# Portfolio · Srivathsan Venkateswaran

A single-page static portfolio (plain HTML/CSS/JS, no build step) designed as an
Indian transit network: a station-board hero, a departures-board navigation, and
four colored "lines": Engineering (blue), Markets (amber), Travel (green), and
the Story Layer (magenta).

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

- **Dates**: SILQ "March 2026 → Present" (confirmed), Caterpillar "2023 – 2026" (start year inferred), college "2019 – 2023", social media era "2019 – 2023".
- **Burrito live URL**: currently `burrito-finance.vercel.app` (from the repo README).
- **The city marquee** in the Travel section: swap in places you've actually been.
- **Board detail**: "6.7 m above MSL" is Chennai's elevation, in the style of a real station board.
