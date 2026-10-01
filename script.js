(() => {
  const core = document.createElement('script');
  core.src = 'script-base.js';
  core.async = false;

  core.onload = () => {
    const menu = document.querySelector('#menu');
    if (!menu) return;

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

    // Rename the seasonal menu heading from autumn-only to autumn/winter.
    const autumnMenu = menu.querySelector('#autumn-menu');
    const autumnSummary = autumnMenu?.querySelector('summary');
    if (autumnSummary && autumnSummary.textContent.trim() === '秋季限定') {
      autumnSummary.textContent = '秋冬限定';
    }

    // Match the summer tempura item typography and price styling to the other menu cards.
    const summerGroup = findGroup('夏季限定');
    if (summerGroup) {
      summerGroup.querySelectorAll('.tempura-feature').forEach(item => {
        const title = item.querySelector('.tempura-feature-info h3');
        const price = item.querySelector('.tempura-feature-info p');
        if (title) title.classList.add('summer-tempura-title-fix');
        if (price) price.classList.add('dish-price', 'summer-tempura-price-fix');
      });

      if (!document.querySelector('#summer-tempura-style-fix')) {
        const style = document.createElement('style');
        style.id = 'summer-tempura-style-fix';
        style.textContent = `
          #menu .tempura-feature-info .summer-tempura-title-fix {
            font-family: "Noto Serif JP", serif !important;
            font-weight: 500 !important;
            letter-spacing: 0 !important;
            line-height: 1.5 !important;
            margin: 8px 0 2px !important;
          }
          #menu .tempura-feature-info .summer-tempura-price-fix {
            font-size: 22px !important;
            font-weight: 600 !important;
            color: #6f3d24 !important;
            line-height: 1.5 !important;
            margin: 12px 0 !important;
          }
          @media (max-width: 760px) {
            #menu .tempura-feature-info .summer-tempura-title-fix {
              font-size: 19px !important;
            }
            #menu .tempura-feature-info .summer-tempura-price-fix {
              font-size: 22px !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
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
          #menu .menu-photo-fix-card .menu-photo-fix-image {
            display: block !important;
            width: 100% !important;
            aspect-ratio: 3 / 2 !important;
            overflow: hidden !important;
            margin: 0 0 16px !important;
            background: transparent !important;
          }
          #menu .menu-photo-fix-card .menu-photo-fix-image img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
            max-width: none !important;
            margin: 0 !important;
          }
          #menu .menu-photo-fix-card h3,
          #menu .menu-photo-fix-card .dish-price,
          #menu .menu-photo-fix-card .menu-note {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            transform: none !important;
          }
          #menu .menu-photo-fix-card h3 { margin: 0 0 8px !important; line-height: 1.35 !important; }
          #menu .menu-photo-fix-card .menu-note { margin: 0 0 8px !important; line-height: 1.5 !important; }
          #menu .menu-photo-fix-card .dish-price { margin: 0 !important; line-height: 1.2 !important; }
          @media (max-width: 760px) {
            #menu .menu-photo-fix-card {
              display: block !important;
              width: 100% !important;
              margin: 0 0 34px !important;
              padding: 0 !important;
            }
            #menu .menu-photo-fix-card .menu-photo-fix-image { margin-bottom: 14px !important; }
          }
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
        <span class="card-photo menu-photo-fix-image">
          <img src="最新版_えびおろしきしめん.jpeg?v=20261001-4" alt="海老おろしきしめん" loading="lazy" decoding="async" width="1536" height="1024">
        </span>
        <h3>海老おろしきしめん</h3>
        <p class="menu-note">冷・季節限定</p>
        <p class="dish-price">1,500円</p>`;
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
        item.innerHTML = `
          <span class="dish-photo-link">
            <img src="${image}?v=20261001-side-3" alt="${name}" loading="lazy" decoding="async" width="1536" height="1024">
          </span>
          <h4>${name}</h4>
          <p class="dish-price">${price}</p>`;
        sideGrid.appendChild(item);
      });

      if (!sideGrid.querySelector('[data-oebi-single-photo]')) {
        const item = document.createElement('article');
        item.className = 'dish-photo-item';
        item.dataset.oebiSinglePhoto = '';
        item.innerHTML = `
          <span class="dish-photo-link portrait">
            <img src="images/menu-oebi-single.jpg" alt="大エビフライ（一本）" loading="lazy" decoding="async" width="360" height="240">
          </span>
          <h4>大エビフライ（一本）</h4>
          <p class="dish-price">880円</p>`;
        sideGrid.appendChild(item);
      }

      if (!document.querySelector('#side-dish-title-font-fix')) {
        const style = document.createElement('style');
        style.id = 'side-dish-title-font-fix';
        style.textContent = `
          #menu .side-dish-grid .dish-photo-item h3,
          #menu .side-dish-grid .dish-photo-item h4 {
            font-family: "Noto Serif JP", serif !important;
            font-weight: 500 !important;
            letter-spacing: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }

      const normalizeSideName = (value = '') => value
        .normalize('NFKC')
        .replace(/〈[^〉]*〉/g, '')
        .replace(/\s+/g, '')
        .replace(/磯部/g, '磯辺')
        .trim();

      const photoNames = new Set(
        [...sideGrid.querySelectorAll('article h3, article h4')]
          .map(el => normalizeSideName(el.textContent))
          .filter(Boolean)
      );

      sideGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const dt = row.querySelector('dt');
        const name = normalizeSideName(dt?.textContent || '');
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

    const normalizeMenuName = (value = '') => value
      .normalize('NFKC')
      .replace(/〈[^〉]*〉/g, '')
      .replace(/[\u3000\s]+/g, '')
      .replace(/磯部/g, '磯辺')
      .trim();

    menu.querySelectorAll('details.menu-group').forEach(group => {
      const seenCards = new Set();
      const photoNames = new Set();

      [...group.querySelectorAll('article')].forEach(card => {
        const title = card.querySelector('h3, h4');
        if (!title) return;
        const name = normalizeMenuName(title.textContent);
        if (!name) return;

        if (seenCards.has(name)) {
          card.remove();
          return;
        }

        seenCards.add(name);
        if (card.querySelector('img')) photoNames.add(name);
      });

      const seenRows = new Set();
      group.querySelectorAll('.menu-list > div').forEach(row => {
        const name = normalizeMenuName(row.querySelector('dt')?.textContent || '');
        if (!name) return;

        if (photoNames.has(name) || seenRows.has(name)) {
          row.remove();
          return;
        }

        seenRows.add(name);
      });
    });
  };

  core.onerror = () => console.error('script-base.js could not be loaded');
  document.head.appendChild(core);
})();