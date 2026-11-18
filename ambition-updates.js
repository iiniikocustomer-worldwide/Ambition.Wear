(() => {
  'use strict';

  const CART_KEY = 'ambition-wear-cart';
  const money = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  function removeCashOption() {
    document.querySelectorAll('select[name="payment-option"] option').forEach((option) => {
      if (option.textContent.trim().toLowerCase() === 'cash on collection') option.remove();
    });
  }

  function patchCatalogNames(root = document) {
    root.querySelectorAll('h3').forEach((heading) => {
      if (heading.textContent.trim() === 'Ambition Graphic T-shirt') {
        heading.textContent = 'Ambition Wear Horse Racing';
        const card = heading.closest('.product-card');
        if (card) {
          const price = card.querySelector('.product-card__price');
          if (price) price.textContent = 'R450 / R350';
        }
      }
    });
  }

  function patchHorseModal(modal) {
    const heading = modal.querySelector('h2');
    if (!heading || heading.textContent.trim() !== 'Ambition Graphic T-shirt') return;

    heading.textContent = 'Ambition Wear Horse Racing';
    const priceRow = modal.querySelector('.product-modal__price-row strong');
    if (priceRow) priceRow.textContent = 'R450';

    const sizeBlock = [...modal.querySelectorAll('.variant-block')].find((block) => block.textContent.includes('Choose size'));
    if (sizeBlock) {
      sizeBlock.innerHTML = '<div class="variant-label-row"><span>Choose sleeve</span></div><div class="size-options"><button type="button" class="size-chip is-selected" data-sleeve="Long Sleeve" aria-pressed="true">Long Sleeve — R450</button><button type="button" class="size-chip" data-sleeve="Short Sleeve" aria-pressed="false">Short Sleeve — R350</button></div>';
    }

    modal.querySelectorAll('[data-sleeve]').forEach((button) => {
      button.addEventListener('click', () => {
        modal.querySelectorAll('[data-sleeve]').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        if (priceRow) priceRow.textContent = button.dataset.sleeve === 'Long Sleeve' ? 'R450' : 'R350';
      });
    });
  }

  document.addEventListener('click', (event) => {
    removeCashOption();

    const addButton = event.target.closest('[data-add-to-bag]');
    if (addButton) {
      const modal = addButton.closest('.product-modal');
      if (modal && modal.querySelector('h2')?.textContent.trim() === 'Ambition Wear Horse Racing') {
        event.preventImmediatePropagation();
        event.preventDefault();

        const selected = modal.querySelector('[data-sleeve].is-selected');
        const sleeve = selected?.dataset.sleeve || 'Long Sleeve';
        const price = sleeve === 'Long Sleeve' ? 450 : 350;
        const quantityInput = modal.querySelector('.product-quantity');
        const quantity = Math.max(1, Math.min(10, Number(quantityInput?.value || 1)));
        const image = modal.querySelector('[data-main-photo]')?.src || '';

        let cart = [];
        try {
          const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
          if (Array.isArray(saved)) cart = saved;
        } catch (_) {}

        const match = cart.find((item) => item.name === 'Ambition Wear Horse Racing' && item.size === sleeve);
        if (match) match.quantity = Number(match.quantity || 0) + quantity;
        else cart.push({ name: 'Ambition Wear Horse Racing', image, size: sleeve, colour: 'Black', quantity, price });

        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
        sessionStorage.setItem('ambition-open-bag-after-update', 'true');
        location.reload();
      }
    }
  }, true);

  function init() {
    removeCashOption();
    patchCatalogNames();

    document.querySelectorAll('.product-modal').forEach(patchHorseModal);

    if (sessionStorage.getItem('ambition-open-bag-after-update') === 'true') {
      sessionStorage.removeItem('ambition-open-bag-after-update');
      setTimeout(() => document.querySelector('.bag-open')?.click(), 400);
    }

    const observer = new MutationObserver((records) => {
      removeCashOption();
      patchCatalogNames();
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          patchCatalogNames(node);
          if (node.matches?.('.product-modal')) patchHorseModal(node);
          node.querySelectorAll?.('.product-modal').forEach(patchHorseModal);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
