V27 Auto Update pack.

What it does:
- Front end fetches live data from /.netlify/functions/live-data on every page load.
- The function fetches the public Humber Premier League source and returns UI-safe JSON.
- If the source fetch fails, the app falls back to bundled data.

Important:
- This is not for Netlify Drop.
- To use functions, deploy this as a proper Netlify project from GitHub or the Netlify CLI/API.
- Netlify Docs say functions deploy through continuous deployment with Git, the CLI, or the API.
- Scheduled Functions are free, but this first V27 pack updates on-request rather than on a timer.

Best route:
1. Put this folder in a GitHub repo
2. Import the repo into Netlify
3. Netlify will build the site and functions together
