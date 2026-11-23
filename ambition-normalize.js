(() => {
  'use strict';

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.includes('souldustrecords-byte/Ambition.co/main/stock.json')) {
      return originalFetch(new URL('stock.json', document.baseURI).href, init);
    }
    return originalFetch(input, init);
  };

  const CART_KEY = 'ambition-wear-cart';
  const money = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  function readCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(cart) ? cart.filter((item) => item && Number(item.quantity) > 0) : [];
    } catch (_) {
      return [];
    }
  }

  function downloadTextInvoice() {
    const cart = readCart();
    if (!cart.length) return;

    const checkout = document.querySelector('.checkout-options');
    const get = (name) => checkout?.querySelector(`[name="${name}"]`)?.value?.trim() || '';
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const lines = cart.map((item, index) =>
      `${index + 1}. ${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''}\n   Quantity: ${item.quantity} | Total: ${money(Number(item.price) * Number(item.quantity))}`
    );

    const content = [
      'AMBITION WEAR', 'ORDER INVOICE', '==============================', '',
      ...lines, '', `Subtotal: ${money(subtotal)}`,
      `Customer name: ${get('customer-name') || 'Not provided'}`,
      `Customer email: ${get('customer-email') || 'Not provided'}`,
      `Delivery: ${get('delivery-option') || 'Collection'}`,
      `Payment: ${get('payment-option') || 'To be confirmed'}`,
      ...(get('customer-address') ? [`Address: ${get('customer-address')}`] : []),
      '', 'Please confirm availability and arrange payment/delivery.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ambition-wear-invoice.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function bindDownload() {
    const button = document.querySelector('#download-invoice');
    if (!button || button.dataset.normalizedDownload) return;
    button.dataset.normalizedDownload = 'true';
    button.addEventListener('click', downloadTextInvoice);
  }

  bindDownload();
  document.addEventListener('DOMContentLoaded', bindDownload, { once: true });
  new MutationObserver(bindDownload).observe(document.documentElement, { childList: true, subtree: true });
})();
