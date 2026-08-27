(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Branded first-visit intro. Session storage prevents it replaying on every page return.
  const intro = document.querySelector('[data-site-intro]');
  if (intro) {
    let introSeen = false;
    let introFinished = false;
    try { introSeen = sessionStorage.getItem('break-intro-seen') === '1'; } catch (_) { /* Storage can be unavailable. */ }

    const revealSite = () => {
      if (introFinished) return;
      introFinished = true;
      body.classList.add('site-ready');
      body.classList.remove('intro-active');
      intro.classList.add('is-leaving');
      window.setTimeout(() => intro.remove(), reduceMotion ? 0 : 650);
    };

    if (introSeen || reduceMotion) {
      intro.remove();
      body.classList.add('site-ready');
    } else {
      body.classList.add('intro-active');
      try { sessionStorage.setItem('break-intro-seen', '1'); } catch (_) { /* Continue without persistence. */ }
      const startExit = () => window.setTimeout(revealSite, 1450);
      if (document.readyState === 'complete') startExit();
      else window.addEventListener('load', startExit, { once: true });
      window.setTimeout(revealSite, 3500);
    }
  } else {
    body.classList.add('site-ready');
  }


  // Mobile navigation.
  const setMenu = (open) => {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    const bars = toggle.querySelectorAll('span');
    if (bars.length === 3) {
      bars[0].style.transform = open ? 'translateY(6px) rotate(45deg)' : '';
      bars[1].style.opacity = open ? '0' : '';
      bars[2].style.transform = open ? 'translateY(-6px) rotate(-45deg)' : '';
    }
  };

  if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (!mobileMenu?.classList.contains('is-open')) return;
    if (!mobileMenu.contains(event.target) && !toggle?.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1000) setMenu(false); }, { passive: true });

  // Header state.
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 14);
  updateHeader();

  // Footer year.
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Opening hours are intentionally not guessed; direct visitors to the verified phone number.
  const updateOpenStatus = () => {
    const isOpen = false;
    const text = 'Καλέστε για ωράριο · 22951 52112';

    document.querySelectorAll('[data-open-status]').forEach((el) => { el.textContent = text; });
    document.querySelectorAll('.live-status').forEach((el) => {
      el.classList.toggle('is-open', isOpen);
      el.classList.toggle('is-closed', !isOpen);
    });
  };
  updateOpenStatus();

  // Scroll reveal.
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Menu filtering and category state.
  const search = document.querySelector('[data-menu-search]');
  if (search) {
    const items = [...document.querySelectorAll('[data-menu-item]')];
    const sections = [...document.querySelectorAll('[data-menu-section]')];
    const status = document.querySelector('[data-search-status]');
    const empty = document.querySelector('[data-menu-empty]');
    const clearButtons = document.querySelectorAll('[data-clear-search]');
    const categoryLinks = [...document.querySelectorAll('[data-category-link]')];

    const normalize = (value) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('el-GR')
      .trim();

    const apply = () => {
      const query = normalize(search.value);
      let shown = 0;
      items.forEach((item) => {
        const match = !query || normalize(item.textContent).includes(query);
        item.hidden = !match;
        if (match) shown += 1;
      });
      sections.forEach((section) => {
        section.hidden = !section.querySelector('[data-menu-item]:not([hidden])');
      });
      if (status) status.textContent = query ? `${shown} ${shown === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'}` : '';
      if (empty) empty.hidden = shown !== 0;
    };

    search.addEventListener('input', apply);
    search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && search.value) {
        search.value = '';
        apply();
      }
    });
    clearButtons.forEach((button) => button.addEventListener('click', () => {
      search.value = '';
      apply();
      search.focus();
    }));

    categoryLinks.forEach((link) => link.addEventListener('click', () => {
      categoryLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    }));

    if ('IntersectionObserver' in window && categoryLinks.length) {
      const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && !entry.target.hidden)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        categoryLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
      }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.5] });
      sections.forEach((section) => sectionObserver.observe(section));
    }

    apply();
  }

  // Gallery lightbox with keyboard navigation and focus containment.
  const lightbox = document.querySelector('[data-lightbox]');
  const galleryItems = [...document.querySelectorAll('[data-gallery-item]')];
  if (lightbox && galleryItems.length) {
    const image = lightbox.querySelector('[data-lightbox-image]');
    const label = lightbox.querySelector('[data-lightbox-label]');
    const title = lightbox.querySelector('[data-lightbox-title]');
    const close = lightbox.querySelector('[data-lightbox-close]');
    const prev = lightbox.querySelector('[data-lightbox-prev]');
    const next = lightbox.querySelector('[data-lightbox-next]');
    const focusables = [close, prev, next].filter(Boolean);
    let current = 0;
    let lastFocus = null;

    const render = (index) => {
      current = (index + galleryItems.length) % galleryItems.length;
      const card = galleryItems[current];
      const cardImage = card.querySelector('img');
      const small = card.querySelector('small');
      const strong = card.querySelector('strong');
      if (!cardImage) return;
      image.src = cardImage.src;
      image.alt = cardImage.alt;
      label.textContent = small?.textContent || '';
      title.textContent = strong?.textContent || cardImage.alt;
    };

    const open = (index, source) => {
      lastFocus = source;
      render(index);
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
      close?.focus();
    };

    const hide = () => {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      body.classList.remove('lightbox-open');
      lastFocus?.focus();
    };

    galleryItems.forEach((item, index) => item.addEventListener('click', () => open(index, item)));
    close?.addEventListener('click', hide);
    prev?.addEventListener('click', () => render(current - 1));
    next?.addEventListener('click', () => render(current + 1));
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) hide(); });
    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') hide();
      if (event.key === 'ArrowLeft') render(current - 1);
      if (event.key === 'ArrowRight') render(current + 1);
      if (event.key === 'Tab' && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Back-to-top control is only visible after meaningful scrolling.
  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Επιστροφή στην κορυφή');
  backToTop.textContent = '↑';
  body.appendChild(backToTop);

  const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 650);
  updateBackToTop();
  let scrollUpdateQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollUpdateQueued) return;
    scrollUpdateQueued = true;
    window.requestAnimationFrame(() => {
      updateHeader();
      updateBackToTop();
      scrollUpdateQueued = false;
    });
  }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'auto' }));

  document.querySelectorAll('.site-footer .footer-grid').forEach((footer) => {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    legal.innerHTML = '<h3>Πληροφορίες</h3><a href="faq.html">Συχνές ερωτήσεις</a><a href="privacy.html">Απόρρητο</a><a href="terms.html">Όροι χρήσης</a><button type="button" data-cookie-settings>Ρυθμίσεις cookies</button>';
    footer.appendChild(legal);
  });

  const consentKey = 'break-consent-v1';
  const readConsent = () => { try { return JSON.parse(localStorage.getItem(consentKey)); } catch (_) { return null; } };
  const enableOptionalContent = () => {
    document.querySelectorAll('[data-map-src]').forEach((frame) => { if (!frame.src) frame.src = frame.dataset.mapSrc; });
    document.querySelectorAll('[data-map-consent]').forEach((notice) => { notice.hidden = true; });
    window.dispatchEvent(new CustomEvent('break:analytics-consent'));
  };
  const saveConsent = (analytics) => {
    localStorage.setItem(consentKey, JSON.stringify({ analytics, updated: new Date().toISOString() }));
    document.querySelector('[data-cookie-banner]')?.remove();
    if (analytics) enableOptionalContent();
  };
  const showConsent = () => {
    document.querySelector('[data-cookie-banner]')?.remove();
    const banner = document.createElement('section');
    banner.className = 'cookie-banner'; banner.dataset.cookieBanner = ''; banner.setAttribute('aria-label', 'Επιλογές cookies');
    banner.innerHTML = '<div><strong>Η ιδιωτικότητά σας</strong><p>Χρησιμοποιούμε απαραίτητη τοπική αποθήκευση. Ο χάρτης και τυχόν ανώνυμα στατιστικά ενεργοποιούνται μόνο αν τα αποδεχθείτε. <a href="privacy.html">Μάθετε περισσότερα</a>.</p></div><div class="cookie-actions"><button class="btn btn-dark" type="button" data-cookie-reject>Μόνο απαραίτητα</button><button class="btn btn-primary" type="button" data-cookie-accept>Αποδοχή</button></div>';
    body.appendChild(banner);
    banner.querySelector('[data-cookie-reject]').addEventListener('click', () => saveConsent(false));
    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => saveConsent(true));
  };
  const storedConsent = readConsent();
  if (!storedConsent) showConsent(); else if (storedConsent.analytics) enableOptionalContent();
  document.querySelectorAll('[data-cookie-settings]').forEach((button) => button.addEventListener('click', showConsent));
  document.querySelector('[data-enable-map]')?.addEventListener('click', () => saveConsent(true));

  const inquiryForm = document.querySelector('[data-inquiry-form]');
  inquiryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = inquiryForm.querySelector('[data-form-status]');
    if (!inquiryForm.checkValidity()) { inquiryForm.reportValidity(); if (status) status.textContent = 'Ελέγξτε τα υποχρεωτικά πεδία.'; return; }
    const data = new FormData(inquiryForm);
    const subject = encodeURIComponent(`Αίτημα από ${data.get('name')}`);
    const message = encodeURIComponent(`Όνομα: ${data.get('name')}\nΤηλέφωνο: ${data.get('phone')}\n\n${data.get('message')}`);
    if (status) status.textContent = 'Ανοίγει η εφαρμογή email…';
    window.location.href = `mailto:?subject=${subject}&body=${message}`;
  });
})();
