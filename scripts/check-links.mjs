#!/usr/bin/env node
/**
 * Verify the network data before it goes anywhere public.
 *
 *   node scripts/check-links.mjs           structure + link reachability
 *   node scripts/check-links.mjs --offline structure only, no network calls
 *
 * The rule that matters most is the repo one: a calling card that links a 404
 * is worse than one that says "private". Eleven of these projects are private
 * repositories, so every `repo` field has to be proved publicly readable.
 */

import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const offline = process.argv.includes("--offline");

/* data.js and india.js assign onto `window`, so give them one. */
const sandbox = { window: {} };
for (const file of ["data.js", "india.js"]) {
  const src = readFileSync(join(root, file), "utf8");
  new Function("window", src)(sandbox.window);
}
const work = sandbox.window.PORTFOLIO;
const india = sandbox.window.INDIA;

const problems = [];
const fail = (m) => problems.push(m);

/**
 * Hosts confirmed to serve HIS work, checked against `vercel project ls` and by
 * reading each page's title.
 *
 * This list exists because a 200 proves a page is there, not that it is his.
 * Three links passed the reachability check while pointing at strangers'
 * projects: jcomm.vercel.app serves an unrelated "J-COMM", misal.vercel.app
 * serves something called "Covid ID", and travelport.vercel.app is a Pages
 * Router app that is not in his Vercel account at all. Adding a host here is a
 * deliberate act: confirm the deployment is his before you do it.
 */
const OWNED = new Set([
  "getsquadfit.com",
  "vyasadithya.com",
  "mastersmentor.srivathsanvenkateswaran.workers.dev",
  "tarvo-five.vercel.app",
  "jcomm-one.vercel.app",
  "varalakshmi-tiffins.vercel.app",
  "one-rail.vercel.app",
  "burrito-finance.vercel.app",
  "jimvathsan.vercel.app",
]);

/* Third-party profiles, which are meant to point away from him. */
const OFFSITE = new Set(["github.com", "www.linkedin.com", "srivathsan.hashnode.dev"]);

/* ---------- structure ---------- */
const REQUIRED = ["id", "group", "name", "status", "outcome", "solves", "what"];
const STATUSES = new Set(["running", "live", "private", "archive"]);
const groupIds = new Set(work.groups.map((g) => g.id));
const ids = new Set();

for (const s of work.projects) {
  const where = s.name || s.id || "(unnamed)";
  for (const f of REQUIRED) {
    if (s[f] === undefined || s[f] === null || s[f] === "") fail(`${where}: missing "${f}"`);
  }
  if (ids.has(s.id)) fail(`${where}: duplicate id "${s.id}"`);
  ids.add(s.id);
  if (!groupIds.has(s.group)) fail(`${where}: unknown group "${s.group}"`);
  if (!STATUSES.has(s.status)) fail(`${where}: unknown status "${s.status}"`);

  const links = s.links || [];
  if (s.status === "running" && !links.length && !(s.notes || []).length) {
    fail(`${where}: claims "running" with no link and nothing explaining why not`);
  }
  if (s.status === "private" && links.length) {
    fail(`${where}: marked "private" but carries a link`);
  }
}

for (const g of work.stacks) {
  for (const m of g.members) {
    if (!ids.has(m)) fail(`shared stack "${g.id}" lists unknown project "${m}"`);
  }
  if (g.members.length < 2) fail(`shared stack "${g.id}" needs at least two members`);
}
for (const g of work.groups) {
  if (!work.projects.some((s) => s.group === g.id)) fail(`group "${g.id}" has no projects`);
}

/* The evidence strip quotes these, so they must match what was baked. */
if (india.stats.cities !== india.cities.length) {
  fail(`stats.cities (${india.stats.cities}) disagrees with the city list (${india.cities.length})`);
}
if (india.stats.trips !== india.trips.length) {
  fail(`stats.trips (${india.stats.trips}) disagrees with the trip list (${india.trips.length})`);
}

/* ---------- reachability ---------- */
async function head(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    return res.status;
  } catch {
    return 0;
  }
}

async function isPublicRepo(url) {
  // Unauthenticated ls-remote: succeeds for public repos, fails for private.
  // Deliberately not the gh CLI, which is signed in to the wrong account.
  try {
    await run("git", ["ls-remote", url.replace(/\/$/, "") + ".git", "HEAD"], {
      timeout: 25000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "true" },
    });
    return true;
  } catch {
    return false;
  }
}

if (!offline) {
  const checks = [];
  for (const s of work.projects) {
    for (const l of s.links || []) {
      if (!l.href.startsWith("http")) continue;
      const host = new URL(l.href).hostname;
      if (!OWNED.has(host)) {
        fail(`${s.name}: ${host} is not on the confirmed-owned list. A 200 does ` +
             `not mean the deployment is his. Verify it, then add it to OWNED.`);
        continue;
      }
      checks.push(
        head(l.href).then((code) => {
          if (code !== 200) fail(`${s.name}: ${l.href} returned ${code || "no response"}`);
        })
      );
    }
    if (s.repo) {
      checks.push(
        isPublicRepo(s.repo).then((ok) => {
          if (!ok) fail(`${s.name}: links ${s.repo}, which is NOT publicly readable`);
        })
      );
    }
  }
  for (const l of work.links) {
    if (l.href.startsWith("http")) {
      const host = new URL(l.href).hostname;
      if (!OFFSITE.has(host)) fail(`profile link points at unexpected host ${host}`);
      checks.push(
        head(l.href).then((code) => {
          // Hashnode answers 403 and LinkedIn answers 999 to unattended
          // requests. Both mean "the page is there, stop scraping me".
          if (![200, 403, 999].includes(code)) {
            fail(`profile link ${l.href} returned ${code || "no response"}`);
          }
        })
      );
    }
  }
  await Promise.all(checks);
}

/* ---------- report ---------- */
const running = work.projects.filter((s) => s.status === "running").length;
const linked = work.projects.filter((s) => (s.links || []).length).length;
const repos = work.projects.filter((s) => s.repo).length;

console.log(
  `${work.projects.length} projects · ${running} running · ${linked} with a live link · ` +
  `${repos} with a public repo`
);
console.log(
  `atlas: ${india.stats.trips} trips · ${india.stats.states} states/UTs · ` +
  `${india.stats.cities} cities · ${india.stats.days} days`
);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.error("  ✗ " + p));
  process.exit(1);
}
console.log(offline ? "\nStructure OK (offline)." : "\nAll checks passed.");
