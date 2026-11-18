(() => {
  'use strict';

  const CART_KEY = 'ambition-wear-cart';
  const PRODUCT_NAME = 'Ambition Wear Horse Racing';

  function removeCashOption() {
    document.querySelectorAll('select[name="payment-option"] option').forEach((option) => {
      if (option.textContent.trim().toLowerCase() === 'cash on collection') option.remove();
    });
  }

  function horseCard(root = document) {
    root.querySelectorAll('.product-card').forEach((card) => {
      const heading = card.querySelector('h3');
      if (heading?.textContent.trim() !== PRODUCT_NAME) return;
      const price = card.querySelector('.product-card__price');
      if (price && price.textContent !== 'R450 / R350') price.textContent = 'R450 / R350';
      const description = card.querySelector('.product-card__info > p');
      const copy = 'Long Sleeve R450 · Short Sleeve R350. View both product photos.';
      if (description && description.textContent !== copy) description.textContent = copy;
    });
  }

  function patchHorseModal(modal) {
    if (modal.dataset.horseVariantsReady === 'true') return;
    const heading = modal.querySelector('h2');
    if (heading?.textContent.trim() !== PRODUCT_NAME) return;
    modal.dataset.horseVariantsReady = 'true';

    const price = modal.querySelector('.product-modal__price-row strong');
    if (price) price.textContent = 'R450';

    const sizeBlock = [...modal.querySelectorAll('.variant-block')].find((block) => block.textContent.includes('Choose size'));
    if (sizeBlock) {
      sizeBlock.innerHTML = '<div class="variant-label-row"><span>Choose sleeve</span></div><div class="size-options"><button type="button" class="size-chip is-selected" data-size="Long Sleeve" aria-pressed="true">Long Sleeve — R450</button><button type="button" class="size-chip" data-size="Short Sleeve" aria-pressed="false">Short Sleeve — R350</button></div>';
    }

    const description = modal.querySelector('.product-modal__description');
    if (description) description.textContent = 'Ambition Wear Horse Racing. Choose Long Sleeve R450 or Short Sleeve R350. Select a thumbnail to view every product image.';

    const thumbs = [...modal.querySelectorAll('[data-thumb-index]')];
    thumbs.forEach((thumb, index) => {
      const image = thumb.querySelector('img');
      if (image) image.alt = index === 0 ? `${PRODUCT_NAME} — Long Sleeve, R450` : `${PRODUCT_NAME} — Short Sleeve, R350`;
      thumb.setAttribute('aria-label', index === 0 ? 'View Long Sleeve, R450' : 'View Short Sleeve, R350');
    });
  }

  function chooseSleeve(modal, sleeve) {
    const shortSleeve = sleeve === 'Short Sleeve';
    modal.querySelectorAll('[data-size]').forEach((button) => {
      const selected = button.dataset.size === sleeve;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const price = modal.querySelector('.product-modal__price-row strong');
    if (price) price.textContent = shortSleeve ? 'R350' : 'R450';
    modal.querySelector(`[data-thumb-index="${shortSleeve ? 1 : 0}"]`)?.click();
  }

  function addHorseVariant(modal) {
    const sleeve = modal.querySelector('[data-size].is-selected')?.dataset.size || 'Long Sleeve';
    const price = sleeve === 'Short Sleeve' ? 350 : 450;
    const quantity = Math.max(1, Math.min(10, Number(modal.querySelector('.product-quantity')?.value || 1)));
    const image = modal.querySelector('[data-main-photo]')?.src || '';

    let cart = [];
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (Array.isArray(saved)) cart = saved;
    } catch (_) {}

    const matching = cart.find((item) => item.name === PRODUCT_NAME && item.size === sleeve && item.colour === 'Black');
    if (matching) matching.quantity = Number(matching.quantity || 0) + quantity;
    else cart.push({ name: PRODUCT_NAME, image, size: sleeve, colour: 'Black', quantity, price });

    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
    try { sessionStorage.setItem('ambition-open-bag-after-update', 'true'); } catch (_) {}
    location.reload();
  }

  function init() {
    removeCashOption();
    horseCard();

    const observer = new MutationObserver((records) => {
      removeCashOption();
      horseCard();
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('.product-modal')) patchHorseModal(node);
        node.querySelectorAll('.product-modal').forEach(patchHorseModal);
      }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('click', (event) => {
      removeCashOption();
      const sleeveButton = event.target.closest?.('.product-modal [data-size]');
      if (sleeveButton) {
        const modal = sleeveButton.closest('.product-modal');
        if (modal?.querySelector('h2')?.textContent.trim() === PRODUCT_NAME) {
          chooseSleeve(modal, sleeveButton.dataset.size);
        }
        return;
      }

      const addButton = event.target.closest?.('.product-modal [data-add-to-bag]');
      if (addButton) {
        const modal = addButton.closest('.product-modal');
        if (modal?.querySelector('h2')?.textContent.trim() === PRODUCT_NAME) {
          event.preventDefault();
          event.stopImmediatePropagation();
          addHorseVariant(modal);
        }
      }
    }, true);

    try {
      if (sessionStorage.getItem('ambition-open-bag-after-update') === 'true') {
        sessionStorage.removeItem('ambition-open-bag-after-update');
        setTimeout(() => document.querySelector('.bag-open')?.click(), 500);
      }
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
