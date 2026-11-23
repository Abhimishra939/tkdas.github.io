import json
import os
import signal
import tempfile
import time
from datetime import datetime, timezone
from scholarly import scholarly

PROFILE_ID = os.getenv("SCHOLAR_ID", "wfz2In0AAAAJ")
OUTPUT_FILE = "scholar_data.json"
ATTEMPTS = 2
PROFILE_TIMEOUT = 60
PUBLICATION_TIMEOUT = 12

class FetchTimeout(TimeoutError):
    pass

def _alarm_handler(signum, frame):
    raise FetchTimeout("Operation exceeded its time limit")

def run_with_timeout(seconds, fn, *args, **kwargs):
    if not hasattr(signal, "SIGALRM"):
        return fn(*args, **kwargs)
    old_handler = signal.signal(signal.SIGALRM, _alarm_handler)
    signal.alarm(seconds)
    try:
        return fn(*args, **kwargs)
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)

def safe(value):
    return value if isinstance(value, (str, int, float, bool)) or value is None else str(value)

def main():
    author = None
    last_error = None

    for attempt in range(1, ATTEMPTS + 1):
        print(f"Scholar profile fetch attempt {attempt}/{ATTEMPTS}", flush=True)
        try:
            author = run_with_timeout(PROFILE_TIMEOUT, scholarly.search_author_id, PROFILE_ID)
            author = run_with_timeout(30, scholarly.fill, author, sections=["basics", "indices"])
            break
        except Exception as exc:
            last_error = exc
            print(f"Profile fetch failed: {type(exc).__name__}: {exc}", flush=True)
            if attempt < ATTEMPTS:
                time.sleep(15)
    if author is None:
        raise RuntimeError(f"Unable to fetch Scholar profile; old {OUTPUT_FILE} preserved. Last error: {last_error}")

    pubs = []
    items = author.get("publications", []) or []
    print(f"Profile fetched. Found {len(items)} publication records.", flush=True)

    # Publication details are optional: skip any individual record that times out/errors.
    for i, item in enumerate(items, 1):
        try:
            filled = run_with_timeout(PUBLICATION_TIMEOUT, scholarly.fill, item)
        except Exception as exc:
            print(f"Publication {i}/{len(items)} detail fetch skipped: {type(exc).__name__}", flush=True)
            filled = item
        bib = filled.get("bib", {}) or {}
        fallback = item.get("bib", {}) or {}
        title = bib.get("title") or fallback.get("title") or ""
        year = bib.get("pub_year") or fallback.get("pub_year")
        authors = bib.get("author") or fallback.get("author") or ""
        venue = bib.get("venue") or bib.get("journal") or bib.get("conference") or fallback.get("venue") or ""
        url = filled.get("pub_url") or item.get("pub_url") or ""
        pubs.append({
            "title": safe(title), "year": safe(year), "authors": safe(authors),
            "venue": safe(venue), "url": safe(url)
        })

    pubs.sort(key=lambda p: int(p["year"]) if str(p["year"]).isdigit() else 0, reverse=True)
    data = {
        "profile_id": PROFILE_ID,
        "profile_url": f"https://scholar.google.com/citations?user={PROFILE_ID}",
        "name": author.get("name", "Dr. T.K. Das"),
        "citations": author.get("citedby"),
        "h_index": author.get("hindex"),
        "i10_index": author.get("i10index"),
        "publication_count": len(pubs),
        "publications": pubs,
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds")
    }

    # Atomic replacement: only replace the existing JSON after successful profile fetch and serialization.
    directory = os.path.dirname(os.path.abspath(OUTPUT_FILE))
    fd, temp_path = tempfile.mkstemp(prefix="scholar_data_", suffix=".tmp", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp_path, OUTPUT_FILE)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    print(f"Updated successfully: {len(pubs)} publications; citations={data['citations']}; h={data['h_index']}; i10={data['i10_index']}", flush=True)

if __name__ == "__main__":
    main()
