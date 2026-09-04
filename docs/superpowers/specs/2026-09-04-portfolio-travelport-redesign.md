# Portfolio redesign: adopt TravelPort's design language

Date: 2026-09-04

## Why

The portfolio carries two sites. The root (`index.html`, `styles.css`,
`script.js`) is the v1 transit build, last touched in `252f6f0` and stale.
`redesign/` is the current one, and every recent commit — the velocity lead, the
unslop pass, the SquadFit value reframe — landed there. Visitors to `/` get the
old copy.

Both are built on a metro metaphor: saturated line liveries, an Indian Railways
station name board, a route spine that fills as you scroll, night bands, and
four display faces. TravelPort, the sibling site, is the opposite — warm paper,
one blue accent, one amber highlighter, Manrope and JetBrains Mono, soft panels.
The two read as work by different people.

This rebuild collapses the portfolio to one site at `/`, in TravelPort's design
language.

## Decisions

Taken with the site's owner before any code was written:

1. **Full adoption of TravelPort's theme; the metro skin goes.** Not a
   recolour — the station board, route spine, network diagram, line liveries and
   night bands are all removed. The content stays.
2. **The India atlas survives.** It is real data, not metaphor, and it is
   exactly the kind of figure TravelPort is built around.
3. **Ships at root.** Old root files overwritten, `redesign/` deleted. One site,
   one URL. Prior versions stay recoverable in git history.
4. **Dark mode goes.** TravelPort is light-only warm paper and offers no night
   palette to adopt. The current `☾` toggle and the whole `light-dark()` block
   are dropped rather than inventing a dark half TravelPort does not have.
5. **Status survives as plain English.** The `running / live / private /
   archive` vocabulary and its map legend go, but the hero promises status —
   "with its real status attached: in use, just built, or pitched to somebody
   who never wrote back." So each card states it plainly instead. The jargon
   goes; the honesty does not.

## Design system

Tokens are copied from `TravelPort/site/app/globals.css` verbatim, not
approximated, so the two sites match rather than resemble each other.

| Role | Value |
|---|---|
| canvas | `#f3f1eb` |
| canvas-deep | `#e9e6de` |
| surface | `#fffdf8` |
| ink / text-primary | `#171815` |
| text-secondary | `#474943` |
| text-muted | `#777970` |
| border-light | `#d8d5cc` |
| border-muted | `#bab7af` |
| accent | `#2f5d8f` |
| accent-dark | `#234a73` |
| accent-soft | `#e3ebf4` |
| highlight | `#e0a326` |
| highlight-soft | `#f7ecd6` |

Type: Manrope 400–800 and JetBrains Mono 400/500, loaded from Google Fonts
(the static site has no `next/font`). Headings at weight 800, `-0.04em`
tracking. Radii 9 / 10 / 14 / 18. `shadow-sm: 0 12px 30px rgba(23,24,21,.07)`,
`shadow-lg: 0 32px 80px rgba(23,24,21,.12)`.

Primitives ported as-is: `.section-label` (10px uppercase, `0.15em` tracking,
leading 24px dash), `.marker` (the amber highlighter gradient), `.button` with
`.button-primary` / `.button-secondary`, `.panel`, `.card-hover`.

**Project groups reuse TravelPort's four categorical colours** — teal `#1f6f7a`,
olive `#4a7a2e`, rose `#a8324a`, ochre `#8c6d33`. TravelPort already assigns
exactly four of these to region tags. The grouping that used to be four metro
lines becomes a quiet tag colour. Nothing else on the page carries colour.

## Files

Static, no build step, no dependencies — unchanged in that respect.

```
index.html   page shell and all prose that is not data
styles.css   tokens, primitives, page styles
data.js      projects, career, links; map coordinates stripped
india.js     baked map geometry, unchanged (from scripts/bake-map.py)
render.js    draws projects, career, stats and atlas from data
script.js    scroll reveal, card disclosure, year filter, nav spy
```

`redesign/` is removed. `scripts/check-links.mjs` and `scripts/velocity.sh`
read from `redesign/` today and are repointed at root.

## Page structure

**Header** — 72px sticky, `rgba(255,253,248,.94)` with 16px backdrop blur once
scrolled, `SV` mark in an ink square, name over a "Software engineer"
microlabel, nav underline sweeping origin-right to origin-left on hover.

**Hero** — section-label eyebrow, the claim at Manrope 800 with the amber marker
under "Four of them run someone else's business", the intro paragraph, then
Email primary with GitHub / LinkedIn / Blog secondary.

**Stats strip** — 13 products, 1,765 commits, 17 shipped, 222 days, 43 cities,
19 states and UTs. Mono numerals over uppercase labels in one bordered panel.

**Work** — four groups, each a section-label, heading and lede, then a grid of
`.panel` cards. Card front carries the name, the `outcome` line, plain-English
status and stack chips; it expands to `what`, `solves`, `replaces`, `notes` and
`scale`. This replaces both the network SVG and the current accordion.

**Career** — seven roles as a bordered timeline, current role marked in accent
blue.

**Atlas** — kept, restyled. Visited states fill `accent-soft` against a hairline
outline, city dots in ink sized by days spent, labels in mono, year filters as
pill buttons, side panel keeping the per-year bars. The existing label
collision-avoidance logic carries over untouched.

**Footer** — accent-blue `SV` mark, name, and a mono meta line.

## Verification

- `node scripts/check-links.mjs` passes against the root data files.
- Every project in `data.js` survives the move with its copy intact; the
  station coordinates are the only fields dropped.
- The page renders with JavaScript disabled to the extent the `<noscript>`
  block promises.
- No `redesign/` path remains anywhere in the repo.
