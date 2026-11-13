(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const accountForm = $('#account-form');
  const cardForm = $('#card-form');
  const card = $('#deal-card');
  const status = $('#builder-status');
  const fields = {
    campaign: $('#campaign-type'), headline: $('#offer-title'), discount: $('#discount'),
    code: $('#promo-code'), note: $('#card-note')
  };
  const safe = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  function updatePreview() {
    const campaign = fields.campaign.value;
    $('#preview-headline').innerHTML = safe(fields.headline.value.trim() || 'YOUR BIG\nOFFER').replace(/\n/g, '<br>');
    $('#preview-discount').textContent = fields.discount.value.trim() || 'YOUR OFFER';
    $('#preview-code').textContent = fields.code.value.trim() ? `CODE: ${fields.code.value.trim().toUpperCase()}` : '';
    $('#preview-note').textContent = fields.note.value.trim() || 'SHOP THE DROP';
    $('.deal-type').textContent = campaign === 'SALE' ? 'SEASONAL SALE' : campaign;
    const theme = $('input[name="theme"]:checked')?.value || 'lime';
    card.className = `deal-card theme-${theme}`;
  }

  accountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!accountForm.reportValidity()) return;
    const name = $('#client-name').value.trim();
    status.textContent = `Welcome, ${name.split(/\s+/)[0]} — your profile is ready in this demo.`;
    $('#account-panel').classList.add('profile-ready');
    $('#workspace-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  cardForm.addEventListener('input', updatePreview);
  cardForm.addEventListener('change', updatePreview);
  $('#save-card').addEventListener('click', () => {
    const draft = {
      campaign: fields.campaign.value, headline: fields.headline.value,
      discount: fields.discount.value, code: fields.code.value, note: fields.note.value,
      theme: $('input[name="theme"]:checked')?.value || 'lime'
    };
    try {
      localStorage.setItem('ambition-client-card-draft', JSON.stringify(draft));
      status.textContent = 'Draft saved in this browser.';
    } catch (_) {
      status.textContent = 'Browser storage is unavailable. You can still download your card.';
    }
  });

  try {
    const draft = JSON.parse(localStorage.getItem('ambition-client-card-draft') || 'null');
    if (draft) {
      fields.campaign.value = draft.campaign || 'SALE';
      fields.headline.value = draft.headline || '';
      fields.discount.value = draft.discount || '';
      fields.code.value = draft.code || '';
      fields.note.value = draft.note || '';
      const themeOption = $(`input[name="theme"][value="${draft.theme}"]`);
      if (themeOption) themeOption.checked = true;
    }
  } catch (_) { /* Ignore invalid or unavailable local drafts. */ }

  $('#download-card').addEventListener('click', () => {
    const theme = $('input[name="theme"]:checked')?.value || 'lime';
    const colors = { lime: { bg:'#171814', fg:'#ffffff', accent:'#d7ff00' }, mono:{ bg:'#e9e8e2', fg:'#171814', accent:'#171814' }, red:{ bg:'#421b18', fg:'#ffffff', accent:'#ff5948' } }[theme];
    const headline = fields.headline.value.trim() || 'YOUR BIG OFFER';
    const lines = headline.split(/\s*\n\s*|\s*\.\s*/).filter(Boolean).slice(0, 3);
    const code = fields.code.value.trim() ? `CODE: ${fields.code.value.trim().toUpperCase()}` : '';
    const xml = (value) => safe(value);
    const headlineSvg = lines.map((line, index) => `<text x="80" y="${390 + index * 92}" fill="${colors.fg}" font-family="Arial,sans-serif" font-size="78" font-weight="800" letter-spacing="-5">${xml(line)}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="${colors.bg}"/><circle cx="1030" cy="150" r="360" fill="none" stroke="${colors.fg}" stroke-opacity=".14" stroke-width="2"/><text x="80" y="92" fill="${colors.fg}" font-family="Arial,sans-serif" font-size="27" font-weight="700" letter-spacing="5">AMBITION WEAR</text><text x="80" y="260" fill="${colors.accent}" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="5">${xml(fields.campaign.value === 'SALE' ? 'SEASONAL SALE' : fields.campaign.value)}</text>${headlineSvg}<rect x="80" y="690" width="480" height="100" fill="${colors.accent}"/><text x="105" y="758" fill="${theme === 'mono' ? '#fff' : '#171814'}" font-family="Arial,sans-serif" font-size="48" font-weight="800">${xml(fields.discount.value.trim() || 'YOUR OFFER')}</text><text x="80" y="900" fill="${colors.accent}" font-family="Arial,sans-serif" font-size="25" font-weight="700" letter-spacing="2">${xml(code)}</text><line x1="80" y1="940" x2="1000" y2="940" stroke="${colors.fg}" stroke-opacity=".5"/><text x="80" y="990" fill="${colors.fg}" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="3">${xml(fields.note.value.trim() || 'SHOP THE DROP')}</text><text x="1000" y="990" fill="${colors.accent}" text-anchor="end" font-family="Arial,sans-serif" font-size="28">✦</text></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ambition-deal-card.svg';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    URL.revokeObjectURL(url);
    status.textContent = 'Your deal card has been downloaded as an SVG.';
  });
  updatePreview();
})();
