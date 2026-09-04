#!/usr/bin/env python3
"""
Bake TravelPort's travel data into a static JS file for the portfolio.

Run by hand; the output is committed, so the site itself has no build step.

    python3 scripts/bake-map.py

Reads (from the TravelPort repo, never fetched at runtime):
  site/public/data/maps/india-states/paths.json   36 state/UT paths, pre-projected
  site/public/data/cities/india_cities.json       417 cities with lat/lng
  parsed/*.json                                   the trip files

Writes:
  india.js
"""

import json
import math
import os
import re
import sys
from collections import Counter, defaultdict

TRAVELPORT = os.path.expanduser("~/Documents/Personal/TravelPort")
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "india.js")

# Cities that appear in the trip notes but not in india_cities.json.
# Coordinates are the standard published ones for each place.
EXTRA_CITIES = {
    "Kodaikanal":     (10.2381, 77.4892, "Tamil Nadu"),
    "Gokarna":        (14.5479, 74.3188, "Karnataka"),
    "Hampi":          (15.3350, 76.4600, "Karnataka"),
    "Dharamshala":    (32.2190, 76.3234, "Himachal Pradesh"),
    "Dalhousie":      (32.5448, 75.9618, "Himachal Pradesh"),
    "Jibhi":          (31.6180, 77.2280, "Himachal Pradesh"),
    "Leh":            (34.1526, 77.5771, "Ladakh"),
    "Gangtok":        (27.3389, 88.6065, "Sikkim"),
    "Darjeeling":     (27.0410, 88.2663, "West Bengal"),
    "New Jalpaiguri": (26.6870, 88.3953, "West Bengal"),
    "Siliguri":       (26.7271, 88.3953, "West Bengal"),
    "Puri":           (19.8135, 85.8312, "Odisha"),
    "Chittorgarh":    (24.8887, 74.6269, "Rajasthan"),
    "Patan":          (23.8493, 72.1266, "Gujarat"),
    "Bhuj":           (23.2419, 69.6669, "Gujarat"),
    "Ankola":         (14.6636, 74.3016, "Karnataka"),
    "Udupi":          (13.3409, 74.7421, "Karnataka"),
    "Pathankot":      (32.2643, 75.6421, "Punjab"),
    "Dindigul":       (10.3673, 77.9803, "Tamil Nadu"),
    "Palakkad":       (10.7867, 76.6548, "Kerala"),
    "Ernakulam":      (9.9816, 76.2999, "Kerala"),
    "Varkala":        (8.7379, 76.7163, "Kerala"),
    "Coorg":          (12.3375, 75.8069, "Karnataka"),
    "Kudremukh":      (13.1340, 75.2600, "Karnataka"),
    "Dandeli":        (15.2667, 74.6167, "Karnataka"),
    "Aurangabad":     (19.8762, 75.3433, "Maharashtra"),
    "Modhera":        (23.5836, 72.1330, "Gujarat"),
    "Triund":         (32.2600, 76.3400, "Himachal Pradesh"),
    "Puducherry":     (11.9416, 79.8083, "Puducherry"),
    "Chandigarh":     (30.7333, 76.7794, "Chandigarh"),
    "Amritsar":       (31.6340, 74.8723, "Punjab"),
    "Goa":            (15.4909, 73.8278, "Goa"),
    "Mangaluru":      (12.9141, 74.8560, "Karnataka"),
    "Mysuru":         (12.2958, 76.6394, "Karnataka"),
}

# Trip-note spellings -> the canonical name we plot under.
ALIASES = {
    "Bangalore": "Bengaluru",
    "Baroda": "Vadodara",
    "Kochi": "Ernakulam",
    "Bombay": "Mumbai",
    "Calcutta": "Kolkata",
    "Madras": "Chennai",
    "Trichy": "Tiruchirappalli",
    "Pondicherry": "Puducherry",
}

# Regions in the manifest that are trip groupings, not real states.
PSEUDO_REGIONS = {"East India", "West India", "North India", "South India"}


def load_json(*parts):
    with open(os.path.join(TRAVELPORT, *parts)) as fh:
        return json.load(fh)


def project(lat, lon, meta):
    """Reproduce the projection baked into paths.json (spherical Mercator)."""
    p = meta["projection"]
    x = p["offsetX"] + (math.radians(lon) - p["minX"]) * p["scale"]
    y_merc = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    y = p["offsetY"] + p["renderedH"] - (y_merc - p["minY"]) * p["scale"]
    return round(x, 1), round(y, 1)


