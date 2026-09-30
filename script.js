const button = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
function setMenu(open) {
 nav.classList.toggle('open', open);
 button.setAttribute('aria-expanded', String(open));
 button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
}
button.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); button.focus(); }
});

/* Always open the site from the very top instead of restoring a menu anchor/scroll position. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function resetInitialView() {
 if (location.hash) history.replaceState(null, '', location.pathname + location.search);
 requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
}
addEventListener('pageshow', resetInitialView);

const opening = document.querySelector('.opening');
const header = document.querySelector('.header');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
let framePending = false;
function updateOpening() {
 framePending = false;
 if (!opening) return;
 if (opening.classList.contains('scroll-signature')) {
  opening.classList.add('scroll-ready');
  const stage = opening.querySelector('.opening-stage');
  const progress = clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - stage.offsetHeight));
  const fade = smooth(progress / .72);
  opening.style.setProperty('--signature-opacity', 1 - fade);
  opening.style.setProperty('--signature-wipe', (135 - fade * 170) + '%');
  opening.style.setProperty('--signature-y', reduceMotion.matches ? '0px' : (-progress * 14) + 'px');
  const copyOpacity = smooth((progress - .80) / .16);
  opening.style.setProperty('--copy-opacity', copyOpacity);
  document.documentElement.classList.toggle('opening-copy-visible', copyOpacity >= .995);
  opening.style.setProperty('--cue-opacity', 1 - smooth(progress / .2));
  const copy = opening.querySelector('.opening-copy');
  copy.inert = progress < .70;
  copy.style.visibility = progress < .64 ? 'hidden' : 'visible';
  header.classList.toggle('over-opening', opening.getBoundingClientRect().bottom > header.offsetHeight);
  return;
 }
 if (reduceMotion.matches) { header.classList.remove('over-opening'); return; }
 const stage = opening.querySelector('.opening-stage');
 const progress = clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - stage.offsetHeight));
 opening.style.setProperty('--wipe', (140 - smooth(progress / .85) * 180) + '%');
 opening.style.setProperty('--photo-opacity', smooth((progress - .03) / .52));
 opening.style.setProperty('--photo-scale', 1.035 - smooth(progress) * .035);
 opening.style.setProperty('--mark-opacity', 1 - smooth(progress / .63));
 opening.style.setProperty('--mark-scale', 1 + progress * .06);
 opening.style.setProperty('--mark-blur', (progress * 5) + 'px');
 opening.style.setProperty('--cue-opacity', 1 - clamp(progress * 6));
 const cue = opening.querySelector('.scroll-cue');
 if (cue) cue.style.visibility = progress > .2 ? 'hidden' : 'visible';
 header.classList.toggle('over-opening', opening.getBoundingClientRect().bottom > stage.offsetHeight * .35);
}
function scheduleOpening() { if (!framePending) { framePending = true; requestAnimationFrame(updateOpening); } }
addEventListener('scroll', scheduleOpening, { passive: true });
addEventListener('resize', scheduleOpening);
addEventListener('pageshow', scheduleOpening);
reduceMotion.addEventListener('change', scheduleOpening);
updateOpening();

// Anniversary turns over on March 3 in Japan, independent of the visitor's timezone.
function foundingAnniversary(date = new Date()) {
 const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date);
 const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
 const year = Number(values.year), month = Number(values.month), day = Number(values.day);
 return year - 1973 - (month < 3 || (month === 3 && day < 3) ? 1 : 0);
}
function updateAnniversary() {
 document.querySelectorAll('[data-founding-years]').forEach(element => { element.textContent = foundingAnniversary(); });
 document.querySelectorAll('[data-anniversary]').forEach(element => {
  element.textContent = `創業${foundingAnniversary()}周年`;
 });
}
updateAnniversary();
addEventListener('pageshow', updateAnniversary);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateAnniversary(); });

/* Move fried gyoza out of the autumn feature and into the regular side-dish section. */
function placeFriedGyozaWithSideDishes() {
 const autumnCards = [...document.querySelectorAll('#autumn-menu .card')];
 const gyozaCard = autumnCards.find(card => card.querySelector('h3')?.textContent.trim() === '揚げ餃子');
 const sideGrid = document.querySelector('.side-dish-grid');
 if (gyozaCard && sideGrid) {
  gyozaCard.classList.remove('card', 'reveal');
  gyozaCard.classList.add('dish-photo-item');
  const link = gyozaCard.querySelector('a');
  if (link) {
   link.classList.remove('card-photo');
   link.classList.add('dish-photo-link');
   link.setAttribute('aria-label', '揚げ餃子の写真');
  }
  const heading = gyozaCard.querySelector('h3');
  if (heading) {
   const h4 = document.createElement('h4');
   h4.textContent = heading.textContent;
   heading.replaceWith(h4);
  }
  sideGrid.appendChild(gyozaCard);
 }
 const sideMenu = [...document.querySelectorAll('.menu-group')].find(group => group.querySelector('summary')?.textContent.trim() === '一品料理・ご飯');
 const sideList = sideMenu?.querySelector('.menu-list');
 const alreadyListed = sideList && [...sideList.querySelectorAll('dt')].some(dt => dt.textContent.trim() === '揚げ餃子');
 if (sideList && !alreadyListed) {
  const row = document.createElement('div');
  row.innerHTML = '<dt>揚げ餃子</dt><dd>480円</dd>';
  sideList.appendChild(row);
 }
}
placeFriedGyozaWithSideDishes();

