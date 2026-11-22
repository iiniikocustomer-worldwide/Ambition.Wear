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

  // Intercept checkout before the legacy handler, which called reportValidity()
  // on a div rather than a form and therefore prevented orders from opening.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#send-invoice');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    let cart;
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      cart = Array.isArray(saved) ? saved.filter((item) => item && Number(item.quantity) > 0) : [];
    } catch (_) {
      cart = [];
    }
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
      addressInput?.setCustomValidity('Please enter your delivery address.');
      addressInput?.reportValidity();
      addressInput?.setCustomValidity('');
      return;
    }

    const lines = cart.flatMap((item) => {
      const description = `${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${money(Number(item.price) * Number(item.quantity))}`;
      return [description, ...(item.image ? [`Product image: ${item.image}`] : []), ''];
    });
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const message = [
      'Hello Ambition Wear, I would like to place this order:',
      '', ...lines,
      `Client name: ${name}`,
      `Client email: ${email}`,
      `Delivery: ${delivery}`,
      `Payment: ${payment}`,
      ...(address ? [`Address: ${address}`] : []),
      '', `Subtotal: ${money(subtotal)}`,
      'Please confirm availability and arrange payment/delivery. Thank you!'
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }, true);
})();
