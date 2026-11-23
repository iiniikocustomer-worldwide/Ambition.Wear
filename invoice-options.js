(() => {
  'use strict';

  function decorateActions() {
    const footer = document.querySelector('.bag-drawer .bag-footer');
    const send = document.querySelector('#send-invoice');
    if (!footer || !send) return;

    send.textContent = 'WhatsApp invoice';

    if (!document.querySelector('#download-invoice')) {
      const download = document.createElement('button');
      download.type = 'button';
      download.id = 'download-invoice';
      download.className = 'primary-action download-invoice-action';
      download.textContent = 'Download invoice';
      send.insertAdjacentElement('beforebegin', download);
    }

    const styleId = 'invoice-actions-style';
    if (!document.querySelector(`#${styleId}`)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.bag-drawer .bag-footer #download-invoice,.bag-drawer .bag-footer #send-invoice{width:100%;min-height:52px;border-radius:28px;font-weight:700}.bag-drawer .bag-footer #download-invoice{margin-bottom:8px;background:#fff!important;color:#111!important;border:1.5px solid #111}.bag-drawer .bag-footer #send-invoice{background:#25D366!important;border:0;color:#111!important}`;
      document.head.append(style);
    }
  }

  decorateActions();
  document.addEventListener('DOMContentLoaded', decorateActions, { once: true });
  new MutationObserver(decorateActions).observe(document.documentElement, { childList: true, subtree: true });
})();
