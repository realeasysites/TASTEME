(() => {
  // Mobile nav
  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
      if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Highlight today's hours
  const today = new Date().getDay();
  document.querySelectorAll('#hours tr').forEach((tr) => {
    if (Number(tr.dataset.day) === today) tr.classList.add('today');
  });

  // Scroll reveal
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // Instagram embeds: load Instagram's script only when the section gets close
  const ig = document.getElementById('social');
  if (ig && document.querySelector('.instagram-media')) {
    const load = () => {
      if (window.instgrm) return window.instgrm.Embeds.process();
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { load(); io2.disconnect(); }
      }, { rootMargin: '400px' });
      io2.observe(ig);
    } else load();
  }

  // Catering / inquiry form
  const form = document.getElementById('inquiry-form');
  if (form) {
    const status = document.getElementById('form-status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      status.className = 'form-status';
      if (!data.name.trim()) { status.textContent = 'Please add your name.'; status.classList.add('err'); return; }
      if (!data.phone.trim() && !data.email.trim()) { status.textContent = 'Please add a phone number or email.'; status.classList.add('err'); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Something went wrong.');
        form.reset();
        status.textContent = 'Got it! We’ll be in touch soon. 🥪';
        status.classList.add('ok');
      } catch (err) {
        status.textContent = err.message + ' You can also call (207) 303-0013.';
        status.classList.add('err');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send My Request';
      }
    });
  }
})();
