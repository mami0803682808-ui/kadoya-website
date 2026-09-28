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
 if (reduceMotion.matches) { header.classList.remove('over-opening'); return; }
 const stage = opening.querySelector('.opening-stage');
 const progress = clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - stage.offsetHeight));
 opening.style.setProperty('--wipe', (140 - smooth(progress / .85) * 180) + '%');
 opening.style.setProperty('--photo-opacity', smooth((progress - .03) / .52));
 opening.style.setProperty('--mark-opacity', 1 - smooth(progress / .63));
 opening.style.setProperty('--mark-scale', 1 + progress * .06);
 opening.style.setProperty('--mark-blur', (progress * 5) + 'px');
 opening.style.setProperty('--cue-opacity', 1 - clamp(progress * 6));
 const cue = opening.querySelector('.scroll-cue');
 cue.style.visibility = progress > .2 ? 'hidden' : 'visible';
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
