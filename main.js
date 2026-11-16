/* ==========================================================
   CALLAHAN PORTFOLYO - main.js
   Doğukan Özkan | Vanilla JS (ES6+)
   Modüller: konsol imzası, nav, reveal, HUD, siber göz,
   kod yağmuru, yazı efekti, terminal, filtre, form doğrulama
   ========================================================== */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     0. ORTAK VERİ (terminal komutları bunu kullanır)
     ---------------------------------------------------------- */
  const DATA = {
    projeler: [
      { ad: 'Görme Engelliler İçin Akıllı Baston (TÜBİTAK 2209-A)', aciklama: 'ESP32, lazer mesafe sensörleri ve Bluetooth ses modülü tabanlı akıllı baston [Geliştirme Aşamasında]' }
    ],
    yetenekler: {
      'Diller': 'C, HTML5, CSS3, JavaScript',
      'Bulut & Sistem': 'Linux (Ubuntu CLI), AWS (EC2, S3)',
      'Araçlar': 'Git & GitHub'
    },
    sertifikalar: [
      '2027 Türkiye Siber Vatan Programı',
      'Türk Dünyası Genç Turizm Elçileri ve Kültürel Diplomasi Akademisi (100 saat)',
      'KOSGEB Geleneksel ve İleri Girişimcilik Eğitimi Sertifikaları'
    ],
    egitim: [
      'OSTİM Teknik Üniversitesi - Bilgisayar Programcılığı (1. Sınıf)',
      'OSTİM Şehit Alper Zor MTAL - Elektrik-Elektronik / Haberleşme Teknolojisi'
    ],
    iletisim: [
      ['LinkedIn', 'linkedin.com/in/doğukan-özkan-a53174336'],
      ['GitHub', 'github.com/CallahanX'],
      ['E-posta', 'dknozkn@gmail.com']
    ]
  };

  /* ----------------------------------------------------------
     1. KONSOL EASTER EGG (F12)
     ---------------------------------------------------------- */
  function consoleSignature() {
    const art = String.raw`
  ____    _    _     _        _    _   _    _    _   _
 / ___|  / \  | |   | |      / \  | | | |  / \  | \ | |
| |     / _ \ | |   | |     / _ \ | |_| | / _ \ |  \| |
| |___ / ___ \| |___| |___ / ___ \|  _  |/ ___ \| |\  |
 \____/_/   \_\_____|_____/_/   \_\_| |_/_/   \_\_| \_|
`;
    console.log('%c' + art, 'color:#FF1E42;font-family:monospace;font-weight:bold;text-shadow:0 0 8px #E60023;');
    console.log('%c> SYSTEM.ONLINE', 'color:#00F0FF;font-family:monospace;font-size:14px;font-weight:bold;');
    console.log('%cDoğukan Özkan (Callahan) %c| Web & Bulut (AWS) Geliştirici Adayı',
      'color:#fff;background:#E60023;padding:3px 8px;font-family:monospace;font-weight:bold;',
      'color:#00F0FF;font-family:monospace;');
    console.log('%cKonsolu açtığına göre kodu merak ediyorsun. Bu iyi bir işaret. 😉\nconst callahan = true;',
      'color:#8b8e9a;font-family:monospace;');
  }

  /* ----------------------------------------------------------
     2. NAVİGASYON, YIL, REVEAL
     ---------------------------------------------------------- */
  function initNav() {
    const toggle = $('#nav-toggle');
    const links = $('#nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? '✕' : '☰';
      });
      links.addEventListener('click', e => {
        if (e.target.closest('a')) {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = '☰';
        }
      });
    }

    // Aktif bölüm vurgusu (ana sayfa içi hash linkleri)
    const anchors = $$('.nav-links a[href^="#"]');
    const targets = anchors.map(a => $(a.getAttribute('href'))).filter(Boolean);
    if (anchors.length && targets.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            anchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(t => io.observe(t));
    }
  }

  function initYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(i => i.classList.add('visible'));
      animateBars(document);
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          animateBars(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(i => io.observe(i));
  }

  // Yetenek çubukları + yüzde sayacı
  function animateBars(root) {
    $$('.bar > i[data-level]', root).forEach(bar => {
      if (bar.dataset.done) return;
      bar.dataset.done = '1';
      const level = Number(bar.dataset.level);
      const pct = bar.closest('.skill')?.querySelector('.pct');
      requestAnimationFrame(() => { bar.style.width = level + '%'; });
      if (!pct) return;
      if (reduceMotion) { pct.textContent = level + '%'; return; }
      const start = performance.now();
      const dur = 1300;
      const tick = now => {
        const t = clamp((now - start) / dur, 0, 1);
        pct.textContent = Math.round(level * (1 - Math.pow(1 - t, 3))) + '%';
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ----------------------------------------------------------
     3. HUD: FARE KOORDİNATLARI
     ---------------------------------------------------------- */
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  function initHUD() {
    const hx = $('#hud-x');
    const hy = $('#hud-y');
    const update = (x, y) => {
      mouse.x = x;
      mouse.y = y;
      if (hx) hx.textContent = String(Math.round(x)).padStart(4, '0');
      if (hy) hy.textContent = String(Math.round(y)).padStart(4, '0');
    };
    window.addEventListener('mousemove', e => update(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      if (t) update(t.clientX, t.clientY);
    }, { passive: true });
    update(mouse.x, mouse.y);
  }

  /* ----------------------------------------------------------
     4. İMLECİ TAKİP EDEN SİBER GÖZ (yay fiziği ile)
     ---------------------------------------------------------- */
  function initEye() {
    const svg = $('#cyber-eye');
    const iris = $('#iris');
    const pupil = $('#pupil');
    if (!svg || !iris) return;

    const MAX_X = 108;   // iris yatay hareket sınırı (SVG birimi)
    const MAX_Y = 44;    // iris dikey hareket sınırı
    const REACH_X = 220; // imleç bu kadar piksel yatay uzaklıkta -> tam yatay sapma
    const REACH_Y = 140; // dikey eksen daha hassas: az mesafede tam sapma
    const PUPIL_EXTRA = 0.1; // göz bebeği iris içinde ek kayma oranı
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const STIFFNESS = 0.14;
    const DAMPING = 0.72;

    function frame() {
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      // Eksenler ayrı ölçeklenir: yukarı/aşağı hareket de net görünür
      const tx = clamp((mouse.x - cx) / REACH_X, -1, 1) * MAX_X;
      const ty = clamp((mouse.y - cy) / REACH_Y, -1, 1) * MAX_Y;

      // Yay-sönüm fiziği: hızlı ama yumuşak takip
      vel.x += (tx - pos.x) * STIFFNESS;
      vel.y += (ty - pos.y) * STIFFNESS;
      vel.x *= DAMPING;
      vel.y *= DAMPING;
      pos.x += vel.x;
      pos.y += vel.y;

      // Elips sınırı içinde tut
      const m = Math.hypot(pos.x / MAX_X, pos.y / MAX_Y);
      if (m > 1) { pos.x /= m; pos.y /= m; }

      iris.setAttribute('transform', `translate(${pos.x.toFixed(2)} ${pos.y.toFixed(2)})`);
      if (pupil) {
        pupil.setAttribute('transform', `translate(${(pos.x * PUPIL_EXTRA).toFixed(2)} ${(pos.y * PUPIL_EXTRA).toFixed(2)})`);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Rastgele göz kırpma
    function scheduleBlink() {
      setTimeout(() => {
        svg.classList.add('blink');
        setTimeout(() => svg.classList.remove('blink'), 140);
        if (Math.random() < 0.25) {
          setTimeout(() => {
            svg.classList.add('blink');
            setTimeout(() => svg.classList.remove('blink'), 140);
          }, 300);
        }
        scheduleBlink();
      }, rand(2200, 5200));
    }
    if (!reduceMotion) scheduleBlink();

    // Tıklayınca göz kırp
    svg.addEventListener('click', () => {
      svg.classList.add('blink');
      setTimeout(() => svg.classList.remove('blink'), 160);
    });
  }

  /* ----------------------------------------------------------
     5. ARKA PLAN KOD YAĞMURU (Canvas)
     ---------------------------------------------------------- */
  function initCodeRain() {
    const canvas = $('#code-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SNIPPETS = [
      '<h1>', '</div>', '#include <stdio.h>', 'aws s3 sync', 'sudo apt update',
      'const callahan = true;', '<html>', '0x00F0FF', '</body>', '<section>',
      'int main(void) {', 'return 0;', 'git commit -m "init"', 'ssh -i key.pem ec2-user',
      'aws ec2 describe-instances', 'chmod 755 deploy.sh', 'npm run build', 'let eye = "open";',
      'display: grid;', 'addEventListener', '<script src="main.js">', 'printf("Merhaba");',
      'IAM::Role', 'git push origin main', 'ls -la /var/www', 'S3://callahan-media',
      '0xE60023', '#!/bin/bash', 'document.querySelector', '<canvas id="rain">'
    ];
    const COLORS = ['#E60023', '#FF1E42', '#00F0FF'];

    let w = 0, h = 0, dpr = 1;
    let drops = [];
    let running = true;

    function newDrop(initial) {
      const size = pick([12, 13, 14, 16]);
      const lines = Math.floor(rand(3, 6));
      return {
        x: rand(0, Math.max(w - 160, 10)),
        y: initial ? rand(-h * 0.2, h) : -lines * size * 1.6 - rand(0, 200),
        speed: rand(0.35, 1.25),
        size,
        color: pick(COLORS),
        lines: Array.from({ length: lines }, () => pick(SNIPPETS))
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = clamp(Math.floor(w / 75), 8, 26);
      drops = Array.from({ length: count }, () => newDrop(true));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const d of drops) {
        const lh = d.size * 1.6;
        ctx.font = `${d.size}px "JetBrains Mono", "Fira Code", monospace`;
        ctx.textBaseline = 'top';
        d.lines.forEach((txt, i) => {
          const isHead = i === d.lines.length - 1;      // en alttaki satır parlak "baş"
          const fade = (i + 1) / d.lines.length;
          ctx.globalAlpha = isHead ? 1 : 0.25 + fade * 0.5;
          ctx.fillStyle = isHead ? '#ffffff' : d.color;
          ctx.shadowColor = d.color;
          ctx.shadowBlur = isHead ? 12 : 4;
          ctx.fillText(txt, d.x, d.y + i * lh);
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        if (!reduceMotion) d.y += d.speed;
        if (d.y > h + 20) Object.assign(d, newDrop(false));
      }
    }

    function loop() {
      if (!running) return;
      draw();
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(loop);
    });

    resize();
    if (reduceMotion) draw(); else requestAnimationFrame(loop);
  }

  /* ----------------------------------------------------------
     6. YAZI MAKİNESİ (Hero)
     ---------------------------------------------------------- */
  function initTyping() {
    const el = $('#typing-text');
    if (!el) return;
    const phrases = [
      'Bilgisayar Programcılığı Öğrencisi',
      'Web & Bulut (AWS) Geliştirici Adayı',
      'ellerimi kodla kirletirim.',
      'const callahan = true;'
    ];
    if (reduceMotion) { el.textContent = phrases[0]; return; }
    let p = 0, c = 0, deleting = false;
    function step() {
      const text = phrases[p];
      el.textContent = text.slice(0, c);
      let delay = deleting ? 28 : 65;
      if (!deleting && c === text.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
      c += deleting ? -1 : 1;
      setTimeout(step, delay);
    }
    step();
  }

  /* ----------------------------------------------------------
     7. MİNİ TERMİNAL
     ---------------------------------------------------------- */
  function initTerminal() {
    const body = $('#term-body');
    const out = $('#term-output');
    const input = $('#term-input');
    if (!body || !out || !input) return;

    const history = [];
    let hIndex = 0;

    function print(text = '', cls = '') {
      const line = document.createElement('div');
      line.className = 'term-line' + (cls ? ' ' + cls : '');
      line.textContent = text;
      out.appendChild(line);
      return line;
    }
    function scrollDown() { body.scrollTop = body.scrollHeight; }

    const commands = {
      help() {
        print('Kullanılabilir komutlar:', 'info');
        [
          ['help', 'bu yardım menüsü'],
          ['projeler', 'projelerimi listeler'],
          ['yetenekler', 'teknik yetenekler'],
          ['sertifikalar', 'program ve sertifikalar'],
          ['egitim', 'eğitim bilgilerim'],
          ['iletisim', 'sosyal medya ve e-posta'],
          ['hakkimda', 'kısa tanıtım'],
          ['whoami', 'kimim ben?'],
          ['tarih', 'sistem tarihi'],
          ['clear', 'ekranı temizler']
        ].forEach(([c, d]) => print('  ' + c.padEnd(14) + '- ' + d));
      },
      projeler() {
        print('Projeler:', 'info');
        DATA.projeler.forEach((p, i) => {
          print(`  [${i + 1}] ${p.ad}`, 'ok');
          print('      ' + p.aciklama, 'dim');
        });
        print('Detaylar için: projeler.html', 'dim');
      },
      yetenekler() {
        print('Teknik Yetenekler:', 'info');
        Object.entries(DATA.yetenekler).forEach(([k, v]) => {
          print('  ' + k.padEnd(16) + ': ' + v);
        });
      },
      sertifikalar() {
        print('Başarılar & Sertifikalar:', 'info');
        DATA.sertifikalar.forEach(s => print('  ✔ ' + s, 'ok'));
      },
      egitim() {
        print('Eğitim:', 'info');
        DATA.egitim.forEach(e => print('  ▸ ' + e, 'ok'));
      },
      iletisim() {
        print('İletişim:', 'info');
        DATA.iletisim.forEach(([k, v]) => print('  ' + k.padEnd(10) + ': ' + v));
      },
      hakkimda() {
        print('Doğukan Özkan (Callahan)', 'info');
        print('Bilgisayar Programcılığı Öğrencisi | Web & Bulut (AWS) Geliştirici Adayı');
        print('OSTİM Teknik Üniversitesi - Bilişim Teknolojileri MYO', 'dim');
      },
      whoami() { print('callahan', 'ok'); },
      tarih() { print(new Date().toLocaleString('tr-TR')); },
      clear() { out.innerHTML = ''; }
    };
    commands['hakkımda'] = commands.hakkimda;
    commands.date = commands.tarih;
    commands['eğitim'] = commands.egitim;
    commands['iletişim'] = commands.iletisim;

    function run(raw) {
      const cmd = raw.trim();
      const line = print('', 'cmd');
      const p = document.createElement('span');
      p.className = 'p';
      p.textContent = 'callahan@portfolio:~$ ';
      line.appendChild(p);
      line.appendChild(document.createTextNode(cmd));
      if (!cmd) return;

      history.push(cmd);
      hIndex = history.length;

      const key = cmd.toLowerCase();
      if (commands[key]) {
        commands[key]();
      } else if (key.startsWith('sudo')) {
        print('callahan zaten sudoers dosyasında... ama bu komuta izin yok. 😎', 'err');
      } else if (key === 'exit') {
        print('Çıkış yok. Buradan sadece daha fazla kod yazmaya geçilir.', 'dim');
      } else {
        print(`komut bulunamadı: ${cmd}`, 'err');
        print("'help' yazarak komutları görebilirsin.", 'dim');
      }
    }

    // Açılış mesajı
    print('Callahan Terminal v1.0 — hoş geldin!', 'info');
    print("Komutlar için 'help' yaz.", 'dim');
    print('');

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        run(input.value);
        input.value = '';
        scrollDown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIndex > 0) { hIndex--; input.value = history[hIndex]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIndex < history.length - 1) { hIndex++; input.value = history[hIndex]; }
        else { hIndex = history.length; input.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const v = input.value.toLowerCase();
        if (!v) return;
        const match = Object.keys(commands).find(c => c.startsWith(v));
        if (match) input.value = match;
      } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
        e.preventDefault();
        commands.clear();
      }
    });

    // Terminal alanına tıklayınca odaklan
    body.addEventListener('click', () => input.focus());

    // Hazır komut butonları
    $$('.term-hints button[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        run(btn.dataset.cmd);
        scrollDown();
      });
    });
  }

  /* ----------------------------------------------------------
     8. PROJE FİLTRELEME
     ---------------------------------------------------------- */
  function initFilters() {
    const buttons = $$('.filter-btn');
    const cards = $$('.project-card');
    const counter = $('#filter-count');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        let visible = 0;
        cards.forEach(card => {
          const cats = card.dataset.category.split(' ');
          const show = f === 'all' || cats.includes(f);
          card.classList.toggle('hidden', !show);
          card.classList.remove('fade-in');
          if (show) {
            visible++;
            void card.offsetWidth; // animasyonu yeniden başlat
            card.classList.add('fade-in');
          }
        });
        if (counter) counter.textContent = visible + ' proje';
      });
    });
  }

  /* ----------------------------------------------------------
     9. İLETİŞİM FORMU - CANLI DOĞRULAMA
     ---------------------------------------------------------- */
  function initForm() {
    const form = $('#contact-form');
    if (!form) return;

    const status = $('#form-status');
    const counter = $('#char-count');
    const fields = {
      name: {
        el: $('#name'),
        check: v => {
          const t = v.trim();
          if (!t) return 'Ad soyad zorunludur.';
          if (t.length < 3) return 'En az 3 karakter girin.';
          if (!/^[A-Za-zÇĞİÖŞÜçğıöşü\s'.-]+$/.test(t)) return 'Sadece harf kullanın.';
          if (t.split(/\s+/).length < 2) return 'Lütfen ad ve soyadı birlikte yazın.';
          return '';
        },
        ok: 'Harika.'
      },
      email: {
        el: $('#email'),
        check: v => {
          const t = v.trim();
          if (!t) return 'E-posta zorunludur.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Geçerli bir e-posta girin (örn. ad@site.com).';
          return '';
        },
        ok: 'E-posta geçerli.'
      },
      subject: {
        el: $('#subject'),
        check: v => (v ? '' : 'Lütfen bir konu seçin.'),
        ok: 'Konu seçildi.'
      },
      message: {
        el: $('#message'),
        check: v => {
          const t = v.trim();
          if (!t) return 'Mesaj boş olamaz.';
          if (t.length < 10) return `En az 10 karakter yazın (${t.length}/10).`;
          return '';
        },
        ok: 'Mesaj hazır.'
      }
    };

    function validate(key, force = false) {
      const f = fields[key];
      const group = f.el.closest('.form-group');
      const msg = $('.field-msg', group);
      if (!force && f.el.value === '' && !f.touched) return true;
      const err = f.check(f.el.value);
      group.classList.toggle('invalid', !!err);
      group.classList.toggle('valid', !err);
      msg.textContent = err || '✔ ' + f.ok;
      return !err;
    }

    Object.keys(fields).forEach(key => {
      const f = fields[key];
      f.touched = false;
      const evt = f.el.tagName === 'SELECT' ? 'change' : 'input';
      f.el.addEventListener(evt, () => {
        f.touched = true;
        validate(key);
        if (key === 'message' && counter) counter.textContent = `${f.el.value.length} / 500`;
      });
      f.el.addEventListener('blur', () => { f.touched = true; validate(key); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      status.className = 'form-status';
      let allValid = true;
      let firstInvalid = null;
      Object.keys(fields).forEach(key => {
        fields[key].touched = true;
        const ok = validate(key, true);
        if (!ok && !firstInvalid) firstInvalid = fields[key].el;
        allValid = allValid && ok;
      });

      if (!allValid) {
        status.textContent = '✖ Lütfen işaretli alanları düzeltin.';
        status.classList.add('show', 'error');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Statik site (GitHub Pages): sunucu yok, gönderim simüle edilir.
      const name = fields.name.el.value.trim().split(/\s+/)[0];
      status.textContent = `✔ Teşekkürler ${name}! Mesajın alındı (demo gönderim).`;
      status.classList.add('show', 'success');
      form.reset();
      Object.values(fields).forEach(f => {
        f.touched = false;
        const g = f.el.closest('.form-group');
        g.classList.remove('valid', 'invalid');
        $('.field-msg', g).textContent = '';
      });
      if (counter) counter.textContent = '0 / 500';
    });
  }

  /* ----------------------------------------------------------
     BAŞLAT
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    consoleSignature();
    initYear();
    initNav();
    initHUD();
    initCodeRain();
    initEye();
    initTyping();
    initTerminal();
    initFilters();
    initForm();
    initReveal();
  });
})();
