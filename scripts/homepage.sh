#!/bin/sh
# Switch what https://silverspoonprop.com/ shows. Only the root page changes,
# every other page (/about, /projects, ...) stays live either way.
#
#   sh scripts/homepage.sh coming-soon   -> show the Coming Soon page
#   sh scripts/homepage.sh live          -> restore the real homepage
#
# The real homepage lives in index.live.html, the placeholder in
# index.coming-soon.html; this just copies one of them over index.html.
# While Coming Soon is on, make homepage edits in index.live.html.
# Then commit + push for it to go live.

set -e
cd "$(dirname "$0")/.."

case "$1" in
  coming-soon)
    # Save the current real homepage first, so edits made while live aren't lost
    cmp -s index.html index.coming-soon.html || cp index.html index.live.html
    cp index.coming-soon.html index.html ;;
  live)        cp index.live.html index.html ;;
  *) echo "Usage: sh scripts/homepage.sh coming-soon|live"; exit 1 ;;
esac

echo "Homepage set to: $1"
