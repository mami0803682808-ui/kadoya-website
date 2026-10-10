import re,json
from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
class Check(HTMLParser):
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='img':
            src=a.get('src','').split('?')[0]
            if src.startswith('http'):return
            target=root/src.lstrip('/') if src.startswith('/') else self.file.parent/src
            assert target.exists(),(self.file,src)
            if a.get('srcset'):
                for item in a['srcset'].split(','):
                    src=item.strip().split()[0];target=root/src.lstrip('/') if src.startswith('/') else self.file.parent/src
                    assert target.exists(),(self.file,src)
        if tag=='a' and a.get('href','').startswith('/'):
            href=a['href'].split('#')[0]
            if href.endswith('/'):assert (root/href.lstrip('/')/'index.html').exists(),href
for file in [root/'index.html']+[root/p/'index.html' for p in ['kishimen','morning','misonikomi','teishoku','misokatsu','dengaku','seo']]:
    p=Check();p.file=file;s=file.read_text();p.feed(s)
    for schema in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>',s,re.S):json.loads(schema)
    if file.parent.name in ['kishimen','morning','misonikomi','teishoku','misokatsu','dengaku']:
        assert s.count('<h1>')==1,file
        assert 'class="dish"' in s,file
        assert '久保一色1038-1' in s,file
print('Validated page images, responsive assets, internal routes, structured data and shop facts.')
