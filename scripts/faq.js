document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');

  const setExpanded = (item, expanded) => {
    const question = item.querySelector('.faq-question');
    item.classList.toggle('active', expanded);
    if (question) question.setAttribute('aria-expanded', String(expanded));
  };

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', String(item.classList.contains('active')));

    const toggle = () => {
      const shouldOpen = !item.classList.contains('active');
      faqItems.forEach(faqItem => setExpanded(faqItem, false));
      if (shouldOpen) setExpanded(item, true);
    };

    question.addEventListener('click', toggle);
    question.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });
});
