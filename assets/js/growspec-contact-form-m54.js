/* GROWSPEC enquiry form: direct Formspree delivery when a verified endpoint is configured;
   graceful email/WhatsApp fallbacks before setup and on delivery errors. */
(() => {
  'use strict';
  const form = document.querySelector('[data-m54-enquiry-form]');
  if (!form) return;

  const status = form.querySelector('[data-m54-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const copyButton = form.querySelector('[data-m54-copy]');
  const whatsappButton = form.querySelector('[data-m54-whatsapp]');
  const note = form.querySelector('.m54-form-note');
  const recipient = 'abbas@growspecbio.com';
  const configured = (form.getAttribute('data-formspree-endpoint') || '').trim();
  const endpoint = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+\/?$/.test(configured) ? configured : '';
  let sending = false;

  const params = new URLSearchParams(window.location.search);
  const requestedSystem = params.get('system');
  const systemSelect = form.elements.namedItem('system');
  const selectRequestedSystem = () => {
    if (!requestedSystem || !systemSelect) return;
    const option = Array.from(systemSelect.options).find((item) =>
      item.value.toLowerCase() === requestedSystem.toLowerCase());
    if (option) systemSelect.value = option.value;
  };
  selectRequestedSystem();

  const field = (name) => {
    const element = form.elements.namedItem(name);
    return element ? String(element.value || '').trim() : '';
  };

  const buildBrief = () => {
    const rows = [
      ['Name', field('name')],
      ['Company', field('company')],
      ['Email', field('email')],
      ['Phone / WhatsApp', field('phone')],
      ['Country / Region', field('country')],
      ['Interested System', field('system')],
      ['Crop / Application', field('crop')],
      ['Available Space', field('space')],
      ['Target Output', field('output')],
      ['Project Timeline', field('timeline')],
      ['Project Details', field('message')],
    ];
    return rows.filter((row) => row[1]).map((row) => row[0] + ': ' + row[1]).join('\n\n');
  };

  const setStatus = (message, kind) => {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-status', kind || 'info');
  };

  const validate = () => {
    if (field('website') || field('_gotcha')) return false;
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Please complete your name, email, country and system selection.', 'error');
      return false;
    }
    return true;
  };

  const mailtoUrl = () => {
    const subject = 'GROWSPEC Project Enquiry - ' + (field('system') || 'General') + ' - ' + field('name');
    const body = [
      'Hello GROWSPEC,',
      '',
      'I would like to request a quotation or technical consultation.',
      '',
      buildBrief(),
      '',
      'Please contact me using the details above.'
    ].join('\n');
    return 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };

  if (endpoint) {
    form.action = endpoint;
    form.method = 'POST';
    if (submitButton) submitButton.textContent = 'Send Project Enquiry';
    if (note) note.textContent = 'Send your enquiry directly to our sales team. You will see a confirmation here if the service accepts your submission.';
  } else {
    if (submitButton) submitButton.textContent = 'Prepare Email Enquiry';
    if (note) note.textContent = 'Email opens a prepared draft in your email app; you must press Send there. WhatsApp opens a prefilled message you can send.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !validate()) return;

    if (!endpoint) {
      setStatus('Your email app is opening. Please press Send there to deliver the enquiry.', 'info');
      window.location.href = mailtoUrl();
      return;
    }

    const selectedSystem = field('system') || 'General';
    const formData = new FormData(form);
    formData.delete('website');
    formData.set('_subject', 'GROWSPEC Project Enquiry - ' + selectedSystem + ' - ' + field('name'));
    formData.set('enquiry_page', window.location.href);
    formData.set('source', 'GROWSPEC website project enquiry');

    sending = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending enquiry...';
    }
    form.setAttribute('aria-busy', 'true');
    setStatus('Sending your project enquiry securely...', 'info');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        if (response.status === 429) throw new Error('rate-limit');
        throw new Error('not-accepted');
      }

      form.reset();
      selectRequestedSystem();
      setStatus('Thank you. Your enquiry was accepted by our form service. We will review your project details and reply by email.', 'success');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { lead_source: 'website_form', product_interest: selectedSystem });
      }
    } catch (error) {
      const rateLimited = error && error.message === 'rate-limit';
      const message = rateLimited
        ? 'The enquiry service is busy. Please try again shortly, or contact us directly by email or WhatsApp.'
        : 'Your enquiry was not confirmed as submitted. Please try again, or contact us by WhatsApp or email. Your entered details have been kept.';
      setStatus(message, 'error');
    } finally {
      sending = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Project Enquiry';
      }
      form.removeAttribute('aria-busy');
    }
  });

  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      if (!validate()) return;
      const message = [
        'Hello GROWSPEC, I would like to request a quotation or project consultation.',
        '',
        buildBrief()
      ].join('\n');
      const url = 'https://wa.me/8618718396182?text=' + encodeURIComponent(message);
      const tab = window.open(url, '_blank', 'noopener,noreferrer');
      if (!tab) window.location.href = url;
      setStatus('WhatsApp is opening with your project details. Please press Send in WhatsApp to deliver your enquiry.', 'info');
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const brief = buildBrief();
      if (!brief) {
        setStatus('Add your project details before copying.', 'info');
        return;
      }
      try {
        await navigator.clipboard.writeText(brief);
        setStatus('Project brief copied. Paste it into your email or WhatsApp message.', 'success');
      } catch (_) {
        const textarea = document.createElement('textarea');
        textarea.value = brief;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        setStatus(copied ? 'Project brief copied.' : 'Copy failed. Please select and copy your project details manually.', copied ? 'success' : 'error');
      }
    });
  }
})();