/* Make the Matsutake Dobinmushi photo render reliably from Drive. */
function fixMatsutakeDobinPhoto() {
 const card = [...document.querySelectorAll('#autumn-menu .card')].find(card => card.querySelector('h3')?.textContent.trim() === '松茸土瓶蒸し');
 if (!card) return;
 const imageUrl = 'https://lh3.googleusercontent.com/d/1mXZBnZlctLMy47ozYQSJkh985lFnYxjn=w1600';
 const img = card.querySelector('img');
 const link = card.querySelector('a');
 if (img) {
  img.src = imageUrl;
  img.alt = '松茸土瓶蒸し';
 }
 if (link) link.href = imageUrl;
}
fixMatsutakeDobinPhoto();

/* Keep seasonal menu naming consistent. */
const autumnMenuTitle = document.querySelector('#autumn-menu-title');
if (autumnMenuTitle) autumnMenuTitle.textContent = '秋季限定';

/* Add the serving period to the two matsutake dishes. */
function addMatsutakeServingPeriod() {
 const targets = new Set(['松茸土瓶蒸し', '松茸土瓶蒸しときのこ天ぷら御膳']);
 document.querySelectorAll('#autumn-menu .card').forEach(card => {
  const heading = card.querySelector('h3');
  if (!heading || !targets.has(heading.textContent.trim())) return;
  if (card.querySelector('.matsutake-period')) return;
  const note = document.createElement('p');
  note.className = 'menu-note matsutake-period';
  note.textContent = '10月〜11月下旬まで';
  heading.insertAdjacentElement('afterend', note);
 });
}
addMatsutakeServingPeriod();

/* Keep menu cards clean: remove item numbers and descriptive copy, but preserve prices and serving-period notes. */
function simplifyMenuCards() {
 document.querySelectorAll('.cards .card > .number, .commitment-no').forEach(element => element.remove());
 document.querySelectorAll('.cards .card').forEach(card => {
  [...card.children].forEach(child => {
   if (child.tagName !== 'P') return;
   if (child.classList.contains('dish-price') || child.classList.contains('menu-note')) return;
   child.remove();
  });
 });
}
simplifyMenuCards();

