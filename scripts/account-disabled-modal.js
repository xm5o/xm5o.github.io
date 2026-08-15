(function () {
  function buildModal() {
    if (document.getElementById('account-disabled-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'account-disabled-modal';
    modal.className = 'account-disabled-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'account-disabled-title');

    modal.innerHTML = `
      <div class="account-disabled-box">
        <h3 id="account-disabled-title">This account isn't available</h3>
        <p>This account has been disabled by Instagram. try one of the other links instead.</p>
        <button type="button" class="account-disabled-ok">OK</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.account-disabled-ok').addEventListener('click', hideAccountDisabledPopup);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideAccountDisabledPopup();
    });
  }

  function showAccountDisabledPopup() {
    buildModal();
    const modal = document.getElementById('account-disabled-modal');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  function hideAccountDisabledPopup() {
    const modal = document.getElementById('account-disabled-modal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  window.showAccountDisabledPopup = showAccountDisabledPopup;
  window.hideAccountDisabledPopup = hideAccountDisabledPopup;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href*="instagram.com"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showAccountDisabledPopup();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideAccountDisabledPopup();
    });
  });
})();