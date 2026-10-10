#!/usr/bin/env python3
"""Encode referenced large photographs as WebP; keep original files and photo links."""
import re,json
from pathlib import Path
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1];file=root/'index.html';s=file.read_text();report=[]
# src remains the original photo; responsive srcset selects the smaller WebP only at display time.
for match in list(re.finditer(r'<img\b[^>]*>',s)):
    tag=match[0];src=re.search(r'src="([^"]+)"',tag)
    if not src or not src[1].startswith('images/'):continue
    source=root/src[1]
    if not source.exists():continue
    with Image.open(source) as photo:
        im=ImageOps.exif_transpose(photo)
        w,h=im.size
        updated=tag
        # Existing declared geometry is preserved to avoid changing established card sizing.
        if 'width=' not in updated:updated=updated[:-1]+f' width="{w}" height="{h}">'
        if 'decoding=' not in updated:updated=updated[:-1]+' decoding="async">'
        if source.stat().st_size>=350000 and im.mode in ['RGB','RGBA'] and 'logo' not in source.name:
            folder=root/'images/optimized';folder.mkdir(exist_ok=True)
            variants=[]
            for size in [640,1200]:
                small=im.copy();small.thumbnail((size,size*10),Image.Resampling.LANCZOS)
                target=folder/f'{source.stem}-{size}.webp';small.save(target,'WEBP',quality=82,method=6)
                variants.append((target.relative_to(root).as_posix(),small.width,target.stat().st_size))
            updated=re.sub(r'\s+(?:srcset|sizes)="[^"]*"','',updated)
            updated=updated[:-1]+' srcset="'+', '.join(f'{p} {width}w' for p,width,n in variants)+'" sizes="(max-width: 650px) 46vw, (max-width: 1000px) 45vw, 420px">'
            if not any(r['original']==src[1] for r in report):report.append({'original':src[1],'originalBytes':source.stat().st_size,'variants':[{'path':p,'width':width,'bytes':n} for p,width,n in variants]})
        s=s.replace(tag,updated)
file.write_text(s)
(root/'data/seo/image-optimization.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Optimized {len(report)} unique photographs; originals retained.')
