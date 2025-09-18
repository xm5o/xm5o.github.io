const skillsData = [
    { name: 'Coding', level: 40 },
    { name: 'Gaming', level: 60 },
];
  
const skillsContainer = document.getElementById('skills-container');
  
skillsData.forEach(skill => {
    const skillDiv = document.createElement('div');
    skillDiv.classList.add('skill');
  
    const skillLabel = document.createElement('label');
    skillLabel.textContent = skill.name;
    skillDiv.appendChild(skillLabel);
  
    const progressBarContainer = document.createElement('div');
    progressBarContainer.classList.add('progress-bar');
  
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress');
    progressBar.style.width = `${skill.level}%`;
  
    progressBarContainer.appendChild(progressBar);
    skillDiv.appendChild(progressBarContainer);
  
    skillsContainer.appendChild(skillDiv);
});