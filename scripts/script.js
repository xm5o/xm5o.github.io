// age calculating

(function () {
  function calculateAge(birthdateStr) {
    const birthDate = new Date(birthdateStr);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) age--;

    return age;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-birthday]').forEach((el) => {
      const birthday = el.getAttribute('data-birthday');
      if (!birthday) return;
      el.textContent = calculateAge(birthday);
    });
  });
})();