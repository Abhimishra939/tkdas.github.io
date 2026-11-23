#!/usr/bin/env python3
"""Fetch Dr. T.K. Das Google Scholar metrics/publications via SerpApi.
Reads SERPAPI_KEY from environment and preserves existing JSON if fetching fails."""
import json, os, tempfile, urllib.parse, urllib.request
from datetime import datetime, timezone

PROFILE_ID=os.getenv('SCHOLAR_ID','wfz2In0AAAAJ')
OUTPUT_FILE='scholar_data.json'
API_KEY=os.getenv('SERPAPI_KEY')

def fetch():
    if not API_KEY: raise RuntimeError('SERPAPI_KEY is not set')
    params={'engine':'google_scholar_author','author_id':PROFILE_ID,'hl':'en','num':'100','api_key':API_KEY}
    req=urllib.request.Request('https://serpapi.com/search.json?'+urllib.parse.urlencode(params),headers={'User-Agent':'TKDasAcademicWebsite/1.0'})
    with urllib.request.urlopen(req,timeout=90) as response: data=json.loads(response.read().decode('utf-8'))
    if data.get('error'): raise RuntimeError('SerpApi error: '+str(data['error']))
    status=(data.get('search_metadata') or {}).get('status')
    if status and status!='Success': raise RuntimeError('SerpApi status: '+str(status))
    if not data.get('author') and not data.get('articles'): raise RuntimeError('Response missing profile/article data')
    return data

def metric(table,key):
    for row in table or []:
        v=row.get(key) if isinstance(row,dict) else None
        if isinstance(v,dict): return v.get('all')
    return None

def main():
    raw=fetch(); author=raw.get('author') or {}; table=(raw.get('cited_by') or {}).get('table') or []
    pubs=[]
    for a in raw.get('articles') or []:
        if not isinstance(a,dict): continue
        pubs.append({'title':a.get('title') or '', 'year':a.get('year') or '', 'authors':a.get('authors') or '',
                   'venue':a.get('publication') or '', 'url':a.get('link') or '', 'citations':(a.get('cited_by') or {}).get('value')})
    pubs.sort(key=lambda p:int(p['year']) if str(p['year']).isdigit() else 0,reverse=True)
    old={}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE,encoding='utf-8') as f: old=json.load(f)
        except Exception: pass
    citations=metric(table,'citations'); h=metric(table,'h_index'); i10=metric(table,'i10_index')
    if citations is None or h is None or i10 is None: raise RuntimeError('Required Scholar metrics missing; old snapshot preserved')
    out={'profile_id':PROFILE_ID,'profile_url':f'https://scholar.google.com/citations?user={PROFILE_ID}',
         'name':author.get('name') or old.get('name') or 'Dr. T.K. Das','citations':citations,'h_index':h,'i10_index':i10,
         'publication_count':len(pubs) if pubs else old.get('publication_count','300+'),
         'publications':pubs if pubs else old.get('publications',[]),
         'updated_at':datetime.now(timezone.utc).isoformat(timespec='seconds'),'source':'SerpApi Google Scholar Author API'}
    directory=os.path.dirname(os.path.abspath(OUTPUT_FILE)); fd,tmp=tempfile.mkstemp(prefix='scholar_data_',suffix='.tmp',dir=directory)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f: json.dump(out,f,ensure_ascii=False,indent=2); f.flush(); os.fsync(f.fileno())
        os.replace(tmp,OUTPUT_FILE)
    finally:
        if os.path.exists(tmp): os.remove(tmp)
    print(f"Updated: citations={citations}, h={h}, i10={i10}, articles={len(pubs)}")
if __name__=='__main__': main()
