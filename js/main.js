/* =====================================================
   NEXGLOBE - Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');



  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = navToggle.querySelectorAll('span');
      navLinks.classList.contains('open')
        ? (spans[0].style.transform = 'rotate(45deg) translate(5px,5px)', spans[1].style.opacity = '0', spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)')
        : (spans[0].style.transform = '', spans[1].style.opacity = '', spans[2].style.transform = '');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }));
  }

  // ---- Active Nav Link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  // ---- Scroll Reveal ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));

  // ---- Animated Counters ----
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // ---- Hero background slideshow ----
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 4500);
  }

  // ---- Parallax Hero slides ----
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const slides = heroSection.querySelectorAll('.hero-slide');
      slides.forEach(s => { s.style.transform = `translateY(${scrolled * 0.25}px)`; });
    }, { passive: true });
  }

  // ---- Service Cards hover particles ----
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Image lazy load effect ----
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
        imgObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.lazy-img').forEach(img => {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.98)';
    img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    imgObserver.observe(img);
  });

  // ---- Floating particles on hero ----
  const particleContainer = document.getElementById('hero-particles');
  if (particleContainer) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      p.style.cssText = `
        position:absolute;
        width:${Math.random()*4+1}px;
        height:${Math.random()*4+1}px;
        border-radius:50%;
        background:rgba(212,175,55,${Math.random()*0.6+0.2});
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        animation:particle-float ${Math.random()*8+6}s ease-in-out infinite;
        animation-delay:${Math.random()*4}s;
      `;
      particleContainer.appendChild(p);
    }
  }

  // ---- Tab functionality (Trading/Logistics pages) ----
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabGroup = btn.closest('.tabs-container');
      const target = btn.dataset.tab;
      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = tabGroup.querySelector(`[data-panel="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // ---- Contact Form ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = '✓ Inquiry Sent!';
      btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    });
  }

  // ---- Gold line drawing on scroll ----
  const mapLines = document.querySelectorAll('.map-line');
  if (mapLines.length) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.strokeDashoffset = '0';
        }
      });
    }, { threshold: 0.3 });
    mapLines.forEach(l => lineObserver.observe(l));
  }

});

// ---- Add particle animation CSS dynamically ----
const style = document.createElement('style');
style.textContent = `
@keyframes particle-float {
  0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; }
  33%  { transform: translate(${Math.random()*60-30}px, ${Math.random()*60-30}px) scale(1.2); opacity: 1; }
  66%  { transform: translate(${Math.random()*60-30}px, ${Math.random()*60-30}px) scale(0.8); opacity: 0.4; }
}
`;
document.head.appendChild(style);
