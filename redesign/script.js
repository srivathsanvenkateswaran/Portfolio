/* ============================================================
   Behaviour: night service, scroll reveals, the route spine
   that fills in behind you, and opening a station sheet.
   ============================================================ */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- render everything from the data files ---------- */
  if (typeof window.RENDER === "function") window.RENDER();

  /* ---------- night service ---------- */
  const toggle = document.querySelector(".theme-toggle");
  const nightNow = () => {
    const set = document.documentElement.dataset.theme;
    if (set) return set === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const paintToggle = () => {
    if (!toggle) return;
    const dark = nightNow();
    toggle.textContent = dark ? "☀" : "☾";
    toggle.setAttribute("aria-label", dark ? "Switch to day service" : "Switch to night service");
  };
  paintToggle();
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = nightNow() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      paintToggle();
    });
  }

  /* ---------- scroll reveals ---------- */
  const observed = document.querySelectorAll(".observe");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    observed.forEach((n) => io.observe(n));
  } else {
    observed.forEach((n) => n.classList.add("is-in"));
  }

  /* ---------- station sheets ---------- */
  function setOpen(station, open) {
    const btn = station.querySelector(".st-summary");
    const panel = station.querySelector(".st-panel");
    if (!btn || !panel) return;
    station.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    const chevron = btn.querySelector(".st-chevron");
    if (chevron) chevron.textContent = open ? "−" : "+";
    if (open) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
    syncMap();
  }

  document.querySelectorAll(".station").forEach((station) => {
    const btn = station.querySelector(".st-summary");
    if (!btn) return;
    btn.addEventListener("click", () => {
      setOpen(station, !station.classList.contains("is-open"));
    });
  });

  /* Opening from the map, or from a link someone shared. */
  function openFromHash() {
    const hash = decodeURIComponent(location.hash || "").replace(/^#st-/, "");
    if (!hash) return;
    const station = document.querySelector('.station[data-station="' + CSS.escape(hash) + '"]');
    if (!station) return;
    setOpen(station, true);
    station.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    const btn = station.querySelector(".st-summary");
    if (btn) btn.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", openFromHash);
  if (location.hash) setTimeout(openFromHash, 60);

  /* Mark the open stations on the schematic so the two stay in step. */
  function syncMap() {
    document.querySelectorAll("#network-svg .net-station").forEach((n) => {
      const id = n.getAttribute("data-station");
      const row = document.querySelector('.station[data-station="' + CSS.escape(id) + '"]');
      n.classList.toggle("is-open", !!row && row.classList.contains("is-open"));
    });
  }

  /* Hovering a line on the schematic dims the others. */
  const netSvg = document.getElementById("network-svg");
  if (netSvg) {
    netSvg.addEventListener("mouseover", (e) => {
      const st = e.target.closest("[data-line]");
      netSvg.setAttribute("data-focus", st ? st.getAttribute("data-line") : "");
    });
    netSvg.addEventListener("mouseleave", () => netSvg.removeAttribute("data-focus"));
  }

  /* ---------- the route spine ---------- */
  const rails = Array.prototype.map.call(
    document.querySelectorAll(".line-section"),
    (section) => ({ section: section, fill: section.querySelector(".rail i") })
  ).filter((r) => r.fill);

  let ticking = false;
  function paintRails() {
    ticking = false;
    const mid = window.innerHeight * 0.62;
    rails.forEach((r) => {
      const box = r.section.getBoundingClientRect();
      let progress = (mid - box.top) / Math.max(box.height, 1);
      progress = Math.max(0, Math.min(1, progress));
      r.fill.style.transform = "scaleY(" + progress.toFixed(4) + ")";
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paintRails);
  }
  if (rails.length) {
    if (reduced) {
      rails.forEach((r) => (r.fill.style.transform = "scaleY(1)"));
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      paintRails();
    }
  }

  /* ---------- header nav: light the line you are in ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".line-nav a[href^='#']"));
  const targets = navLinks
    .map((a) => ({ a: a, section: document.querySelector(a.getAttribute("href")) }))
    .filter((t) => t.section);

  if (targets.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const hit = targets.find((t) => t.section === e.target);
          if (hit) hit.a.classList.toggle("is-here", e.isIntersecting);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    targets.forEach((t) => spy.observe(t.section));
  }
})();
