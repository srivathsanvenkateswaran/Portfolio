# Portfolio rebuild: the network of shipped work

**Date:** 2026-08-18
**Status:** design, awaiting review
**Supersedes:** the current single-page site at `/` (July 2026, redesigned 5 Aug 2026)

## 1. Why

The current site is well made and reads junior anyway. Three reasons, none visual:

1. **It is themed, not positioned.** The transit metaphor is decorative. It says
   "I like trains", which is a hobby, not a claim. Compare the two sites this was
   benchmarked against: thilaksrinivas.com opens with a claim and a number, and
   gokulap.me uses a metaphor that *is* the job (a DevOps engineer whose resume is
   a Kubernetes manifest), so the format itself is evidence.
2. **There is not one number on it.** Both benchmark sites quantify relentlessly.
3. **The work shown is not the work.** The engineering section leads with Burrito,
   OneRail, OneMetro, a Pokedex clone and two crypto bots, while twelve newer
   products sit invisible on disk. Showing a tutorial-tier Android app beside
   SquadFit is what makes the page read like a beginner's.

Meanwhile the strongest asset is unused. TravelPort is not a "travel section", it
is a dataset: 50 trip files, 45 non-wrapper trips, 21 states and UTs, 45 cities,
222 distinct days on the road, hand-written notes parsed into structured JSON with
per-event city derivation, checksums and confidence scores. It proves the travel
story and data engineering in one object.

**The fix:** stop asserting the transit theme and make it load-bearing. The site
becomes an actual network diagram of the work, plus a second, literal map drawn
from real travel data. Same theme, suddenly earned.

## 2. Audience and job

**Builder's calling card.** The reader is a peer, a founder, or someone arriving
from GitHub or the blog. The page is optimised for respect from people who know
what shipping costs, not for conversion.

Consequences: volume and range lead. Numbers appear as proof rather than sales.
Tone is dry and confident, never persuasive. No calls to action beyond contact.

## 3. Decisions already taken

| # | Decision | Chosen |
|---|---|---|
| 1 | Site's job | Builder's calling card |
| 2 | Organising concept | Earn the metro theme; two maps |
| 3 | Work with no public repo and no deploy | Show it, status stated honestly |
| 4 | Depth | One page, expandable stations, no build step |
| 5 | Line topology | By who it is for |
| 6 | Hero framing | Lead with output; location is metadata only |
| 7 | Departures board | Dropped; network diagram is the index |
| 8 | Social-media era | Demoted to one entry in the career trunk |
| 9 | Varalakshmi Tiffins | Present as a template, not client work; link is fine |
| 10 | PharmaCare | Include the project; never the family connection |
| 11 | Deployment | Ship to `/redesign` first, promote to `/` when approved |

## 4. Information architecture

```
HERO           name board, claim, links
EVIDENCE       one strip of sourced numbers
THE NETWORK    interactive SVG, 17 stations, 4 lines   <- the index and centrepiece
  RED     (8)  software small businesses actually run on
  GREEN   (4)  transit and maps
  AMBER   (3)  money
  MAGENTA (2)  built for me and my friends
TRUNK LINE     career: TCE -> Zoho -> Caterpillar x3 -> SILQ, plus the social-media era
THE REAL ONE   India from TravelPort data: 21 states, 45 cities, 222 days
TERMINUS       contact
```

The work network is schematic and invented. The travel map is literal and rendered
from real data. The second one is what stops the first one reading as decoration.

## 5. The network diagram

Full-width SVG, rendered by JS from a layout array in `data.js`, so stations are
data that can be reordered rather than hand-tuned path strings.

**Grammar.** Standard metro drafting: orthogonal and 45 degree segments only,
uniform tick marks for ordinary stations, the double-ring symbol for interchanges,
line colours sampled from real Indian metro liveries (carried over from the current
`styles.css`, plus one new red).

**Interchanges are real,** not ornamental. A station is drawn as an interchange when
it genuinely shares a stack with another line's station:

- `Next.js + Drizzle + Neon`: SquadFit, Tarvo, JComm, Jimvathsan
- `PWA + native`: SquadFit, Tatak
- `offline-first`: Tatak, Misal

**Behaviour.** The diagram is the page index; the departures board is gone. Clicking
a station scrolls to it and expands its sheet. Hovering a line dims the others.
Current scroll position lights the corresponding station, reusing the existing
rAF-driven spine logic in `script.js`.

