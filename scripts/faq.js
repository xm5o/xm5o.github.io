document.addEventListener('DOMContentLoaded', () => {
  const faqItems = [...document.querySelectorAll('.faq-item')];

  const setExpanded = (item, expanded) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    item.classList.toggle('active', expanded);
    if (question) question.setAttribute('aria-expanded', String(expanded));
    if (answer) answer.setAttribute('aria-hidden', String(!expanded));
  };

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    question.setAttribute('aria-controls', answerId);
    question.setAttribute('aria-expanded', String(item.classList.contains('active')));
    answer.setAttribute('aria-hidden', String(!item.classList.contains('active')));

    question.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('active');
      faqItems.forEach(faqItem => setExpanded(faqItem, false));
      if (shouldOpen) setExpanded(item, true);
    });
  });
});
