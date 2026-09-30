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

    // Add the kids' kishimen photo to the same compact photo grid used by the other rice/kids menu items.
    const kidsGroup = findGroup('丼もの・お子様メニュー');
    if (kidsGroup && !kidsGroup.querySelector('[data-kids-kishimen-photo]')) {
      let grid = kidsGroup.querySelector('.nested-menu-photo.cards, .float-photo-grid.cards');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'nested-menu-photo cards float-photo-grid';
        kidsGroup.querySelector('.menu-list')?.before(grid);
      }
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.kidsKishimenPhoto = '';
      card.innerHTML = `
        <img src="images/menu-kids-kishimen.jpg" alt="お子様きしめん" loading="lazy" decoding="async" width="360" height="240">
        <h3>お子様きしめん</h3>
        <p class="dish-price">650円</p>`;
      grid.appendChild(card);
    }

    // Add photos for Oyakodon, Tekkadon and Negitorodon using the existing donburi card layout.
    if (kidsGroup) {
      let grid = kidsGroup.querySelector('.nested-menu-photo.cards, .float-photo-grid.cards');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'nested-menu-photo cards float-photo-grid';
        kidsGroup.querySelector('.menu-list')?.before(grid);
      }

      const donburi = [
        { name: '親子丼', price: '1,000円', image: 'images/oyakodon.jpg', key: 'oyakodon' },
        { name: '鉄火丼', price: '1,040円', image: 'images/tekkadon.jpg', key: 'tekkadon' },
        { name: 'ネギトロ丼', price: '1,040円', image: 'images/negitorodon.jpg', key: 'negitorodon' }
      ];

      donburi.forEach(({ name, price, image, key }) => {
        if (grid.querySelector(`[data-donburi-photo="${key}"]`) || [...grid.querySelectorAll('h3')].some(title => title.textContent.trim() === name)) return;
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.donburiPhoto = key;
        card.innerHTML = `
          <img src="${image}" alt="${name}" loading="lazy" decoding="async" width="360" height="240">
          <h3>${name}</h3>
          <p class="dish-price">${price}</p>`;
        grid.appendChild(card);
      });

      const photoNames = new Set(donburi.map(item => item.name));
      kidsGroup.querySelectorAll('.menu-list > div').forEach(row => {
        const name = row.querySelector('dt')?.textContent.trim();
        if (photoNames.has(name)) row.remove();
      });
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