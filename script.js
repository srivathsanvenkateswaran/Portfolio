/* ============================================================
   Behaviour: render, then reveal, disclose, and follow scroll.
   Everything here degrades to a readable page if it does not run.
   ============================================================ */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof window.RENDER === "function") window.RENDER();

  /* ---------- Header state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const observed = document.querySelectorAll(".observe");
  if (reduced || !("IntersectionObserver" in window)) {
    observed.forEach((n) => n.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    observed.forEach((n) => io.observe(n));
  }

  /* ---------- Card disclosure ----------
     One card can be open at a time inside a group is tempting, but people
     compare projects side by side, so any number stay open. */
  function setOpen(card, open) {
    const btn = card.querySelector(".card-top");
    const panel = card.querySelector(".card-panel");
    card.dataset.open = open ? "true" : "false";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.querySelector(".card-more span").textContent = open ? "Close" : "Detail";
    if (open) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
  }

  document.querySelectorAll(".card").forEach((card) => {
    const btn = card.querySelector(".card-top");
    btn.addEventListener("click", () => {
      setOpen(card, card.dataset.open !== "true");
    });
  });

  /* Deep link straight to one project: /#squadfit opens its card. */
  function openFromHash() {
    const id = decodeURIComponent(location.hash || "").replace(/^#/, "");
    if (!id) return;
    const card = document.querySelector('.card[data-project="' + CSS.escape(id) + '"]');
    if (!card) return;
    setOpen(card, true);
    card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* ---------- Nav highlight ---------- */
  const navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".site-nav a[href^='#']")
  );
  const targets = navLinks
    .map((a) => ({ link: a, section: document.querySelector(a.getAttribute("href")) }))
    .filter((t) => t.section);

  if ("IntersectionObserver" in window && targets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const hit = targets.find((t) => t.section === e.target);
          if (!hit) return;
          navLinks.forEach((a) => a.classList.remove("is-active"));
          hit.link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => spy.observe(t.section));
  }
})();
