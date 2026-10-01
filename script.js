(() => {
  const core = document.createElement('script');
  core.src = 'script-base.js';
  core.async = false;

  core.onload = () => {
    const menu = document.querySelector('#menu');
    if (!menu) return;

    // Replace the existing Tanagata Tanuki Kishimen photo while preserving its current card, title and price styling.
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

    // Rebuild the donburi/kids photo cards from scratch so every item uses the same
    // structure, image ratio, title position and price placement on mobile and desktop.
    const donGroup = findGroup('丼もの・お子様メニュー');
    if (donGroup) {
      let grid = donGroup.querySelector('.nested-menu-photo.cards, .float-photo-grid.cards');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'nested-menu-photo cards float-photo-grid';
        donGroup.querySelector('.menu-list')?.before(grid);
      }

      const targets = new Set(['親子丼', '鉄火丼', 'ネギトロ丼', 'お子様きしめん']);

      // Remove every previously injected/broken version of these four cards.
      [...grid.querySelectorAll('article')].forEach(card => {
        const name = card.querySelector('h3, h4')?.textContent.trim();
        const src = card.querySelector('img')?.getAttribute('src') || '';
        if (
          targets.has(name) ||
          card.hasAttribute('data-kids-kishimen-photo') ||
          card.hasAttribute('data-donburi-photo') ||
          card.hasAttribute('data-menu-photo-fix') ||
          /oyakodon|tekkadon|negitorodon|menu-kids-kishimen/.test(src)
        ) {
          card.remove();
        }
      });

      const items = [
        { name: '親子丼', price: '1,000円', image: 'images/oyakodon.jpg', key: 'oyakodon' },
        { name: '鉄火丼', price: '1,040円', image: 'images/tekkadon.jpg', key: 'tekkadon' },
        { name: 'ネギトロ丼', price: '1,040円', image: 'images/negitorodon.jpg', key: 'negitorodon' },
        { name: 'お子様きしめん', price: '650円', image: 'images/menu-kids-kishimen.jpg', key: 'kids-kishimen' }
      ];

      items.forEach(({ name, price, image, key }) => {
        const card = document.createElement('article');
        card.className = 'card menu-photo-fix-card';
        card.dataset.menuPhotoFix = key;
        card.innerHTML = `
          <span class="card-photo menu-photo-fix-image">
            <img src="${image}?v=20261001-2" alt="${name}" loading="lazy" decoding="async" width="800" height="533">
          </span>
          <h3>${name}</h3>
          <p class="dish-price">${price}</p>`;
        grid.appendChild(card);
      });

      // Remove duplicate text-only rows now represented by photo cards.
      donGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = row.querySelector('dt')?.textContent.trim();
        if (targets.has(name)) row.remove();
      });

      // Scope the fix to these cards only so no other menu section changes.
      if (!document.querySelector('#menu-photo-fix-style')) {
        const style = document.createElement('style');
        style.id = 'menu-photo-fix-style';
        style.textContent = `
          #menu .menu-photo-fix-card {
            min-width: 0 !important;
            overflow: visible !important;
          }
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
            aspect-ratio: 3 / 2 !important;
            object-fit: cover !important;
            object-position: center !important;
            max-width: none !important;
            margin: 0 !important;
          }
          #menu .menu-photo-fix-card h3 {
            position: static !important;
            display: block !important;
            margin: 0 0 8px !important;
            padding: 0 !important;
            line-height: 1.35 !important;
            height: auto !important;
            min-height: 0 !important;
            transform: none !important;
          }
          #menu .menu-photo-fix-card .dish-price {
            position: static !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
            height: auto !important;
            min-height: 0 !important;
            transform: none !important;
          }
          @media (max-width: 760px) {
            #menu .menu-photo-fix-card {
              display: block !important;
              width: 100% !important;
              margin: 0 0 34px !important;
              padding: 0 !important;
            }
            #menu .menu-photo-fix-card .menu-photo-fix-image {
              width: 100% !important;
              aspect-ratio: 3 / 2 !important;
              margin-bottom: 14px !important;
            }
            #menu .menu-photo-fix-card h3 {
              font-size: inherit !important;
              margin-bottom: 8px !important;
            }
            #menu .menu-photo-fix-card .dish-price {
              margin-top: 0 !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Add the single large fried shrimp to the existing side-dish photo grid so its image, label and price match nearby items.
    const sideGrid = menu.querySelector('.side-dish-grid');
    if (sideGrid && !sideGrid.querySelector('[data-oebi-single-photo]')) {
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
  };

  core.onerror = () => console.error('script-base.js could not be loaded');
  document.head.appendChild(core);
})();