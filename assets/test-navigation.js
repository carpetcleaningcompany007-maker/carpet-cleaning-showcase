(() => {
  const testHome = 'https://htmlpreview.github.io/?https://raw.githubusercontent.com/carpetcleaningcompany007-maker/carpet-cleaning-showcase/main/index.html';
  const repairHomeLinks = () => {
    document.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href') === '/') link.href = testHome;
    });
  };
  repairHomeLinks();
  new MutationObserver(repairHomeLinks).observe(document.documentElement, { childList: true, subtree: true });
})();
