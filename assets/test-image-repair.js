(() => {
  const base = 'https://raw.githubusercontent.com/carpetcleaningcompany007-maker/carpet-cleaning-showcase/main/';
  const filenames = new Set([
    'jw-home-hero.webp',
    'carla-hallway-before-final.jpg', 'carla-carpet-after.jpg',
    'carla-carpet-extraction.jpg', 'carla-carpet-process.jpg',
    'carla-google-review-source.jpg', 'carla-prespray-dirty-carpet.png',
    'carla-story-original-restored.jpg', 'carpet-before-genuine.png',
    'carpet-after-genuine.png', 'facebook-before-after-1.jpg',
    'facebook-before-after-2.jpg', 'green-stairs-before.jpg',
    'green-stairs-after.jpg', 'grey-carpet-before-2.jpg', 'grey-carpet-after-2.jpg'
  ]);
  const repair = () => {
    document.querySelectorAll('img').forEach(image => {
      const name = image.getAttribute('src')?.split('/').pop()?.split('?')[0];
      if (name && filenames.has(name) && image.dataset.testImageFixed !== 'yes') {
        image.dataset.testImageFixed = 'yes';
        image.src = base + name;
      }
    });
  };
  repair();
  new MutationObserver(repair).observe(document.documentElement, {childList:true, subtree:true});
})();
