(() => {
  'use strict';

  const WA = '27672364114';
  const CART_KEY = 'ambition-wear-cart';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
  const money = (n) => `R${Number(n || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  let stock = [];
  let cart = [];
  let active = 'All';

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(saved)) {
      cart = saved.filter((x) => x && Number(x.quantity) > 0 && Number(x.price) >= 0);
    }
  } catch (error) {
    cart = [];
  }

  function prepareStock(items) {
    const base = Array.isArray(items) ? items.filter(Boolean) : [];
    const visible = base.filter((item) => item.name && item.name !== 'Ambition Cap');

    const beanie = {
      name: 'Ambition Bjeweled Beanies',
      category: 'Headwear',
      description: 'A statement beanie with the edge of the Ambition brand.',
      sizes: ['One size'],
      colours: ['Black', 'White'],
      price: '120',
      priceLabel: 'R120',
      image: 'https://raw.githubusercontent.com/recordingsabantu/Ambition.co/main/Ambition%20Wear/Ambition%20Bjeweled%20Beanies/Screenshot_20261111_133815_WhatsApp.jpg',
      gallery: [
        'https://raw.githubusercontent.com/recordingsabantu/Ambition.co/main/Ambition%20Wear/Ambition%20Bjeweled%20Beanies/Screenshot_20261111_133815_WhatsApp.jpg',
        'https://raw.githubusercontent.com/recordingsabantu/Ambition.co/main/Ambition%20Wear/Ambition%20Bjeweled%20Beanies/Screenshot_20261111_133821_WhatsApp.jpg',
        'https://raw.githubusercontent.com/recordingsabantu/Ambition.co/main/Ambition%20Wear/Ambition%20Bjeweled%20Beanies/Screenshot_20261111_133826_WhatsApp.jpg'
      ],
      status: 'In stock',
      orderable: true
    };

    return [...visible, beanie];
  }

  function getGallery(item) {
    const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
    const images = gallery.length ? gallery : [item.image].filter(Boolean);
    return images.length ? images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'];
  }

  function getVisibleStock() {
    if (active === 'All') return stock;
    return stock.filter((item) => item.category === active);
  }

  function drawFilters() {
    const filterWrap = $('.catalog-filters');
    if (!filterWrap) return;
    const categories = ['All', ...new Set(stock.map((item) => item.category).filter(Boolean))];
    filterWrap.innerHTML = categories.map((category) => `
      <button class="filter-pill ${category === active ? 'is-active' : ''}" data-filter="${esc(category)}">${esc(category)}</button>
    `).join('');
  }

  function renderFeatured() {
    const featured = $('#featured-products');
    if (!featured) return;
    const picks = [...stock].slice(0, 4);
    featured.innerHTML = picks.map((item, index) => productCard(item, index)).join('');
    startSlideshow();
  }

  function renderShopGrid() {
    const shopGrid = $('#shop-grid');
    if (!shopGrid) return;
    const items = getVisibleStock();
    shopGrid.innerHTML = items.map((item, index) => productCard(item, index)).join('');
    startSlideshow();
  }

  function productCard(item, index) {
    const gallery = getGallery(item);
    const price = Number(item.price) > 0 ? money(item.price) : (item.priceLabel || 'Ask for price');
    const label = item.status || 'In stock';
    const itemCount = Math.min(10, Math.max(4, Number(item.price) ? 10 : 6));

    return `
      <article class="product-card" data-product-index="${index}" tabindex="0">
        <div class="product-card__visual">
          <div class="product-card__slides" aria-label="${esc(item.name)} images">
            ${gallery.map((image, i) => `
              <img src="${esc(image)}" alt="${esc(item.name)}" class="product-card__slide ${i === 0 ? 'is-visible' : ''}" loading="lazy">
            `).join('')}
          </div>
          <div class="product-card__badge">${itemCount} available</div>
        </div>
        <div class="product-card__meta">
          <div>
            <p class="product-card__category">${esc(item.category || 'Collection')}</p>
            <h3>${esc(item.name)}</h3>
          </div>
          <span class="product-card__price">${esc(price)}</span>
        </div>
        <div class="product-card__info">
          <p>${esc(item.description || 'Premium Ambition essentials.')}</p>
          <div class="product-card__footer">
            <span class="stock-pill">${esc(label)}</span>
            <button class="mini-action" type="button" data-action="view-product">View more</button>
          </div>
        </div>
      </article>
    `;
  }

  function openProductModal(item) {
    const gallery = getGallery(item);
    const sizes = Array.isArray(item.sizes) && item.sizes.length ? item.sizes : ['One size'];
    const defaultSize = sizes[0] || 'One size';
    const modalMarkup = `
      <div class="modal-backdrop is-open" data-close-modal>
        <div class="product-modal" role="dialog" aria-modal="true" aria-label="Choose ${esc(item.name)}">
          <button type="button" class="modal-close" data-close-modal aria-label="Close product">×</button>

          <div class="product-modal__gallery">
            <div class="product-modal__main">
              ${gallery.map((image, i) => `
                <img src="${esc(image)}" alt="${esc(item.name)} ${i + 1}" class="product-modal__photo ${i === 0 ? 'is-visible' : ''}">
              `).join('')}
            </div>
            <div class="product-modal__thumbs">
              ${gallery.map((image, i) => `
                <button type="button" class="product-modal__thumb ${i === 0 ? 'is-active' : ''}" data-thumb-index="${i}">
                  <img src="${esc(image)}" alt="${esc(item.name)} thumbnail ${i + 1}">
                </button>
              `).join('')}
            </div>
          </div>

          <div class="product-modal__details">
            <p class="eyebrow">${esc(item.category || 'AMBITION')}</p>
            <h2>${esc(item.name)}</h2>
            <div class="product-modal__price-row">
              <span class="product-modal__price">${esc(Number(item.price) > 0 ? money(item.price) : (item.priceLabel || 'Ask for price'))}</span>
              <span class="product-modal__stock">${esc(item.status || 'In stock')}</span>
            </div>
            <p class="product-modal__desc">${esc(item.description || 'Premium style built to move with you.')}</p>

            <div class="variant-block">
              <div class="variant-label-row">
                <span>Select size</span>
                <span class="meta-note">10 items available</span>
              </div>
              <div class="size-options">
                ${sizes.map((size) => `
                  <button type="button" class="size-chip ${size === defaultSize ? 'is-selected' : ''}" data-size="${esc(size)}">${esc(size)}</button>
                `).join('')}
              </div>
            </div>

            <div class="variant-block variant-block--compact">
              <div class="variant-label-row">
                <span>Quantity</span>
              </div>
              <div class="qty-picker">
                <button type="button" data-qty-change="-1" aria-label="Decrease quantity">−</button>
                <input id="modal-qty" type="number" min="1" value="1" inputmode="numeric">
                <button type="button" data-qty-change="1" aria-label="Increase quantity">＋</button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="primary-action" data-add-to-bag>Add to bag</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = $('.product-modal-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.className = 'product-modal-root';
    root.innerHTML = modalMarkup;
    document.body.appendChild(root);

    bindModalEvents();
  }

  function bindModalEvents() {
    const modalRoot = $('.product-modal-root');
    if (!modalRoot) return;

    modalRoot.addEventListener('click', (event) => {
      const closeBtn = event.target.closest('[data-close-modal]');
      if (closeBtn) {
        modalRoot.remove();
        return;
      }

      const thumb = event.target.closest('[data-thumb-index]');
      if (thumb) {
        const index = Number(thumb.dataset.thumbIndex || 0);
        const main = modalRoot.querySelector('.product-modal__main');
        const thumbs = modalRoot.querySelectorAll('.product-modal__thumb');
        [...main.children].forEach((img, idx) => {
          img.classList.toggle('is-visible', idx === index);
        });
        thumbs.forEach((btn, idx) => btn.classList.toggle('is-active', idx === index));
        return;
      }

      const sizeBtn = event.target.closest('.size-chip');
      if (sizeBtn) {
        modalRoot.querySelectorAll('.size-chip').forEach((btn) => btn.classList.toggle('is-selected', btn === sizeBtn));
        return;
      }

      const qtyBtn = event.target.closest('[data-qty-change]');
      if (qtyBtn) {
        const input = modalRoot.querySelector('#modal-qty');
        const current = Number(input.value || 1);
        const next = Math.max(1, current + Number(qtyBtn.dataset.qtyChange || 0));
        input.value = String(next);
        return;
      }

      const addBtn = event.target.closest('[data-add-to-bag]');
      if (addBtn) {
        const index = Number($('.product-card[data-product-index]')?.dataset.productIndex ?? 0);
        const selected = modalRoot.querySelector('.size-chip.is-selected')?.dataset.size || 'One size';
        const quantity = Math.max(1, Number(modalRoot.querySelector('#modal-qty').value || 1));
        const productName = modalRoot.querySelector('.product-modal__details h2')?.textContent || 'Ambition item';
        const productObj = stock.find((item) => item.name === productName) || stock[index] || stock[0];

        if (!productObj) return;

        const existingEntry = cart.find((entry) => entry.name === productObj.name && entry.size === selected);
        if (existingEntry) {
          existingEntry.quantity += quantity;
        } else {
          cart.push({
            name: productObj.name,
            image: getGallery(productObj)[0],
            size: selected,
            quantity,
            price: Number(productObj.price) || 0
          });
        }

        saveCart();
        closeBag();
        modalRoot.remove();
        openBag();
        toast(`${productObj.name} added to bag`);
      }
    });
  }

  function startSlideshow() {
    const cards = $$('.product-card');
    cards.forEach((card) => {
      const slides = [...card.querySelectorAll('.product-card__slide')];
      if (slides.length < 2) return;
      let index = 0;
      const tick = () => {
        index = (index + 1) % slides.length;
        slides.forEach((img, i) => img.classList.toggle('is-visible', i === index));
      };
      card._slideTimer = setInterval(tick, 1800);
    });
  }

  function injectDrawer() {
    if ($('#bag-drawer')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-backdrop"></div>
      <aside class="bag-drawer" id="bag-drawer" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="bag-drawer__header">
          <div>
            <p class="eyebrow">Bag</p>
            <h3>Your selection</h3>
          </div>
          <button class="drawer-close" type="button" aria-label="Close bag">×</button>
        </div>

        <div class="bag-drawer__body">
          <div class="cart-items"></div>

          <div class="checkout-panel">
            <div class="checkout-block">
              <p class="checkout-label">Paying options</p>
              <label class="radio-option"><input type="radio" name="payment-method" value="EFT" checked> EFT</label>
              <label class="radio-option"><input type="radio" name="payment-method" value="Card"> Card</label>
              <label class="radio-option"><input type="radio" name="payment-method" value="Cash"> Cash</label>
              <label class="radio-option"><input type="radio" name="payment-method" value="Payfast"> Payfast</label>
            </div>

            <div class="checkout-block">
              <p class="checkout-label">Delivery options</p>
              <label class="radio-option"><input type="radio" name="delivery-method" value="Local delivery" checked> Local delivery</label>
              <label class="radio-option"><input type="radio" name="delivery-method" value="Courier"> Courier</label>
              <label class="radio-option"><input type="radio" name="delivery-method" value="Collection"> Collection</label>
            </div>

            <div class="checkout-form">
              <label>
                Name
                <input id="checkout-name" type="text" placeholder="Your name" value="">
              </label>
              <label>
                Email
                <input id="checkout-email" type="email" placeholder="you@example.com" value="">
              </label>
            </div>

            <div class="summary-row">
              <span>Subtotal</span>
              <strong class="bag-subtotal">R0</strong>
            </div>
            <div class="summary-row total-row">
              <span>Total</span>
              <strong class="bag-total">R0</strong>
            </div>
            <button type="button" class="primary-action" id="send-invoice">Send invoice</button>
          </div>
        </div>
      </aside>
    `);

    $('.drawer-backdrop').addEventListener('click', closeBag);
    $('#bag-drawer .drawer-close').addEventListener('click', closeBag);
    $('#send-invoice').addEventListener('click', sendInvoice);
  }

  function drawCart() {
    const cartList = $('.cart-items');
    const subTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    if (cartList) {
      if (!cart.length) {
        cartList.innerHTML = `
          <div class="empty-cart">
            <p>Your bag is empty.</p>
            <span>Choose a garment to start your Ambition fit.</span>
          </div>
        `;
      } else {
        cartList.innerHTML = cart.map((item) => `
          <div class="cart-item" data-cart-name="${esc(item.name)}" data-cart-size="${esc(item.size || 'One size')}">
            <img src="${esc(item.image || '')}" alt="${esc(item.name)}" loading="lazy">
            <div class="cart-item__info">
              <div class="cart-item__top">
                <h4>${esc(item.name)}</h4>
                <button type="button" class="cart-remove" data-remove-item="${esc(item.name)}|${esc(item.size || 'One size')}" aria-label="Remove ${esc(item.name)}">×</button>
              </div>
              <p>${esc(item.size || 'One size')} · Qty ${esc(item.quantity || 1)}</p>
              <span>${esc(money(Number(item.price || 0) * Number(item.quantity || 1)))}</span>
            </div>
          </div>
        `).join('');
      }
    }

    const subtotalEl = $('.bag-subtotal');
    const totalEl = $('.bag-total');
    if (subtotalEl) subtotalEl.textContent = money(subTotal);
    if (totalEl) totalEl.textContent = money(subTotal);

    document.querySelectorAll('.bag-count').forEach((countEl) => {
      countEl.textContent = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    });
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      // ignore storage errors in private browsing
    }
    drawCart();
  }

  function openBag() {
    const drawer = $('#bag-drawer');
    const backdrop = $('.drawer-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    document.body.classList.add('drawer-open');
    drawCart();
  }

  function closeBag() {
    const drawer = $('#bag-drawer');
    const backdrop = $('.drawer-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
  }

  function toast(message) {
    const el = $('.toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function sendInvoice() {
    if (!cart.length) {
      toast('Your bag is empty');
      return;
    }

    const payment = $('input[name="payment-method"]:checked')?.value || 'EFT';
    const delivery = $('input[name="delivery-method"]:checked')?.value || 'Local delivery';
    const name = $('#checkout-name')?.value?.trim() || 'Customer';
    const email = $('#checkout-email')?.value?.trim() || 'No email supplied';

    const lines = cart.map((item) => {
      const size = item.size || 'One size';
      return `• ${item.name} (${size}) x ${item.quantity} — ${money(Number(item.price || 0) * Number(item.quantity || 1))}`;
    }).join('\n');

    const total = money(cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0));
    const message = `Hello Ambition Wear,%0A%0A` +
      `Please send me an invoice for the following order:%0A%0A` +
      `${lines}%0A%0A` +
      `Customer: ${encodeURIComponent(name)}%0A` +
      `Email: ${encodeURIComponent(email)}%0A` +
      `Payment: ${encodeURIComponent(payment)}%0A` +
      `Delivery: ${encodeURIComponent(delivery)}%0A` +
      `Total: ${encodeURIComponent(total)}%0A%0A` +
      `Thanks.`;

    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
    toast('Invoice request sent');
  }

  document.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      active = filter.dataset.filter;
      drawFilters();
      renderShopGrid();
      return;
    }

    const productCardEl = event.target.closest('[data-product-index]');
    if (productCardEl) {
      const index = Number(productCardEl.dataset.productIndex || 0);
      const item = getVisibleStock()[index] || stock[index] || stock[0];
      if (item) openProductModal(item);
      return;
    }

    const viewButton = event.target.closest('[data-action="view-product"]');
    if (viewButton) {
      const card = viewButton.closest('.product-card');
      if (card) {
        const index = Number(card.dataset.productIndex || 0);
        const item = getVisibleStock()[index] || stock[index] || stock[0];
        if (item) openProductModal(item);
      }
      return;
    }

    const remove = event.target.closest('[data-remove-item]');
    if (remove) {
      const [name, size] = remove.dataset.removeItem.split('|');
      cart = cart.filter((item) => !(item.name === name && (item.size || 'One size') === size));
      saveCart();
      toast('Item removed');
      return;
    }

    const bagButton = event.target.closest('[data-open-bag]');
    if (bagButton) {
      openBag();
      return;
    }

    if (event.target.closest('.bag-count')) {
      openBag();
      return;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeBag();
      const modalRoot = $('.product-modal-root');
      if (modalRoot) modalRoot.remove();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderShopGrid();
    drawFilters();
    injectDrawer();
    drawCart();
    document.querySelectorAll('.year').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  });

  fetch(new URL('stock.json', document.baseURI))
    .then((response) => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Invalid catalog');
      stock = prepareStock(data);
      drawFilters();
      renderFeatured();
      renderShopGrid();
    })
    .catch(() => {
      stock = prepareStock([]);
      drawFilters();
      renderFeatured();
      renderShopGrid();
    });
})();
