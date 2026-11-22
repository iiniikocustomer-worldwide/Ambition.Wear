  function sendInvoice() {
    if (!cart.length) return toast('Your bag is empty');
    const form = $('.checkout-options');
    if (!form.reportValidity()) return;
    const name = form.elements['customer-name'].value.trim();
    const email = form.elements['customer-email'].value.trim();
    const address = form.elements['customer-address'].value.trim();
    const delivery = form.elements['delivery-option'].value;
    const payment = form.elements['payment-option'].value;
    if (delivery.startsWith('Delivery') && !address) return toast('Please enter your delivery address');

    const lines = cart.flatMap((item) => {
      const detail = `${item.name}${item.colour ? ` — ${item.colour}` : ''}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${money(item.price * item.quantity)}`;
      return item.image ? [detail, `Product image: ${item.image}`, ''] : [detail, ''];
    });

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const message = ['Hello Ambition Wear, I would like to place this order:', '', ...lines, `Client name: ${name}`, `Client email: ${email}`, `Delivery: ${delivery}`, `Payment: ${payment}`, ...(address ? [`Address: ${address}`] : []), '', `Subtotal: ${money(subtotal)}`, 'Please confirm availability and arrange payment/delivery. Thank you!'];
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
