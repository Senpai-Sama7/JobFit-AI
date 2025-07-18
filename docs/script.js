// ----------------------------------------------------------------------------
// 1. DOMReady Helpers
// ----------------------------------------------------------------------------
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

// ----------------------------------------------------------------------------
// 2. Off-Canvas Navigation Toggle
// ----------------------------------------------------------------------------
function initOffCanvas() {
  const nav = document.getElementById('navigation');
  // any element with data-off="navigation" toggles it
  document.querySelectorAll('[data-off="navigation"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      nav.classList.toggle('f-navigation--open');
    });
  });
}

// ----------------------------------------------------------------------------
// 3. Initialize AOS (Animate On Scroll)
// ----------------------------------------------------------------------------
function initAOS() {
  if (window.AOS) {
    AOS.init({
      once: true,
      duration: 600,
      easing: 'ease-out-back'
    });
  }
}

// ----------------------------------------------------------------------------
// 4. Initialize Swiper Marquee Carousel
// ----------------------------------------------------------------------------
function initMarquee() {
  if (!window.Swiper) return;
  document.querySelectorAll('.js-carousel--marquee').forEach(container => {
    new Swiper(container, {
      loop: true,
      speed: (parseFloat(container.dataset.speed) || 1) * 1000,
      slidesPerView: 'auto',
      spaceBetween: 24,
      freeMode: true,
      autoplay: { delay: 0, disableOnInteraction: false }
    });
  });
}

// ----------------------------------------------------------------------------
// 5. Depth Hover Parallax Fallback
// ----------------------------------------------------------------------------
function initDepthParallax() {
  document.querySelectorAll('.f-depth').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `translate3d(${x * 8}px, ${y * 8}px, 0)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ----------------------------------------------------------------------------
// 6. Kick It All Off
// ----------------------------------------------------------------------------
ready(() => {
  initOffCanvas();
  initAOS();
  initMarquee();
  initDepthParallax();
});

