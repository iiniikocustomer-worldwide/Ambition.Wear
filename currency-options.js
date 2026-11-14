(() => {
  'use strict';

  const currencies = {
    CAD: { label: 'CAD · Canadian dollar', fallback: 0.075 },
    AUD: { label: 'AUD · Australian dollar', fallback: 0.083 },
    NZD: { label: 'NZD · New Zealand dollar', fallback: 0.092 },
    BWP: { label: 'BWP · Botswana pula', fallback: 0.074 },
    NAD: { label: 'NAD · Namibian dollar', fallback: 1 },
    NGN: { label: 'NGN · Nigerian naira', fallback: 82 },
    KES: { label: 'KES · Kenyan shilling', fallback: 7.1 },
    JPY: { label: 'JPY · Japanese yen', fallback: 8.5 },
    INR: { label: 'INR · Indian rupee', fallback: 4.6 },
    AED: { label: 'AED · UAE dirham', fallback: 0.20 }
  };
  const storageKey = 'ambition-display-currency-extra';
  const rates = Object.fromEntries(Object.entries(currencies).map(([code, currency]) => [code, currency.fallback]));
  let activeCurrency = '';

  try {
    const saved = localStorage.getItem(storageKey);
    if (currencies[saved]) activeCurrency = saved;
  } catch (_) { /* Browser storage may be unavailable. */ }

  function formatPrices() {
    if (!activeCurrency) return;
    document.querySelectorAll('.product-card__price,.product-modal__price-row strong,.bag-subtotal,.cart-item strong').forEach((node) => {
      if (!node.dataset.zarPrice) {
        const match = node.textContent.trim().match(/^R\s*([\d,]+(?:\.\d+)?)(.*)$/);
        if (!match) return;
        node.dataset.zarPrice = String(Number(match[1].replace(/,/g, '')));
        node.dataset.priceSuffix = match[2] || '';
      }
      const amount = Number(node.dataset.zarPrice) * rates[activeCurrency];
      const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: activeCurrency }).format(amount);
      const text = `${formatted}${node.dataset.priceSuffix || ''}`;
      if (node.textContent !== text) node.textContent = text;
    });
    document.querySelectorAll('.currency-label').forEach((label) => {
      label.setAttribute('aria-label', `Display currency: ${currencies[activeCurrency].label}. Activate to change.`);
      const textNode = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode && textNode.textContent.trim() !== activeCurrency) textNode.textContent = activeCurrency;
    });
  }

  function addOptions(menu) {
    Object.entries(currencies).forEach(([code, currency]) => {
      if (menu.querySelector(`[data-currency="${code}"]`)) return;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'currency-option';
      option.dataset.currency = code;
      option.setAttribute('role', 'option');
      option.textContent = currency.label;
      menu.insertBefore(option, menu.querySelector('.currency-note'));
    });
  }

  document.addEventListener('click', (event) => {
    const option = event.target.closest('.currency-option');
    if (!option) return;
    if (currencies[option.dataset.currency]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      activeCurrency = option.dataset.currency;
      try { localStorage.setItem(storageKey, activeCurrency); } catch (_) { /* Ignore unavailable storage. */ }
      document.querySelectorAll('.currency-option').forEach((item) => item.setAttribute('aria-checked', String(item.dataset.currency === activeCurrency)));
      const menu = option.closest('.currency-menu');
      if (menu) menu.hidden = true;
      option.closest('.currency-control')?.querySelector('.currency-label')?.setAttribute('aria-expanded', 'false');
      formatPrices();
    } else {
      activeCurrency = '';
      try { localStorage.removeItem(storageKey); } catch (_) { /* Ignore unavailable storage. */ }
    }
  }, true);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches?.('.currency-menu')) addOptions(node);
      node.querySelectorAll?.('.currency-menu').forEach(addOptions);
    }));
    if (activeCurrency) formatPrices();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  fetch('https://api.frankfurter.app/latest?from=ZAR&to=CAD,AUD,NZD,JPY,INR', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Rates unavailable')))
    .then((data) => {
      Object.assign(rates, data.rates || {});
      if (activeCurrency) formatPrices();
    })
    .catch(() => undefined);

  if (activeCurrency) formatPrices();
})();
