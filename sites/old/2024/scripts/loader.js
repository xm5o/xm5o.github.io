const fadeOut = () => {
  
  const loaderWrapper =
  document.querySelector('.load-screen');
  loaderWrapper.classList.add('fade');
}
window.addEventListener('load', fadeOut);