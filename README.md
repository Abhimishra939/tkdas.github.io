# Dr. T.K. Das — Academic website

Clean multi-page academic profile site for **Dr. T.K. Das** (Principal Scientist, Division of Agronomy, ICAR-IARI, New Delhi).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, Scholar metrics, profile summary, research themes, achievements preview, recent papers |
| `about.html` | Full profile & expertise |
| `research.html` | Research themes |
| `achievements.html` | Honours, fellowships, leadership |
| `publications.html` | Full list loaded from `scholar_data.json` (auto-updated) |
| `top50.html` | Curated Top 50 articles with NAAS ratings (separate page so Home stays short) |
| `contact.html` | Address & Scholar link |
| `books.html` | Books & bulletins |

## Auto-update (Google Scholar)

- **Script:** `scripts/update_scholar.py` (SerpApi Google Scholar Author API)
- **Workflow:** `.github/workflows/update-scholar.yml`
- **Schedule:** Daily at **00:00 UTC = 05:30 AM IST**
- **Secret required:** `SERPAPI_KEY` in GitHub repo → Settings → Secrets
- **Output:** `scholar_data.json` at repo root (citations, h-index, i10, publication list)

Home and Publications pages read `scholar_data.json` in the browser. If the file is missing or the fetch fails, fallback numbers on Home remain visible.

## Deploy on GitHub Pages

1. Push this folder as the repository root (or `docs/`).
2. Enable **Settings → Pages → Deploy from branch** (root or `/docs`).
3. Add secret `SERPAPI_KEY`.
4. Run the workflow once manually (**Actions → Update Google Scholar profile data → Run workflow**) to populate `scholar_data.json`.

## Design

Shared assets:

- `assets/site.css` — design system (forest / gold / cream)
- `assets/site.js` — mobile nav, metrics load, scroll reveal

Portrait image is loaded from IARI’s public staff photo URL.
