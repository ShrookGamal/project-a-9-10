(function () {
  'use strict';

  var html = document.documentElement;
  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var veil = document.getElementById('veil');
  var links = Array.prototype.slice.call(document.querySelectorAll('.lnk'));
  var up = document.getElementById('fxUp');
  var ticking = false;

  if (!hdr || !burger || !nav || !veil) {
    return;
  }

  function openMenu() {
    nav.classList.add('open');
    veil.classList.add('show');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'إغلاق القائمة');
    html.classList.add('lock');
  }

  function closeMenu() {
    nav.classList.remove('open');
    veil.classList.remove('show');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'فتح القائمة');
    html.classList.remove('lock');
  }

  burger.addEventListener('click', function () {
    if (nav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  veil.addEventListener('click', closeMenu);

  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180) {
      closeMenu();
    }
  });

  function setActive(target) {
    links.forEach(function (link) {
      link.classList.toggle('act', link === target);
    });
  }

  function update() {
    ticking = false;

    hdr.classList.toggle('sc', window.scrollY > 30);

    if (up) {
      up.classList.toggle('show', window.scrollY > 600);
    }

    var y = window.scrollY + window.innerHeight * 0.35;
    var current = links[0];
    var last = links[0];

    links.forEach(function (link) {
      var id = link.getAttribute('href');
      var section = id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      if (section) {
        last = link;
        if (section.offsetTop <= y) {
          current = link;
        }
      }
    });

    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom && window.scrollY > 0) {
      current = last;
    }

    setActive(current);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', update);
  window.addEventListener('resize', onScroll);
  update();
})();

(function () {
  'use strict';

  var wrap = document.getElementById('slides');
  var cnt = document.getElementById('hcCur');
  var tot = document.getElementById('hcTot');
  var bar = document.getElementById('hpBar');
  var prevBtn = document.getElementById('hPrev');
  var nextBtn = document.getElementById('hNext');

  if (!wrap) {
    return;
  }

  var slides = Array.prototype.slice.call(wrap.querySelectorAll('.sl'));
  var total = slides.length;
  var cur = 0;
  var timer = null;
  var DELAY = 6000;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function load(i) {
    var img = slides[i].querySelector('img');
    if (img && !img.getAttribute('src') && img.getAttribute('data-src')) {
      img.setAttribute('src', img.getAttribute('data-src'));
    }
  }

  function runBar() {
    if (!bar) {
      return;
    }
    bar.classList.remove('run');
    void bar.offsetWidth;
    bar.classList.add('run');
  }

  function go(n) {
    var next = (n + total) % total;
    if (next === cur) {
      return;
    }

    load(next);
    load((next + 1) % total);

    var prev = slides[cur];
    prev.classList.remove('on');
    prev.classList.add('out');
    window.setTimeout(function () {
      prev.classList.remove('out');
    }, 1700);

    slides[next].classList.remove('out');
    slides[next].classList.add('on');
    cur = next;

    if (cnt) {
      cnt.textContent = pad(cur + 1);
    }
    runBar();
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      go(cur + 1);
    }, DELAY);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (tot) {
    tot.textContent = pad(total);
  }

  load(1);
  slides.forEach(function (s, i) {
    if (i > 1) {
      window.setTimeout(function () {
        load(i);
      }, 900 + i * 450);
    }
  });

  runBar();
  start();

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      go(cur + 1);
      start();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      go(cur - 1);
      start();
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop();
    } else {
      runBar();
      start();
    }
  });
})();

