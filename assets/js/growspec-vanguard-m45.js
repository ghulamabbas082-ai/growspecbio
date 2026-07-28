(() => {
  const body = document.body;
  if (!body || !body.classList.contains('vanguard-m45')) return;

  const header = document.querySelector('[data-apex-header]');
  const menuButton = document.querySelector('[data-apex-menu]');
  const mobileNav = document.querySelector('[data-apex-mobile]');
  const navGroup = document.querySelector('.apex-nav-group');
  const navTrigger = document.querySelector('.apex-nav-trigger');

  const progress = document.createElement('div');
  progress.className = 'm45-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const updateScrollState = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--m45-scroll', String(Math.min(1, window.scrollY / max)));
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });

  const closeMobile = () => {
    if (!header || !menuButton) return;
    header.classList.remove('is-menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  if (menuButton && header) {
    menuButton.addEventListener('click', () => {
      const open = header.classList.toggle('is-menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMobile();
    });
  }

  if (navTrigger && navGroup) {
    navTrigger.addEventListener('click', event => {
      event.preventDefault();
      const open = navGroup.classList.toggle('is-open');
      navTrigger.setAttribute('aria-expanded', String(open));
    });
  }

  document.addEventListener('click', event => {
    if (navGroup && !navGroup.contains(event.target)) {
      navGroup.classList.remove('is-open');
      navTrigger?.setAttribute('aria-expanded', 'false');
    }
    if (header && header.classList.contains('is-menu-open') && !header.contains(event.target)) {
      closeMobile();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMobile();
      navGroup?.classList.remove('is-open');
      navTrigger?.setAttribute('aria-expanded', 'false');
    }
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5%' });
    document.querySelectorAll('.apex-reveal').forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.apex-reveal').forEach(element => element.classList.add('is-visible'));
  }

  const sectionLinks = [...document.querySelectorAll('.apex-section-nav a[href^="#"]')];
  const sectionMap = sectionLinks
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(item => item.section);

  if ('IntersectionObserver' in window && sectionMap.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionMap.forEach(({ link, section }) => {
        const active = section === visible.target;
        link.classList.toggle('is-active', active);
        if (active && window.innerWidth < 780) {
          link.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-34% 0px -58%', threshold: [0, 0.15, 0.35] });
    sectionMap.forEach(({ section }) => sectionObserver.observe(section));
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-m45-depth]').forEach(frame => {
      frame.addEventListener('pointermove', event => {
        const rect = frame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        frame.style.setProperty('--m45-x', `${(x * 5).toFixed(2)}px`);
        frame.style.setProperty('--m45-y', `${(y * 4).toFixed(2)}px`);
      });
      frame.addEventListener('pointerleave', () => {
        frame.style.setProperty('--m45-x', '0px');
        frame.style.setProperty('--m45-y', '0px');
      });
    });
  }
})();
