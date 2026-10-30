(() => {
  const $ = (s) => document.querySelector(s);
  const ua = navigator.userAgent;
  const os = /Windows/.test(ua) ? 'windows' : /Macintosh/.test(ua) ? 'mac' : /Linux|X11/.test(ua) && !/Android/.test(ua) ? 'linux' : null;
  const mb = (n) => Math.round(n / 1048576) + ' MB';
  if (os) $(`.dl [data-os="${os}"]`)?.classList.add('mine');

  // version, direct download links and sizes from the latest release
  fetch('https://api.github.com/repos/RX-7-GTC/inca/releases/latest')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((rel) => {
      const assets = rel.assets || [];
      const find = (end) => assets.find((a) => a.name.endsWith(end));
      $('#dl-version').textContent = rel.tag_name;
      for (const a of document.querySelectorAll('[data-asset]')) {
        const f = find(a.dataset.asset); if (!f) continue;
        a.href = f.browser_download_url; a.querySelector('.size').textContent = mb(f.size);
      }
      $('#bar-meta').innerHTML = `<b>Free</b> · ${rel.tag_name} · MIT license`;
      // browsers can't reliably tell Apple Silicon from Intel, so Mac visitors pick in the download section
      const mine = { windows: 'portable.exe', linux: '.AppImage', mac: 'mac-arm64.dmg' }[os];
      if (mine && find(mine)) {
        if (os !== 'mac') $('#hero-dl').href = find(mine).browser_download_url;
        $('#hero-dl').textContent = 'Download for ' + { windows: 'Windows', linux: 'Linux', mac: 'Mac' }[os];
      }
    })
    .catch(() => {});

  // click a screenshot to view it full size
  const lb = $('#lightbox'), img = $('#lb-img');
  for (const a of document.querySelectorAll('.zoom')) {
    a.addEventListener('click', (e) => { e.preventDefault(); img.src = a.href; img.alt = a.dataset.cap || ''; lb.hidden = false; });
  }
  lb.addEventListener('click', () => { lb.hidden = true; });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });
})();
