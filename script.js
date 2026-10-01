(() => {
  const core = document.createElement('script');
  core.src = 'script-base.js';
  core.async = false;

  core.onload = () => {
    const menu = document.querySelector('#menu');
    if (!menu) return;

    const beerBrands = menu.querySelector('.beer-brands');
    if (beerBrands) {
      beerBrands.textContent = 'アサヒスーパードライ・キリンラガー・キリンクラシックラガー・サッポロラガー';
    }

    const tanagata = menu.querySelector('img[alt="田縣たぬききしめん"]');
    if (tanagata) {
      tanagata.src = 'images/menu-tanagata-tanuki-new.jpg';
      tanagata.width = 360;
      tanagata.height = 240;
      tanagata.loading = 'lazy';
      tanagata.decoding = 'async';
    }

    const findGroup = (label) => [...menu.querySelectorAll('details.menu-group')].find(group => {
      const summary = group.querySelector('summary');
      return (summary?.textContent || '').trim().includes(label);
    });

    const autumnMenu = menu.querySelector('#autumn-menu');
    const autumnSummary = autumnMenu?.querySelector('summary');
    if (autumnSummary && autumnSummary.textContent.trim() === '秋季限定') {
      autumnSummary.textContent = '秋冬限定';
    }

    const summerGroup = findGroup('夏季限定');
    if (summerGroup) {
      [...summerGroup.querySelectorAll('.tempura-feature')].forEach(item => {
        const name = item.querySelector('h3')?.textContent.replace(/\s+/g, '') || '';
        if (name.includes('国産とり天') || name.includes('とり天') || name.includes('きのこの天ぷら')) item.remove();
      });
      const tempuraGrid = summerGroup.querySelector('.tempura-feature-grid');
      if (tempuraGrid && !tempuraGrid.querySelector('.tempura-feature')) tempuraGrid.remove();

      if (!document.querySelector('#summer-title-align-style')) {
        const style = document.createElement('style');
        style.id = 'summer-title-align-style';
        style.textContent = `
          #menu .summer-photo-grid .card {
            display:flex!important;
            flex-direction:column!important;
            align-items:stretch!important;
          }
          #menu .summer-photo-grid .card > img,
          #menu .summer-photo-grid .card > .card-photo {
            display:block!important;
            width:100%!important;
            height:auto!important;
            aspect-ratio:4/3!important;
            margin:0 0 14px!important;
            padding:0!important;
            overflow:hidden!important;
          }
          #menu .summer-photo-grid .card > img,
          #menu .summer-photo-grid .card > .card-photo img {
            display:block!important;
            width:100%!important;
            height:100%!important;
            aspect-ratio:4/3!important;
            object-fit:cover!important;
            object-position:center!important;
            margin:0!important;
            padding:0!important;
          }
          #menu .summer-photo-grid .card h3 {
            margin-top:0!important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    const autumnCards = autumnMenu?.querySelector('.cards');
    if (autumnCards && !autumnCards.querySelector('[data-kinoko-tempura-autumn]')) {
      const card = document.createElement('article');
      card.className = 'card reveal';
      card.dataset.kinokoTempuraAutumn = '';
      card.innerHTML = `
        <a class="card-photo" href="images/kinoko-tempura.jpg" target="_blank" rel="noopener">
          <img src="images/kinoko-tempura.jpg?v=20261001-season" alt="きのこの天ぷら" loading="lazy" decoding="async">
        </a>
        <h3>きのこの天ぷら</h3>
        <p class="menu-note">舞茸・椎茸・えのき茸</p>
        <p class="dish-price">680円</p>`;
      autumnCards.appendChild(card);
    }

    const donGroup = findGroup('丼もの・お子様メニュー');
    if (donGroup) {
      let grid = donGroup.querySelector('.nested-menu-photo.cards, .float-photo-grid.cards');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'nested-menu-photo cards float-photo-grid';
        donGroup.querySelector('.menu-list')?.before(grid);
      }
      const targets = new Set(['親子丼', '鉄火丼', 'ネギトロ丼', '牛どて丼', 'お子様きしめん']);
      [...grid.querySelectorAll('article')].forEach(card => {
        const name = card.querySelector('h3, h4')?.textContent.trim();
        if (targets.has(name) || card.hasAttribute('data-menu-photo-fix')) card.remove();
      });
      const items = [
        { name: '親子丼', price: '1,000円', image: '親子丼.jpeg', key: 'oyakodon' },
        { name: '鉄火丼', price: '1,040円', image: '鉄火丼.jpeg', key: 'tekkadon' },
        { name: 'ネギトロ丼', price: '1,040円', image: 'ネギトロ丼.jpeg', key: 'negitorodon' },
        { name: '牛どて丼', price: '1,000円', image: 'どて丼.jpeg', key: 'dotedon' },
        { name: 'お子様きしめん', price: '650円', image: 'お子様きしめん.jpeg', key: 'kids-kishimen' }
      ];
      items.forEach(({ name, price, image, key }) => {
        const card = document.createElement('article');
        card.className = 'card menu-photo-fix-card';
        card.dataset.menuPhotoFix = key;
        card.innerHTML = `
          <span class="card-photo menu-photo-fix-image">
            <img src="${image}?v=20261001-4" alt="${name}" loading="lazy" decoding="async" width="1536" height="1024">
          </span>
          <h3>${name}</h3>
          <p class="dish-price">${price}</p>`;
        grid.appendChild(card);
      });
      donGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = row.querySelector('dt')?.textContent.trim();
        if (targets.has(name)) row.remove();
      });
      if (!document.querySelector('#menu-photo-fix-style')) {
        const style = document.createElement('style');
        style.id = 'menu-photo-fix-style';
        style.textContent = `
          #menu .menu-photo-fix-card { min-width: 0 !important; overflow: visible !important; }
          #menu .menu-photo-fix-card .menu-photo-fix-image {display:block!important;width:100%!important;aspect-ratio:3/2!important;overflow:hidden!important;margin:0 0 16px!important;background:transparent!important;}
          #menu .menu-photo-fix-card .menu-photo-fix-image img {display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;max-width:none!important;margin:0!important;}
          #menu [data-menu-photo-fix="kids-kishimen"] .menu-photo-fix-image img {transform:scale(1.24)!important;transform-origin:center center!important;}
          #menu .menu-photo-fix-card h3,#menu .menu-photo-fix-card .dish-price,#menu .menu-photo-fix-card .menu-note {position:static!important;display:block!important;padding:0!important;height:auto!important;min-height:0!important;transform:none!important;}
          #menu .menu-photo-fix-card h3 {margin:0 0 8px!important;line-height:1.35!important;}
          #menu .menu-photo-fix-card .menu-note {margin:0 0 8px!important;line-height:1.5!important;}
          #menu .menu-photo-fix-card .dish-price {margin:0!important;line-height:1.2!important;}
          @media(max-width:760px){#menu .menu-photo-fix-card{display:block!important;width:100%!important;margin:0 0 34px!important;padding:0!important}#menu .menu-photo-fix-card .menu-photo-fix-image{margin-bottom:14px!important}}
        `;
        document.head.appendChild(style);
      }
    }

    const kishimenGroup = [...menu.querySelectorAll('details.menu-group')].find(group => {
      const summary = group.querySelector('summary');
      return (summary?.textContent || '').trim() === 'きしめん';
    });
    if (kishimenGroup) {
      let grid = kishimenGroup.querySelector('.nested-menu-photo.cards, .float-photo-grid.cards');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'nested-menu-photo cards float-photo-grid';
        kishimenGroup.querySelector('.menu-list')?.before(grid);
      }
      [...grid.querySelectorAll('article')].forEach(card => {
        const name = card.querySelector('h3, h4')?.textContent.trim();
        if (name === '海老おろしきしめん' || card.hasAttribute('data-ebi-oroshi-photo')) card.remove();
      });
      const card = document.createElement('article');
      card.className = 'card menu-photo-fix-card';
      card.dataset.ebiOroshiPhoto = '';
      card.innerHTML = `
        <span class="card-photo menu-photo-fix-image"><img src="最新版_えびおろしきしめん.jpeg?v=20261001-4" alt="海老おろしきしめん" loading="lazy" decoding="async" width="1536" height="1024"></span>
        <h3>海老おろしきしめん</h3><p class="menu-note">冷・季節限定</p><p class="dish-price">1,500円</p>`;
      grid.prepend(card);
      kishimenGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = row.querySelector('dt')?.textContent.trim() || '';
        if (name.startsWith('海老おろしきしめん')) row.remove();
      });
    }

    const sideGroup = findGroup('一品料理・ご飯');
    const sideGrid = sideGroup?.querySelector('.side-dish-grid');
    if (sideGrid) {
      const sideItems = [
        { name: '国産とり天（3個）', price: '530円', image: 'images/toriten.jpg', key: 'toriten' },
        { name: 'ちくわ磯辺揚げ', price: '480円', image: 'IMG_7539.jpeg', key: 'isobe' },
        { name: 'イカ焼き', price: '800円', image: 'IMG_7542.jpeg', key: 'ikayaki' },
        { name: '焼きナス', price: '480円', image: 'IMG_7551.jpeg', key: 'nasu' },
        { name: 'フライドポテト', price: '480円', image: 'IMG_7553.jpeg', key: 'potato' },
        { name: '牛すじどて煮', price: '530円', image: 'IMG_7555.jpeg', key: 'doteni' },
        { name: 'もずく酢', price: '350円', image: 'IMG_7568.jpeg', key: 'mozuku' },
        { name: '梅くらげ', price: '350円', image: 'IMG_7530.jpeg', key: 'umekurage' },
        { name: '枝豆', price: '380円', image: 'IMG_7565.jpeg', key: 'edamame' },
        { name: 'まぐろ山かけ', price: '680円', image: 'IMG_7534.jpeg', key: 'maguro-yamakake' },
        { name: '焼きそば', price: '900円', image: 'IMG_7559.jpeg', key: 'yakisoba' },
        { name: '塩焼き鳥（2本）', price: '480円', image: 'IMG_7571.jpeg', key: 'yakitori' },
        { name: 'カツとじ鍋', price: '900円', image: 'IMG_7575.jpeg', key: 'katsutoji' }
      ];
      sideItems.forEach(({ name, price, image, key }) => {
        const existing = [...sideGrid.querySelectorAll('article')].find(card => {
          const title = card.querySelector('h3, h4')?.textContent.trim();
          return title === name || card.dataset.sidePhoto === key;
        });
        if (existing) existing.remove();
        const item = document.createElement('article');
        item.className = 'dish-photo-item';
        item.dataset.sidePhoto = key;
        item.innerHTML = `<span class="dish-photo-link"><img src="${image}?v=20261001-side-4" alt="${name}" loading="lazy" decoding="async" width="1536" height="1024"></span><h4>${name}</h4><p class="dish-price">${price}</p>`;
        sideGrid.appendChild(item);
      });
      if (!sideGrid.querySelector('[data-oebi-single-photo]')) {
        const item = document.createElement('article');
        item.className = 'dish-photo-item';
        item.dataset.oebiSinglePhoto = '';
        item.innerHTML = `<span class="dish-photo-link portrait"><img src="images/menu-oebi-single.jpg" alt="大エビフライ（一本）" loading="lazy" decoding="async" width="360" height="240"></span><h4>大エビフライ（一本）</h4><p class="dish-price">880円</p>`;
        sideGrid.appendChild(item);
      }
      sideGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const text = row.querySelector('dt')?.textContent.replace(/\s+/g, '') || '';
        if (text.startsWith('とり天')) row.remove();
      });
      if (!document.querySelector('#side-dish-title-font-fix')) {
        const style = document.createElement('style');
        style.id = 'side-dish-title-font-fix';
        style.textContent = `#menu .side-dish-grid .dish-photo-item h3,#menu .side-dish-grid .dish-photo-item h4{font-family:"Noto Serif JP",serif!important;font-weight:500!important;letter-spacing:0!important;}`;
        document.head.appendChild(style);
      }
      const normalizeSideName = (value = '') => value.normalize('NFKC').replace(/〈[^〉]*〉/g, '').replace(/\s+/g, '').replace(/磯部/g, '磯辺').trim();
      const photoNames = new Set([...sideGrid.querySelectorAll('article h3, article h4')].map(el => normalizeSideName(el.textContent)).filter(Boolean));
      sideGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = normalizeSideName(row.querySelector('dt')?.textContent || '');
        if (photoNames.has(name)) row.remove();
      });
    }

    const fishCard = menu.querySelector('#fish-set-photo');
    if (fishCard && !fishCard.querySelector('[data-fish-instagram-note]')) {
      const note = document.createElement('p');
      note.className = 'menu-note';
      note.dataset.fishInstagramNote = '';
      note.innerHTML = '内容は日によって異なります。最新の内容は<a href="https://www.instagram.com/komaki_kadoya/" target="_blank" rel="noopener">公式Instagramのストーリー</a>をご確認ください。';
      fishCard.appendChild(note);
    }

    const misoGroup = menu.querySelector('#miso-menu');
    if (misoGroup) {
      const normalizeMisoName = (value = '') => value
        .normalize('NFKC')
        .replace(/[（(][^）)]*[）)]/g, '')
        .replace(/海老/g, 'えび')
        .replace(/[\u3000\s]+/g, '')
        .trim();
      const photoMisoNames = new Set([
        '味噌煮込みきしめん',
        '海老天入り味噌煮込みきしめん',
        'デラックス味噌煮込みきしめん'
      ].map(normalizeMisoName));
      misoGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = normalizeMisoName(row.querySelector('dt')?.textContent || '');
        if (photoMisoNames.has(name)) row.remove();
      });
    }

    const normalizeMenuName = (value = '') => value.normalize('NFKC').replace(/〈[^〉]*〉/g, '').replace(/[\u3000\s]+/g, '').replace(/磯部/g, '磯辺').trim();
    menu.querySelectorAll('details.menu-group').forEach(group => {
      const seenCards = new Set();
      const photoNames = new Set();
      [...group.querySelectorAll('article')].forEach(card => {
        const title = card.querySelector('h3, h4');
        if (!title) return;
        const name = normalizeMenuName(title.textContent);
        if (!name) return;
        if (seenCards.has(name)) { card.remove(); return; }
        seenCards.add(name);
        if (card.querySelector('img')) photoNames.add(name);
      });
      const seenRows = new Set();
      group.querySelectorAll('.menu-list > div').forEach(row => {
        const name = normalizeMenuName(row.querySelector('dt')?.textContent || '');
        if (!name) return;
        if (photoNames.has(name) || seenRows.has(name)) { row.remove(); return; }
        seenRows.add(name);
      });
    });

    if (!document.querySelector('#desktop-menu-unify-style')) {
      const style = document.createElement('style');
      style.id = 'desktop-menu-unify-style';
      style.textContent = `
        @media (min-width: 761px) {
          #menu .cards,
          #menu .dish-photo-grid,
          #menu .nested-set-photos,
          #menu .nested-menu-photo,
          #menu .float-photo-grid,
          #menu .summer-photo-grid,
          #menu .side-dish-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 26px !important;
            row-gap: 48px !important;
            align-items: start !important;
          }
          #menu .card,
          #menu .dish-photo-item,
          #menu .menu-photo-fix-card {
            min-width: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          #menu .card > .card-photo,
          #menu .card > .menu-photo-fix-image,
          #menu .card > img,
          #menu .dish-photo-item > .dish-photo-link,
          #menu .dish-photo-item > .card-photo,
          #menu .dish-photo-item > img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 4 / 3 !important;
            overflow: hidden !important;
            margin: 0 0 14px !important;
            padding: 0 !important;
            background: transparent !important;
          }
          #menu .card > .card-photo img,
          #menu .card > .menu-photo-fix-image img,
          #menu .card > img,
          #menu .dish-photo-item > .dish-photo-link img,
          #menu .dish-photo-item > .card-photo img,
          #menu .dish-photo-item > img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            aspect-ratio: 4 / 3 !important;
            object-fit: cover !important;
            object-position: center !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #menu .card h3,
          #menu .card h4,
          #menu .dish-photo-item h3,
          #menu .dish-photo-item h4,
          #menu .menu-photo-fix-card h3,
          #menu .menu-photo-fix-card h4 {
            position: static !important;
            display: block !important;
            width: 100% !important;
            min-height: 3.05em !important;
            margin: 0 0 8px !important;
            padding: 0 !important;
            font-family: "Noto Serif JP", serif !important;
            font-size: 23px !important;
            font-weight: 600 !important;
            line-height: 1.45 !important;
            letter-spacing: 0 !important;
            text-align: left !important;
            transform: none !important;
          }
          #menu .card .dish-price,
          #menu .dish-photo-item .dish-price,
          #menu .menu-photo-fix-card .dish-price {
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 10px 0 0 !important;
            padding: 0 !important;
            font-family: "Zen Kaku Gothic New", sans-serif !important;
            font-size: 22px !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
            color: #6f3d24 !important;
            text-align: left !important;
            white-space: normal !important;
            transform: none !important;
          }
          #menu .card .menu-note,
          #menu .dish-photo-item .menu-note,
          #menu .menu-photo-fix-card .menu-note {
            width: 100% !important;
            margin: 0 0 8px !important;
          }
          #morning-menu .morning-sets {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 26px !important;
            align-items: start !important;
          }
          #morning-menu .morning-set { min-width: 0 !important; width: 100% !important; }
          #morning-menu .morning-set-photo {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 4 / 3 !important;
            overflow: hidden !important;
            margin: 0 0 14px !important;
          }
          #morning-menu .morning-set-photo img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
          }
          #morning-menu .morning-set h3 {
            min-height: 1.5em !important;
            margin: 0 0 8px !important;
            font-family: "Noto Serif JP", serif !important;
            font-size: 23px !important;
            font-weight: 600 !important;
            line-height: 1.45 !important;
            letter-spacing: 0 !important;
            text-align: left !important;
          }
          #morning-menu .morning-set .set-price {
            margin: 10px 0 0 !important;
            font-family: "Zen Kaku Gothic New", sans-serif !important;
            font-size: 22px !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
            color: #6f3d24 !important;
            text-align: left !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.querySelector('#mobile-menu-unify-style')) {
      const style = document.createElement('style');
      style.id = 'mobile-menu-unify-style';
      style.textContent = `
        @media (max-width: 760px) {
          #menu .cards,
          #menu .dish-photo-grid,
          #menu .nested-set-photos,
          #menu .nested-menu-photo,
          #menu .float-photo-grid,
          #menu .summer-photo-grid,
          #menu .side-dish-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
            row-gap: 28px !important;
            align-items: start !important;
          }
          #menu .card,
          #menu .dish-photo-item,
          #menu .menu-photo-fix-card {
            min-width: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          #menu .card > .card-photo,
          #menu .card > .menu-photo-fix-image,
          #menu .card > img,
          #menu .dish-photo-item > .dish-photo-link,
          #menu .dish-photo-item > .card-photo,
          #menu .dish-photo-item > img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 4 / 3 !important;
            overflow: hidden !important;
            margin: 0 0 10px !important;
            padding: 0 !important;
            background: transparent !important;
          }
          #menu .card > .card-photo img,
          #menu .card > .menu-photo-fix-image img,
          #menu .card > img,
          #menu .dish-photo-item > .dish-photo-link img,
          #menu .dish-photo-item > .card-photo img,
          #menu .dish-photo-item > img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            aspect-ratio: 4 / 3 !important;
            object-fit: cover !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #menu .card h3,
          #menu .card h4,
          #menu .dish-photo-item h3,
          #menu .dish-photo-item h4,
          #menu .menu-photo-fix-card h3,
          #menu .menu-photo-fix-card h4 {
            min-height: 2.8em !important;
            margin: 0 0 6px !important;
            font-size: 16px !important;
            line-height: 1.4 !important;
            text-align: left !important;
          }
          #menu .card .dish-price,
          #menu .dish-photo-item .dish-price,
          #menu .menu-photo-fix-card .dish-price {
            margin: 6px 0 0 !important;
            font-size: 16px !important;
            line-height: 1.2 !important;
            text-align: left !important;
          }
          #menu .card .menu-note,
          #menu .dish-photo-item .menu-note,
          #menu .menu-photo-fix-card .menu-note {
            width: 100% !important;
            margin: 0 0 6px !important;
            padding: 10px 12px !important;
            font-size: 11px !important;
            line-height: 1.6 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.querySelector('#side-dish-crop-fix')) {
      const style = document.createElement('style');
      style.id = 'side-dish-crop-fix';
      style.textContent = `
        #menu img[alt="揚げ出し豆腐"],
        #menu img[alt="大きな茶碗蒸し"] {
          object-fit: contain !important;
          object-position: center center !important;
          background: #1b1814 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const gallery = document.querySelector('#shop .shop-gallery-scroll');
    if (gallery && !gallery.parentElement?.querySelector('.shop-gallery-arrows')) {
      const wrap = document.createElement('div');
      wrap.className = 'shop-gallery-arrow-wrap';
      gallery.parentNode.insertBefore(wrap, gallery);
      wrap.appendChild(gallery);
      const controls = document.createElement('div');
      controls.className = 'shop-gallery-arrows';
      controls.innerHTML = `<button type="button" class="shop-gallery-arrow shop-gallery-prev" aria-label="前の写真を見る">◀</button><button type="button" class="shop-gallery-arrow shop-gallery-next" aria-label="次の写真を見る">▶</button>`;
      wrap.appendChild(controls);
      const prev = controls.querySelector('.shop-gallery-prev');
      const next = controls.querySelector('.shop-gallery-next');
      const amount = () => Math.max(gallery.clientWidth * 0.78, 260);
      prev.addEventListener('click', () => gallery.scrollBy({ left: -amount(), behavior: 'smooth' }));
      next.addEventListener('click', () => gallery.scrollBy({ left: amount(), behavior: 'smooth' }));
      const updateArrows = () => {
        const max = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
        prev.disabled = gallery.scrollLeft <= 4;
        next.disabled = gallery.scrollLeft >= max - 4;
      };
      gallery.addEventListener('scroll', updateArrows, { passive: true });
      window.addEventListener('resize', updateArrows);
      requestAnimationFrame(updateArrows);
      const style = document.createElement('style');
      style.id = 'shop-gallery-arrow-style';
      style.textContent = `.shop-gallery-arrow-wrap{position:relative}.shop-gallery-arrows{position:absolute;left:0;right:0;top:0;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:space-between;padding:0 8px;z-index:4}.shop-gallery-arrow{pointer-events:auto;width:42px;height:42px;border:0;border-radius:50%;background:rgba(244,240,230,.92);color:#26251f;box-shadow:0 2px 12px rgba(0,0,0,.18);font-size:18px;line-height:1;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px)}.shop-gallery-arrow:disabled{opacity:.28;cursor:default}@media(max-width:760px){.shop-gallery-arrow-wrap{position:relative}.shop-gallery-arrows{left:0;right:0;top:0;height:auto;aspect-ratio:4/3;padding:0 6px;align-items:center}.shop-gallery-arrow{width:38px;height:38px;font-size:16px}}`;
      document.head.appendChild(style);
    }
  };

  core.onerror = () => console.error('script-base.js could not be loaded');
  document.head.appendChild(core);
})();