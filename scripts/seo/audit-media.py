#!/usr/bin/env python3
"""Static asset budget: measures file bytes, not browser load time."""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
assets={}
for name in ['index.html','style-base.css','style.css','script-base.js','script.js']:
    text=(root/name).read_text()
    for url in re.findall(r'(?:images|videos)/[^\s"\'<>\)]+',text):
        url=url.split('?')[0]
        file=root/url
        if file.is_file():assets[url]=file.stat().st_size
result={'measurement':'Referenced local asset bytes; not LCP or transfer bytes. Hidden and lazy assets may not load on first view.',
 'totalReferencedBytes':sum(assets.values()),'imageBytes':sum(n for f,n in assets.items() if f.startswith('images/')),
 'videoBytes':sum(n for f,n in assets.items() if f.startswith('videos/')),
 'over500KB':[{'path':f,'bytes':n} for f,n in sorted(assets.items(),key=lambda x:-x[1]) if n>500000],
 'assets':assets}
output=Path(sys.argv[1]) if len(sys.argv)>1 else root/'data/seo/media-audit.json'
output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f"Referenced assets: {result['imageBytes']/1024/1024:.2f} MiB images; {result['videoBytes']/1024/1024:.2f} MiB videos")
