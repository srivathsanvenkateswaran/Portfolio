/* ============================================================
   The network: every shipped thing, and where it sits.

   Stations are data, not hand-drawn paths, so the map can be
   re-laid-out by editing numbers here. Layout grid is a
   1200 x 560 viewBox; lines run horizontally with a single
   45 degree bend, and interchange ties are vertical.

   Status vocabulary, and each has to be literally true:
     running  deployed and in real use by someone who is not me
     live     deployed and reachable, no claim about users
     private  built and working, no public repo, not deployed
     archive  older public work, still up, not worked on now
   ============================================================ */

window.NETWORK = {

  lines: [
    {
      id: "red",
      name: "Red Line",
      claim: "Software small businesses actually run on",
      lede: "Four of these are in daily use by someone who is not me. That is the " +
            "only sentence on this page I would defend hardest.",
      path: "M110,170 H630 L730,270 H1090",
    },
    {
      id: "green",
      name: "Green Line",
      claim: "Transit and maps",
      lede: "I keep building the same thing from different angles: a network, " +
            "priced and timed, drawn honestly.",
      path: "M110,330 H500",
    },
    {
      id: "amber",
      name: "Amber Line",
      claim: "Money",
      lede: "Reading markets is the hobby. These are what the hobby produced.",
      path: "M110,490 H370",
    },
    {
      id: "magenta",
      name: "Magenta Line",
      claim: "Built for me and my friends",
      lede: "No users to answer to, which is the point.",
      path: "M830,400 H960",
    },
  ],

  /* Groups of stations sharing a stack. Membership shows as a badge on every
     member's sheet; the pairs that sit next to each other on the grid are also
     drawn as dashed interchange ties. */
  interchanges: [
    { id: "drizzle", label: "Next.js + Drizzle + Neon",
      members: ["squadfit", "tarvo", "jcomm", "jimvathsan"] },
    { id: "native", label: "PWA + native",
      members: ["squadfit", "tatak"] },
    { id: "offline", label: "Offline first",
      members: ["tatak", "misal"] },
  ],

  ties: [
    ["squadfit", "tatak"],
    ["tatak", "misal"],
    ["jcomm", "jimvathsan"],
  ],

  stations: [

    /* ---------------- Red Line ---------------- */
    {
      id: "squadfit", line: "red", x: 110, y: 170,
      name: "SquadFit", status: "running", version: "v2.70.0",
      solves: "Gyms run on paper receipt books and signature registers.",
      what: "Owners run plans, payments, dues and QR check-in. Members log " +
            "workouts, hold streaks and race their squad weekly.",
      stack: ["Next.js 16", "React 19", "Drizzle", "Neon", "Better Auth", "Expo"],
      surface: "One backend, two surfaces, one version number: a PWA and a " +
               "React Native Android app that share their domain code verbatim.",
      notes: [
        "Trilingual: English, Tamil and Hindi.",
        "Charts are hand-rolled SVG. No chart library.",
        "Workout Squads, a Flutter app for squad check-ins, was the first " +
        "attempt at this idea and is where it started.",
      ],
      links: [{ label: "getsquadfit.com", href: "https://getsquadfit.com" }],
      repo: null,
    },
    {
      id: "pharmacare", line: "red", x: 240, y: 170,
      name: "PharmaCare", status: "running",
      solves: "A distributor's receivables lived inside a legacy ERP that nobody could query.",
      what: "Reverse engineered the ERP's open-item receivables ledger and " +
            "reproduced its on-screen party balances exactly, proved against two " +
            "independent snapshot columns the ERP writes itself.",
      stack: ["Next.js static export", "Supabase", "MariaDB source", "nightly sync"],
      notes: [
        "The account-level general ledger disagrees with the bill-wise ledger, " +
        "and the ERP's own screens ignore it. Getting that right was the whole job.",
        "Bilingual user guide, English and Tamil.",
        "Pure static export, so it hosts anywhere.",
      ],
      links: [],
      repo: null,
    },
    {
      id: "mastersmentor", line: "red", x: 370, y: 170,
      name: "Masters Mentor", short: "MastersMentor", status: "running",
      solves: "An admissions consultancy with no way to show its record or qualify a lead.",
      what: "Packages, case studies and a free profile-evaluation tool for a " +
            "consultancy that places Indian students in European business schools.",
      stack: ["Cloudflare Workers"],
      links: [{ label: "mastersmentor.workers.dev",
                href: "https://mastersmentor.srivathsanvenkateswaran.workers.dev/" }],
      repo: null,
    },
    {
      id: "vyasadithya", line: "red", x: 500, y: 170,
      name: "Vyas Adithya", status: "running",
      solves: "A mentor with no home on the internet.",
      what: "Personal site for an ex-Amazon, ESCP mentor. Built end to end, " +
            "live on his own domain, and the site he actually uses.",
      stack: ["static", "custom domain"],
      links: [{ label: "vyasadithya.com", href: "https://vyasadithya.com" }],
      repo: null,
    },
    {
      id: "jelfort", line: "red", x: 630, y: 170,
      name: "Jelfort", status: "private",
      solves: "The five questions a front desk answers all day, at the hours nobody is at the desk.",
      what: "A voice agent that answers the phone for a dental clinic or a salon, " +
            "holds a real conversation, books the slot and hangs up. The owner " +
            "opens a console between patients: who called, what they wanted, what " +
            "got booked, and what the agent got wrong.",
      stack: ["npm workspaces monorepo", "realtime voice"],
      notes: [
        "Voice latency is the engineering bet the whole thing rests on.",
        "Clone it and you are talking to the agent in a browser tab in two " +
        "minutes: no phone number, no API key, no paid account.",
      ],
      links: [],
      repo: null,
    },
    {
      id: "tarvo", line: "red", x: 830, y: 270,
      name: "Tarvo", status: "live",
      solves: "An apartment block's maintenance dues tracked in a notebook.",
      what: "Maintenance and book-keeping ledger for an apartment block, with the " +
            "ledger maths checked by assertions rather than by trust.",
      stack: ["Next.js", "Drizzle", "Neon", "Better Auth", "PGlite", "Vercel Blob"],
      links: [{ label: "tarvo-five.vercel.app", href: "https://tarvo-five.vercel.app" }],
      repo: null,
    },
    {
      id: "jcomm", line: "red", x: 960, y: 270,
      name: "JComm", status: "live",
      solves: "Every small jersey retailer needs the same store built again from scratch.",
      what: "A resellable single-store e-commerce template. One codebase is one " +
            "store: to onboard a retailer you edit one config file, set env vars " +
            "and point it at a fresh database.",
      stack: ["Next.js App Router", "Tailwind v4", "Drizzle", "Auth.js",
              "Cloudflare R2", "Razorpay"],
      notes: [
        "Every external service is optional and switches itself on when its env " +
        "vars appear, with local fallbacks, so the whole store runs in dev with " +
        "zero external accounts.",
      ],
      links: [{ label: "jcomm-one.vercel.app", href: "https://jcomm-one.vercel.app" }],
      repo: null,
    },
    {
      id: "darshini", line: "red", x: 1090, y: 270,
      name: "Darshini template", short: "Darshini", status: "live",
      solves: "A neighbourhood tiffin shop with no website and no budget for one.",
      what: "A complete small-restaurant site: hero, story, signature dishes, full " +
            "menu, visit details. Built speculatively and pitched cold. It was " +
            "never taken up, so it stands as a template rather than as client work.",
      stack: ["hand-written HTML", "CSS", "vanilla JS"],
      notes: [
        "No build step, no framework, no npm dependencies. It opens straight " +
        "from disk and deploys to any static host.",
      ],
      links: [{ label: "live demo", href: "https://varalakshmi-tiffins.vercel.app" }],
      repo: null,
    },

    /* ---------------- Green Line ---------------- */
    {
      id: "tatak", line: "green", x: 110, y: 330,
      name: "Tatak", status: "private",
      solves: "Crossing Bengaluru when the real answer is a walk, a bus, a metro and another walk.",
      what: "A multi-modal journey planner across BMTC buses and Namma Metro. " +
            "Every leg priced in integer paise, metro by fare zone and bus by " +
            "distance, then ranked and tagged FASTEST, CHEAPEST or MINIMUM_TRANSITS.",
      stack: ["TypeScript", "GTFS", "Next.js", "Kotlin / Compose"],
      surface: "A PWA that works offline for an already-issued ticket, a hand-written " +
               "Trusted Web Activity APK, and a native Kotlin client.",
      scale: [
        ["graph", "~9,100 stops, 34,000+ walking transfers"],
        ["GTFS parse", "193 MB in 4.8 s"],
        ["cold start, end to end", "7.0 s"],
        ["warm /api/plan", "~0.96 s"],
      ],
      notes: [
        "Kannada station names and official line colours carried all the way " +
        "through to the response.",
        "Its README used to advertise 200 ms. That number described a step " +
        "nobody experiences, so it was measured properly and corrected upward. " +
        "The numbers above are the honest ones.",
      ],
      links: [],
      repo: null,
    },
    {
      id: "travelport", line: "green", x: 240, y: 330,
      name: "TravelPort", status: "private",
      solves: "Years of handwritten trip notes that nobody could query.",
      what: "Parses free-text travel notes into structured JSON: every expense " +
            "typed and priced, its city derived, a confidence score attached, and " +
            "per-day checksums run against the totals I wrote down at the time.",
      stack: ["Python", "Next.js", "GeoJSON"],
      notes: [
        "It is the source of the map at the bottom of this page: 45 trips, " +
        "19 states and union territories, 222 days. That map is the only " +
        "published output it has.",
        "Where a checksum disagrees with my own arithmetic, the parser flags it " +
        "rather than quietly picking one.",
      ],
      links: [],
      repo: null,
    },
    {
      id: "onerail", line: "green", x: 370, y: 330,
      name: "OneRail", status: "live",
      solves: "Indian Railways data is everywhere and explorable nowhere.",
      what: "Train schedules down to platform numbers and day increments, rake " +
            "and coach composition, Rake Sharing Association groups, and a " +
            "vector-rendered atlas of the national track topology built from " +
            "OpenStreetMap.",
      stack: ["Next.js", "MapLibre GL", "OpenStreetMap"],
      notes: [
        "Viewport culling: the API only returns what is inside the visible " +
        "bounding box, so the map stays fast at every zoom level.",
      ],
      links: [{ label: "one-rail.vercel.app", href: "https://one-rail.vercel.app" }],
      repo: "https://github.com/srivathsanvenkateswaran/OneRail",
    },
    {
      id: "onemetro", line: "green", x: 500, y: 330,
      name: "OneMetro", status: "archive", stars: 6,
      solves: "India's metro networks, each locked inside its own operator's app.",
      what: "One gateway to DMRC, CMRL, KMRL and MMRDA networks: maps that load " +
            "in under a second, a Ctrl+P command palette over every station, and " +
            "deep links down to a single stop.",
      stack: ["vanilla JS", "SVG", "Vite"],
      notes: [
        "Its own SVG rendering engine, with Hermite interpolation for the curves " +
        "and no framework anywhere. The network diagram at the top of this page " +
        "is built the same way, for the same reasons.",
        "Geographic projections for Chennai and Pune, schematic layouts for " +
        "Delhi and Mumbai, because those networks are too tangled to draw true.",
        "No tracking and no external API calls.",
      ],
      links: [],
      repo: "https://github.com/srivathsanvenkateswaran/OneMetro",
    },

    /* ---------------- Amber Line ---------------- */
    {
      id: "misal", line: "amber", x: 110, y: 490,
      name: "Misal", status: "live",
      solves: "Net worth scattered across brokers, fund houses, an employer equity account and a couple of exchanges.",
      what: "A local-first desktop app that consolidates Indian brokers, mutual " +
            "funds, US employer equity and crypto into one honest view. No " +
            "account, no cloud, no server: the data stays on the machine.",
      stack: ["Tauri", "TypeScript", "Vite"],
      notes: [
        "Named after the dish: many components prepared separately, assembled " +
        "into one bowl, each keeping its own character.",
        "Its README opens by telling you not to trust its numbers yet, which is " +
        "the correct thing for it to say.",
      ],
      links: [],
      repo: "https://github.com/srivathsanvenkateswaran/Misal",
    },
    {
      id: "burrito", line: "amber", x: 240, y: 490,
      name: "Burrito", status: "live",
      solves: "The paid crypto-analytics platforms cost more than the insight is worth.",
      what: "A self-updating quantitative market site: 98 charts of risk, cycles, " +
            "on-chain data, breadth, derivatives and US macro across 27 assets, " +
            "recomputed daily.",
      stack: ["Next.js", "Python", "free data sources"],
      scale: [
        ["charts", "98"],
        ["assets", "27 coins plus macro"],
        ["running cost", "$0 per month"],
      ],
      notes: [
        "Its own risk model: an asymmetric quadratic quantile regression fan " +
        "fitted to each asset's full history, independently implemented. It " +
        "scores the 2013, 2017 and 2021 tops at 0.98 to 0.99, and the 2022 " +
        "bottom at 0.01.",
        "The site is read-only and renders precomputed series, so API rate " +
        "limits never reach a visitor.",
      ],
      links: [{ label: "burrito-finance.vercel.app", href: "https://burrito-finance.vercel.app" }],
      repo: "https://github.com/srivathsanvenkateswaran/Burrito",
    },
    {
      id: "cryptopm", line: "amber", x: 370, y: 490,
      name: "CryptoPortfolioManager", short: "Crypto PM", status: "archive", stars: 3,
      solves: "Tracking a crypto portfolio without handing it to a website.",
      what: "A command-line portfolio tracker. Small, old, and still the thing " +
            "I reach for.",
      stack: ["Python", "CLI"],
      links: [],
      repo: "https://github.com/srivathsanvenkateswaran/CryptoPortfolioManager",
    },

    /* ---------------- Magenta Line ---------------- */
    {
      id: "bidwicket", line: "magenta", x: 830, y: 400,
      name: "BidWicket", status: "private",
      solves: "A group of friends who wanted an IPL auction of their own.",
      what: "A live player auction everyone bids in from their phone: the timer " +
            "resets on every bid and the hammer falls when it hits zero. Then a " +
            "season-long fantasy league on top, so one auction has to be lived " +
            "with for months.",
      stack: ["Fastify", "Socket.IO", "SQLite", "React", "Vite"],
      notes: [
        "An npm workspaces monorepo that builds down to a single Node process " +
        "serving the API, the websocket auction feed and the static client.",
      ],
      links: [],
      repo: null,
    },
    {
      id: "jimvathsan", line: "magenta", x: 960, y: 400,
      name: "Jimvathsan", status: "live",
      solves: "Logging a workout should take less time than the set did.",
      what: "A training tracker that takes plain-text notation, " +
            "'Chest press @15 1x15 1x13', and updates the dashboard, the per-day, " +
            "per-exercise and per-muscle views instantly. Sessions, sets, tension, " +
            "bodyweight, steps and measurements.",
      stack: ["Next.js", "Drizzle", "Neon", "PGlite"],
      links: [{ label: "jimvathsan.vercel.app", href: "https://jimvathsan.vercel.app" }],
      repo: null,
    },
  ],

  /* ---------------- career trunk ---------------- */
  career: [
    { role: "Software Development Engineer 2", org: "SILQ",
      when: "March 2026 to now", where: "", current: true,
      note: "Technology for global trade: tooling for factories and supply chains " +
            "that makes quality on the ground measurable and comparable." },
    { role: "Software Engineer 2", org: "Caterpillar", when: "May 2025 to March 2026",
      where: "Chennai",
      note: "Senior scope on the same search platform, and the last stop on a run " +
            "that started as a six-month internship three years earlier." },
    { role: "Software Engineer 1", org: "Caterpillar", when: "July 2023 to April 2025",
      where: "Chennai",
      note: "Enterprise search: Apache Solr, Lucidworks Fusion, and NLP and ML " +
            "pipelines that helped thousands of engineers and dealers find the " +
            "right part, document or answer." },
    { role: "Software Engineering Intern", org: "Caterpillar",
      when: "January 2023 to June 2023", where: "Chennai",
      note: "Six months on the search platform team, overlapping the last " +
            "semester of college. It turned into the next three years." },
    { role: "Social media manager", org: "Freelance and part-time",
      when: "2019 to 2023", where: "",
      note: "Strategy, design and content calendars for pages and brands. Where I " +
            "learned that building the thing is only half of it." },
    { role: "Intern", org: "Zoho Corporation", when: "July 2022", where: "Chennai",
      note: "A summer inside one of the few Indian companies that builds its " +
            "whole stack itself." },
    { role: "B.E.", org: "Thiagarajar College of Engineering", when: "2019 to 2023",
      where: "Madurai",
      note: "Where most of the older public repos began: Android apps, Discord " +
            "bots, scrapers, and an IVRS helpline for people without smartphones." },
  ],

  links: [
    { label: "GitHub", href: "https://github.com/srivathsanvenkateswaran" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/srivathsanvenkateswaran/" },
    { label: "Blog", href: "https://srivathsan.hashnode.dev" },
    { label: "Email", href: "mailto:srivathsanvenkateswaran@gmail.com" },
  ],
};