## 6. Station spec sheets

Collapsed: one dense line per station. Expanded in place: a uniform sheet. Identical
structure across all 17 is the point, because that is what makes density read as
rigour instead of noise.

```
SQUADFIT                                     * RUNNING · v2.70.0
solves    gyms running on paper receipt books and signature registers
stack     Next.js 16 · React 19 · Drizzle · Neon · Better Auth · Expo
surface   PWA + Android, one backend, one version number
notes     trilingual EN/TA/HI · hand-rolled SVG charts, no chart library
links     getsquadfit.com                              repo private
exchange  (o) Next.js+Drizzle+Neon    (o) PWA+native
```

**Fields:** `name`, `status`, `solves`, `stack`, `surface`, `notes`, `links`,
`interchange`. Every field is optional except `name`, `status` and `solves`.

**Status vocabulary,** and each value must be literally true:

- `RUNNING` : deployed and in real use by someone who is not him
- `LIVE` : deployed and reachable, without a claim about users
- `PRIVATE BUILD` : built and working, no public repo, not deployed
- `ARCHIVE` : older public work, still up, no longer worked on

## 7. The 17 stations

Copy is drafted from each project's own README and specs, and every number is
sourced from the repo rather than estimated.

### Red line: software small businesses actually run on (8)

Four of these are in real use by someone other than him. That is the claim the
line rests on, and it is exact.

| Station | Status | Source of substance |
|---|---|---|
| **SquadFit** | RUNNING | multi-tenant gym platform, v2.70.0, PWA + Expo off one backend, trilingual, Drizzle/Neon, Better Auth. Link `getsquadfit.com`. Repo private. |
| **PharmaCare** | RUNNING | pharma distribution book-keeping over a legacy ERP. Reverse-engineered EasyWin's open-item receivables ledger and reproduced its on-screen balances exactly, proved against two independent ERP-written snapshot columns. Static Next export on Cloudflare Pages, Supabase, nightly sync, bilingual EN/TA user guide. |
| **Masters Mentor** | RUNNING | site for an admissions consultancy: packages, case studies, free profile-evaluation tool. Link the Workers URL. |
| **Vyas Adithya** | RUNNING | personal site for a mentor, live on the custom domain `vyasadithya.com`. |
| **Jelfort** | PRIVATE BUILD | voice agent that answers a clinic or salon phone, holds a conversation, books the slot. Latency is the stated engineering bet. Runs locally in two minutes with no API key. |
| **Tarvo** | PRIVATE BUILD | apartment-block maintenance and book-keeping ledger. Drizzle, Neon, PGlite locally, Better Auth. |
| **JComm** | LIVE | resellable single-store jersey e-commerce template: one config file per retailer, every external service optional with local fallbacks so the whole store runs with zero external accounts. |
| **Darshini template** | LIVE | complete small-restaurant site, dependency-free static HTML/CSS/JS, built as a speculative POC and cold-pitched. **Described as a template, never as client work.** Link to the live URL is approved. |

### Green line: transit and maps (4)

| Station | Status | Source of substance |
|---|---|---|
| **Tatak** | PRIVATE BUILD | multi-modal Bengaluru journey planner across BMTC and Namma Metro with walking legs, priced per leg in integer paise, ranked FASTEST / CHEAPEST / MINIMUM_TRANSITS, Kannada station names. ~9,100-stop graph, 34,000+ walking transfers, 193 MB GTFS parsed in 4.8 s, warm query ~0.96 s. Use Tatak's own measured numbers, including that it corrected its earlier inflated ones. |
| **TravelPort** | LIVE | the pipeline behind the travel map below: hand-written notes to structured JSON, city derivation, checksums, confidence scores. |
| **OneRail** | LIVE | public repo, live URL. |
| **OneMetro** | ARCHIVE | public repo, 6 stars, Android, no deploy. |

### Amber line: money (3)

| Station | Status | Source of substance |
|---|---|---|
| **Burrito** | LIVE | 98-chart quant dashboard, public repo, live at `burrito-finance.vercel.app`. |
| **Misal** | LIVE | local-first desktop app consolidating Indian brokers, mutual funds, US employer equity and crypto into one net-worth view. Tauri. No account, no cloud, no server. The only modern flagship with a public repo. |
| **CryptoPortfolioManager** | ARCHIVE | CLI portfolio tracker, public, 3 stars. |

