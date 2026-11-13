(() => {
  'use strict';

  const WHATSAPP = '27672364114';
  const CART_KEY = 'ambition-wear-cart';
  const CATALOG_FALLBACK = 'https://raw.githubusercontent.com/souldustrecords-byte/Ambition.co/main/stock.json';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  function siteBaseUrl() {
    const url = new URL(document.baseURI || window.location.href);
    if (!url.pathname.endsWith('/') && !/\.[A-Za-z0-9]+$/.test(url.pathname)) url.pathname += '/';
    return url;
  }

  function assetUrl(value) {
    const candidate = String(value || '').trim();
    if (!candidate) return '';
    if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(candidate)) return candidate;

    const normalized = candidate.split('/').map((segment) => encodeURI(decodeURIComponent(segment))).join('/');
    return new URL(normalized, siteBaseUrl()).href;
  }

  let products = [];
  let cart = [];
  let activeCategory = 'All';
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(saved)) cart = saved.filter((item) => item && Number(item.quantity) > 0);
  } catch (_) { cart = []; }

  function normalizedProduct(item) {
    if (!item || typeof item !== 'object' || !item.name) return null;
    const gallery = Array.isArray(item.gallery) ? item.gallery : [];
    const uniqueGallery = [...gallery, item.image || '']
      .filter(Boolean)
      .map((entry) => assetUrl(entry))
      .filter((url, index, array) => array.indexOf(url) === index);
    const priceValue = Number(item.price);
    return {
      ...item,
      name: String(item.name),
      category: item.category || 'Collection',
      description: item.description || 'Premium Ambition essentials.',
      sizes: Array.isArray(item.sizes) && item.sizes.length ? item.sizes : ['One size'],
      colours: Array.isArray(item.colours) ? item.colours : [],
      image: uniqueGallery[0] || '',
      gallery: uniqueGallery,
      price: Number.isFinite(priceValue) ? String(priceValue) : '',
      priceLabel: item.priceLabel || (Number.isFinite(priceValue) && priceValue > 0 ? money(priceValue) : 'Ask for price'),
      status: item.status || 'In stock',
      orderable: item.orderable !== false,
    };
  }

  function fetchCatalog() {
    if (window.location.protocol === 'file:') {
      return Promise.resolve([]);
    }
    const primary = new URL('stock.json', siteBaseUrl());
    return fetch(primary.href, { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.json();
    }).catch(() => fetch(CATALOG_FALLBACK, { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.json();
    }));
  }

  function prepareProducts(items) {
    return (Array.isArray(items) ? items : []).map(normalizedProduct).filter(Boolean)
      .filter((item) => item.name !== 'Ambition Lifestyle');
  }

  const galleryFor = (item) => item.gallery?.length ? item.gallery : (item.image ? [item.image] : []);
  const visibleProducts = () => activeCategory === 'All' ? products : products.filter((item) => item.category === activeCategory);

  function drawFilters() {
    const wrapper = $('#product-filters, .catalog-filters');
    if (!wrapper) return;
    const categories = ['All', ...new Set(products.map((item) => item.category).filter(Boolean))];
    wrapper.innerHTML = categories.map((category) => `<button type="button" class="filter-pill ${category === activeCategory ? 'is-active' : ''}" data-filter="${esc(category)}" aria-pressed="${String(category === activeCategory)}">${esc(category)}</button>`).join('');
  }

  function render() {
    const grid = $('#shop-products, #shop-grid');
    if (grid) {
      const list = visibleProducts();
      grid.innerHTML = list.length ? list.map((item, index) => `
        <article class="product-card interactive-product" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${esc(item.name)} options">
          <div class="product-card__visual"><img src="${esc(galleryFor(item)[0] || '')}" alt="${esc(item.name)}" class="product-card__slide is-visible" loading="lazy"></div>
          <div class="product-card__meta"><div><p class="product-card__category">${esc(item.category)}</p><h3>${esc(item.name)}</h3></div><span class="product-card__price">${esc(Number(item.price) > 0 ? money(item.price) : item.priceLabel)}</span></div>
          <div class="product-card__info"><p>${esc(item.description)}</p><div class="product-card__footer"><span class="stock-pill">${esc(item.status)}</span><span class="text-link">View item →</span></div></div>
        </article>
      `).join('') : '<p class="loading">No items in this collection yet.</p>';
      grid.querySelectorAll('.product-card').forEach((card, index) => card.style.setProperty('--card-index', index));
    }
    const featured = $('#featured-products');
    if (featured) featured.innerHTML = products.slice(0, 4).map((item, index) => `
      <article class="product-card interactive-product" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${esc(item.name)} options">
        <div class="product-card__visual"><img src="${esc(galleryFor(item)[0] || '')}" alt="${esc(item.name)}" class="product-card__slide is-visible" loading="lazy"></div>
        <div class="product-card__meta"><div><p class="product-card__category">${esc(item.category)}</p><h3>${esc(item.name)}</h3></div><span class="product-card__price">${esc(Number(item.price) > 0 ? money(item.price) : item.priceLabel)}</span></div>
        <div class="product-card__info"><p>${esc(item.description)}</p><div class="product-card__footer"><span class="stock-pill">${esc(item.status)}</span><span class="text-link">View item →</span></div></div>
      </article>
    `).join('');
  }

  function drawCart() {
    const target = $('.cart-items');
    if (target) target.innerHTML = cart.length ? cart.map((item, index) => `<article class="cart-item"><img src="${esc(item.image)}" alt="${esc(item.name)}"><div class="cart-item__info"><div class="cart-item__row"><strong>${esc(item.name)}</strong><button type="button" class="cart-remove" data-remove="${index}" aria-label="Remove ${esc(item.name)}">×</button></div><p>${esc(item.colour || '')}${esc(item.colour && item.size ? ' · ' : '')}${esc(item.size || '')}</p><div class="cart-item__actions"><button type="button" data-qty="-1" data-index="${index}" aria-label="Decrease quantity">−</button><span>${Number(item.quantity || 1)}</span><button type="button" data-qty="1" data-index="${index}" aria-label="Increase quantity">+</button></div></div></article>`).join('') : '<p class="cart-empty">Your bag is empty.</p>';
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    if ($('.bag-subtotal')) $('.bag-subtotal').textContent = money(subtotal);
    document.querySelectorAll('.bag-count').forEach((element) => { element.textContent = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); });
  }

  function openBag() {
    const drawer = $('#bag-drawer');
    if (!drawer) return;
    drawer.classList.add('is-open');
    document.body.classList.add('drawer-open');
    document.querySelector('.drawer-backdrop')?.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawCart();
  }

  function closeBag() {
    const drawer = $('#bag-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    document.querySelector('.drawer-backdrop')?.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { /* storage may be unavailable */ }
    drawCart();
  }

  function init() {
    document.querySelectorAll('.year').forEach((element) => { element.textContent = new Date().getFullYear(); });
    drawCart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  fetchCatalog().then((items) => {
    if (!Array.isArray(items)) throw new Error('Invalid catalog');
    products = prepareProducts(items);
    drawFilters();
    render();
  }).catch(() => {
    products = [];
    const grid = $('#shop-products, #shop-grid');
    if (grid) grid.innerHTML = '<p class="loading">The collection could not be loaded. Please refresh to try again.</p>';
  });
})();
