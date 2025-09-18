// Change Text Size
const textInput = document.getElementById('text-input');
const fontSizeSlider = document.getElementById('font-size');
const storedFontSize = localStorage.getItem('font-size');
const fontSizeText = document.getElementById('font-size-text');

if (storedFontSize) {
  fontSizeSlider.value = storedFontSize;
  updateFontSize();
}

fontSizeSlider.addEventListener('input', function() {
  updateFontSize();
  
  localStorage.setItem('font-size', fontSizeSlider.value);
});

function updateFontSize() {
  const elements = document.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.fontSize = `${fontSizeSlider.value}px`;
    fontSizeText.innerHTML = `${fontSizeSlider.value}px`;
  }
}

window.addEventListener('load', function() {
  updateFontSize();
});

// Themes
document.addEventListener('DOMContentLoaded', function () {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    changeTheme(savedTheme);
    document.getElementById('theme-selector').value = savedTheme;
  }
});

function changeTheme(theme) {
  const root = document.documentElement;
  localStorage.setItem('selectedTheme', theme);

  switch (theme) {
    case 'dark':
      root.style.setProperty('--primaryColor', '#D4C2FC');
      root.style.setProperty('--secondaryColor', '#998FC7');
      root.style.setProperty('--lightColor', '#fff');
      root.style.setProperty('--bgColor-1', '#28262C');
      root.style.setProperty('--bgColor-2', '#0F0E13');
      root.style.setProperty('--loadBG', '#000');
      break;
    
    case 'light':
      root.style.setProperty('--primaryColor', '#D4C2FC');
      root.style.setProperty('--secondaryColor', '#998FC7');
      root.style.setProperty('--lightColor', '#000');
      root.style.setProperty('--bgColor-1', '#eee');
      root.style.setProperty('--bgColor-2', '#fff');
      root.style.setProperty('--loadBG', '#fff');
      break;
    
    case 'black':
        root.style.setProperty('--primaryColor', '#998FC7');
        root.style.setProperty('--secondaryColor', '#D4C2FC');
        root.style.setProperty('--lightColor', '#fff');
        root.style.setProperty('--bgColor-1', '#0F0E13');
        root.style.setProperty('--bgColor-2', '#28262C');
        root.style.setProperty('--loadBG', '#000');
  } 
}