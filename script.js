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
