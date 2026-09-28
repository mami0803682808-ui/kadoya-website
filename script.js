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
