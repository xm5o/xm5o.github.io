const discordModal = document.getElementById('discordModal');
const joinCommunityBtn = document.querySelector('.discord-cta');
const closeModal = document.querySelector('.close-modal');

const serverConfig = {
  serverId: "",
  inviteCode: "WBQssXDfKJ",
  name: "Immortal Community",
  description: "",
  icon: "assets/image.jpg",
  banner: "",
  fallbackMembers: 0,
  fallbackOnline: 0
};

async function fetchDiscordServerData() {
  try {
    const widgetResponse = await fetch(`https://discord.com/api/guilds/${serverConfig.serverId}/widget.json`);
    
    if (widgetResponse.ok) {
      const widgetData = await widgetResponse.json();
      return {
        name: widgetData.name || serverConfig.name,
        members: widgetData.presence_count || serverConfig.fallbackMembers,
        online: widgetData.presence_count || serverConfig.fallbackOnline,
        icon: widgetData.instant_invite ? `https://cdn.discordapp.com/icons/${serverConfig.serverId}/${widgetData.instant_invite.guild.icon}.png` : serverConfig.icon
      };
    }
    
    const inviteResponse = await fetch(`https://discord.com/api/v10/invites/${serverConfig.inviteCode}?with_counts=true`);
    
    if (inviteResponse.ok) {
      const inviteData = await inviteResponse.json();
      return {
        name: inviteData.guild.name || serverConfig.name,
        members: inviteData.approximate_member_count || serverConfig.fallbackMembers,
        online: inviteData.approximate_presence_count || serverConfig.fallbackOnline,
        icon: inviteData.guild.icon ? 
          `https://cdn.discordapp.com/icons/${inviteData.guild.id}/${inviteData.guild.icon}.png` : 
          serverConfig.icon,
        banner: inviteData.guild.banner ? 
          `https://cdn.discordapp.com/banners/${inviteData.guild.id}/${inviteData.guild.banner}.png?size=1024` : 
          serverConfig.banner
      };
    }
    
    throw new Error('API requests failed');
    
  } catch (error) {
    console.warn('Failed to fetch Discord data, using fallback:', error);
    return {
      name: serverConfig.name,
      members: serverConfig.fallbackMembers,
      online: serverConfig.fallbackOnline,
      icon: serverConfig.icon,
      banner: serverConfig.banner
    };
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}

async function openDiscordModal() {
  discordModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // loading
  document.getElementById('memberCount').textContent = '...';
  document.getElementById('onlineCount').textContent = '...';
  
  try {
    const serverData = await fetchDiscordServerData();
    
    document.getElementById('serverName').textContent = serverData.name;
    document.getElementById('serverDescription').textContent = serverConfig.description;
    document.getElementById('serverIcon').src = serverData.icon;
    document.getElementById('memberCount').textContent = formatNumber(serverData.members);
    document.getElementById('onlineCount').textContent = formatNumber(serverData.online);
    
    const bannerElement = document.getElementById('serverBanner');
    if (serverData.banner) {
      bannerElement.style.backgroundImage = `url(${serverData.banner})`;
      bannerElement.classList.add('has-banner');
    } else {
      bannerElement.style.backgroundImage = '';
      bannerElement.classList.remove('has-banner');
    }
    
    document.getElementById('joinButton').href = `https://discord.gg/${serverConfig.inviteCode}`;
    
  } catch (error) {
    console.error('Error loading Discord data:', error);
  }
}

function closeDiscordModal() {
  discordModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

joinCommunityBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openDiscordModal();
});

closeModal.addEventListener('click', closeDiscordModal);

window.addEventListener('click', (e) => {
  if (e.target === discordModal) {
    closeDiscordModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && discordModal.classList.contains('active')) {
    closeDiscordModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  fetchDiscordServerData();
});