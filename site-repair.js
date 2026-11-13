(() => {
  'use strict';

  function repairStoryVideo() {
    const video = document.querySelector('.story-film-section video');
    if (!video || video.dataset.localSourceReady) return;

    const filename = '• Two young men spend their days working inside a busy clothing warehouse_ surrounded by boxes_ fabric_ labels_ and unfinished ideas. While everyone else s.mp4';
    const path = ['Ambition Wear', 'Ambition Lifestyle', filename]
      .map((part) => encodeURIComponent(part))
      .join('/');

    video.dataset.localSourceReady = 'true';
    video.removeAttribute('src');
    video.querySelectorAll('source').forEach((source) => source.remove());
    video.src = new URL(path, document.baseURI).href;
    video.load();

    video.addEventListener('error', () => {
      const caption = video.parentElement?.querySelector('p');
      if (caption) caption.textContent = 'The campaign video could not be loaded. Please try again later.';
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repairStoryVideo, { once: true });
  } else {
    repairStoryVideo();
  }
})();
