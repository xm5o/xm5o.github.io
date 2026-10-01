(() => {
  'use strict';

  const itemsFor = () => {
    const ar = Boolean(window.ImmortalI18n?.isArabic);
    return [
      { label: ar ? 'الرئيسية' : 'Home', hint: ar ? 'بداية الموقع' : 'Back to the top', href: '#home', icon: 'bx-home' },
      { label: ar ? 'المشاريع' : 'Projects', hint: ar ? 'شوف شغلي ومشاريعي' : 'See my work', href: '#projects', icon: 'bx-folder' },
      { label: 'Selina', hint: ar ? 'بوت Discord' : 'Discord bot', href: 'selina/', icon: 'bxl-discord-alt' },
      { label: ar ? 'دراسة مشروع Selina' : 'Selina case study', hint: ar ? 'كيف بنيت المشروع' : 'How the project was built', href: 'projects/selina/', icon: 'bx-book-open' },
      { label: ar ? 'الطلبات' : 'Commissions', hint: ar ? 'تشارت وكود FNF' : 'FNF charting and code', href: 'commission/', icon: 'bx-brush' },
      { label: ar ? 'عني' : 'About', hint: ar ? 'تعرف علي أكثر' : 'More about me', href: '#about', icon: 'bx-user' },
      { label: ar ? 'وش أشتغل عليه الآن' : 'Now', hint: ar ? 'شغلي الحالي' : 'Current work', href: '#now', icon: 'bx-time-five' },
      { label: ar ? 'المهارات' : 'Skills', hint: ar ? 'الأدوات والتقنيات' : 'Tools and technologies', href: '#services', icon: 'bx-code-alt' },
      { label: ar ? 'الموسيقى' : 'Music', hint: ar ? 'الأغاني اللي أسمعها' : 'What I listen to', href: '#music', icon: 'bx-music' },
      { label: ar ? 'تواصل معي' : 'Contact', hint: 'Discord', href: '#contact', icon: 'bx-message-rounded' },
      { label: 'GitHub', hint: '@xm5o', href: 'https://github.com/xm5o', icon: 'bxl-github', external: true }
    ];
  };

  function build() {
    if (document.getElementById('siteCommandPalette')) return;

    const root = document.createElement('div');
    root.id = 'siteCommandPalette';
    root.className = 'command-palette';
    root.hidden = true;
    root.innerHTML = `
      <div class="command-palette-backdrop" data-command-close></div>
      <section class="command-palette-panel" role="dialog" aria-modal="true" aria-labelledby="commandPaletteTitle">
        <div class="command-palette-search">
          <i class="bx bx-search" aria-hidden="true"></i>
          <input id="commandPaletteInput" type="search" autocomplete="off" spellcheck="false">
          <kbd>ESC</kbd>
        </div>
        <p class="command-palette-title" id="commandPaletteTitle"></p>
        <div class="command-palette-results" id="commandPaletteResults" role="listbox"></div>
        <div class="command-palette-footer"><span>↑ ↓</span><span>Enter</span><span>Esc</span></div>
      </section>
    `;

    document.body.appendChild(root);

    const input = root.querySelector('#commandPaletteInput');
    const title = root.querySelector('#commandPaletteTitle');
    const results = root.querySelector('#commandPaletteResults');
    let filtered = [];
    let selected = 0;
    let previousFocus = null;

    const copy = () => {
      const ar = Boolean(window.ImmortalI18n?.isArabic);
      input.placeholder = ar ? 'ابحث في الموقع...' : 'Search the site...';
      input.setAttribute('aria-label', input.placeholder);
      title.textContent = ar ? 'انتقل بسرعة' : 'Quick navigation';
    };

    const render = () => {
      const q = input.value.trim().toLowerCase();
      filtered = itemsFor().filter(item => (item.label + ' ' + item.hint).toLowerCase().includes(q));
      selected = Math.min(selected, Math.max(0, filtered.length - 1));
      results.innerHTML = '';

      if (!filtered.length) {
        const empty = document.createElement('p');
        empty.className = 'command-palette-empty';
        empty.textContent = window.ImmortalI18n?.isArabic ? 'ما لقيت نتيجة.' : 'No matching page.';
        results.appendChild(empty);
        return;
      }

      filtered.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'command-palette-item';
        button.dataset.index = String(index);
        button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', String(index === selected));
        button.innerHTML = `
          <span class="command-palette-icon"><i class="bx ${item.icon}" aria-hidden="true"></i></span>
          <span class="command-palette-copy"><strong></strong><small></small></span>
          <i class="bx bx-right-arrow-alt command-palette-arrow" aria-hidden="true"></i>
        `;
        button.querySelector('strong').textContent = item.label;
        button.querySelector('small').textContent = item.hint;
        button.addEventListener('click', () => activate(index));
        results.appendChild(button);
      });
    };

    const syncSelection = () => {
      results.querySelectorAll('.command-palette-item').forEach((button, index) => {
        button.setAttribute('aria-selected', String(index === selected));
        if (index === selected) button.scrollIntoView({ block: 'nearest' });
      });
    };

    const open = () => {
      previousFocus = document.activeElement;
      copy();
      root.hidden = false;
      document.documentElement.classList.add('command-palette-open');
      input.value = '';
      selected = 0;
      render();
      requestAnimationFrame(() => input.focus());
    };

    const close = () => {
      root.hidden = true;
      document.documentElement.classList.remove('command-palette-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };

    const activate = (index = selected) => {
      const item = filtered[index];
      if (!item) return;
      close();
      if (item.external) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.href;
      }
    };

    input.addEventListener('input', () => { selected = 0; render(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selected = filtered.length ? (selected + 1) % filtered.length : 0;
        syncSelection();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selected = filtered.length ? (selected - 1 + filtered.length) % filtered.length : 0;
        syncSelection();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        activate();
      } else if (event.key === 'Escape') {
        close();
      }
    });

    root.addEventListener('click', event => {
      if (event.target.closest('[data-command-close]')) close();
    });

    document.addEventListener('keydown', event => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        root.hidden ? open() : close();
      } else if (!typing && event.key === '/' && root.hidden) {
        event.preventDefault();
        open();
      } else if (event.key === 'Escape' && !root.hidden) {
        close();
      }
    });

    window.addEventListener('immortal-language-ready', copy);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();