/* Expand the noodle craftsmanship story. */
function updateNoodleCraftCopy() {
 const noodleArticle = [...document.querySelectorAll('.commitment-grid article')].find(article => article.querySelector('.craft-word')?.textContent.trim() === '麺');
 if (!noodleArticle) return;
 const heading = noodleArticle.querySelector('.craft-copy h3');
 const body = noodleArticle.querySelector('.craft-copy p');
 if (heading) heading.innerHTML = '毎日、角屋で打つ。<br>「麺だけでもうまい」一杯へ。';
 if (body) body.textContent = '小麦粉は香川から直送し、中でも一番粉を使用。毎日、角屋で麺を仕込んでいます。目指すのは、だしに頼らず「麺だけでもうまい」と思えるきしめん。配合を独自にブレンドし、つるっとした喉ごしだけでなく、もちもちとした食感にも仕上げています。';
}
updateNoodleCraftCopy();

/* Mobile craft section: force a clean one-column layout and prevent vertical text overlap. */
const craftMobileFix = document.createElement('style');
craftMobileFix.textContent = `
@media (max-width: 760px) {
  .commitment-editorial .commitment-grid article {
    display: block !important;
    padding: 40px 0 !important;
  }
  .commitment-editorial .commitment-no { display: none !important; }
  .commitment-editorial .craft-word {
    writing-mode: horizontal-tb !important;
    font-size: 50px !important;
    line-height: 1 !important;
    margin: 0 0 22px !important;
    justify-self: auto !important;
  }
  .commitment-editorial .craft-copy {
    max-width: none !important;
    width: 100% !important;
  }
  .commitment-editorial .craft-copy h3 {
    font-size: 22px !important;
    line-height: 1.7 !important;
    margin: 0 0 14px !important;
  }
  .commitment-editorial .craft-copy p {
    font-size: 14px !important;
    line-height: 2 !important;
    letter-spacing: .02em !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }
}
`;
document.head.appendChild(craftMobileFix);

/* Photos are display-only: remove navigation/zoom behavior from every image link. */
function disableImageLinks() {
 document.querySelectorAll('a').forEach(link => {
  if (!link.querySelector('img')) return;
  link.removeAttribute('href');
  link.removeAttribute('target');
  link.removeAttribute('rel');
  link.removeAttribute('aria-label');
  link.removeAttribute('tabindex');
  link.style.cursor = 'default';
  link.addEventListener('click', event => event.preventDefault());
 });
}
disableImageLinks();

/* Reveal only below-the-fold content, once. Content remains readable without JS. */
const motionItems = [...document.querySelectorAll('.welcome h2, .section-title, .about-grid > *, .cards > .card, .miso-showcase > *, .morning-set, .shop-gallery figure, .feature-copy')];
let revealObserver;
function configureReveals() {
 if (revealObserver) revealObserver.disconnect();
 motionItems.forEach(element => element.classList.remove('motion-pending', 'motion-revealed'));
 if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
 revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (!entry.isIntersecting) return;
   entry.target.classList.remove('motion-pending');
   entry.target.classList.add('motion-revealed');
   revealObserver.unobserve(entry.target);
  });
 }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
 motionItems.forEach(element => {
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight) return;
  const siblings = [...element.parentElement.children];
  const stagger = element.matches('.card, .morning-set, .shop-gallery figure') && window.innerWidth > 760;
  element.style.setProperty('--reveal-delay', stagger ? ((siblings.indexOf(element) % 3) * 90) + 'ms' : '0ms');
  element.classList.add('motion-pending');
  revealObserver.observe(element);
 });
}
document.addEventListener('focusin', event => {
 const item = event.target.closest('.motion-pending');
 if (item) { item.classList.remove('motion-pending'); revealObserver?.unobserve(item); }
});
reduceMotion.addEventListener('change', configureReveals);
addEventListener('pageshow', configureReveals);
configureReveals();

// Do not use artwork cropped from a composite image. Keep the craft section clean until each illustration is a standalone asset.
document.querySelectorAll('.craft-art').forEach(element => element.remove());


// Morning menu: stagger cards into view as the section enters the viewport.
(() => {
  const cards = [...document.querySelectorAll('.morning-sets .morning-set')];
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = cards.indexOf(entry.target);
      window.setTimeout(() => entry.target.classList.add('morning-in'), Math.max(0,index) * 115);
      observer.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
  cards.forEach(card => observer.observe(card));
})();


