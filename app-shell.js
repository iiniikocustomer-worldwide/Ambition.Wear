(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = (selector) => document.querySelector(selector);

  function loadStoreFeatures() {
    if (document.querySelector('script[data-store-features]')) return;
    const script = document.createElement('script');
    script.src = new URL('site-features.js', document.baseURI).href;
    script.defer = true;
    script.dataset.storeFeatures = 'true';
    document.head.append(script);
  }

  function loadLayoutRepair() {
    if (!document.querySelector('link[data-layout-repair]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('layout-repair.css', document.baseURI).href;
      stylesheet.dataset.layoutRepair = 'true';
      document.head.append(stylesheet);
    }
    if (!document.querySelector('script[data-site-repair]')) {
      const script = document.createElement('script');
      script.src = new URL('site-repair.js', document.baseURI).href;
      script.dataset.siteRepair = 'true';
      document.head.append(script);
    }
  }

  function setMenuIcon() {
    const holder = $('.menu-toggle__icon');
    if (!holder || holder.querySelector('[data-menu-svg]')) return;
    holder.style.background = 'transparent';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.dataset.menuSvg = 'true';
    svg.innerHTML = '<path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    holder.replaceChildren(svg);
  }

  function bootNavigation() {
    const header = $('.site-header');
    const toggle = $('.menu-toggle');
    const nav = $('.nav-links');
    if (!header || !toggle || !nav || toggle.dataset.menuBound) return;
    toggle.dataset.menuBound = 'true';
    const setMenuState = (open) => {
      header.classList.toggle('menu-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setMenuState(!header.classList.contains('menu-open')));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target) && !event.target.closest('.menu-toggle')) setMenuState(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenuState(false); });
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenuState(false); });
  }

  function registerWorker() {
    if (!('serviceWorker' in navigator) || document.documentElement.dataset.workerBound) return;
    document.documentElement.dataset.workerBound = 'true';
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => undefined), { once: true });
  }

  loadLayoutRepair();
  loadStoreFeatures();
  setMenuIcon();
  bootNavigation();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setMenuIcon(); bootNavigation(); }, { once: true });
  }
  registerWorker();
})();
