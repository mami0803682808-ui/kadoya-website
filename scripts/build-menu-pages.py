#!/usr/bin/env python3
"""Generate static intent pages from the current homepage, keeping prices and shop facts in sync."""
import re, json, html, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'index.html').read_text()
css_version=hashlib.sha256((ROOT/'menu-pages.css').read_bytes()).hexdigest()[:12]
plain=lambda value:html.unescape(re.sub('<[^>]+>',' ',value)).strip()
articles={}
for article in re.findall(r'<article\b.*?</article>',s,re.S):
    h=re.search(r'<h[34][^>]*>(.*?)</h[34]>',article,re.S)
    im=re.search(r'<img\b[^>]*>',article)
    if h and im: articles.setdefault(plain(h[1]),article)
pages=[
 ('kishimen','小牧の自家製きしめん','毎日、角屋で打つ。もちもちの一杯を。','香川から直送する小麦粉で、毎日、角屋で麺を仕込んでいます。つるっとした喉ごしと、もちもちとした食感を目指した自家製麺。田県神社前駅から徒歩1分の角屋で、お昼や夜のお食事にどうぞ。',['きしめん','天ぷらきしめん','とり天きしめん','カレーきしめん','田縣たぬききしめん','天ざるきしめん'],'麺の大盛りは＋250円です。味噌煮込みきしめんは、専用ページでご紹介しています。'),
 ('morning','小牧のモーニング','お好きなドリンクに、朝のセットを添えて。','7:30〜10:30のモーニング。厚切りトーストから、きしめんまで、5種類のセットをご用意しています。ご注文・お席のご利用とも10:30までです。',['厚切りトースト','ホットドッグ','サンドイッチ','カレー','きしめん'],'セット料金はドリンク代への追加料金です。ブレンドコーヒーは500円。厚切りトーストのAセットは、ドリンク代のみでお楽しみいただけます。'),
 ('misonikomi','小牧の味噌煮込みきしめん','角屋の味噌と、煮込みきしめん。','麺とだしに合う、長年守ってきた味噌の味。味噌煮込みきしめんのほか、海老天入りやデラックスをご用意しています。',['味噌煮込みきしめん','海老天入り味噌煮込みきしめん','デラックス味噌煮込みきしめん'],'味噌煮込みは豚肉・卵入り。うどんに変更できます。煮込み麺の大盛りはできません。ライスセット（御飯・香の物付）＋330円／小ライスセット＋220円。'),
 ('teishoku','小牧の定食・ランチ','お昼にも、夜にも。角屋の定食。','お魚、揚げ物、菜めし田楽など、その日の気分に合わせて選べる定食。平日限定の日替わりランチは税込1,080円で、内容は公式Instagramのストーリーで更新しています。',['本日のお魚定食','みそかつ定食','菜めし田楽定食','唐揚げ定食','天ぷら定食','エビフライ定食'],'昼は11:00〜14:00（L.O.13:30）、夜は17:00〜20:30（L.O.20:00）。季節限定料理を含む全メニューは、トップページのお品書きからご確認いただけます。'),
 ('misokatsu','小牧の味噌カツ','みそだれをまとった、とんかつの一皿。','角屋の味噌カツを、定食や丼で。田県神社前駅周辺でのお食事や、田縣神社周辺での昼食・夕食にご利用いただけます。',['みそかつ定食','味噌ヒレカツ定食','味噌カツ丼'],'定食、きしめん、味噌煮込みなどもご用意しています。ご家族やご友人それぞれのお好みに合わせてお選びください。'),
 ('dengaku','小牧の菜めし田楽','菜めしと田楽を、角屋で。','菜めし田楽定食と、単品の豆腐田楽をご用意しています。落ち着いた店内で、お昼や夜のお食事をお楽しみください。',['菜めし田楽定食','豆腐田楽'],'店内にはカウンター席・お座敷があり、おひとりでもご家族でもご利用いただけます。')]