// Menu tabs: show only the selected category.
(() => {
 const menu=document.querySelector('#menu');
 if(!menu) return;
 const tabs=[...menu.querySelectorAll('[data-menu-tab]')];
 const autumn=menu.querySelector('#autumn-menu');
 const heading=menu.querySelector('#regular-menu');
 const photoCards=heading?.nextElementSibling;
 const morning=document.querySelector('#morning-menu');
 const cats=menu.querySelector('.menu-categories');
 if(!tabs.length || !cats) return;

 const groups=[...cats.children].filter(el=>el.classList.contains('menu-group'));
 const take=(names)=>groups.filter(g=>names.includes((g.querySelector('summary')?.textContent||'').trim()));
 const anchor=cats;
 const make=(key,nodes)=>{
   const p=document.createElement('div');
   p.className='menu-tab-panel';
   p.dataset.menuPanel=key;
   nodes.filter(Boolean).forEach(n=>p.appendChild(n));
   anchor.parentNode.insertBefore(p,anchor);
   return p;
 };
 const panels=[
   make('season',[autumn,...take(['夏季限定','年越し蕎麦'])]),
   make('set',[heading,photoCards,...take(['定食'])]),
   make('noodle',[...take(['味噌煮込みきしめん','きしめん','丼もの・お子様メニュー','ミニ丼セット'])]),
   make('side',[...take(['一品料理・ご飯','お飲み物・デザート'])]),
   make('morning',[morning])
 ];
 anchor.remove();

 function show(key){
   tabs.forEach(btn=>{
     const active=btn.dataset.menuTab===key;
     btn.classList.toggle('is-active',active);
     btn.setAttribute('aria-selected',active?'true':'false');
   });
   panels.forEach(p=>{ p.hidden=p.dataset.menuPanel!==key; });
 }
 tabs.forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.menuTab)));
 show('season');
})();


// Cinematic opening + delayed mobile shortcut dock.
(() => {
 const opening=document.querySelector('.opening-new');
 const dock=document.querySelector('.mobile-dock');
 if(!opening) return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reveal=()=>document.body.classList.add('opening-ready');
 if(reduced) reveal(); else window.setTimeout(reveal,420);

 if(!dock) return;
 const updateDock=()=>{
   // The opening section contains both the logo stage and the 53-year image/copy.
   // Keep shortcuts hidden until the visitor has passed that entire sequence.
   const threshold=opening.offsetTop + opening.offsetHeight - Math.min(100,window.innerHeight*.08);
   const ready = window.scrollY + window.innerHeight >= threshold;
   dock.classList.toggle('dock-visible',ready);
   document.body.classList.toggle('desktop-rail-ready',ready);
 };
 updateDock();
 addEventListener('scroll',updateDock,{passive:true});
 addEventListener('resize',updateDock,{passive:true});
 addEventListener('pageshow',updateDock);
})();

// Accordion menus always start closed.
document.querySelectorAll('#menu details.menu-group').forEach(item=>item.open=false);

/* Header logo: return to the opening screen. */
document.querySelector('.header .logo')?.addEventListener('click', event => {
  event.preventDefault();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
});

/* Mobile-style auto-hiding header: upward page movement hides it; downward page movement shows it. */
(() => {
  const siteHeader = document.querySelector('.header');
  if (!siteHeader) return;
  let lastY = window.scrollY;
  const updateHeaderDirection = () => {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    if (y <= 8) {
      siteHeader.classList.remove('header-hidden');
      siteHeader.classList.add('header-visible');
    } else if (delta < -4) {
      siteHeader.classList.remove('header-hidden');
      siteHeader.classList.add('header-visible');
    } else if (delta > 4) {
      siteHeader.classList.add('header-hidden');
      siteHeader.classList.remove('header-visible');
    }
    lastY = y;
  };
  addEventListener('scroll', updateHeaderDirection, { passive: true });
  updateHeaderDirection();
})();
