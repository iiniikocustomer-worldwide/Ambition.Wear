(() => {
  'use strict';

  const WHATSAPP = '27672364114';
  const CART_KEY = 'ambition-wear-cart';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const money = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  function siteBaseUrl() {
    const url = new URL(document.baseURI || window.location.href);
    if (!url.pathname.endsWith('/') && !/\.[A-Za-z0-9]+$/.test(url.pathname)) url.pathname += '/';
    return url;
  }

  function assetUrl(value) {
    const candidate = String(value || '').trim();
    if (!candidate) return '';
    if (/^(https?:|data:)/i.test(candidate)) return candidate;
    return new URL(candidate, siteBaseUrl()).href;
  }

  function uniqueImages(item) {
    const seen = new Set();
    const images = (Array.isArray(item.gallery) ? item.gallery : []).concat(item.image || [])
      .filter(Boolean).map(assetUrl).filter((url) => {
        if (seen.has(url)) return false;
        seen.add(url);
        return true;
      });
    return images;
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
    const gallery = uniqueImages(item);
    const priceValue = Number(item.price);
    return {
      ...item,
      name: String(item.name),
      category: item.category || 'Collection',
      description: item.description || 'Premium Ambition essentials.',
      sizes: Array.isArray(item.sizes) && item.sizes.length ? item.sizes : ['One size'],
      colours: Array.isArray(item.colours) ? item.colours : [],
      image: gallery[0] || '',
      gallery,
      price: Number.isFinite(priceValue) ? String(priceValue) : '',
      priceLabel: item.priceLabel || (Number.isFinite(priceValue) && priceValue > 0 ? money(priceValue) : 'Ask for price'),
      status: item.status || 'In stock',
      orderable: item.orderable !== false
    };
  }

  function resolveCatalogUrl() {
    const raw = 'https://raw.githubusercontent.com/recordingsabantu/Ambition.co/main/stock.json';
    const candidates = [new URL('stock.json', siteBaseUrl()), new URL(raw)];
    return candidates.filter((url, index, list) => list.findIndex((other) => other.href === url.href) === index);
  }

  function fetchCatalog() {
    const [primary, fallback] = resolveCatalogUrl();
    return fetch(primary.href).then((response) => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.json();
    }).catch(() => {
      if (!fallback) throw new Error('Catalog unavailable');
      return fetch(fallback.href).then((response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      });
    });
  }

  function prepareProducts(items) {
    return (Array.isArray(items) ? items : []).map(normalizedProduct).filter(Boolean)
      .filter((item) => item.name !== 'Ambition Cap');
  }

  function galleryFor(item) {
    return item.gallery?.length ? item.gallery : (item.image ? [item.image] : []);
  }

  function visibleProducts() {
    return activeCategory === 'All' ? products : products.filter((item) => item.category === activeCategory);
  }

  function drawFilters() {
    const wrapper = $('#product-filters, .catalog-filters');
    if (!wrapper) return;
    const categories = ['All', ...new Set(products.map((item) => item.category).filter(Boolean))];
    wrapper.innerHTML = categories.map((category) =>
      `<button type="button" class="filter-pill ${category === activeCategory ? 'is-active' : ''}" data-filter="${esc(category)}" aria-pressed="${category === activeCategory}">${esc(category)}</button>`
    ).join('');
  }

  function productCard(item, index) {
    const image = galleryFor(item)[0] || '';
    const price = Number(item.price) > 0 ? money(item.price) : item.priceLabel;
    return `<article class="product-card interactive-product" data-product-index="${index}" tabindex="0" role="button" aria-label="View ${esc(item.name)} options">
      <div class="product-card__visual"><div class="product-card__slides"><img src="${esc(image)}" alt="${esc(item.name)}" class="product-card__slide is-visible" loading="lazy"></div>
        <span class="product-card__badge">${galleryFor(item).length > 1 ? `${galleryFor(item).length} photos · View options` : 'View options'}</span>
      </div>
      <div class="product-card__meta"><div><p class="product-card__category">${esc(item.category)}</p><h3>${esc(item.name)}</h3></div><span class="product-card__price">${esc(price)}</span></div>
      <div class="product-card__info"><p>${esc(item.description)}</p><div class="product-card__footer"><span class="stock-pill">${esc(item.status)}</span><span class="text-link">Choose options →</span></div></div>
    </article>`;
  }

  function render() {
    const grid = $('#shop-products, #shop-grid');
    if (grid) {
      const list = visibleProducts();
      grid.innerHTML = list.length ? list.map(productCard).join('') : '<p class="loading">No items in this collection yet.</p>';
    }
    const featured = $('#featured-products');
    if (featured) featured.innerHTML = products.slice(0, 4).map(productCard).join('');
  }

  function openProduct(item) {
    $('.product-modal-root')?.remove();
    const images = galleryFor(item);
    const sizes = item.sizes.length ? item.sizes : ['One size'];
    const imageList = images.length ? images : [''];
    const price = Number(item.price) > 0 ? money(item.price) : item.priceLabel;
    const root = document.createElement('div');
    root.className = 'product-modal-root';
    root.innerHTML = `<div class="modal-backdrop" data-dismiss-product>
      <section class="product-modal" role="dialog" aria-modal="true" aria-label="${esc(item.name)} options">
        <button class="modal-close" type="button" data-dismiss-product aria-label="Close product details">×</button>
        <div class="product-modal__gallery">
          <div class="product-modal__main"><img class="product-modal__photo is-visible" data-main-photo src="${esc(imageList[0])}" alt="${esc(item.name)} photo 1"></div>
          <div class="product-modal__thumbs" aria-label="Choose a product photo">${imageList.map((src, index) => `<button type="button" class="product-modal__thumb ${index === 0 ? 'is-active' : ''}" data-thumb-index="${index}" aria-label="View photo ${index + 1} of ${imageList.length}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>
          <p class="product-photo-count" aria-live="polite">${imageList.length} ${imageList.length === 1 ? 'photo' : 'photos'} · Select a photo to view</p>
        </div>
        <div class="product-modal__details"><p class="eyebrow">${esc(item.category)}</p><h2>${esc(item.name)}</h2>
          <div class="product-modal__price-row"><strong>${esc(price)}</strong><span>${esc(item.status)}</span></div>
          <p class="product-modal__desc">${esc(item.description)}</p>
          ${item.colours.length ? `<p class="product-colours"><b>Colour:</b> ${item.colours.map(esc).join(' / ')}</p>` : ''}
          <div class="variant-block"><div class="variant-label-row"><span>Choose size</span></div><div class="size-options">${sizes.map((size, index) => `<button type="button" class="size-chip ${index === 0 ? 'is-selected' : ''}" data-size="${esc(size)}" aria-pressed="${index === 0}">${esc(size)}</button>`).join('')}</div></div>
          <div class="variant-block"><div class="variant-label-row"><span>Quantity</span></div><div class="qty-picker"><button type="button" data-product-qty="-1" aria-label="Decrease quantity">−</button><input class="product-quantity" type="number" min="1" max="10" value="1"><button type="button" data-product-qty="1" aria-label="Increase quantity">+</button></div></div>
          <button type="button" class="primary-action" data-add-to-bag ${item.orderable ? '' : 'disabled'}>${item.orderable ? 'Add to bag' : 'Contact us to order'}</button>
        </div>
      </section></div>`;
    document.body.appendChild(root);
    const modal = $('.product-modal', root);
    root.addEventListener('click', (event) => {
      if (event.target.closest('[data-dismiss-product]')) { root.remove(); return; }
      const thumb = event.target.closest('[data-thumb-index]');
      if (thumb) {
        const index = Number(thumb.dataset.thumbIndex);
        const photo = $('[data-main-photo]', modal);
        photo.src = imageList[index];
        photo.alt = `${item.name} photo ${index + 1}`;
        modal.querySelectorAll('.product-modal__thumb').forEach((button, position) => button.classList.toggle('is-active', position === index));
        return;
      }
      const size = event.target.closest('[data-size]');
      if (size) {
        modal.querySelectorAll('[data-size]').forEach((button) => {
          const selected = button === size;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        return;
      }
      const quantityButton = event.target.closest('[data-product-qty]');
      if (quantityButton) {
        const input = $('.product-quantity', modal);
        input.value = Math.max(1, Math.min(10, Number(input.value || 1) + Number(quantityButton.dataset.productQty)));
        return;
      }
      if (event.target.closest('[data-add-to-bag]') && item.orderable) {
        const sizeValue = $('.size-chip.is-selected', modal)?.dataset.size || 'One size';
        const quantity = Math.max(1, Math.min(10, Number($('.product-quantity', modal).value || 1)));
        const matching = cart.find((entry) => entry.name === item.name && entry.size === sizeValue);
        if (matching) matching.quantity += quantity;
        else cart.push({ name: item.name, image: imageList[0] || '', size: sizeValue, quantity, price: Number(item.price) || 0 });
        saveCart();
        root.remove();
        openBag();
      }
    });
  }

  function injectBag() {
    if ($('#bag-drawer')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="drawer-backdrop"></div><aside class="bag-drawer" id="bag-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden="true"><div class="drawer-header"><h2>Your bag</h2><button class="drawer-close" type="button" aria-label="Close bag">×</button></div><div class="cart-items"></div><div class="bag-summary"><div class="bag-row"><span>Subtotal</span><strong class="bag-subtotal">R0</strong></div><button class="primary-action" id="send-invoice" type="button">Send invoice on WhatsApp</button></div></aside>`);
    $('.drawer-backdrop').addEventListener('click', closeBag);
    $('.drawer-close').addEventListener('click', closeBag);
    $('#send-invoice').addEventListener('click', sendInvoice);
  }

  function drawCart() {
    const target = $('.cart-items');
    if (target) target.innerHTML = cart.length ? cart.map((item, index) => `<article class="cart-item"><img src="${esc(item.image)}" alt="${esc(item.name)}"><div class="cart-item__info"><div class="cart-item__top"><h3>${esc(item.name)}</h3><button type="button" data-remove="${index}" aria-label="Remove ${esc(item.name)}">×</button></div><p>${esc(item.size)} · ${money(item.price)}</p><div class="qty-picker cart-qty"><button type="button" data-qty="-1" data-index="${index}" aria-label="Decrease quantity">−</button><span>${Number(item.quantity)}</span><button type="button" data-qty="1" data-index="${index}" aria-label="Increase quantity">+</button></div></div></article>`).join('') : '<p class="empty-cart">Your bag is empty.</p>';
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    if ($('.bag-subtotal')) $('.bag-subtotal').textContent = money(subtotal);
    document.querySelectorAll('.bag-count').forEach((element) => { element.textContent = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0); });
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { /* storage may be unavailable */ }
    drawCart();
  }
  function openBag() {
    injectBag();
    $('.bag-drawer')?.classList.add('is-open');
    $('.drawer-backdrop')?.classList.add('is-open');
    $('.bag-drawer')?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    drawCart();
  }
  function closeBag() {
    $('.bag-drawer')?.classList.remove('is-open');
    $('.drawer-backdrop')?.classList.remove('is-open');
    $('.bag-drawer')?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  }
  function toast(message) {
    const element = $('.toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2600);
  }
  function sendInvoice() {
    if (!cart.length) return toast('Your bag is empty');
    const lines = cart.map((item) => `${item.name} (${item.size}) x ${item.quantity} — ${money(item.price * item.quantity)}`);
    const text = ['Hello Ambition Wear, please send me an invoice for this order:', '', ...lines, '', `Subtotal: ${money(cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0))}`].join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  function addFooterFilm() {
    const footer = $('.site-footer');
    if (!footer || footer.querySelector('.footer-film')) return;
    const folder = 'Ambition Wear/Ambition Lifestyle/';
    const videoName = '• Two young men spend their days working inside a busy clothing warehouse_ surrounded by boxes_ fabric_ labels_ and unfinished ideas. While everyone else s.mp4';
    const videoUrl = assetUrl(folder.split('/').map(encodeURIComponent).join('/') + encodeURIComponent(videoName));
    footer.insertAdjacentHTML('afterbegin', `<section class="footer-film"><div class="wrap"><p class="eyebrow">AMBITION IN MOTION</p><h2>Built by ambition.</h2><video controls playsinline preload="metadata" aria-label="Ambition clothing campaign film"><source src="${esc(videoUrl)}" type="video/mp4">Your browser does not support video playback.</video></div></section>`);
    const style = document.createElement('style');
    style.textContent = '.footer-film{padding:48px 0;background:#111;color:#fff}.footer-film h2{margin:8px 0 24px;font-size:clamp(28px,5vw,48px)}.footer-film video{display:block;width:min(100%,900px);max-height:70vh;margin:auto;background:#000}.product-modal__thumbs{display:flex;gap:8px;overflow-x:auto;padding:10px 2px}.product-modal__thumb{flex:0 0 64px;height:76px;padding:2px;border:1px solid #ddd;background:#fff;cursor:pointer}.product-modal__thumb.is-active{border:2px solid #111}.product-modal__thumb img{width:100%;height:100%;object-fit:contain}.product-photo-count{font-size:12px;color:#666;margin:4px 0}.product-modal__main [data-main-photo]{display:block;width:100%;height:100%;max-height:55vh;object-fit:contain}.product-card__badge{white-space:normal}';
    document.head.appendChild(style);
  }

  document.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      activeCategory = filter.dataset.filter;
      drawFilters();
      render();
      return;
    }
    const card = event.target.closest('.product-card[data-product-index]');
    if (card) {
      const item = visibleProducts()[Number(card.dataset.productIndex)];
      if (item) openProduct(item);
      return;
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) { cart.splice(Number(remove.dataset.remove), 1); saveCart(); return; }
    const quantity = event.target.closest('[data-qty][data-index]');
    if (quantity) {
      const index = Number(quantity.dataset.index);
      if (!cart[index]) return;
      cart[index].quantity = Math.max(1, Number(cart[index].quantity || 1) + Number(quantity.dataset.qty));
      saveCart();
      return;
    }
    if (event.target.closest('.bag-open, [data-open-bag], .bag-count')) openBag();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeBag(); $('.product-modal-root')?.remove(); }
    const card = event.target.closest?.('.product-card[data-product-index]');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const item = visibleProducts()[Number(card.dataset.productIndex)];
      if (item) openProduct(item);
    }
  });

  function init() {
    injectBag();
    drawCart();
    document.querySelectorAll('.year').forEach((element) => { element.textContent = new Date().getFullYear(); });
    addFooterFilm();
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
    console.warn('Ambition catalog could not be loaded.');
  });
})();
