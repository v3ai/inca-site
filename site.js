(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // mobile menu
  const btn = $('#menu-btn'), links = $('#links');
  btn.addEventListener('click', () => { const open = links.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
  $$('#links a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); btn.setAttribute('aria-expanded', false); }));

  // highlight the visitor's OS
  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua) ? 'windows' : /Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'mac' : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? 'linux' : null;
  const osName = { windows: 'Windows', linux: 'Linux', mac: 'macOS' }[os];
  if (os) {
    const card = $(`.dl-card[data-os="${os}"]`); if (card) card.classList.add('mine');
    if (os !== 'mac') $('#hero-dl-text').textContent = 'Download for ' + osName;
  }

  // fill in the latest release's version and direct download links
  const fmt = n => n > 1048576 ? Math.round(n / 1048576) + ' MB' : Math.round(n / 1024) + ' KB';
  fetch('https://api.github.com/repos/v3ai/inca/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(rel => {
      const v = rel.tag_name || '';
      const date = rel.published_at ? new Date(rel.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      $('#release-text').textContent = `Inca ${v} is out${date ? ' · ' + date : ''}`;
      $('#release-pill').href = rel.html_url;
      $('#dl-version').textContent = v;
      for (const a of $$('[data-asset]')) {
        const asset = (rel.assets || []).find(x => x.name.endsWith(a.dataset.asset));
        if (!asset) continue;
        a.href = asset.browser_download_url;
        const s = document.createElement('span'); s.className = 'size'; s.textContent = fmt(asset.size); a.append(' ', s);
      }
      const primary = { windows: 'portable.exe', linux: '.AppImage' }[os];
      const asset = primary && (rel.assets || []).find(x => x.name.endsWith(primary));
      if (asset) { $('#hero-dl').href = asset.browser_download_url; $('#hero-fine').textContent = `${v} for ${osName} · ${fmt(asset.size)} · MIT license · No account needed`; }
    })
    .catch(() => {});

  // lightbox
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  let last = null;
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
  $$('.zoom').forEach(z => z.addEventListener('click', () => {
    last = z; lbImg.src = z.dataset.src; lbImg.alt = z.dataset.cap || ''; lbCap.textContent = z.dataset.cap || '';
    lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close').focus();
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });

  // fade sections in as they scroll into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.feature, .card, .gallery > *, .dl-card, .keys div, .comm').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