### Magenta line: built for me and my friends (2)

| Station | Status | Source of substance |
|---|---|---|
| **BidWicket** | PRIVATE BUILD | live IPL-style player auction over Socket.IO where a timer resets on every bid, plus a season-long fantasy league. npm-workspaces monorepo building to a single Node process. |
| **Jimvathsan** | LIVE | personal training tracker, plain-text set notation, Neon in production and PGlite locally. |

**Two padding removals, decided while writing this spec.** Workout Squads was a
Flutter v1 that never shipped; it folds into SquadFit's sheet as its predecessor,
which is honest and makes SquadFit's story better. That leaves Magenta at two
stations, which is fine. CryptoPortfolioManager stays because it is a real tool
rather than a tutorial. Padding lines to a target count is exactly the instinct
that made the old page read junior. Overrule this at review if you disagree.

**Removed from the site entirely:** Pokedex-Jetpack-Compose, Crypto-Discord-Bot,
linuxVisualSearch, and the rest of the 2020 to 2023 tutorial repos.

## 8. Evidence strip

Only numbers traceable to his own files. No invented user or revenue counts.

**17 shipped · 4 in real use by someone else · SquadFit v2.70.0 · 21 states and UTs
· 45 cities · 222 days on the road · 3 languages shipped · 2022 to 2026**

## 9. The travel map

India drawn from TravelPort's own baked geometry, so there is no map library, no
tile server and no external request.

**Source data,** copied into this repo at bake time, never fetched at runtime:

- `TravelPort/site/public/data/maps/india-states/paths.json` : 36 state and UT SVG
  paths, already projected to an 800x900 viewBox
- `TravelPort/site/public/data/cities/india_cities.json` : 417 cities with lat/lng
- `TravelPort/parsed/*.json` : the 50 trip files

**Render:** the 21 visited states filled in line green, the 45 visited cities as
station dots sized by number of days, trips drawn as connecting runs. A year filter
across 2022 / 2024 / 2025 / 2026 makes the 25-trip 2025 spike visible. Trip counts
per year are 1, 7, 25, 12.

Links through to `travelport.vercel.app` for anyone who wants the detail.

## 10. Career trunk

Confirmed against the current site, which had these right:

- **SILQ**, SDE 2, March 2026 to present. Global trade and supply-chain tooling.
- **Caterpillar**, SE 2, May 2025 to March 2026, Chennai. Enterprise search platform.
- **Caterpillar**, SE 1, July 2023 to April 2025, Chennai. Solr, Lucidworks Fusion,
  NLP/ML pipelines.
- **Caterpillar**, intern, January 2023 to June 2023, Chennai.
- **Zoho**, intern, July 2022, Chennai.
- **B.E., Thiagarajar College of Engineering**, 2019 to 2023, Madurai.
- **Social media manager**, 2019 to 2023, freelance and part-time. One entry here
  now, not its own line.

Rendered as the existing vertical route diagram, which is one of the best parts of
the current site and carries over unchanged in structure.

## 11. Visual system

**Carries over unchanged,** because it is already better than either benchmark site:
the Archivo / Bricolage Grotesque / IBM Plex Sans / Martian Mono pairing, the station
name board, the platform-edge tactile paving, the route spine that fills on scroll,
the `light-dark()` night service with its manual toggle, and the concrete-grey
background.

**Changes:** a fifth line colour for red, since the largest line is new. Hero copy
becomes a claim about output instead of "an engineer who ships his hobbies". The
departures board is removed and its mono type and status pulse migrate into the
station sheets, where the status finally means something.

**Hero.** Location is metadata in the name board and nothing more. He was explicit
that where he lives does not matter, so there is no geography narrative anywhere on
the page. Working claim, subject to his rewrite:

> Seventeen things shipped. Four of them are running someone else's business.

**Copy rule, carried over:** no em-dashes anywhere. Colons, commas, periods or `·`.

## 12. Technical architecture

Hand-written, no build step, no dependencies, no framework. This matches the current
repo and deploys instantly.

