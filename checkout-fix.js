(() => {
  'use strict';

  const CART_KEY = 'ambition-wear-cart';
  const WHATSAPP = '27672364114';
  const money = (value) => `R${Number(value || 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

  const toast = (message) => {
    const node = document.querySelector('.toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
  };

  function getCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter((item) => item && Number(item.quantity) > 0) : [];
    } catch (_) {
      return [];
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#send-invoice');
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const cart = getCart();
    if (!cart.length) return toast('Your bag is empty');

    const checkout = document.querySelector('.checkout-options');
    if (!checkout) return toast('Checkout is unavailable. Please refresh and try again.');

    const field = (name) => checkout.querySelector(`[name="${name}"]`);
    const nameInput = field('customer-name');
    const emailInput = field('customer-email');
    const addressInput = field('customer-address');
    const deliveryInput = field('delivery-option');
    const paymentInput = field('payment-option');

    for (const input of [nameInput, emailInput, deliveryInput, paymentInput]) {
      if (input && !input.reportValidity()) return;
    }

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const address = addressInput?.value.trim() || '';
    const delivery = deliveryInput?.value || 'Collection';
    const payment = paymentInput?.value || 'To be confirmed';

    if (delivery.startsWith('Delivery') && !address) {
      if (addressInput) {
        addressInput.setCustomValidity('Please enter your delivery address.');
        addressInput.reportValidity();
        addressInput.setCustomValidity('');
      } else {
        toast('Please enter your delivery address');
      }
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const orderLines = cart.map((item) =>
      `${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${money(Number(item.price) * Number(item.quantity))}`
    );

    const message = [
      'Hello Ambition Wear, I would like to place this order:',
      '', ...orderLines,
      '', `Client name: ${name}`,
      `Client email: ${email}`,
      `Delivery: ${delivery}`,
      `Payment: ${payment}`,
      ...(address ? [`Address: ${address}`] : []),
      '', `Subtotal: ${money(subtotal)}`,
      'Please confirm availability and arrange payment/delivery. Thank you!'
    ].join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    button.disabled = true;
    const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    // Fall back to same-tab navigation if the browser blocks the new tab.
    if (!whatsappWindow) window.location.assign(whatsappUrl);
    setTimeout(() => { button.disabled = false; }, 300);
  }, true);
})();
