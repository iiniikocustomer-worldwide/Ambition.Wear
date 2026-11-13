(() => {
  'use strict';

  const currencies = {
    ZAR: { label: 'ZAR · South African rand', symbol: 'R', fallback: 1 },
    USD: { label: 'USD · US dollar', symbol: '$', fallback: 0.055 },
    GBP: { label: 'GBP · British pound', symbol: '£', fallback: 0.043 },
    EUR: { label: 'EUR · Euro', symbol: '€', fallback: 0.050 }
  };
  const currencyKey = 'ambition-display-currency';
  const profileKey = 'ambition-client-profile';
  let rates = Object.fromEntries(Object.entries(currencies).map(([code, value]) => [code, value.fallback]));
  let activeCurrency = 'ZAR';
  try { if (currencies[localStorage.getItem(currencyKey)]) activeCurrency = localStorage.getItem(currencyKey); } catch (_) { /* storage may be disabled */ }

  const style = document.createElement('style');
  style.textContent = `
    .currency-control{position:relative;display:inline-flex!important;align-items:center;gap:8px}
    .currency-label{border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;padding:10px 0}
    .currency-menu{position:absolute;z-index:200;right:0;bottom:calc(100% + 10px);min-width:220px;padding:8px;background:#fff;color:#161616;border:1px solid #ddd;box-shadow:0 12px 35px #0002}
    .currency-menu[hidden]{display:none}
    .currency-option{display:flex;width:100%;padding:11px 12px;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}
    .currency-option:hover,.currency-option[aria-checked=true]{background:#f0efe9}
    .currency-note{margin:6px 10px 8px;color:#666;font-size:11px;line-height:1.5}
    .profile-editor{margin-top:22px;padding:22px;background:#efeee9;border-left:3px solid #d7ff00}
    .profile-editor[hidden]{display:none}
    .profile-editor h4{margin:0 0 14px;font:700 19px/1.2 'Space Grotesk','DM Sans',sans-serif}
    .profile-preview{display:flex;align-items:center;gap:14px;margin-bottom:18px}
    .profile-avatar{width:76px;height:76px;flex:0 0 76px;border-radius:50%;object-fit:cover;background:#d8d8d1;border:2px solid #fff;box-shadow:0 2px 12px #0002}
    .profile-avatar-placeholder{display:grid;place-items:center;color:#444;font-weight:800;font-size:24px}
    .profile-preview-copy{min-width:0}.profile-preview-copy strong,.profile-preview-copy span{display:block;overflow-wrap:anywhere}
    .profile-preview-copy span{margin-top:4px;color:#666;font-size:13px}
    .profile-editor label{display:block;margin:12px 0 6px;font-size:12px;font-weight:700}
    .profile-editor input[type=text],.profile-editor textarea{width:100%;padding:11px 12px;border:1px solid #d4d3cc;background:#fff;color:#171714;font:inherit}
    .profile-editor textarea{min-height:84px;resize:vertical}
    .profile-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
    .profile-actions button{padding:10px 14px;border:1px solid #171714;background:#171714;color:#fff;font:700 12px inherit;cursor:pointer}
    .profile-actions .profile-remove{background:transparent;color:#171714}
    .profile-status{min-height:1.4em;margin:10px 0 0;color:#3d5a00;font-size:12px}
    @media(max-width:520px){.currency-menu{right:-8px}.profile-editor{padding:18px}}
  `;
  document.head.append(style);

  function currencyFormat(amount) {
    const converted = amount * rates[activeCurrency];
    const decimals = activeCurrency === 'ZAR' ? 0 : 2;
    return `${currencies[activeCurrency].symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  function decoratePrices(root = document) {
    const selector = '.product-card__price,.product-modal__price-row strong,.bag-subtotal,.cart-item strong';
    const nodes = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    nodes.forEach((node) => {
      if (!node.dataset.zarPrice) {
        const match = node.textContent.trim().match(/^R\s*([\d,]+(?:\.\d+)?)(.*)$/);
        if (!match) return;
        node.dataset.zarPrice = String(Number(match[1].replace(/,/g, '')));
        node.dataset.priceSuffix = match[2] || '';
      }
      node.textContent = `${currencyFormat(Number(node.dataset.zarPrice))}${node.dataset.priceSuffix || ''}`;
    });
  }

  function makeCurrencyControl(label) {
    if (label.dataset.currencyReady) return;
    label.dataset.currencyReady = 'true';
    label.classList.add('currency-label');
    label.setAttribute('aria-haspopup', 'listbox');
    label.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.className = 'currency-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Choose display currency');
    Object.entries(currencies).forEach(([code, currency]) => {
      const option = document.createElement('button');
      option.type = 'button'; option.className = 'currency-option'; option.dataset.currency = code;
      option.setAttribute('role', 'option'); option.textContent = currency.label;
      option.addEventListener('click', () => {
        activeCurrency = code;
        try { localStorage.setItem(currencyKey, code); } catch (_) { /* storage may be disabled */ }
        updateCurrencyUI();
        menu.hidden = true; label.setAttribute('aria-expanded', 'false');
      });
      menu.append(option);
    });
    const note = document.createElement('p');
    note.className = 'currency-note';
    note.textContent = 'Display conversion is approximate. Order totals are confirmed in ZAR.';
    menu.append(note);
    label.insertAdjacentElement('afterend', menu);
    label.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      label.setAttribute('aria-expanded', String(!menu.hidden));
    });
    label.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); label.click(); }
      if (event.key === 'Escape') { menu.hidden = true; label.setAttribute('aria-expanded', 'false'); }
    });
  }

  function updateCurrencyUI() {
    document.querySelectorAll('.currency-label').forEach((label) => {
      label.childNodes.forEach((node) => { if (node.nodeType === Node.TEXT_NODE) node.remove(); });
      label.prepend(document.createTextNode(activeCurrency));
      label.setAttribute('aria-label', `Display currency: ${currencies[activeCurrency].label}. Activate to change.`);
      label.querySelectorAll('.currency-option').forEach((option) => option.setAttribute('aria-checked', String(option.dataset.currency === activeCurrency)));
    });
    decoratePrices();
  }

  function initCurrency() {
    document.querySelectorAll('.currency-label').forEach(makeCurrencyControl);
    updateCurrencyUI();
    fetch('https://api.frankfurter.app/latest?from=ZAR&to=USD,GBP,EUR', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error('Rates unavailable');
      return response.json();
    }).then((data) => {
      if (data.rates) { rates = { ...rates, ...data.rates, ZAR: 1 }; updateCurrencyUI(); }
    }).catch(() => undefined);
  }

  function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
      if (file.size > 8 * 1024 * 1024) return reject(new Error('Image must be 8 MB or smaller.'));
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const scale = Math.min(1, 420 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.76));
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
      image.src = url;
    });
  }

  function initProfileEditor() {
    const accountForm = document.querySelector('#account-form');
    const panel = document.querySelector('#account-panel');
    if (!accountForm || !panel || panel.querySelector('.profile-editor')) return;
    const editor = document.createElement('section');
    editor.className = 'profile-editor'; editor.hidden = true;
    editor.innerHTML = '<h4>Customize your client profile</h4><div class="profile-preview"><div class="profile-avatar profile-avatar-placeholder" data-avatar-placeholder aria-hidden="true">A</div><img class="profile-avatar" data-avatar hidden alt="Your profile photo"><div class="profile-preview-copy"><strong data-profile-name>Your name</strong><span data-profile-business>Your business or brand</span></div></div><label for="profile-photo">Profile image</label><input id="profile-photo" type="file" accept="image/*"><label for="profile-bio">Short profile bio</label><textarea id="profile-bio" maxlength="180" placeholder="Tell us a little about your brand"></textarea><div class="profile-actions"><button type="button" data-save-profile>Save profile</button><button type="button" class="profile-remove" data-remove-photo>Remove photo</button></div><p class="profile-status" role="status" aria-live="polite"></p>';
    accountForm.insertAdjacentElement('afterend', editor);

    let profile = null;
    try { profile = JSON.parse(localStorage.getItem(profileKey) || 'null'); } catch (_) { profile = null; }
    const photoInput = editor.querySelector('#profile-photo');
    const bioInput = editor.querySelector('#profile-bio');
    const status = editor.querySelector('.profile-status');
    const photo = editor.querySelector('[data-avatar]');
    const placeholder = editor.querySelector('[data-avatar-placeholder]');
    const renderProfile = () => {
      const name = profile?.name || accountForm.elements.name.value.trim() || 'Your name';
      const business = profile?.business || accountForm.elements.business.value.trim() || 'Your business or brand';
      editor.querySelector('[data-profile-name]').textContent = name;
      editor.querySelector('[data-profile-business]').textContent = business;
      bioInput.value = profile?.bio || '';
      if (profile?.photo) { photo.src = profile.photo; photo.hidden = false; placeholder.hidden = true; }
      else { photo.removeAttribute('src'); photo.hidden = true; placeholder.hidden = false; placeholder.textContent = (name[0] || 'A').toUpperCase(); }
    };
    renderProfile();

    accountForm.addEventListener('submit', (event) => {
      if (!accountForm.checkValidity()) return;
      const name = accountForm.elements.name.value.trim();
      const business = accountForm.elements.business.value.trim();
      const email = accountForm.elements.email.value.trim();
      profile = { ...(profile || {}), name, business, email, bio: profile?.bio || '', photo: profile?.photo || '' };
      try { localStorage.setItem(profileKey, JSON.stringify(profile)); }
      catch (_) { status.textContent = 'Profile could not be saved in this browser. Try a smaller image or clear storage.'; }
      renderProfile();
      setTimeout(() => { editor.hidden = false; }, 0);
      // Do not cancel the existing demo account form handler.
      void event;
    }, true);

    photoInput.addEventListener('change', async () => {
      if (!photoInput.files?.[0]) return;
      status.textContent = 'Preparing image…';
      try {
        profile = { ...(profile || {}), photo: await compressPhoto(photoInput.files[0]) };
        renderProfile();
        status.textContent = 'Image preview ready. Save your profile to keep it in this browser.';
      } catch (error) { status.textContent = error.message; }
    });
    editor.querySelector('[data-save-profile]').addEventListener('click', () => {
      profile = { ...(profile || {}), name: accountForm.elements.name.value.trim(), business: accountForm.elements.business.value.trim(), email: accountForm.elements.email.value.trim(), bio: bioInput.value.trim() };
      try { localStorage.setItem(profileKey, JSON.stringify(profile)); status.textContent = 'Profile saved on this device.'; }
      catch (_) { status.textContent = 'Could not save profile. Try a smaller image or clear browser storage.'; }
      renderProfile();
    });
    editor.querySelector('[data-remove-photo]').addEventListener('click', () => {
      profile = { ...(profile || {}), photo: '' }; photoInput.value = ''; renderProfile();
      try { localStorage.setItem(profileKey, JSON.stringify(profile)); status.textContent = 'Profile photo removed.'; }
      catch (_) { status.textContent = 'Could not update profile storage.'; }
    });
  }

  function init() { initCurrency(); initProfileEditor(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches?.('.currency-label') || node.querySelector?.('.currency-label')) initCurrency();
    if (node.matches?.('#account-form') || node.querySelector?.('#account-form')) initProfileEditor();
    decoratePrices(node);
  })));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
