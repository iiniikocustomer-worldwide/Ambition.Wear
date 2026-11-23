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

  function loadImage(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const image = new Image();
      let done = false;
      const finish = (value) => {
        if (done) return;
        done = true;
        resolve(value);
      };
      image.onload = () => finish(image);
      image.onerror = () => finish(null);
      setTimeout(() => finish(null), 2500);
      image.src = url;
    });
  }

  async function makeInvoiceImage(cart, details, subtotal) {
    const width = 900;
    const rowHeight = 170;
    const top = 210;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = top + cart.length * rowHeight + 230;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create invoice image.');

    context.fillStyle = '#f5f4ef';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#171814';
    context.fillRect(0, 0, width, 150);
    context.fillStyle = '#d7ff00';
    context.font = '700 22px Arial';
    context.fillText('AMBITION WEAR', 42, 48);
    context.fillStyle = '#ffffff';
    context.font = '700 38px Arial';
    context.fillText('ORDER INVOICE', 42, 105);

    let y = top;
    for (const item of cart) {
      context.fillStyle = '#ffffff';
      context.fillRect(30, y, width - 60, rowHeight - 14);
      context.strokeStyle = '#deded7';
      context.strokeRect(30, y, width - 60, rowHeight - 14);

      const image = await loadImage(item.image);
      if (image) {
        context.save();
        context.beginPath();
        context.rect(48, y + 16, 132, 132);
        context.clip();
        const scale = Math.max(132 / image.naturalWidth, 132 / image.naturalHeight);
        const imageWidth = image.naturalWidth * scale;
        const imageHeight = image.naturalHeight * scale;
        context.drawImage(image, 48 + (132 - imageWidth) / 2, y + 16 + (132 - imageHeight) / 2, imageWidth, imageHeight);
        context.restore();
      }

      context.fillStyle = '#171814';
      context.font = '700 22px Arial';
      context.fillText(`${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''}`.slice(0, 48), 202, y + 48);
      context.font = '18px Arial';
      context.fillStyle = '#555';
      context.fillText(`Quantity: ${item.quantity}`, 202, y + 84);
      context.font = '700 21px Arial';
      context.fillStyle = '#171814';
      context.fillText(money(Number(item.price) * Number(item.quantity)), 202, y + 124);
      y += rowHeight;
    }

    context.fillStyle = '#171814';
    context.font = '700 24px Arial';
    context.fillText(`Subtotal: ${money(subtotal)}`, 48, y + 35);
    context.font = '18px Arial';
    context.fillText(`Customer: ${details.name}`, 48, y + 78);
    context.fillText(`Email: ${details.email}`, 48, y + 108);
    context.fillText(`Delivery: ${details.delivery}`, 48, y + 138);
    context.fillText(`Payment: ${details.payment}`, 48, y + 168);

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Invoice generation timed out.'));
      }, 8000);
      canvas.toBlob((blob) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        blob ? resolve(blob) : reject(new Error('Could not export invoice image.'));
      }, 'image/png');
    });
  }

  function openWhatsApp(message) {
    window.location.assign(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`);
  }

  document.addEventListener('click', async (event) => {
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
      addressInput?.setCustomValidity('Please enter your delivery address.');
      addressInput?.reportValidity();
      addressInput?.setCustomValidity('');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const details = { name, email, delivery, payment };
    const orderLines = cart.map((item) => `${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${money(Number(item.price) * Number(item.quantity))}`);
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

    button.disabled = true;
    let blob;
    try {
      blob = await makeInvoiceImage(cart, details, subtotal);
      const file = new File([blob], 'ambition-wear-invoice.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: 'Ambition Wear order invoice',
            text: message
          });
          toast('Invoice shared successfully.');
        } catch (error) {
          if (error?.name !== 'AbortError') openWhatsApp(message);
        }
      } else {
        openWhatsApp(message);
        toast('WhatsApp opened for Ambition Wear.');
      }
    } catch (_) {
      openWhatsApp(message);
    } finally {
      button.disabled = false;
    }
  }, true);
})();
