/* ============================================================
   Draws the page from data.js and india.js.

   index.html carries no project copy: every card, role, number
   and dot below comes out of a data file, so correcting a fact
   means editing one line in one place.
   ============================================================ */

(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const work = window.PORTFOLIO;
  const india = window.INDIA;

  const el = (tag, attrs, kids) => apply(document.createElement(tag), attrs, kids);
  const svg = (tag, attrs, kids) => apply(document.createElementNS(NS, tag), attrs, kids);

  function apply(node, attrs, kids) {
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v === null || v === undefined) continue;
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    (kids || []).forEach((c) => node.appendChild(c));
    return node;
  }

  const byId = {};
  (work.projects || []).forEach((p) => { byId[p.id] = p; });

  const stacksFor = (id) => work.stacks.filter((g) => g.members.includes(id));

  /* Status, in plain English rather than in the vocabulary the data uses.
     `isLive` marks the two states worth colouring: someone else is using it,
     or you can go and look at it right now. */
  const STATUS = {
    running: { text: "In real use", isLive: true },
    live:    { text: "Deployed", isLive: true },
    private: { text: "Built, not deployed", isLive: false },
    archive: { text: "Archive", isLive: false },
  };

  const GROUP_COLOR = {
    business: "var(--rose)",
    transit:  "var(--teal)",
    money:    "var(--ochre)",
    personal: "var(--olive)",
  };

  const external = (href) => !href.startsWith("mailto:");

  /* ----------------------------------------------------------
     1. Work — groups of project cards
     ---------------------------------------------------------- */
  function drawGroups() {
    const host = document.getElementById("groups");
    if (!host) return;

    work.groups.forEach((g) => {
      const projects = work.projects.filter((p) => p.group === g.id);

      const section = el("section", { class: "group observe" });
      section.style.setProperty("--group-color", GROUP_COLOR[g.id] || "var(--accent)");

      /* The counts do work the prose used to: how many, and how many of them
         somebody else is actually using. */
      const inUse = projects.filter((p) => STATUS[p.status].isLive).length;

      section.appendChild(
        el("div", { class: "group-head" }, [
          el("div", { class: "group-meta" }, [
            el("p", { class: "section-label", text: g.label }),
            el("span", { class: "group-count", text: projects.length + " projects" }),
            /* "deployed", not "live": this counts running + live, and the hero
               already claims a smaller number for what someone else is using. */
            inUse ? el("span", { class: "group-count is-live", text: inUse + " deployed" }) : null,
          ].filter(Boolean)),
          el("h3", { text: g.name }),
          el("p", { class: "lede", text: g.lede }),
        ])
      );

      const grid = el("div", { class: "cards" });
      projects.forEach((p) => grid.appendChild(card(p)));
      section.appendChild(grid);

      host.appendChild(section);
    });
  }

  function card(p) {
    const status = STATUS[p.status] || { text: p.status, isLive: false };
    const panelId = "panel-" + p.id;

    const top = el("button", {
      class: "card-top",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": panelId,
    }, [
      el("div", { class: "card-title-row" }, [
        el("span", { class: "card-name", text: p.name }),
        el("span", {
          class: "card-status" + (status.isLive ? " is-live" : ""),
        }, [
          el("i", { class: "dot", "aria-hidden": "true" }),
          el("span", { text: status.text }),
        ]),
      ]),
      el("p", { class: "card-outcome", text: p.outcome }),
      el("div", { class: "chips" },
        (p.stack || []).map((s) => el("span", { class: "chip", text: s }))),
      el("span", { class: "card-more" }, [
        el("span", { text: "Detail" }),
        el("span", { class: "card-chevron", "aria-hidden": "true" }),
      ]),
    ]);

    const fields = [];
    const field = (k, v) => fields.push(
      el("div", {}, [
        el("p", { class: "field-k", text: k }),
        el("p", { class: "field-v", text: v }),
      ])
    );

    if (p.what) field("What it is", p.what);
    if (p.solves) field("The problem", p.solves);
    if (p.replaces) field("What it replaces", p.replaces);
    if (p.surface) field("How it ships", p.surface);
    if (p.version) field("Version", p.version);

    if (p.scale) {
      fields.push(
        el("div", {}, [
          el("p", { class: "field-k", text: "Measured" }),
          el("div", { class: "field-v" },
            p.scale.map(([k, v]) => el("div", { class: "scale-row" }, [
              el("span", { text: k }),
              el("b", { text: v }),
            ]))),
        ])
      );
    }

    if (p.notes && p.notes.length) {
      fields.push(
        el("div", {}, [
          el("p", { class: "field-k", text: "Notes" }),
          el("ul", { class: "field-v" },
            p.notes.map((n) => el("li", { text: n }))),
        ])
      );
    }

    const shared = stacksFor(p.id);
    if (shared.length) {
      field("Shares a stack", shared.map((g) => {
        const others = g.members.filter((m) => m !== p.id).map((m) => byId[m].name);
        return g.label + " — also " + others.join(", ");
      }).join(". "));
    }

    const links = (p.links || []).map((l) => el("a", {
      href: l.href,
      target: external(l.href) ? "_blank" : null,
      rel: external(l.href) ? "noopener" : null,
      text: l.label,
    }));
    if (p.repo) {
      links.push(el("a", {
        href: p.repo, target: "_blank", rel: "noopener", text: "Source",
      }));
    }
    if (links.length) fields.push(el("div", { class: "card-links" }, links));

    const panel = el("div", { class: "card-panel", id: panelId, hidden: "" }, fields);

    return el("article", {
      class: "panel card card-hover",
      "data-project": p.id,
      "data-open": "false",
    }, [top, panel]);
  }

  /* ----------------------------------------------------------
     2. Career
     ---------------------------------------------------------- */
  function drawTimeline() {
    const host = document.getElementById("timeline");
    if (!host) return;
    work.career.forEach((c) => {
      host.appendChild(
        el("li", { class: "role" + (c.current ? " is-current" : "") }, [
          /* Date and place are separate lines: joined with a "·" they wrapped
             mid-separator and left a dangling dot at the end of the line. */
          el("div", { class: "role-when" }, [
            el("span", { class: "role-date", text: c.when }),
            c.where ? el("span", { class: "role-where", text: c.where }) : null,
          ].filter(Boolean)),
          el("div", {}, [
            el("h3", { class: "role-title" }, [
              el("span", { text: c.role }),
              el("span", { class: "role-org", text: c.org }),
            ]),
            el("p", { class: "role-note", text: c.note }),
          ]),
        ])
      );
    });
  }

  /* ----------------------------------------------------------
     3. Evidence strip, links, footer
     ---------------------------------------------------------- */
  function drawStats() {
    const host = document.getElementById("stat-row");
    if (!host) return;
    const st = india.stats;
    const running = work.projects.filter((p) => p.status === "running").length;
    /* Velocity first: it is the strongest number here and the easiest to check.
       See scripts/velocity.sh for how the two build figures are counted. */
    [
      [13, "products"],
      ["1,765", "commits"],
      [running, "in real use"],
      [work.projects.length, "shipped"],
      [st.days, "days travelled"],
      [st.cities, "cities"],
      [st.states, "states & UTs"],
    ].forEach(([n, label]) => {
      host.appendChild(
        el("div", { class: "stat" }, [
          el("dt", { class: "stat-n", text: String(n) }),
          el("dd", { class: "stat-l", text: label }),
        ])
      );
    });
  }

  function drawActions() {
    const specs = [
      ["hero-actions", true],
      ["contact-actions", true],
    ];
    /* Email leads: it is the one thing the contact copy actually asks for. */
    const ordered = work.links.slice().sort(
      (a, b) => Number(b.href.startsWith("mailto:")) - Number(a.href.startsWith("mailto:"))
    );
    specs.forEach(([id]) => {
      const host = document.getElementById(id);
      if (!host) return;
      ordered.forEach((l) => {
        const isEmail = l.href.startsWith("mailto:");
        host.appendChild(el("a", {
          class: "button " + (isEmail ? "button-primary" : "button-secondary"),
          href: l.href,
          target: external(l.href) ? "_blank" : null,
          rel: external(l.href) ? "noopener" : null,
          text: l.label,
        }));
      });
    });
  }

  function drawFooter() {
    const host = document.getElementById("footer-meta");
    if (!host) return;
    host.textContent =
      work.projects.length + " shipped · " + india.stats.days + " days on the road · " +
      new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     4. The atlas

     Carried over unchanged in behaviour from the previous build:
     the label placement below was the fiddly part and it still
     earns its keep.
     ---------------------------------------------------------- */
  const atlas = { year: "all" };

  function citiesForYear(year) {
    if (year === "all") return null;
    const wanted = new Set();
    india.trips.forEach((t) => {
      if (String(t.year) === String(year)) t.cities.forEach((c) => wanted.add(c));
    });
    return wanted;
  }

  function drawAtlas() {
    const root = document.getElementById("atlas-svg");
    if (!root || !india) return;
    root.setAttribute("viewBox", india.viewBox);

    const statesG = svg("g", { class: "atlas-states" });
    india.states.forEach((s) => {
      statesG.appendChild(
        svg("path", {
          d: s.d,
          class: "atlas-state" + (s.v ? " is-visited" : ""),
          "data-state": s.n,
        }, [svg("title", { text: s.n })])
      );
    });
    root.appendChild(statesG);
    root.appendChild(svg("g", { class: "atlas-cities", id: "atlas-cities" }));

    paintCities();
    drawYearControls();
    drawAtlasStats();
  }

  function paintCities() {
    const host = document.getElementById("atlas-cities");
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);

    const filter = citiesForYear(atlas.year);
    const shown = india.cities.filter((c) => !filter || filter.has(c.n));
    const radius = (c) => 3 + Math.sqrt(c.d) * 1.15;

    shown.forEach((c) => {
      const r = radius(c);
      const g = svg("g", { class: "atlas-city" });
      g.appendChild(svg("circle", { cx: c.x, cy: c.y, r: r, class: "atlas-halo" }));
      g.appendChild(svg("circle", { cx: c.x, cy: c.y, r: Math.max(2.2, r - 2.4), class: "atlas-pin" }));
      g.appendChild(svg("title", {
        text: `${c.n}, ${c.s}: ${c.d} ${c.d === 1 ? "day" : "days"} across ${c.t} ${c.t === 1 ? "trip" : "trips"}`,
      }));
      host.appendChild(g);
    });

    /* Labels, biggest first, each taking the first free side. Bengaluru and
       Chennai sit close enough that a fixed right-hand offset overprinted them,
       and so did Delhi and Meerut. A label that fits nowhere is dropped: the
       dot and its tooltip still carry the place. */
    const CH = 6.35, LH = 13;
    /* Seed with every dot, so a label cannot be laid over a neighbouring city's
       marker. Testing labels only against other labels let Bengaluru's run
       straight through Chennai's dot. */
    const placed = shown.map((c) => {
      const r = radius(c) + 2;
      return { x: c.x - r, y: c.y - r, w: r * 2, h: r * 2 };
    });
    const clear = (b) => !placed.some((p) =>
      b.x < p.x + p.w && b.x + b.w > p.x && b.y < p.y + p.h && b.y + b.h > p.y);

    shown.slice().sort((a, b) => b.d - a.d).slice(0, 12).forEach((c) => {
      const r = radius(c);
      const w = c.n.length * CH;
      const sides = [
        { x: c.x + r + 5, y: c.y - LH / 2, anchor: "start", tx: c.x + r + 5, ty: c.y + 4 },
        { x: c.x - r - 5 - w, y: c.y - LH / 2, anchor: "end", tx: c.x - r - 5, ty: c.y + 4 },
        { x: c.x - w / 2, y: c.y - r - 6 - LH, anchor: "middle", tx: c.x, ty: c.y - r - 7 },
        { x: c.x - w / 2, y: c.y + r + 5, anchor: "middle", tx: c.x, ty: c.y + r + 15 },
      ];
      const spot = sides.find((s) => clear({ x: s.x, y: s.y, w: w, h: LH }));
      if (!spot) return;
      placed.push({ x: spot.x, y: spot.y, w: w, h: LH });
      host.appendChild(
        svg("text", { x: spot.tx, y: spot.ty, "text-anchor": spot.anchor, class: "atlas-label", text: c.n })
      );
    });
  }

  function drawYearControls() {
    const host = document.getElementById("atlas-controls");
    if (!host) return;
    ["all"].concat(Object.keys(india.stats.perYear)).forEach((y) => {
      const b = el("button", {
        type: "button",
        class: "year-btn" + (y === atlas.year ? " is-on" : ""),
        "data-year": y,
        "aria-pressed": y === atlas.year ? "true" : "false",
        text: y === "all" ? "All years" : y,
      });
      b.addEventListener("click", () => {
        atlas.year = y;
        host.querySelectorAll(".year-btn").forEach((o) => {
          const on = o.dataset.year === y;
          o.classList.toggle("is-on", on);
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        paintCities();
        drawAtlasStats();
      });
      host.appendChild(b);
    });
  }

  function drawAtlasStats() {
    const host = document.getElementById("atlas-stats");
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);

    let trips, days, cities, states;
    if (atlas.year === "all") {
      trips = india.stats.trips;
      days = india.stats.days;
      cities = india.stats.cities;
      states = india.stats.states;
    } else {
      const inYear = india.trips.filter((t) => String(t.year) === String(atlas.year));
      trips = inYear.length;
      days = inYear.reduce((a, t) => a + t.days, 0);
      const cs = new Set(), ss = new Set();
      inYear.forEach((t) => t.cities.forEach((c) => cs.add(c)));
      india.cities.forEach((c) => { if (cs.has(c.n)) ss.add(c.s); });
      cities = cs.size;
      states = ss.size;
    }

    [[trips, "trips"], [days, "days"], [states, "states and UTs"], [cities, "cities"]]
      .forEach(([n, l]) => {
        host.appendChild(
          el("div", { class: "astat" }, [
            el("dt", { class: "astat-n", text: String(n) }),
            el("dd", { class: "astat-l", text: l }),
          ])
        );
      });
  }

  function drawYearBars() {
    const host = document.getElementById("atlas-years");
    if (!host) return;
    const per = india.stats.perYear;
    const max = Math.max.apply(null, Object.values(per));
    host.appendChild(el("p", { class: "years-title", text: "Trips per year" }));
    Object.keys(per).forEach((y) => {
      host.appendChild(
        el("div", { class: "yearbar" }, [
          el("span", { class: "yearbar-y", text: y }),
          el("span", { class: "yearbar-track" }, [
            el("span", { class: "yearbar-fill", style: `width:${(per[y] / max) * 100}%` }),
          ]),
          el("span", { class: "yearbar-n", text: String(per[y]) }),
        ])
      );
    });
  }

  /* ---------------------------------------------------------- */
  window.RENDER = function () {
    drawGroups();
    drawTimeline();
    drawStats();
    drawActions();
    drawFooter();
    drawAtlas();
    drawYearBars();
  };
})();
