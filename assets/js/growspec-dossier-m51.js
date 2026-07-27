
(() => {
  const activate = (root, button, focus = false) => {
    const buttons = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];
    const target = button.getAttribute('aria-controls');

    buttons.forEach((item) => {
      const active = item === button;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.id === target;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    if (focus) button.focus({preventScroll: true});
  };

  document.querySelectorAll('[data-m51-tabs]').forEach((root) => {
    const buttons = [...root.querySelectorAll('[role="tab"]')];
    if (!buttons.length) return;

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(root, button));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        activate(root, buttons[next], true);
      });
    });

    const selected = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
    activate(root, selected);
  });
})();
