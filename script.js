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
  opening.style.setProperty('--copy-opacity', smooth((progress - .68) / .24));
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
