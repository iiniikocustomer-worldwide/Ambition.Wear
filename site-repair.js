(() => {
  'use strict';

  function repairStoryVideo() {
    const video = document.querySelector('.story-film-section video');
    if (!video || video.dataset.localSourceReady) return;

    const filename = '• Two young men spend their days working inside a busy clothing warehouse_ surrounded by boxes_ fabric_ labels_ and unfinished ideas. While everyone else s.mp4';
    const path = ['Ambition Wear', 'Ambition Lifestyle', filename]
      .map((part) => encodeURIComponent(part))
      .join('/');
    const mediaUrl = new URL(path, document.baseURI).href;

    const fallbackMessage = 'The campaign video could not be loaded. Please try again later.';
    const showFallback = () => {
      const caption = video.parentElement?.querySelector('p');
      if (caption) caption.textContent = fallbackMessage;
      video.setAttribute('poster', 'IMG-20261111-WA0079.jpg');
      video.removeAttribute('src');
      video.querySelectorAll('source').forEach((source) => source.remove());
    };

    video.dataset.localSourceReady = 'true';

    try {
      video.src = mediaUrl;
      video.load();
    } catch (error) {
      showFallback();
      return;
    }

    video.addEventListener('error', showFallback, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repairStoryVideo, { once: true });
  } else {
    repairStoryVideo();
  }
})();
