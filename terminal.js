(() => {
  const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  const PROMPT = 'visitor@q7xk:~$';

  const FILES = {
    'readme.txt': {
      lines: [
        'hoş geldin, gezgin.',
        "burası q7xk'nin arka odası. ışığı kendin yak.",
        '',
        'kapılar üç tane: birini kitap bilir, birini boşluk, birini makineler.',
        'adlarını ingilizce yazman yeter.',
        'plan.enc şifreli. anahtar, bu yerin adı.',
      ],
    },
    'manifesto.txt': {
      lines: [
        '1. gizlilik varsayılan olmalı.',
        '2. kod açık, niyet açık.',
        '3. kaos hata değil, hammaddedir.',
        '4. hiçbir mesaj yetmiş iki saatten uzun yaşamaz.',
      ],
    },
    'plan.enc': {
      lines: [
        '▒▓░▒▒▓░ ▓▒░▒▓▒░ ▒░▓▓▒░▒ ░▒▓▒░▓',
        '[şifreli]  >  decrypt plan.enc <anahtar>',
      ],
    },
    '.secret': {
      hidden: true,
      lines: [
        'dikkatli birisin. ls -a yazanlar nadirdir.',
        'sır şu: q7xk bir isim değil, bir alışkanlık:',
        'her şeyi biraz daha açık, biraz daha güvenli, biraz daha tuhaf yapmak.',
      ],
    },
  };

  const greet = () => ['merhaba. burada kimse yok; sadece biz.'];

  const COMMANDS = {
    help: () => [
      'komutlar:',
      '  help            bu yardım',
      '  ls [-a]         dosyaları listele',
      '  cat <dosya>     dosya oku',
      '  whoami          kimsin?',
      '  clear           ekranı temizle',
      '  exit            çık (esc de olur)',
      '',
      'bir de listede olmayanlar var. denemeden bilemezsin.',
    ],

    ls: (args) => {
      const all = args.includes('-a');
      const names = Object.keys(FILES).filter((n) => all || !FILES[n].hidden);
      return [names.join('   ')];
    },

    cat: (args) => {
      const name = args[0];
      if (!name) return ['cat: hangi dosya?'];
      const file = FILES[name];
      return file ? file.lines : [`cat: ${name}: böyle bir dosya yok`];
    },

    decrypt: (args) => {
      const [name, key] = args;
      if (name !== 'plan.enc') return ['decrypt: şifreli bir dosya ver. (plan.enc?)'];
      if (!key) return ['decrypt: anahtar yok.'];
      if (key.toLowerCase() !== 'q7xk') return ['yanlış anahtar. makineler bunu not etti.'];
      return {
        delay: 450,
        lines: [
          'anahtar kabul edildi.',
          'plan çözülüyor...',
          '',
          '  1. gizlilik varsayılan olsun.',
          '  2. kod herkese açık olsun.',
          '  3. geri kalanı kaos.',
          '',
          '(evet, makinelerin de bir planı var.)',
        ],
      };
    },

    whoami: () => ['ziyaretçi. çok meraklı bir ziyaretçi.'],
    date: () => [new Date().toLocaleString('tr-TR')],
    echo: (args, rest) => [rest],
    sudo: () => ['sudo: yetkin yok. bu olay raporlanacak.', '(şaka. kimse okumuyor.)'],
    rm: (args, rest) =>
      rest.includes('-rf')
        ? ['güzel deneme. silinecek bir şey yok; boşluk zaten boş.']
        : ['rm: bu dosya sistemi yazılmamış olanı silemez.'],
    hello: greet,
    hi: greet,
    selam: greet,
    merhaba: greet,
    '42': () => ['evrenin, hayatın ve her şeyin cevabı.', 'soru hâlâ belli değil.'],
    konami: () => ['yukarı yukarı aşağı aşağı sol sağ sol sağ. b a yok; burası başka bir yer.'],
    clear: () => ({ clear: true }),
    exit: () => ({ close: true }),
    quit: () => ({ close: true }),

    lore: () => ({ lines: ['kitap açılıyor...'], go: '/lore' }),
    void: () => ({ lines: ['bakma.', '...', 'boşluğa iniyorsun.'], delay: 350, wait: 1400, go: '/void' }),
    robots: () => ({ lines: ['makineler seni bekliyordu.'], go: '/robots' }),
  };

  let root = null;
  let out = null;
  let input = null;
  let isOpen = false;
  let progress = 0;
  const history = [];
  let hIdx = 0;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function line(text, cls) {
    out.append(el('div', cls, text || '\u00a0'));
    out.scrollTop = out.scrollHeight;
  }

  function print(lines, delay = 0) {
    if (!delay) return lines.forEach((t) => line(t));
    lines.forEach((t, i) => setTimeout(() => line(t), i * delay));
  }

  function build() {
    root = el('div', 'tm');
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'gizli terminal');

    const win = el('div', 'tm-win');
    const bar = el('div', 'tm-bar', 'q7xk@void: ~');
    out = el('div', 'tm-out');
    out.setAttribute('aria-live', 'polite');

    const row = el('div', 'tm-row');
    input = el('input', 'tm-in');
    input.type = 'text';
    input.spellcheck = false;
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.setAttribute('aria-label', 'komut');
    row.append(el('span', 'tm-prompt', PROMPT), input);

    win.append(bar, out, row);
    root.append(win);
    document.body.append(root);

    root.addEventListener('mousedown', (e) => {
      if (e.target === root) close();
      else setTimeout(() => input.focus());
    });
    input.addEventListener('keydown', onInputKey);

    line('q7xk terminal v0.7 - kapı açıldı.');
    line("'help' yaz.");
    line('');
  }

  function openTerm() {
    if (!root) build();
    root.hidden = false;
    isOpen = true;
    input.value = '';
    input.focus();
  }

  function close() {
    if (!root) return;
    root.hidden = true;
    isOpen = false;
    if (document.activeElement) document.activeElement.blur();
  }

  function run(raw) {
    const text = raw.trim();
    line(`${PROMPT} ${raw}`, 'tm-cmd');
    if (!text) return;

    history.push(text);
    hIdx = history.length;

    const [cmd, ...args] = text.split(/\s+/);
    const handler = COMMANDS[cmd.toLowerCase()];
    const res = handler ? handler(args, args.join(' ')) : [`komut bulunamadı: ${cmd}. 'help' yaz.`];

    if (Array.isArray(res)) return print(res);
    if (res.clear) { out.textContent = ''; return; }
    if (res.close) return close();

    print(res.lines || [], res.delay || 0);
    if (res.go) {
      const wait = res.wait || ((res.lines || []).length * (res.delay || 0) + 900);
      setTimeout(() => { location.href = res.go; }, wait);
    }
  }

  function onInputKey(e) {
    if (e.key === 'Enter') {
      const value = input.value;
      input.value = '';
      run(value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdx > 0) input.value = history[--hIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < history.length - 1) {
        input.value = history[++hIdx];
      } else {
        hIdx = history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      out.textContent = '';
    }
  }

  addEventListener('keydown', (e) => {
    if (isOpen) {
      if (e.key === 'Escape') close();
      return;
    }
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    if (e.key === SEQ[progress]) progress++;
    else progress = e.key === SEQ[0] ? 1 : 0;

    if (progress === SEQ.length) {
      progress = 0;
      openTerm();
    }
  });
})();
