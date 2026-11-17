/* ==========================================================
   CALLAHAN PORTFOLYO - main.js
   Doğukan Özkan | Vanilla JS (ES6+)
   Modüller: konsol imzası, nav, reveal, HUD, siber göz,
   kod yağmuru, yazı efekti, terminal, filtre, form doğrulama
   ========================================================== */

/* ----------------------------------------------------------
   FIREBASE REALTIME DATABASE (liderlik tablosu: hiz & skorlar)
   Kendi URL'ni tırnak içine yapıştır, sonunda "/" olmasın.
   Örn: "https://proje-adin-default-rtdb.firebaseio.com"
   Boş/yanlış bırakırsan skorlar tarayıcıda (localStorage) tutulur.
   ---------------------------------------------------------- */
const FIREBASE_DB_URL = "https://calllahan-default-rtdb.europe-west1.firebasedatabase.app";


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
    const ps1 = $('.ps1', body || document);
    const inputRow = $('.term-input-row', body || document);
    if (!body || !out || !input || !ps1 || !inputRow) return;

    const PS1_HTML = ps1.innerHTML;
    const history = [];
    let hIndex = 0;
    let mode = 'normal';   // normal | guess | snake | typing | nick | matrix
    let busy = false;      // animasyon / ağ işlemi sürerken komut alma

    /* ---------- Yardımcılar ---------- */
    function print(text = '', cls = '') {
      const line = document.createElement('div');
      line.className = 'term-line' + (cls ? ' ' + cls : '');
      line.textContent = text;
      out.appendChild(line);
      return line;
    }
    const printLines = (lines, cls = '') => lines.forEach(l => print(l, cls));
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function echo(label, text) {
      const line = print('', 'cmd');
      const p = document.createElement('span');
      p.className = 'p';
      p.textContent = label + ' ';
      line.appendChild(p);
      line.appendChild(document.createTextNode(text));
    }
    function setMode(m, label) {
      mode = m;
      if (label) ps1.textContent = label; else ps1.innerHTML = PS1_HTML;
      input.removeAttribute('maxlength');
      input.classList.remove('bad');
      if (m === 'nick') input.maxLength = 12;
    }
    function printSeq(lines, delay, done) {
      busy = true;
      let i = 0;
      const next = () => {
        if (i >= lines.length) { busy = false; if (done) done(); scrollDown(); return; }
        const [txt, cls] = lines[i++];
        print(txt, cls);
        scrollDown();
        setTimeout(next, delay);
      };
      next();
    }
    const isCmdExit = t => ['cikis', 'çıkış', 'q', 'exit'].includes(t.trim().toLowerCase());

    /* ---------- Sanal dosya sistemi ---------- */
    const FILES = {
      'ozgecmis.txt': [
        '=== OZGECMIS ===',
        'Ad          : Doğukan Özkan (Callahan)',
        'Unvan       : Bilgisayar Programcılığı Öğrencisi | Web & Bulut (AWS) Geliştirici Adayı',
        'Üniversite  : OSTİM Teknik Üniversitesi - Bilgisayar Programcılığı (1. Sınıf)',
        'Lise        : OSTİM Şehit Alper Zor MTAL - Elektrik-Elektronik / Haberleşme Teknolojisi',
        'Program     : 2027 Türkiye Siber Vatan Programı',
        'Proje       : Görme Engelliler İçin Akıllı Baston (TÜBİTAK 2209-A)',
        'Felsefe     : Teoride kalma, ellerini kodla kirlet.'
      ],
      'hedefler.log': [
        '[INFO] Hedefler yükleniyor...',
        '[GOAL] Web ve bulut (AWS) geliştirici olmak',
        '[WIP ] Akıllı Baston prototipini ESP32 ile geliştirmek',
        '[TODO] AWS (EC2, S3) üzerinde gerçek projeler yayınlamak',
        '[TODO] 2027 Siber Vatan Programı için hazırlanmak',
        '[INFO] Durum: öğrenmeye ve üretmeye devam ediyor.'
      ],
      'sistem_bilgisi.sh': [
        '#!/bin/bash',
        '# sistem_bilgisi.sh - Callahan sanal sistem raporu',
        'echo "Kullanıcı : callahan"',
        'echo "Diller    : C, HTML5, CSS3, JavaScript"',
        'echo "Bulut     : AWS (EC2, S3)"',
        'echo "Kahve     : kritik seviyede"',
        'echo "Bug       : 0 (henüz bakmadım)"',
        'exit 0'
      ],
      'gizli_not.txt': [
        '*** GİZLİ NOT ***',
        'Tebrikler, gizli dosyayı buldun! 🕵️',
        'Buraya kadar geldiysen merak eden, kurcalayan biri olduğunu biliyorum. İyi geliştiriciler böyle olur.',
        'Ödül: Bir kahve ısmarlama hakkı. LinkedIn veya e-posta ile ulaş, "gizli_not" de, hakkını kullan. ☕',
        'Bonus: F12 ile konsolu da açtın mı? Orada da bir imza bırakmıştım.',
        'P.S. "sudo rm -rf /" yazma. Denedim, yaramadı.'
      ]
    };
    const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

    /* ---------- neofetch ---------- */
    const NF_ART = [
      '       .-""""""""""-.       ',
      '    .-\'   .--------.   \'-.    ',
      '  .\'     /   .--.   \\     \'.  ',
      ' <      |   ( () )   |      > ',
      '  \'.     \\   \'--\'   /     .\'  ',
      '    \'-.   \'--------\'   .-\'    ',
      '       \'-..........-\'       '
    ];
    function artFragment(art) {
      const frag = document.createDocumentFragment();
      art.forEach(line => {
        let buf = '', cur = null;
        const flush = () => {
          if (!buf) return;
          const s = document.createElement('span');
          s.className = cur;
          s.textContent = buf;
          frag.appendChild(s);
          buf = '';
        };
        for (const ch of line) {
          const c = '()O@'.includes(ch) ? 'u' : 'p';
          if (c !== cur) { flush(); cur = c; }
          buf += ch;
        }
        flush();
        frag.appendChild(document.createTextNode('\n'));
      });
      return frag;
    }
    function neofetch() {
      const wrap = document.createElement('div');
      wrap.className = 'term-line neofetch';
      const art = document.createElement('pre');
      art.className = 'nf-art';
      art.appendChild(artFragment(NF_ART));
      const info = document.createElement('div');
      info.className = 'nf-info';
      const title = document.createElement('div');
      title.className = 'nf-title';
      title.textContent = 'callahan@portfolio';
      const sep = document.createElement('div');
      sep.className = 'nf-sep';
      sep.textContent = '------------------';
      info.appendChild(title);
      info.appendChild(sep);
      [
        ['OS', 'CallahanOS v2.0'],
        ['Host', 'OSTİM Teknik BTMYO'],
        ['Kernel', 'C / Linux / AWS'],
        ['Shell', 'callahan-sh'],
        ['Uptime', 'Aktif']
      ].forEach(([k, v]) => {
        const d = document.createElement('div');
        const ks = document.createElement('span');
        ks.className = 'nf-k';
        ks.textContent = k + ': ';
        const vs = document.createElement('span');
        vs.className = 'nf-v';
        vs.textContent = v;
        d.appendChild(ks);
        d.appendChild(vs);
        info.appendChild(d);
      });
      const colors = document.createElement('div');
      colors.className = 'nf-colors';
      ['#E60023', '#FF1E42', '#00F0FF', '#19c37d', '#ffb020', '#ffffff'].forEach(c => {
        const b = document.createElement('span');
        b.style.background = c;
        colors.appendChild(b);
      });
      info.appendChild(colors);
      wrap.appendChild(art);
      wrap.appendChild(info);
      out.appendChild(wrap);
    }

    /* ---------- matrix (5 sn) ---------- */
    function matrix() {
      mode = 'matrix';
      busy = true;
      input.disabled = true;
      inputRow.style.display = 'none';
      const cv = document.createElement('canvas');
      cv.className = 'term-matrix';
      out.appendChild(cv);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(out.clientWidth, 200);
      const cssH = 220;
      cv.width = cssW * dpr;
      cv.height = cssH * dpr;
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      const fs = 14;
      const cols = Math.floor(cssW / fs);
      const drops = Array.from({ length: cols }, () => Math.random() * -20);
      const red = Array.from({ length: cols }, () => Math.random() < 0.25);
      const chars = '01{}<>/;$#=+*ABCDEFx';
      ctx.fillStyle = '#07080b';
      ctx.fillRect(0, 0, cssW, cssH);
      scrollDown();
      const timer = setInterval(() => {
        ctx.fillStyle = 'rgba(7,8,11,.14)';
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.font = fs + 'px "JetBrains Mono", monospace';
        for (let i = 0; i < cols; i++) {
          const x = i * fs;
          const y = drops[i] * fs;
          ctx.fillStyle = red[i] ? '#E60023' : '#00F0FF';
          ctx.fillText(pick(chars), x, y - fs);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(pick(chars), x, y);
          if (y > cssH && Math.random() > 0.96) drops[i] = 0;
          drops[i] += 1;
        }
      }, 55);
      setTimeout(() => {
        clearInterval(timer);
        cv.remove();
        input.disabled = false;
        inputRow.style.display = '';
        busy = false;
        setMode('normal');
        print('[matrix] bağlantı kesildi. Normal moda dönüldü.', 'dim');
        input.focus();
        scrollDown();
      }, 5000);
    }

    /* ---------- hack ---------- */
    function hackAlert() {
      const bar = n => '[' + '#'.repeat(n) + '.'.repeat(10 - n) + ']';
      printSeq([
        ['[!] YETKİSİZ ERİŞİM GİRİŞİMİ TESPİT EDİLDİ!', 'err'],
        ['[!] IP adresiniz loglandı: 127.0.0.1 (kendi kendini hackliyorsun)', 'err'],
        ['[*] Siber Vatan nöbetçisine bildirim gönderiliyor... ' + bar(3), 'dim'],
        ['[*] Siber Vatan nöbetçisine bildirim gönderiliyor... ' + bar(7), 'dim'],
        ['[*] Siber Vatan nöbetçisine bildirim gönderiliyor... ' + bar(10), 'dim'],
        ['[✔] Şaka! 😄 Hiçbir şey silinmedi, ben sadece bir portföy sitesiyim.', 'ok']
      ], 600);
    }

    /* ---------- Müzik çalar ---------- */
    const TRACKS = ['music/track1.mp3', 'music/track2.mp3'];
    let audio = null;
    let current = 0;
    function stopAudio() {
      if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
    }
    function playTrack(i) {
      stopAudio();
      const src = TRACKS[i];
      const a = new Audio(src);
      let failed = false;
      const fail = () => {
        if (failed) return;
        failed = true;
        if (audio === a) audio = null;
        print(`Ses dosyası bulunamadı (${src} kontrol edin)`, 'err');
        scrollDown();
      };
      a.addEventListener('error', fail);
      a.addEventListener('playing', () => { print(`[Çalıyor]: Track ${i + 1}`, 'ok'); scrollDown(); });
      a.addEventListener('ended', () => {
        print(`[Bitti]: Track ${i + 1}`, 'dim');
        playTrack((i + 1) % TRACKS.length);
      });
      audio = a;
      current = i;
      try {
        const pr = a.play();
        if (pr && pr.catch) {
          pr.catch(err => {
            if (err && err.name === 'NotAllowedError') {
              print('Tarayıcı sesi engelledi. Sayfaya bir kez tıklayıp tekrar dene.', 'err');
            } else {
              fail();
            }
          });
        }
      } catch (e) { fail(); }
    }
    function musicList() {
      print('Müzik Çalar:', 'info');
      TRACKS.forEach((t, i) => print(`  [${i + 1}] Track ${i + 1}  (${t})`));
      print('Komutlar: play [1|2] · pause · stop · next · music', 'dim');
    }

    /* ---------- Sayı tahmin oyunu ---------- */
    let secret = 0, tries = 0;
    function startGuess() {
      secret = 1 + Math.floor(Math.random() * 100);
      tries = 0;
      print('Sayı Tahmin Oyunu: 1 ile 100 arasında bir sayı tuttum. Bil bakalım!', 'info');
      print('Çıkmak için: cikis veya q', 'dim');
      setMode('guess', 'tahmin>');
    }
    function handleGuess(v) {
      if (isCmdExit(v)) {
        print(`Oyundan çıkıldı. Tuttuğum sayı ${secret} idi.`, 'dim');
        setMode('normal');
        return;
      }
      const t = v.trim();
      if (!/^\d+$/.test(t) || Number(t) < 1 || Number(t) > 100) {
        print('Lütfen 1 ile 100 arasında bir sayı gir.', 'err');
        return;
      }
      const n = Number(t);
      tries++;
      if (n < secret) print('Daha büyük ▲', 'info');
      else if (n > secret) print('Daha küçük ▼', 'info');
      else {
        print(`Tebrikler! ${tries} denemede bildin!`, 'ok');
        setMode('normal');
      }
    }

    /* ---------- Snake ---------- */
    let snakeBest = 0;
    function startSnake() {
      const W = 26, H = 14;
      let snake, dir, nextDir, food, score, over, timer;
      const info = document.createElement('div');
      info.className = 'term-line info';
      const screen = document.createElement('pre');
      screen.className = 'term-screen';
      const quit = document.createElement('button');
      quit.type = 'button';
      quit.className = 'term-mini-btn';
      quit.textContent = 'Çık (Q)';
      out.appendChild(info);
      out.appendChild(screen);
      out.appendChild(quit);
      mode = 'snake';
      inputRow.style.display = 'none';
      input.blur();

      function placeFood() {
        do {
          food = { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) };
        } while (snake.some(s => s.x === food.x && s.y === food.y));
      }
      function reset() {
        snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
        dir = { x: 1, y: 0 };
        nextDir = dir;
        score = 0;
        over = false;
        placeFood();
        draw();
        loop();
      }
      function draw() {
        const rows = ['<span class="sn-w">' + '#'.repeat(W + 2) + '</span>'];
        for (let y = 0; y < H; y++) {
          let row = '<span class="sn-w">#</span>';
          for (let x = 0; x < W; x++) {
            if (snake[0].x === x && snake[0].y === y) row += '<span class="sn-h">O</span>';
            else if (snake.some(s => s.x === x && s.y === y)) row += '<span class="sn-s">O</span>';
            else if (food.x === x && food.y === y) row += '<span class="sn-f">*</span>';
            else row += ' ';
          }
          rows.push(row + '<span class="sn-w">#</span>');
        }
        rows.push('<span class="sn-w">' + '#'.repeat(W + 2) + '</span>');
        screen.innerHTML = rows.join('\n');
        if (over) {
          info.className = 'term-line err';
          info.textContent = `OYUN BİTTİ!  Skor: ${score}  En yüksek: ${snakeBest}  —  R: yeniden, Q: çık`;
        } else {
          info.className = 'term-line info';
          info.textContent = `SKOR: ${score}   EN YÜKSEK: ${snakeBest}   [WASD / Ok tuşları]  [Q / ESC: çık]`;
        }
        scrollDown();
      }
      function tick() {
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        const eating = head.x === food.x && head.y === food.y;
        const body = eating ? snake : snake.slice(0, -1);
        if (head.x < 0 || head.y < 0 || head.x >= W || head.y >= H || body.some(s => s.x === head.x && s.y === head.y)) {
          over = true;
          snakeBest = Math.max(snakeBest, score);
          draw();
          return;
        }
        snake.unshift(head);
        if (eating) { score++; snakeBest = Math.max(snakeBest, score); placeFood(); } else snake.pop();
        draw();
      }
      function loop() {
        clearTimeout(timer);
        if (over) return;
        tick();
        if (!over) timer = setTimeout(loop, Math.max(60, 140 - score * 4));
      }
      function exit() {
        clearTimeout(timer);
        document.removeEventListener('keydown', onKey, true);
        info.remove(); screen.remove(); quit.remove();
        inputRow.style.display = '';
        setMode('normal');
        print(`Snake kapatıldı. Skor: ${score}  En yüksek: ${snakeBest}`, 'dim');
        input.focus();
        scrollDown();
      }
      function setDir(x, y) {
        if (over) return;
        if (x === -dir.x && y === -dir.y) return;
        nextDir = { x, y };
      }
      const KEYS = {
        arrowup: [0, -1], w: [0, -1],
        arrowdown: [0, 1], s: [0, 1],
        arrowleft: [-1, 0], a: [-1, 0],
        arrowright: [1, 0], d: [1, 0]
      };
      function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (hasOwn(KEYS, k)) { e.preventDefault(); setDir(...KEYS[k]); }
        else if (k === 'q' || k === 'escape') { e.preventDefault(); exit(); }
        else if ((k === 'r' || k === 'enter') && over) { e.preventDefault(); reset(); }
        else if (k === ' ') e.preventDefault();
      }
      document.addEventListener('keydown', onKey, true);
      quit.addEventListener('click', exit);

      // Dokunmatik: kaydırarak yön ver, bitince dokununca yeniden başlat
      let tx = 0, ty = 0;
      screen.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      screen.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { if (over) reset(); return; }
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
      }, { passive: true });

      reset();
    }

    /* ---------- Hız testi & liderlik tablosu ---------- */
    const SENTENCES = [
      'sudo apt update && sudo apt upgrade -y',
      'aws s3 sync ./site s3://callahan-media --delete',
      '#include <stdio.h> int main(void) { printf("Merhaba"); return 0; }',
      'git add . && git commit -m "init" && git push origin main',
      'chmod 755 deploy.sh && ./deploy.sh',
      'for (int i = 0; i < 10; i++) { sum += i; }',
      'ssh -i key.pem ec2-user@127.0.0.1',
      'ls -la /var/www/html | grep index',
      'const callahan = { role: "developer", cloud: "aws" };',
      'document.querySelector("#eye").addEventListener("click", blink);',
      'aws ec2 describe-instances --region eu-central-1',
      'gcc main.c -o main && ./main'
    ];
    const MAX_WPM = 220;
    const MIN_ACCURACY = 90;
    let target = '', startTime = 0, lastLen = 0, pending = null;

    function lev(a, b) {
      const m = a.length, n = b.length;
      let prev = Array.from({ length: n + 1 }, (_, j) => j);
      for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) {
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        prev = cur;
      }
      return prev[n];
    }
    function startTyping() {
      target = pick(SENTENCES);
      startTime = 0;
      lastLen = 0;
      print('HIZ TESTİ: Aşağıdaki metni olabildiğince hızlı ve doğru yaz, bitince Enter\'a bas.', 'info');
      print('İlk tuşa bastığında süre başlar. Yapıştırma engelli. Çıkmak için: cikis', 'dim');
      print(target, 'typing-target');
      setMode('typing', 'yaz>');
    }
    function abortTyping(msg) {
      input.value = '';
      print(msg, 'err');
      setMode('normal');
    }
    function finishTyping(v) {
      if (isCmdExit(v)) { print('Hız testi iptal edildi.', 'dim'); setMode('normal'); return; }
      if (!startTime || !v.length) { print('Önce yazmaya başla :)', 'err'); return; }
      const elapsed = (performance.now() - startTime) / 1000;
      const dist = lev(v, target);
      const acc = Math.max(0, Math.round((1 - dist / Math.max(target.length, v.length)) * 100));
      const correct = Math.max(0, Math.max(target.length, v.length) - dist);
      const wpm = Math.round((correct / 5) / (elapsed / 60));
      echo('yaz>', v);
      setMode('normal');
      if (elapsed < 0.8 || wpm > MAX_WPM) {
        print(`⚠ Sonuç reddedildi: ${wpm} WPM insanüstü bir hız (limit ${MAX_WPM}). Hile koruması devrede.`, 'err');
        return;
      }
      print(`Süre: ${elapsed.toFixed(1)} sn  |  WPM: ${wpm}  |  Doğruluk: %${acc}`, 'ok');
      if (acc < MIN_ACCURACY) {
        print(`Doğruluk %${MIN_ACCURACY} altında, skor kaydedilmez. Tekrar dene: hiz`, 'dim');
        return;
      }
      pending = { wpm, acc };
      print('Skor tablosuna girmek için takma ad yaz (maks 12 karakter, boş bırakırsan kayıt atlanır):', 'info');
      setMode('nick', 'takma ad>');
    }
    function handleNick(v) {
      const nick = v.trim();
      if (!nick) {
        print('Kayıt atlandı.', 'dim');
        pending = null;
        setMode('normal');
        return;
      }
      if (!/^[\p{L}\p{N}_.-]{1,12}$/u.test(nick)) {
        print('Takma ad sadece harf, rakam, _ . - içerebilir (1-12 karakter).', 'err');
        return;
      }
      const entry = { nick, wpm: pending.wpm, acc: pending.acc, date: Date.now() };
      pending = null;
      setMode('normal');
      saveScore(entry);
    }

    const LS_KEY = 'callahan_scores';
    const cloudOn = () => typeof FIREBASE_DB_URL === 'string' && /^https:\/\//.test(FIREBASE_DB_URL);
    const dbBase = () => FIREBASE_DB_URL.replace(/\/+$/, '');
    const validScore = s => s && typeof s.nick === 'string' && typeof s.wpm === 'number';
    function readLocal() {
      try { const a = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); return Array.isArray(a) ? a.filter(validScore) : []; }
      catch (e) { return []; }
    }
    function writeLocal(entry) {
      try {
        const a = readLocal();
        a.push(entry);
        localStorage.setItem(LS_KEY, JSON.stringify(a));
        return true;
      } catch (e) { return false; }
    }
    async function fetchJSON(url, opts) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
      } finally { clearTimeout(t); }
    }
    async function saveScore(entry) {
      busy = true;
      print('Skor kaydediliyor...', 'dim');
      let where = 'yerel yedek';
      let warn = '';
      if (cloudOn()) {
        try {
          await fetchJSON(dbBase() + '/scores.json', { method: 'POST', body: JSON.stringify(entry) });
          where = 'bulut (Firebase)';
        } catch (e) {
          warn = 'Buluta ulaşılamadı, skor yerel yedeğe yazıldı.';
          writeLocal(entry);
        }
      } else {
        writeLocal(entry);
      }
      print(`✔ Skor kaydedildi [${where}]: ${entry.nick} - ${entry.wpm} WPM`, 'ok');
      if (warn) print(warn, 'err');
      print("Sıralamayı görmek için: skorlar", 'dim');
      busy = false;
      scrollDown();
    }
    async function showScores() {
      busy = true;
      print('Skorlar getiriliyor...', 'dim');
      let list = [];
      let source = 'yerel yedek (FIREBASE_DB_URL boş)';
      if (cloudOn()) {
        try {
          let data;
          try { data = await fetchJSON(dbBase() + '/scores.json?orderBy=%22wpm%22&limitToLast=10'); }
          catch (e) { data = await fetchJSON(dbBase() + '/scores.json'); }
          list = Object.values(data || {}).filter(validScore);
          source = 'bulut (Firebase)';
        } catch (e) {
          list = readLocal();
          source = 'yerel yedek (buluta ulaşılamadı)';
        }
      } else {
        list = readLocal();
      }
      list.sort((a, b) => b.wpm - a.wpm || (a.date || 0) - (b.date || 0));
      list = list.slice(0, 10);
      if (!list.length) {
        print('Henüz skor yok. İlk sen ol: hiz', 'dim');
      } else {
        print('LİDERLİK TABLOSU - İlk 10 (WPM)', 'info');
        print('Sıra | Kullanıcı     | WPM  | Tarih', 'info');
        print('-----+---------------+------+-----------');
        list.forEach((s, i) => {
          const d = s.date ? new Date(s.date).toLocaleDateString('tr-TR') : '-';
          print(`${String(i + 1).padEnd(4)} | ${String(s.nick).slice(0, 12).padEnd(13)} | ${String(Math.round(s.wpm)).padEnd(4)} | ${d}`, i === 0 ? 'ok' : '');
        });
        print('Kaynak: ' + source, 'dim');
      }
      busy = false;
      scrollDown();
    }

    /* ---------- Komutlar ---------- */
    const commands = {
      help() {
        print('╔═ BİLGİ ═══════════════════════════════', 'info');
        [
          ['help', 'bu yardım menüsü'],
          ['hakkimda', 'kısa tanıtım'],
          ['projeler', 'projelerimi listeler'],
          ['yetenekler', 'teknik yetenekler'],
          ['sertifikalar', 'program ve sertifikalar'],
          ['egitim', 'eğitim bilgilerim'],
          ['iletisim', 'sosyal medya ve e-posta'],
          ['whoami / tarih', 'kullanıcı / sistem tarihi']
        ].forEach(([c, d]) => print('  ' + c.padEnd(16) + '- ' + d));
        print('╠═ SİSTEM ══════════════════════════════', 'info');
        [
          ['ls', 'sanal dosyaları listeler'],
          ['cat <dosya>', 'dosya içeriğini okur'],
          ['neofetch', 'sistem bilgisi'],
          ['matrix', '5 sn kod yağmuru'],
          ['hack', 'sakın deneme 😈'],
          ['clear', 'ekranı temizler']
        ].forEach(([c, d]) => print('  ' + c.padEnd(16) + '- ' + d));
        print('╠═ MÜZİK ═══════════════════════════════', 'info');
        [
          ['music / liste', 'parça listesi'],
          ['play [1|2]', 'parçayı çal'],
          ['pause / stop', 'duraklat / durdur'],
          ['next', 'diğer parçaya geç']
        ].forEach(([c, d]) => print('  ' + c.padEnd(16) + '- ' + d));
        print('╠═ OYUNLAR & SIRALAMA ══════════════════', 'info');
        [
          ['sayi', 'sayı tahmin oyunu'],
          ['snake', 'yılan oyunu (WASD / ok tuşları)'],
          ['hiz', 'yazma hızı testi (WPM)'],
          ['skorlar', 'ilk 10 liderlik tablosu']
        ].forEach(([c, d]) => print('  ' + c.padEnd(16) + '- ' + d));
        print('╚═══════════════════════════════════════', 'info');
        print('İpucu: ↑ / ↓ ile önceki komutlar, Tab ile tamamlama.', 'dim');
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
      clear() { out.innerHTML = ''; },
      pwd() { print('/home/callahan'); },

      ls(args) {
        const names = Object.keys(FILES);
        if (args.some(a => /^-\w*l/.test(a))) {
          names.forEach(n => {
            const size = FILES[n].join('\n').length;
            print(`-rw-r--r-- 1 callahan callahan ${String(size).padStart(5)} ${n}`, n.endsWith('.sh') ? 'info' : 'ok');
          });
        } else {
          print(names.join('   '), 'ok');
        }
      },
      cat(args) {
        if (!args.length) { print('cat: dosya adı eksik. Kullanım: cat <dosya_adi>', 'err'); return; }
        const name = args[0].replace(/^\.\//, '');
        if (hasOwn(FILES, name)) printLines(FILES[name]);
        else print(`cat: ${args[0]}: Dosya bulunamadı`, 'err');
      },
      neofetch() { neofetch(); },
      matrix() { matrix(); },
      hack() { hackAlert(); },

      music() { musicList(); },
      liste() { musicList(); },
      play(args) {
        if (!args.length) {
          if (audio && audio.paused) { audio.play().catch(() => {}); return; }
          playTrack(0);
          return;
        }
        const n = Number(args[0]);
        if (n !== 1 && n !== 2) { print('Geçersiz parça. Kullanım: play 1 veya play 2', 'err'); return; }
        playTrack(n - 1);
      },
      pause() {
        if (audio && !audio.paused) { audio.pause(); print(`[Duraklatıldı]: Track ${current + 1}`, 'info'); }
        else print('Şu an çalan bir müzik yok.', 'dim');
      },
      stop() {
        if (audio) { stopAudio(); print('[Durduruldu]', 'info'); }
        else print('Şu an çalan bir müzik yok.', 'dim');
      },
      next() { playTrack((current + 1) % TRACKS.length); },

      sayi() { startGuess(); },
      snake() { startSnake(); },
      hiz() { startTyping(); },
      skorlar() { showScores(); }
    };
    commands['hakkımda'] = commands.hakkimda;
    commands.date = commands.tarih;
    commands['eğitim'] = commands.egitim;
    commands['iletişim'] = commands.iletisim;
    commands.sayı = commands.sayi;
    commands.hız = commands.hiz;

    function run(raw) {
      const cmd = raw.trim();
      echo('callahan@portfolio:~$', cmd);
      if (!cmd) return;

      history.push(cmd);
      hIndex = history.length;

      const norm = cmd.toLowerCase().replace(/\s+/g, ' ');
      const parts = norm.split(' ');
      const key = parts[0];
      const args = cmd.split(/\s+/).slice(1);

      if (/^(sudo )?rm -(rf|fr) \/\*?( --no-preserve-root)?$/.test(norm)) { hackAlert(); return; }
      if (hasOwn(commands, key)) {
        commands[key](args);
      } else if (key === 'sudo') {
        print('callahan zaten sudoers dosyasında... ama bu komuta izin yok. 😎', 'err');
      } else if (key === 'exit') {
        print('Çıkış yok. Buradan sadece daha fazla kod yazmaya geçilir.', 'dim');
      } else {
        print(`komut bulunamadı: ${cmd}`, 'err');
        print("'help' yazarak komutları görebilirsin.", 'dim');
      }
    }

    function dispatch(v) {
      if (mode === 'normal') { run(v); return; }
      if (mode === 'guess') { echo('tahmin>', v); handleGuess(v); return; }
      if (mode === 'typing') { finishTyping(v); return; }
      if (mode === 'nick') { echo('takma ad>', v); handleNick(v); }
    }

    // Açılış mesajı
    print('Callahan Terminal v2.0 — hoş geldin!', 'info');
    print("Komutlar için 'help' yaz. Yeni: neofetch, snake, hiz, music...", 'dim');
    print('');

    input.addEventListener('keydown', e => {
      if (mode === 'snake' || mode === 'matrix') return;
      if (e.key === 'Enter') {
        if (busy) return;
        if (mode === 'typing' && e.isTrusted === false) { abortTyping('⚠ Otomatik giriş algılandı, test iptal.'); return; }
        const v = input.value;
        input.value = '';
        dispatch(v);
        scrollDown();
      } else if (mode === 'normal') {
        if (e.key === 'ArrowUp') {
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
      }
    });

    // Hız testi: hile koruması + canlı hata vurgusu
    input.addEventListener('paste', e => {
      if (mode === 'typing') { e.preventDefault(); abortTyping('⚠ Yapıştırma girişimi algılandı, test iptal edildi.'); }
    });
    input.addEventListener('drop', e => {
      if (mode === 'typing') { e.preventDefault(); abortTyping('⚠ Sürükle-bırak algılandı, test iptal edildi.'); }
    });
    input.addEventListener('input', e => {
      if (mode !== 'typing') return;
      if (e.isTrusted === false || e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop' || input.value.length - lastLen > 3) {
        abortTyping('⚠ Toplu giriş algılandı (yapıştırma?), test iptal edildi.');
        return;
      }
      lastLen = input.value.length;
      if (!input.value.length) startTime = 0;
      else if (!startTime) startTime = performance.now();
      input.classList.toggle('bad', !target.startsWith(input.value));
    });

    // Terminal alanına tıklayınca odaklan
    body.addEventListener('click', () => {
      if (mode === 'snake' || mode === 'matrix') return;
      input.focus();
    });

    // Hazır komut butonları
    $$('.term-hints button[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (mode !== 'normal' || busy) return;
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
