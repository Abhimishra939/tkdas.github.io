import json, os, time
from datetime import datetime, timezone
from scholarly import scholarly

PROFILE_ID = os.getenv('SCHOLAR_ID', 'wfz2In0AAAAJ')

def safe(obj):
    return obj if isinstance(obj, (str, int, float, bool)) or obj is None else str(obj)


def main():
    author = scholarly.search_author_id(PROFILE_ID)
    author = scholarly.fill(author, sections=['basics', 'indices', 'publications'])
    pubs = []
    for item in author.get('publications', []):
        try:
            filled = scholarly.fill(item)
        except Exception:
            filled = item
        bib = filled.get('bib', {})
        title = bib.get('title') or item.get('bib', {}).get('title') or ''
        year = bib.get('pub_year') or item.get('bib', {}).get('pub_year')
        authors = bib.get('author') or item.get('bib', {}).get('author') or ''
        venue = bib.get('venue') or bib.get('journal') or bib.get('conference') or ''
        scholar_url = filled.get('pub_url') or item.get('pub_url') or ''
        pubs.append({'title':safe(title), 'year':safe(year), 'authors':safe(authors), 'venue':safe(venue), 'url':safe(scholar_url)})
    pubs.sort(key=lambda p: (int(p['year']) if str(p['year']).isdigit() else 0), reverse=True)
    data = {
        'profile_id': PROFILE_ID,
        'profile_url': f'https://scholar.google.com/citations?user={PROFILE_ID}',
        'name': author.get('name', 'Dr. T.K. Das'),
        'citations': author.get('citedby'),
        'h_index': author.get('hindex'),
        'i10_index': author.get('i10index'),
        'publication_count': len(pubs),
        'publications': pubs,
        'updated_at': datetime.now(timezone.utc).isoformat(timespec='seconds')
    }
    with open('scholar_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated: {len(pubs)} publications; citations={data['citations']}; h={data['h_index']}; i10={data['i10_index']}")

if __name__ == '__main__':
    main()