# Morning names overlap other menus, so obtain them from the morning section explicitly.
morning=re.search(r'<section id="morning-menu".*?</section>',s,re.S)[0]
morning_articles={plain(re.search(r'<h3[^>]*>(.*?)</h3>',a,re.S)[1]):a for a in re.findall(r'<article\b.*?</article>',morning,re.S)}
shop=re.search(r'<section id="shop".*?<dl>(.*?)</dl>',s,re.S)[1]
shop='<dl>'+shop+'</dl>'
shop=shop.replace('href="#reservation"','href="/#reservation"')
links=''.join(f'<a href="/{slug}/">{html.escape(title.replace("小牧の",""))}</a>' for slug,title,*_ in pages)
for slug,title,headline,intro,names,note in pages:
    selected=morning_articles if slug=='morning' else articles
    cards=[]
    for name in names:
        a=selected[name]
        image=re.search(r'<img\b[^>]*>',a)[0]
        image=image.replace('src="images/','src="/images/').replace('srcset="images/','srcset="/images/').replace(', images/',', /images/')
        description=re.findall(r'<p\b[^>]*>.*?</p>',a,re.S)
        cards.append('<article class="dish">'+image+'<h3>'+html.escape(name)+'</h3>'+''.join(description)+'</article>')
    cards[0]=cards[0].replace('loading="lazy"','loading="eager" fetchpriority="high"')
    photo=re.search(r'src="([^"]+)"',cards[0])[1]
    desc=title+'。'+intro
    schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':f'https://komaki-kadoya.com/{slug}/','name':title+'｜角屋','description':desc,'about':{'@id':'https://komaki-kadoya.com/#restaurant'}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'角屋','item':'https://komaki-kadoya.com/'},{'@type':'ListItem','position':2,'name':title,'item':f'https://komaki-kadoya.com/{slug}/'}]}]}
    output=f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}｜角屋・田県神社前駅から徒歩1分</title><meta name="description" content="{html.escape(desc,quote=True)}">
<link rel="canonical" href="https://komaki-kadoya.com/{slug}/"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:title" content="{title}｜角屋"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:url" content="https://komaki-kadoya.com/{slug}/"><meta property="og:image" content="https://komaki-kadoya.com{photo}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/menu-pages.css?v={css_version}">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script></head>
<body><header><a href="/" aria-label="角屋 トップへ"><img src="/images/kadoya-logo.png" alt="角屋" width="2086" height="754"></a><a class="phone" href="tel:0568722127">電話で予約</a></header>
<main><nav class="breadcrumb" aria-label="パンくず"><a href="/">角屋</a><span>／</span><span>{title}</span></nav>
<section class="intro"><p class="eyebrow">KADOYA · KOMAKI</p><h1>{title}</h1><h2>{headline}</h2><p>{intro}</p></section>
<section aria-label="料理と料金"><p class="note">表示価格はすべて税込です。最新の価格は店頭・モバイルオーダーでご確認ください。</p><div class="dishes">{''.join(cards)}</div><p class="note">{note}</p><a class="button" href="/#menu">お品書きをすべて見る</a></section>
<section class="visit"><p class="eyebrow">VISIT KADOYA</p><h2>田県神社前駅から徒歩1分</h2>{shop}<p><a class="button" href="/#access">アクセス・地図を見る</a></p><p><a href="https://www.instagram.com/komaki_kadoya/" target="_blank" rel="noopener">最新の営業案内は公式Instagramへ</a></p></section>
<section class="related"><h2>ほかのお品書き</h2><nav aria-label="料理別ページ">{links}</nav></section></main><footer><a href="/">角屋 公式サイト</a><p>1973年3月3日創業 · 愛知県小牧市久保一色1038-1</p></footer></body></html>'''
    target=ROOT/slug;target.mkdir(exist_ok=True);(target/'index.html').write_text(output)
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>https://komaki-kadoya.com{p}</loc></url>\n' for p in ['/']+[f'/{p[0]}/' for p in pages])+'</urlset>\n')
nav='<nav class="menu-intent-links" aria-label="料理別のご案内">'+links+'</nav>'
if 'class="menu-intent-links"' in s:s=re.sub(r'<nav class="menu-intent-links".*?</nav>',nav,s,flags=re.S)
else:s=s.replace('<div class="menu-tabs"',nav+'\n<div class="menu-tabs"',1)
# Handle the existing tabs with an alternate class if needed.
if nav not in s:s=s.replace('<section id="menu" class="section">','<section id="menu" class="section">'+nav)
(ROOT/'index.html').write_text(s)
print('Generated 6 menu pages from homepage prices and shop information.')
