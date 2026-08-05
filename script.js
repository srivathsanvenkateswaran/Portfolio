const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Load-in reveal for hero elements
document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.querySelectorAll(".load-reveal").forEach((el) => el.classList.add("in"));
  });
});

// Scroll-triggered reveals
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".observe").forEach((el) => observer.observe(el));

// Departures board rows scroll to their section
document.querySelectorAll(".dep-row").forEach((row) => {
  row.addEventListener("click", () => {
    const target = document.querySelector(row.dataset.target);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Live IST clock on the departures board
const clock = document.getElementById("ist-clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const tick = () => { clock.textContent = `${fmt.format(new Date())} IST`; };
  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------------------------------
   The route spine. Track behind you fills in with the line colour and
   each station lights up as the train passes it — "you are here",
   drawn as a network diagram rather than a progress bar.
   ------------------------------------------------------------------ */
const rails = [...document.querySelectorAll(".line-section")].map((section) => ({
  section,
  fill: section.querySelector(".rail i"),
}));
const stations = [...document.querySelectorAll(".station-marker, .stop-tick")];

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

function drawRoute() {
  const here = window.innerHeight * 0.5;

  rails.forEach(({ section, fill }) => {
    if (!fill) return;
    const box = section.getBoundingClientRect();
    fill.style.setProperty("--travel", clamp01((here - box.top) / box.height).toFixed(4));
  });

  stations.forEach((station) => {
    station.classList.toggle("passed", station.getBoundingClientRect().top < here);
  });
}

let queued = false;
function scheduleDraw() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; drawRoute(); });
}

if (reduceMotion.matches) {
  // Show the whole route at once instead of animating a train along it
  rails.forEach(({ fill }) => fill && fill.style.setProperty("--travel", "1"));
  stations.forEach((station) => station.classList.add("passed"));
} else if (rails.length) {
  drawRoute();
  addEventListener("scroll", scheduleDraw, { passive: true });
  addEventListener("resize", scheduleDraw);
}

// Highlight the nav link for the section in view
const navLinks = [...document.querySelectorAll(".line-nav a[data-line]")];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = navLinks.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-30% 0px -55% 0px" }
);
sections.forEach((s) => navObserver.observe(s));

// Night service toggle — follows the system until the user picks a side
const toggle = document.querySelector(".theme-toggle");
if (toggle) {
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const effectiveTheme = () =>
    document.documentElement.dataset.theme || (systemDark.matches ? "dark" : "light");

  const paintToggle = () => {
    const dark = effectiveTheme() === "dark";
    toggle.textContent = dark ? "☀" : "☾";
    toggle.setAttribute("aria-label", dark ? "Switch to day service" : "Switch to night service");
  };

  toggle.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    paintToggle();
  });

  systemDark.addEventListener("change", paintToggle);
  paintToggle();
}

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
