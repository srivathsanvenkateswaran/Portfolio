#!/usr/bin/env bash
# Recount the two build figures on the evidence strip, so the claim on the site
# is always something anyone can re-derive rather than something I typed once.
#
#   ./scripts/velocity.sh
#
# Counts the projects with a git history under ~/Documents/Personal, prints the
# span from the earliest first commit to today, and totals the commits.
set -euo pipefail

ROOT="${1:-$HOME/Documents/Personal}"
PROJECTS=(SquadFit Tatak Jelfort InvestmentsManager Apart BidWicket PharmaCare
          Football VaralakshmiTiffins Jimvathsan MastersMentor VyasAdithya
          Finance/burrito)

earliest=""
total=0
count=0

for p in "${PROJECTS[@]}"; do
  dir="$ROOT/$p"
  [ -d "$dir/.git" ] || continue
  first=$(git -C "$dir" log --reverse --format=%as | head -1)
  n=$(git -C "$dir" rev-list --count HEAD)
  printf '%-22s %s  %5s commits\n' "$(basename "$p")" "$first" "$n"
  total=$((total + n))
  count=$((count + 1))
  if [ -z "$earliest" ] || [[ "$first" < "$earliest" ]]; then earliest="$first"; fi
done

today=$(date +%F)
days=$(( ( $(date -jf %F "$today" +%s 2>/dev/null || date -d "$today" +%s) -
           $(date -jf %F "$earliest" +%s 2>/dev/null || date -d "$earliest" +%s) ) / 86400 ))

echo
echo "$count projects · $earliest to $today · $days days ($(echo "scale=1; $days/7" | bc) weeks)"
echo "$total commits · $(( total / days )) per day"
