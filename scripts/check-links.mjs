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
  const src = readFileSync(join(root, "redesign", file), "utf8");
  new Function("window", src)(sandbox.window);
}
const net = sandbox.window.NETWORK;
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
const REQUIRED = ["id", "line", "x", "y", "name", "status", "outcome", "solves", "what"];
const STATUSES = new Set(["running", "live", "private", "archive"]);
const lineIds = new Set(net.lines.map((l) => l.id));
const ids = new Set();

for (const s of net.stations) {
  const where = s.name || s.id || "(unnamed)";
  for (const f of REQUIRED) {
    if (s[f] === undefined || s[f] === null || s[f] === "") fail(`${where}: missing "${f}"`);
  }
  if (ids.has(s.id)) fail(`${where}: duplicate id "${s.id}"`);
  ids.add(s.id);
  if (!lineIds.has(s.line)) fail(`${where}: unknown line "${s.line}"`);
  if (!STATUSES.has(s.status)) fail(`${where}: unknown status "${s.status}"`);

  const links = s.links || [];
  if (s.status === "running" && !links.length && !(s.notes || []).length) {
    fail(`${where}: claims "running" with no link and nothing explaining why not`);
  }
  if (s.status === "private" && links.length) {
    fail(`${where}: marked "private" but carries a link`);
  }
}

for (const [a, b] of net.ties) {
  if (!ids.has(a) || !ids.has(b)) fail(`tie ${a}-${b} points at a station that does not exist`);
}
for (const g of net.interchanges) {
  for (const m of g.members) {
    if (!ids.has(m)) fail(`interchange "${g.id}" lists unknown station "${m}"`);
  }
  if (g.members.length < 2) fail(`interchange "${g.id}" needs at least two members`);
}
for (const l of net.lines) {
  if (!net.stations.some((s) => s.line === l.id)) fail(`line "${l.id}" has no stations`);
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
  for (const s of net.stations) {
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
  for (const l of net.links) {
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
const running = net.stations.filter((s) => s.status === "running").length;
const linked = net.stations.filter((s) => (s.links || []).length).length;
const repos = net.stations.filter((s) => s.repo).length;

console.log(
  `${net.stations.length} stations · ${running} running · ${linked} with a live link · ` +
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