def canonical(name):
    return ALIASES.get(name, name)


def main():
    paths_doc = load_json("site", "public", "data", "maps", "india-states", "paths.json")
    meta, names, paths = paths_doc["__meta"], paths_doc["__names"], paths_doc["paths"]

    gazetteer = {}
    for c in load_json("site", "public", "data", "cities", "india_cities.json"):
        gazetteer[canonical(c["name"])] = (c["lat"], c["lng"], c["state"])
    for name, triple in EXTRA_CITIES.items():
        gazetteer.setdefault(name, triple)

    # ---- walk the trip files -------------------------------------------------
    trips = []
    city_days = Counter()
    city_trips = Counter()
    states_visited = set()
    per_year = Counter()
    all_days = set()
    unresolved = set()

    trip_dir = os.path.join(TRAVELPORT, "parsed")
    for fname in sorted(os.listdir(trip_dir)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(trip_dir, fname)) as fh:
            trip = json.load(fh)

        region = trip.get("region")
        if region and region not in PSEUDO_REGIONS:
            states_visited.add(region)

        is_wrapper = trip.get("role") == "wrapper"
        if not is_wrapper:
            per_year[trip.get("year")] += 1

        seen_here = set()
        days_here = set()
        # Days are counted per city, from the dates that city actually appears
        # on. Crediting every city with the whole trip's length inflates transit
        # stops enormously (Chennai came out at 175 days that way).
        city_dates = defaultdict(set)
        for day in trip.get("days", []):
            date = day.get("date")
            if date:
                all_days.add(date)
                days_here.add(date)
            for ev in day.get("events", []):
                city = ev.get("derived_city")
                if not city:
                    continue
                city = canonical(city)
                seen_here.add(city)
                if date:
                    city_dates[city].add(date)
                if city in gazetteer:
                    states_visited.add(gazetteer[city][2])
                else:
                    unresolved.add(city)

        for city in seen_here:
            city_trips[city] += 1
            city_days[city] += max(len(city_dates.get(city, ())), 1)

        if not is_wrapper:
            trips.append({
                "id": trip["trip_id"],
                "name": trip.get("name"),
                "year": trip.get("year"),
                "region": region,
                "days": len(days_here),
                "cities": sorted(seen_here),
            })

    if unresolved:
        print("No coordinates for: " + ", ".join(sorted(unresolved)), file=sys.stderr)
        print("Add them to EXTRA_CITIES and re-run.", file=sys.stderr)
        return 1

    # ---- project the visited cities -----------------------------------------
    cities = []
    for name in sorted(city_days):
        lat, lon, state = gazetteer[name]
        x, y = project(lat, lon, meta)
        cities.append({
            "n": name, "s": state, "x": x, "y": y,
            "d": city_days[name], "t": city_trips[name],
        })

    # ---- trim the state paths to the ones we draw ---------------------------
    # Every state is drawn; visited ones are filled. Round coordinates to one
    # decimal, which is well under a pixel at this viewBox and saves ~40%.
    def shrink(d):
        return re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group()):.1f}", d)

    states = []
    for sid, d in paths.items():
        name = names.get(sid, sid)
        states.append({
            "n": name,
            "v": 1 if name in states_visited else 0,
            "d": shrink(d),
        })
    states.sort(key=lambda s: s["n"])

    payload = {
        "viewBox": meta["viewBox"],
        "states": states,
        "cities": cities,
        "trips": sorted(trips, key=lambda t: (t["year"] or 0, t["id"])),
        "stats": {
            "trips": len(trips),
            "states": len(states_visited),
            "cities": len(cities),
            "days": len(all_days),
            "perYear": dict(sorted((y, n) for y, n in per_year.items() if y)),
        },
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        fh.write("/* Generated by scripts/bake-map.py. Do not edit by hand. */\n")
        fh.write("window.INDIA = ")
        json.dump(payload, fh, separators=(",", ":"), ensure_ascii=False)
        fh.write(";\n")

    st = payload["stats"]
    print(f"wrote {OUT}  ({os.path.getsize(OUT) / 1024:.0f} KB)")
    print(f"  {st['trips']} trips · {st['states']} states/UTs · "
          f"{st['cities']} cities · {st['days']} days")
    print(f"  per year: {st['perYear']}")
    print("  states: " + ", ".join(sorted(states_visited)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
