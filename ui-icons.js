(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    shop: '<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
    story: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>',
    studio: '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.6 1.6 0 0 1 1.1-2.7H18a3 3 0 0 0 3-3c0-5-4-8.9-9-8.9Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
    contact: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.5-3A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8.5 11h7"/>',
    bag: '<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    search: '<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16.2 16.2 4.3 4.3"/>',
    whatsapp: '<path d="M20.5 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.2-4.9a8.4 8.4 0 1 1 16.3-3.6Z"/><path d="M8.5 8.5c.5 2.6 2.4 4.5 5 5l1-1 2 .8c-.2 1.1-1 1.8-2.2 1.8-3.8-.2-7.2-3.6-7.4-7.4 0-1.2.7-2 1.8-2.2l.8 2-1 1Z"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    tiktok: '<path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.47"/><path d="M14 4c.5 3 2.5 5 5.5 5.5"/>',
    facebook: '<path d="M14 21v-8h3l.5-3H14V8c0-.9.4-1.5 1.7-1.5H18V3.8c-.7-.1-1.6-.2-2.7-.2-2.8 0-4.7 1.7-4.7 4.9V10H8v3h2.6v8"/>',
    location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3a15 15 0 0 1-6-6l3-2-2-5Z"/>',
    up: '<path d="m6 14 6-6 6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>'
  };

  function makeIcon(name) {
    if (!icons[name]) return null;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('data-ui-icon', name);
    svg.classList.add('ui-icon');
    // Parse children in SVG context so browsers create real SVGPathElement/CircleElement nodes.
    svg.innerHTML = icons[name];
    return svg;
  }

  function addIcon(element, name, placement = 'prepend') {
    if (!element || element.querySelector(':scope > [data-ui-icon]')) return;
    const icon = makeIcon(name);
    if (icon) element[placement](icon);
  }

  function iconForNav(link) {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href.includes('index.html') || href === './' || href === '/') return 'home';
    if (href.includes('shop.html')) return 'shop';
    if (href.includes('story.html')) return 'story';
    if (href.includes('client-account')) return 'studio';
    if (href.includes('contact.html')) return 'contact';
    return null;
  }

  function decorate(root = document) {
    const all = (selector) => [ ...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector) ];
    all('.bag-open').forEach((el) => addIcon(el, 'bag'));
    all('.menu-toggle__icon').forEach((el) => {
      if (!el.querySelector('[data-ui-icon]')) {
        el.style.background = 'transparent';
        el.replaceChildren(makeIcon('menu'));
        el.setAttribute('data-menu-icon-ready', 'true');
      }
    });
    all('.nav-links a, .studio-header nav a').forEach((el) => {
      const name = iconForNav(el);
      if (name) addIcon(el, name);
    });
    all('a[href*="wa.me"]').forEach((el) => addIcon(el, 'whatsapp'));
    all('a[href^="mailto:"]').forEach((el) => addIcon(el, 'email'));
    all('a[href*="instagram.com"]').forEach((el) => addIcon(el, 'instagram'));
    all('a[href^="tel:"]').forEach((el) => addIcon(el, 'phone'));
    all('.studio-back, .studio-note a').forEach((el) => addIcon(el, 'arrow', 'append'));
    all('.checkout-options label, #account-form label').forEach((el) => {
      const text = el.textContent.toLowerCase();
      const name = text.includes('email') ? 'email' : (text.includes('address') || text.includes('delivery')) ? 'location' : null;
      if (name) addIcon(el, name);
    });
    all('.footer-links').forEach((footer) => {
      if (!footer.querySelector('[data-social-icons]')) {
        const socials = document.createElement('div');
        socials.className = 'footer-social-icons';
        socials.setAttribute('data-social-icons', '');
        const instagram = document.createElement('a');
        instagram.href = 'https://www.instagram.com/wear_ambition/';
        instagram.target = '_blank'; instagram.rel = 'noopener noreferrer';
        instagram.setAttribute('aria-label', 'Follow Ambition Wear on Instagram');
        instagram.append(makeIcon('instagram'));
        socials.append(instagram);
        footer.append(socials);
      }
    });
    all('.nav').forEach((nav) => {
      if (nav.querySelector('.nav-search-link')) return;
      const search = document.createElement('a');
      search.className = 'nav-search-link';
      search.href = 'shop.html';
      search.setAttribute('aria-label', 'Browse the collection');
      search.title = 'Browse the collection';
      search.append(makeIcon('search'));
      const bag = nav.querySelector('.bag-open');
      if (bag) nav.insertBefore(search, bag);
    });
    all('.footer-inner').forEach((footer) => {
      if (footer.querySelector('.back-to-top')) return;
      const button = document.createElement('button');
      button.className = 'back-to-top';
      button.type = 'button';
      button.setAttribute('aria-label', 'Back to top');
      button.append(makeIcon('up'));
      button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      footer.append(button);
      const currency = document.createElement('span');
      currency.className = 'currency-label';
      currency.textContent = 'ZAR';
      currency.append(makeIcon('chevron'));
      currency.setAttribute('aria-label', 'Prices in South African rand');
      footer.append(currency);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => decorate(), { once: true });
  else decorate();
  const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) decorate(node);
  })));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
