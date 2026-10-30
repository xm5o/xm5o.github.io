(() => {
  'use strict';

  function initContactCopy() {
    const button = document.querySelector('[data-copy-discord]');
    const status = document.getElementById('contactCopyStatus');
    if (!button || !status) return;

    const username = String(button.dataset.copyDiscord || 'trr0').trim();

    async function copyText(value) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
      }

      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.top = '0';
      field.style.left = '-9999px';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      field.setSelectionRange(0, field.value.length);

      const copied = document.execCommand('copy');
      field.remove();
      if (!copied) throw new Error('Clipboard copy failed');
    }

    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      status.textContent = '';

      try {
        await copyText(username);
        status.textContent = 'Copied @' + username + ' to your clipboard.';
        button.classList.add('is-copied');
      } catch {
        status.textContent = 'Copy failed. Please select @trr0 manually.';
        button.classList.remove('is-copied');
      } finally {
        button.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactCopy, { once: true });
  } else {
    initContactCopy();
  }
})();