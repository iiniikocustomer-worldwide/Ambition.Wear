(() => {
  'use strict';

  const INSTAGRAM_URL = 'https://www.instagram.com/_wear_ambition?rpxt=MWYyMDViOXY2MGh3cA==';
  const CSS_PATH = 'white-space-content.css';

  function loadContentStyles() {
    if (document.querySelector(`link[href$="/${CSS_PATH}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(CSS_PATH, document.baseURI).href;
    document.head.append(link);
  }

  function updateInstagramLinks(root = document) {
    const links = [...(root.matches?.('a[href*="instagram.com"]') ? [root] : []), ...root.querySelectorAll('a[href*="instagram.com"]')];
    links.forEach((link) => {
      link.href = INSTAGRAM_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (link.textContent.toLowerCase().includes('instagram') || link.closest('.contact-card')) {
        const strong = link.querySelector('strong');
        if (strong) strong.textContent = '@_wear_ambition ↗';
        else if (link.closest('.footer-links')) link.textContent = 'Instagram ↗';
      }
    });
  }

  function addStoryContent() {
    const story = document.querySelector('.story-content');
    if (!story || document.querySelector('.story-values-panel')) return;
    const panel = document.createElement('section');
    panel.className = 'story-values-panel';
    panel.setAttribute('aria-labelledby', 'story-values-heading');
    panel.innerHTML = `
      <div class="story-values-copy">
        <p class="eyebrow">WHAT WE STAND FOR</p>
        <h2 id="story-values-heading">Wear your<br><span>own ambition.</span></h2>
        <p>Our pieces are made for people who choose their own direction and bring their individuality with them.</p>
        <a class="button button-dark" href="shop.html">Explore the collection <span aria-hidden="true">↗</span></a>
      </div>
      <div class="story-values-list" aria-label="Ambition Wear values">
        <article><span>01</span><div><h3>Move with purpose</h3><p>Keep going, one step and one idea at a time.</p></div></article>
        <article><span>02</span><div><h3>Be unapologetically you</h3><p>Individuality belongs in everything you wear.</p></div></article>
        <article><span>03</span><div><h3>Make your own way</h3><p>Dream big, create boldly, and define success for yourself.</p></div></article>
      </div>`;
    story.insertAdjacentElement('afterend', panel);
  }

  function addContactGuidance() {
    const intro = document.querySelector('.contact-intro');
    if (!intro || intro.querySelector('.contact-helpful-note')) return;
    const note = document.createElement('aside');
    note.className = 'contact-helpful-note';
    note.innerHTML = '<p class="eyebrow">QUICK TIP</p><p>Asking about an order? Include the item name, size, colour and your order number so we can help faster.</p><a href="https://wa.me/27672364124" target="_blank" rel="noopener noreferrer">Message us on WhatsApp <span aria-hidden="true">↗</span></a>';
    intro.append(note);
  }

  function init() {
    loadContentStyles();
    updateInstagramLinks();
    addStoryContent();
    addContactGuidance();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    updateInstagramLinks(node);
    if (node.matches?.('.story-content') || node.querySelector?.('.story-content')) addStoryContent();
    if (node.matches?.('.contact-intro') || node.querySelector?.('.contact-intro')) addContactGuidance();
  })));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