(function () {
  'use strict';

  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));

  function countUp(el) {
    if (el.getAttribute('data-done')) {
      return;
    }
    el.setAttribute('data-done', '1');

    var target = parseInt(el.getAttribute('data-n'), 10) || 0;
    var start = null;

    function step(ts) {
      if (start === null) {
        start = ts;
      }
      var p = Math.min((ts - start) / 1800, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function reveal(el) {
    el.classList.add('in');
    var counters = el.querySelectorAll('[data-n]');
    Array.prototype.forEach.call(counters, countUp);
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach(reveal);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  items.forEach(function (el) {
    io.observe(el);
  });
})();

(function () {
  'use strict';

  var sliders = Array.prototype.slice.call(document.querySelectorAll('.sm'));

  sliders.forEach(function (box, idx) {
    var slides = Array.prototype.slice.call(box.querySelectorAll('.ms'));
    var dotsWrap = box.querySelector('.sd');
    var cur = 0;
    var dots = [];

    if (slides.length < 2) {
      return;
    }

    if (dotsWrap) {
      slides.forEach(function (s, i) {
        var d = document.createElement('i');
        if (i === 0) {
          d.className = 'on';
        }
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    function show(n) {
      slides[cur].classList.remove('on');
      if (dots[cur]) {
        dots[cur].classList.remove('on');
      }
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('on');
      if (dots[cur]) {
        dots[cur].classList.add('on');
      }
    }

    window.setTimeout(function () {
      window.setInterval(function () {
        if (!document.hidden) {
          show(cur + 1);
        }
      }, 4200);
    }, idx * 700);
  });
})();

(function () {
  'use strict';

  var html = document.documentElement;
  var items = Array.prototype.slice.call(document.querySelectorAll('.gl-i'));
  var lb = document.getElementById('lb');
  var im = document.getElementById('lbImg');
  var cn = document.getElementById('lbCnt');
  var closeBtn = document.getElementById('lbClose');
  var prevBtn = document.getElementById('lbPrev');
  var nextBtn = document.getElementById('lbNext');
  var cur = 0;
  var sx = 0;

  if (!items.length || !lb || !im) {
    return;
  }

  function show(i) {
    cur = (i + items.length) % items.length;
    var img = items[cur].querySelector('img');
    im.classList.remove('sw');
    im.src = img.getAttribute('src');
    im.alt = img.getAttribute('alt') || '';
    if (cn) {
      cn.textContent = (cur + 1) + ' / ' + items.length;
    }
    void im.offsetWidth;
    im.classList.add('sw');
  }

  function open(i) {
    show(i);
    lb.classList.add('show');
    lb.setAttribute('aria-hidden', 'false');
    html.classList.add('lock');
  }

  function close() {
    lb.classList.remove('show');
    lb.setAttribute('aria-hidden', 'true');
    html.classList.remove('lock');
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      open(i);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      show(cur - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      show(cur + 1);
    });
  }

  lb.addEventListener('click', function (e) {
    if (e.target === lb) {
      close();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('show')) {
      return;
    }
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      show(cur + 1);
    } else if (e.key === 'ArrowRight') {
      show(cur - 1);
    }
  });

  lb.addEventListener('touchstart', function (e) {
    sx = e.changedTouches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) {
      show(dx < 0 ? cur + 1 : cur - 1);
    }
  }, { passive: true });
})();

(function () {
  'use strict';

  var steps = document.getElementById('hwSteps');
  var fill = document.getElementById('hwFill');

  if (!steps || !fill) {
    return;
  }

  var nodes = Array.prototype.slice.call(steps.querySelectorAll('.hw-node'));
  var ticking = false;

  function update() {
    ticking = false;

    var rect = steps.getBoundingClientRect();
    var mid = window.innerHeight * 0.55;
    var p = (mid - rect.top) / rect.height;
    p = Math.max(0, Math.min(1, p));

    fill.style.height = (p * 100) + '%';

    nodes.forEach(function (node) {
      var r = node.getBoundingClientRect();
      node.classList.toggle('on', r.top + r.height / 2 < mid);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();
})();

(function () {
  'use strict';

  var list = document.getElementById('fqList');

  if (!list) {
    return;
  }

  var items = Array.prototype.slice.call(list.querySelectorAll('.fq-q'));

  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) {
        return;
      }
      items.forEach(function (other) {
        if (other !== item && other.open) {
          other.open = false;
        }
      });
    });
  });
})();

(function () {
  'use strict';

  var tracks = Array.prototype.slice.call(document.querySelectorAll('.rw-track'));

  tracks.forEach(function (track) {
    var originals = Array.prototype.slice.call(track.children);

    originals.forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
})();

(function () {
  'use strict';

  var canHover = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (!canHover) {
    return;
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.wy-in'));

  cards.forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
    });

    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

(function () {
  'use strict';

  var yr = document.getElementById('ftYear');
  var form = document.getElementById('ctForm');
  var note = document.getElementById('ctNote');

  if (yr) {
    yr.textContent = new Date().getFullYear();
  }

  if (!form || !note) {
    return;
  }

  var nameEl = document.getElementById('ctName');
  var phoneEl = document.getElementById('ctPhone');
  var areaEl = document.getElementById('ctArea');
  var serviceEl = document.getElementById('ctService');
  var msgEl = document.getElementById('ctMsg');

  function mark(el, bad) {
    var box = el.closest('.ct-f');
    if (box) {
      box.classList.toggle('bad', bad);
    }
  }

  function show(text, type) {
    note.textContent = text;
    note.className = 'ct-note ' + type;
  }

  [nameEl, phoneEl].forEach(function (el) {
    el.addEventListener('input', function () {
      mark(el, false);
      note.textContent = '';
      note.className = 'ct-note';
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameEl.value.trim();
    var phone = phoneEl.value.trim();
    var digits = phone.replace(/[^0-9٠-٩]/g, '');
    var okName = name.length >= 2;
    var okPhone = digits.length >= 8;

    mark(nameEl, !okName);
    mark(phoneEl, !okPhone);

    if (!okName) {
      show('من فضلك اكتب اسمك.', 'err');
      nameEl.focus();
      return;
    }

    if (!okPhone) {
      show('من فضلك اكتب رقم جوال صحيح.', 'err');
      phoneEl.focus();
      return;
    }

    var lines = [
      'السلام عليكم ركن الإبداع، أرغب في طلب خدمة.',
      '',
      'الاسم: ' + name,
      'رقم الجوال: ' + phone,
      'الخدمة المطلوبة: ' + serviceEl.value
    ];

    var area = areaEl.value.trim();
    if (area) {
      lines.push('الحي: ' + area);
    }

    var msg = msgEl.value.trim();
    if (msg) {
      lines.push('التفاصيل: ' + msg);
    }

    var url = 'https://wa.me/966502032339?text=' + encodeURIComponent(lines.join('\n'));
    var win = window.open(url, '_blank', 'noopener');

    if (!win) {
      window.location.href = url;
    }

    show('تم تجهيز طلبك، أكمل الإرسال من واتساب. شكراً لتواصلك معنا.', 'ok');
    form.reset();
  });
})();