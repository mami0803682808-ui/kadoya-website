// Show actual dishes on arrival, keeping the shared homepage tab behavior.
(() => {
  const menu = document.querySelector('#menu');
  if (!menu) return;
  const revealFirst = () => {
    if (!menu.querySelector('[data-menu-panel]')) return false;
    requestAnimationFrame(() => {
      const first = menu.querySelector('[data-menu-panel="season"] details.menu-group');
      if (first) first.open = true;
    });
    return true;
  };
  if (revealFirst()) return;
  const observer = new MutationObserver(() => {
    if (revealFirst()) observer.disconnect();
  });
  observer.observe(menu, { childList: true, subtree: true });
})();
