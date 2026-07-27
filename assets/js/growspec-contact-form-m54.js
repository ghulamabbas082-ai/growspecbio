
(() => {
  const form = document.querySelector('[data-m54-enquiry-form]');
  if (!form) return;

  const status = form.querySelector('[data-m54-form-status]');
  const copyButton = form.querySelector('[data-m54-copy]');
  const recipient = 'abbas@growspecbio.com';

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
    return rows
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n\n');
  };

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const honeypot = field('website');
    if (honeypot) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Please complete the required fields before sending.');
      return;
    }

    const system = field('system') || 'Project Enquiry';
    const name = field('name') || 'Website Visitor';
    const subject = `GROWSPEC Project Enquiry — ${system} — ${name}`;
    const body = [
      'Hello GROWSPEC,',
      '',
      'I would like to discuss a controlled-environment agriculture project.',
      '',
      buildBrief(),
      '',
      'Please contact me using the details above.',
    ].join('\n');

    setStatus('Your email application is opening with the project brief prepared.');
    window.location.href =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const brief = buildBrief();
      if (!brief) {
        setStatus('Add your project details before copying the brief.');
        return;
      }

      try {
        await navigator.clipboard.writeText(brief);
        setStatus('Project brief copied. You can paste it into email or WhatsApp.');
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = brief;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        setStatus('Project brief copied. You can paste it into email or WhatsApp.');
      }
    });
  }
})();