```
index.html            old site, untouched until promotion
styles.css            old
script.js             old
redesign/
  index.html          the new page
  styles.css
  script.js           spine, scroll, theme, station expansion
  network.js          SVG network renderer
  data.js             lines, stations, layout, career, evidence
  india.js            baked state paths + visited cities + trips
scripts/
  bake-map.py         one-off: TravelPort data -> redesign/india.js
  check-links.mjs     verification, see below
docs/superpowers/specs/
  2026-08-18-portfolio-network-design.md
```

`bake-map.py` is run by hand and its output is committed, so the site itself has no
build step. It trims `paths.json` to the states actually needed, projects the 45
visited cities into the same viewBox, and aggregates per-trip day counts.

**Size budget.** `paths.json` is 134 KB raw. Trimmed and rounded to one decimal it
should land near 40 to 60 KB. `india.js` is loaded with `defer` and the map renders
below the fold, so it must not block first paint. Hard ceiling: 150 KB total JS.

## 13. Deployment

Ship to `vathsan.vercel.app/redesign` first, so both designs can be compared side by
side. Vercel serves `redesign/index.html` at `/redesign` with no config needed, and
the old site at `/` is untouched.

Promotion, only on his say-so: move `redesign/*` to the repo root, delete the old
three files, and remove the directory. One commit.

## 14. Publishing constraints

Hard rules. Each of these would be invisible to everyone except him, and damaging.

1. **Never link a private repo.** Eleven of the twelve modern projects are private:
   SquadFit, Tatak, Jelfort, Tarvo, BidWicket, PharmaCare, JComm,
   Varalakshmi-Tiffins, jimvathsan, MastersMentor, vyasadithya. Only Misal, Burrito,
   OneRail, OneMetro and Portfolio are public. Verified unauthenticated with
   `git ls-remote`, not with `gh`.
2. **Never use the `gh` CLI** on this machine. It is authenticated to his work
   account. Use git over SSH.
3. **PharmaCare's family connection is never mentioned.** The project goes on the
   site; the relationship does not.
4. **No PharmaCare business data.** `docs/qa-data-private.md` names real customer
   firms and their open credit lines, and the design specs carry receivable totals
   and account counts. None of it is publishable. Describe the engineering
   achievement qualitatively.
5. **Varalakshmi Tiffins is not a client.** A cold pitch that got no reply. It
   appears as a template. Its `pitch/` directory is internal and stays out.
6. **No SquadFit pricing.** `docs/PRICING.md` is marked not customer-facing.
7. **SquadFit is not "for Dindigul gyms".** It is a general multi-tenant gym
   platform; Dindigul is where its first gyms are, not its scope.

## 15. Accessibility and performance

- The network SVG carries a visually hidden ordered list per line, so the structure
  is available without sight or JS.
- Stations are real `<button>` elements with `aria-expanded` and `aria-controls`.
  Full keyboard traversal along each line.
- Spine fill, station lighting and any map animation respect
  `prefers-reduced-motion`.
- Line colour is never the only carrier of meaning; every line has a text label and
  every status has a word, not just a dot.
- Contrast checked against the existing `-ink` colour variants.
- No layout shift from the map: its container is reserved at its aspect ratio.

## 16. Verification

`scripts/check-links.mjs`, run by hand before promotion. It walks `data.js` and fails
on any of:

- a station missing a required field
- a station whose `links` include a repo that is not publicly readable
- a live URL that does not return 200
- a `RUNNING` status on a station with no link and no note explaining it

The repo rule matters most: a calling card that links a 404 is worse than one that
says "private".

Beyond that, verification is manual, because there is no framework here and adding
one to test a static page is not worth it: keyboard traversal, both themes, reduced
motion, 360 px and 1440 px widths, and the page with JS disabled.

## 17. Out of scope

Per-project case-study pages, a blog index, analytics, a CMS, and any framework
migration. All were considered and rejected. If case studies are wanted later, they
are separate static pages and a separate spec.

## 18. Open questions

None blocking. Two to confirm while building:

1. PharmaCare's deployed URL, if it is publicly reachable at all. If not, its status
   drops from `RUNNING` to a note that says in use, not public.
2. Whether SILQ is remote, which only matters if a location line is wanted anywhere
   beyond the name board.
3. What `misal.vercel.app` actually serves. Misal is a Tauri desktop app, so the
   200 is presumably a landing or download page. If it is a stale placeholder, the
   station links its public repo instead, which it has.
