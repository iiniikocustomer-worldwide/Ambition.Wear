(() => {
  'use strict';

  function decorateActions() {
    const footer = document.querySelector('.bag-drawer .bag-footer');
    const send = document.querySelector('#send-invoice');
    if (!footer || !send) return false;

    if (send.textContent !== 'WhatsApp invoice') send.textContent = 'WhatsApp invoice';

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
      style.textContent = `.bag-drawer .bag-footer #download-invoice,.bag-drawer .bag-footer #send-invoice{width:100%;min-height:52px;border-radius:28px;font-weight:700}.bag-drawer .bag-footer #download-invoice{margin-bottom:10px}`;
      document.head.append(style);
    }
    return true;
  }

  // The bag is injected by site.js after startup on some pages. Watch only until
  // it appears, then disconnect so cart updates cannot trigger an endless scan.
  if (decorateActions()) return;

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (!node.matches?.('#bag-drawer, .bag-drawer, #send-invoice') &&
            !node.querySelector?.('#bag-drawer, .bag-drawer, #send-invoice')) continue;
        if (decorateActions()) {
          observer.disconnect();
          return;
        }
      }
    }
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
