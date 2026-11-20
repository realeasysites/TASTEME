(() => {
  const menu = window.TASTE_ME_MENU || [];
  const TAG_LABELS = { new: 'New', seasonal: 'Seasonal', fav: 'Fan fave', gf: 'GF option', veg: 'Veggie', spicy: 'Spicy' };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const price = (p) => (typeof p === 'number' ? '$' + (Number.isInteger(p) ? p : p.toFixed(2)) : '$' + p);

  const chips = document.getElementById('menu-chips');
  const root = document.getElementById('menu-root');
  if (!chips || !root) return;

  chips.innerHTML = menu.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');

  root.innerHTML = menu.map((s) => `
    <section class="menu-section" id="${s.id}">
      <div class="menu-section-head">
        <h2>${esc(s.title)}</h2>
        ${s.blurb ? `<p>${esc(s.blurb)}</p>` : ''}
      </div>
      <div class="menu-items">
        ${s.items.map((it) => `
          <article class="menu-item">
            <h3>${esc(it.name)}</h3>
            <span class="price">${price(it.price)}</span>
            ${it.desc ? `<p>${esc(it.desc)}</p>` : ''}
            ${it.tags && it.tags.length ? `<div class="tags">${it.tags.map((t) => `<span class="tag tag-${t}">${TAG_LABELS[t] || t}</span>`).join('')}</div>` : ''}
          </article>`).join('')}
      </div>
    </section>`).join('');

  // Scroll to hash after render (sections didn't exist on first paint)
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => target.scrollIntoView(), 50);
  }

  // Active chip follows scroll
  const links = [...chips.querySelectorAll('a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      const active = chips.querySelector('.active');
      if (active) chips.scrollTo({ left: active.offsetLeft - 20, behavior: 'smooth' });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.menu-section').forEach((s) => io.observe(s));
})();
