/* ============================================================
   Renderers. Everything on this page is drawn from data.js and
   india.js: the schematic network, the station sheets, the
   career trunk and the map of India.

   No framework, and the SVG is assembled with the DOM rather
   than with innerHTML so that nothing here can be injected into.
   ============================================================ */

(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const net = window.NETWORK;
  const india = window.INDIA;

  const el = (tag, attrs, kids) => {
    const node = document.createElement(tag);
    apply(node, attrs, kids);
    return node;
  };
  const svg = (tag, attrs, kids) => {
    const node = document.createElementNS(NS, tag);
    apply(node, attrs, kids);
    return node;
  };
  function apply(node, attrs, kids) {
    for (const k in attrs || {}) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.setAttribute("class", attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach((c) => c && node.appendChild(c));
  }

  const byId = {};
  net.stations.forEach((s) => (byId[s.id] = s));

  const groupsFor = (id) => net.interchanges.filter((g) => g.members.includes(id));

  const STATUS = {
    running: { word: "Running", note: "in real use by someone who is not me" },
    live: { word: "Live", note: "deployed and reachable" },
    private: { word: "Private build", note: "built and working, not public" },
    archive: { word: "Archive", note: "older public work, still standing" },
  };

  /* ----------------------------------------------------------
     1. The schematic network
     ---------------------------------------------------------- */
  function drawNetwork() {
    const root = document.getElementById("network-svg");
    if (!root) return;

    const lineGroup = svg("g", { class: "net-lines" });
    net.lines.forEach((line) => {
      lineGroup.appendChild(
        svg("path", { d: line.path, class: "net-line", "data-line": line.id })
      );
    });
    root.appendChild(lineGroup);

    // Out-of-station interchange ties, drawn between grid neighbours.
    const tieGroup = svg("g", { class: "net-ties" });
    net.ties.forEach(([a, b]) => {
      const s = byId[a], t = byId[b];
      if (!s || !t) return;
      tieGroup.appendChild(
        svg("line", { x1: s.x, y1: s.y, x2: t.x, y2: t.y, class: "net-tie" })
      );
    });
    root.appendChild(tieGroup);

    const stationGroup = svg("g", { class: "net-stations" });
    net.stations.forEach((s) => {
      const isChange = groupsFor(s.id).length > 0;
      const link = svg("a", {
        class: "net-station" + (isChange ? " is-change" : "") +
               (s.status === "private" ? " is-private" : "") +
               (s.status === "archive" ? " is-archive" : ""),
        "data-line": s.line,
        "data-station": s.id,
      });
      link.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#st-" + s.id);
      link.setAttribute("href", "#st-" + s.id);

      if (isChange) {
        link.appendChild(svg("circle", { cx: s.x, cy: s.y, r: 11, class: "net-dot-outer" }));
        link.appendChild(svg("circle", { cx: s.x, cy: s.y, r: 5.5, class: "net-dot-inner" }));
      } else {
        link.appendChild(svg("circle", { cx: s.x, cy: s.y, r: 7.5, class: "net-dot" }));
      }

      const label = svg("text", {
        x: s.x, y: s.y, dx: 15, dy: -9,
        transform: `rotate(-40 ${s.x} ${s.y})`,
        class: "net-label",
        text: s.short || s.name,
      });
      link.appendChild(label);

      // Status rides on the station symbol, the way a real map marks a stop
      // that is built but not open. A text flag here collided with the bends.

      link.appendChild(svg("title", { text: `${s.name}: ${STATUS[s.status].word}` }));
      stationGroup.appendChild(link);
    });
    root.appendChild(stationGroup);

    // Line keys, placed at the start of each run.
    const keyGroup = svg("g", { class: "net-keys" });
    net.lines.forEach((line) => {
      const first = net.stations.find((s) => s.line === line.id);
      if (!first) return;
      keyGroup.appendChild(
        svg("text", {
          x: first.x - 22, y: first.y + 5,
          class: "net-key", "data-line": line.id,
          "text-anchor": "end",
          text: line.name.replace(" Line", ""),
        })
      );
    });
    root.appendChild(keyGroup);
  }

  /* ----------------------------------------------------------
     2. Lines and their station sheets
     ---------------------------------------------------------- */
  function drawLines() {
    const host = document.getElementById("lines");
    if (!host) return;

    net.lines.forEach((line) => {
      const stations = net.stations.filter((s) => s.line === line.id);
      const running = stations.filter((s) => s.status === "running").length;

      const head = el("div", { class: "line-head" }, [
        el("p", { class: "line-name", "data-line": line.id, text: line.name }),
        el("h3", { text: line.claim }),
        el("p", { class: "line-lede", text: line.lede }),
        el("p", {
          class: "line-count",
          text:
            stations.length +
            (stations.length === 1 ? " station" : " stations") +
            (running ? " · " + running + " in real use" : ""),
        }),
      ]);

      const list = el("ol", { class: "stations" });
      stations.forEach((s) => list.appendChild(stationRow(s)));

      host.appendChild(
        el("section", { class: "line-section observe", id: line.id, "data-line": line.id }, [
          el("div", { class: "rail", "aria-hidden": "true" }, [el("i", {})]),
          el("div", { class: "line-body" }, [head, list]),
        ])
      );
    });
  }

  function stationRow(s) {
    const status = STATUS[s.status];
    const panelId = "panel-" + s.id;

    const summary = el("button", {
      class: "st-summary",
      type: "button",
      id: "st-" + s.id,
      "aria-expanded": "false",
      "aria-controls": panelId,
    }, [
      el("span", { class: "st-tick", "aria-hidden": "true" }),
      el("span", { class: "st-name", text: s.name }),
      el("span", { class: "st-solves", text: s.solves }),
      el("span", { class: "st-status", "data-status": s.status }, [
        el("span", { class: "st-pulse", "aria-hidden": "true" }),
        el("span", { text: status.word }),
      ]),
      el("span", { class: "st-chevron", "aria-hidden": "true", text: "+" }),
    ]);

    const rows = [];
    const add = (k, v) => rows.push(
      el("div", { class: "sheet-row" }, [
        el("dt", { text: k }),
        el("dd", typeof v === "string" ? { text: v } : null, typeof v === "string" ? null : v),
      ])
    );

    add("status", status.word + ", " + status.note + (s.version ? " · " + s.version : ""));
    add("what", s.what);
    if (s.surface) add("surface", s.surface);
    if (s.stack) {
      add("stack", s.stack.map((t) => el("span", { class: "chip", text: t })));
    }
    if (s.scale) {
      add("measured", [
        el("table", { class: "scale" }, [
          el("tbody", {}, s.scale.map(([k, v]) =>
            el("tr", {}, [el("th", { text: k }), el("td", { text: v })])
          )),
        ]),
      ]);
    }
    if (s.notes) {
      add("notes", [el("ul", { class: "sheet-notes" }, s.notes.map((n) => el("li", { text: n })))]);
    }

    const changes = groupsFor(s.id);
    if (changes.length) {
      add("interchange", changes.map((g) =>
        el("span", { class: "change", title: g.members.map((m) => byId[m].name).join(", ") }, [
          el("span", { class: "change-ring", "aria-hidden": "true" }),
          el("span", { text: g.label }),
        ])
      ));
    }

    const linkNodes = [];
    (s.links || []).forEach((l) =>
      linkNodes.push(el("a", { class: "st-link", href: l.href, target: "_blank", rel: "noopener", text: l.label + " ↗" }))
    );
    if (s.repo) {
      linkNodes.push(el("a", {
        class: "st-link is-repo", href: s.repo, target: "_blank", rel: "noopener",
        text: "source" + (s.stars ? " · " + s.stars + "★" : "") + " ↗",
      }));
    } else {
      linkNodes.push(el("span", { class: "st-nolink", text: "source private" }));
    }
    if (!(s.links || []).length) {
      linkNodes.unshift(el("span", {
        class: "st-nolink",
        text: s.status === "private" ? "not deployed" : "no public URL",
      }));
    }
    add("links", linkNodes);

    const panel = el("div", { class: "st-panel", id: panelId, hidden: "" }, [
      el("dl", { class: "sheet" }, rows),
    ]);

    return el("li", { class: "station", "data-station": s.id }, [summary, panel]);
  }

  /* ----------------------------------------------------------
     3. Career trunk
     ---------------------------------------------------------- */
  function drawTrunk() {
    const host = document.getElementById("trunk");
    if (!host) return;
    net.career.forEach((c) => {
      host.appendChild(
        el("li", { class: "stop" + (c.current ? " is-current" : "") }, [
          el("div", { class: "stop-mark", "aria-hidden": "true" }),
          el("div", { class: "stop-body" }, [
            el("h3", {}, [
              el("span", { class: "stop-role", text: c.role }),
              el("span", { class: "stop-org", text: c.org }),
            ]),
            el("p", { class: "stop-when", text: c.when + (c.where ? " · " + c.where : "") }),
            el("p", { class: "stop-note", text: c.note }),
          ]),
        ])
      );
    });
  }

  /* ----------------------------------------------------------
     4. Evidence strip
     ---------------------------------------------------------- */
  function drawStats() {
    const host = document.getElementById("stat-row");
    if (!host) return;
    const st = india.stats;
    const running = net.stations.filter((s) => s.status === "running").length;
    const stats = [
      [net.stations.length, "shipped"],
      [running, "in real use by someone else"],
      ["v2.70.0", "SquadFit, today"],
      [st.states, "states and union territories"],
      [st.cities, "cities"],
      [st.days, "days on the road"],
      [3, "languages shipped in"],
    ];
    stats.forEach(([n, label]) => {
      host.appendChild(
        el("div", { class: "stat" }, [
          el("dt", { class: "stat-n", text: String(n) }),
          el("dd", { class: "stat-l", text: label }),
        ])
      );
    });
  }

  function drawLinks() {
    [["hero-links", ""], ["terminus-links", ""]].forEach(([id]) => {
      const host = document.getElementById(id);
      if (!host) return;
      net.links.forEach((l) => {
        host.appendChild(
          el("li", {}, [el("a", {
            href: l.href,
            target: l.href.startsWith("mailto:") ? null : "_blank",
            rel: l.href.startsWith("mailto:") ? null : "noopener",
            text: l.label,
          })])
        );
      });
    });
  }

  /* ----------------------------------------------------------
     5. The real map
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

    const citiesG = svg("g", { class: "atlas-cities", id: "atlas-cities" });
    root.appendChild(citiesG);

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
    const years = ["all"].concat(Object.keys(india.stats.perYear));
    years.forEach((y) => {
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
    drawNetwork();
    drawLines();
    drawTrunk();
    drawStats();
    drawLinks();
    drawAtlas();
    drawYearBars();
  };
})();
