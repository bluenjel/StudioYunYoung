(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');

  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const legacyRoutes = {
    '#price': '/price/',
    '#services': '/services/',
    '#gallery': '/portfolio/',
    '#about': '/about/',
    '#yy-process': '/about/#process',
    '#yy-principles': '/about/#principles',
    '#yy-reviews': '/about/#reviews',
    '#yy-consult': '/consult/',
    '#contact': '/consult/#contact'
  };
  if (location.pathname === '/' && legacyRoutes[location.hash]) {
    location.replace(legacyRoutes[location.hash]);
  }

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  if (slides.length) {
    let current = 0;
    let timer;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
        slide.setAttribute('aria-hidden', String(index !== current));
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
        dot.setAttribute('aria-pressed', String(index === current));
      });
    };
    const start = () => {
      clearInterval(timer);
      if (!reducedMotion && !document.hidden) {
        timer = setInterval(() => {
          current = (current + 1) % slides.length;
          render();
        }, 5600);
      }
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => {
      current = index;
      render();
      start();
    }));
    document.addEventListener('visibilitychange', start);
    render();
    start();
  }

  const homeSlider = document.querySelector('[data-home-slider]');
  const homeSlides = homeSlider ? [...homeSlider.querySelectorAll('.home-slide')] : [];
  if (homeSlides.length) {
    let current = Math.max(0, homeSlides.findIndex((slide) => slide.classList.contains('active')));
    let timer;
    let paused = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderHomeSlide = () => {
      homeSlides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
    };
    const stopHomeSlider = () => clearInterval(timer);
    const startHomeSlider = () => {
      stopHomeSlider();
      if (homeSlides.length < 2 || reducedMotion || paused || document.hidden) return;
      timer = setInterval(() => {
        current = (current + 1) % homeSlides.length;
        renderHomeSlide();
      }, 7000);
    };
    homeSlider.addEventListener('mouseenter', () => {
      paused = true;
      stopHomeSlider();
    });
    homeSlider.addEventListener('mouseleave', () => {
      paused = false;
      startHomeSlider();
    });
    homeSlider.addEventListener('focusin', () => {
      paused = true;
      stopHomeSlider();
    });
    homeSlider.addEventListener('focusout', () => {
      paused = false;
      startHomeSlider();
    });
    document.addEventListener('visibilitychange', startHomeSlider);
    renderHomeSlide();
    startHomeSlider();
  }

  const galleryTabs = [...document.querySelectorAll('[data-gallery-target]')];
  const galleryPanels = [...document.querySelectorAll('.gallery-panel')];
  const showGallery = (target, updateHash = true) => {
    if (!galleryTabs.length || !galleryPanels.length) return;
    const validTarget = galleryPanels.some((panel) => panel.id === target) ? target : galleryPanels[0].id;
    galleryPanels.forEach((panel) => { panel.hidden = panel.id !== validTarget; });
    galleryTabs.forEach((tab) => {
      const active = tab.dataset.galleryTarget === validTarget;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (updateHash) history.replaceState(null, '', `#${validTarget}`);
  };

  if (galleryTabs.length) {
    galleryTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => showGallery(tab.dataset.galleryTarget));
      tab.addEventListener('keydown', (event) => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % galleryTabs.length;
        else if (event.key === 'ArrowLeft') next = (index + galleryTabs.length - 1) % galleryTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = galleryTabs.length - 1;
        else return;
        event.preventDefault();
        showGallery(galleryTabs[next].dataset.galleryTarget);
        galleryTabs[next].focus();
      });
    });
    showGallery(location.hash.slice(1), false);
  }

  const dialog = document.querySelector('#lightbox');
  const dialogImage = document.querySelector('#lightbox-image');
  let opener;
  if (dialog && dialogImage) {
    document.querySelectorAll('.gallery-item').forEach((button) => {
      button.addEventListener('click', () => {
        opener = button;
        const image = button.querySelector('img');
        dialogImage.src = image.currentSrc || image.src;
        dialogImage.alt = image.alt;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    });
    dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      opener?.focus();
    });
  }

  const consultMessage = document.querySelector('#consult-message');
  if (consultMessage) {
    const type = document.querySelector('#consult-type');
    const people = document.querySelector('#consult-people');
    const date = document.querySelector('#consult-date');
    const status = document.querySelector('#copy-status');
    const updateMessage = () => {
      consultMessage.value = [
        '촬영 상담을 요청합니다.',
        `촬영 종류: ${type.value}`,
        `인원: ${people.value ? `${people.value}명` : '상담 후 결정'}`,
        `희망일: ${date.value || '상담 후 결정'}`
      ].join('\n');
    };
    [type, people, date].forEach((field) => field.addEventListener('input', updateMessage));
    document.querySelector('#copy-message')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(consultMessage.value);
        status.textContent = '복사했습니다. 상담 채널에 붙여넣어 주세요.';
      } catch {
        consultMessage.focus();
        consultMessage.select();
        status.textContent = '문구를 선택했습니다. 복사한 뒤 상담 채널에 붙여넣어 주세요.';
      }
    });
    updateMessage();
  }

  const event = document.querySelector('[data-event-start]');
  if (event) {
    const today = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    const start = event.dataset.eventStart;
    const end = event.dataset.eventEnd;
    event.hidden = Boolean((start && today < start) || (end && today > end));
  }
})();
