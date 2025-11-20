const userId = '1282747277206884436';
const CdnBaseUrl = 'https://cdn.discordapp.com/';
const DcdnUrl = `https://dcdn.dstn.to/profile/${userId}`;

const IconPaths = {
  desktop: "M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z",
  web: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z",
  mobile: "M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z",
  embedded: "M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264 21.1990185,7.78625885 L21.8575059,17.0050826 C21.9307825,18.0309548 21.1585512,18.9219909 20.132679,18.9952675 C20.088523,18.9984215 20.0442685,19 20,19 C18.8245863,19 17.8000084,18.2000338 17.5149287,17.059715 L17,15 L7,15 L6.48507125,17.059715 C6.19999155,18.2000338 5.1754137,19 4,19 C2.97151413,19 2.13776159,18.1662475 2.13776159,17.1377616 C2.13776159,17.0934931 2.1393401,17.0492386 2.1424941,17.0050826 L2.80098151,7.78625885 C2.91311838,6.21634264 4.21944161,5 5.79335761,5 Z M14.5,10 C15.3284271,10 16,9.32842712 16,8.5 C16,7.67157288 15.3284271,7 14.5,7 C13.6715729,7 13,7.67157288 13,8.5 C13,9.32842712 13.6715729,10 14.5,10 Z M18.5,13 C19.3284271,13 20,12.3284271 20,11.5 C20,10.6715729 19.3284271,10 18.5,10 C17.6715729,10 17,10.6715729 17,11.5 C17,12.3284271 17.6715729,13 18.5,13 Z M6,9 L4,9 L4,11 L6,11 L6,13 L8,13 L8,11 L10,11 L10,9 L8,9 L8,7 L6,7 L6,9 Z",
};

let progressInterval;
let currentStatus = '';
let socket = null;
let heartbeatInterval = null;
let activityInterval = null;
let activityIntervals = {};
let currentActivity = null;

async function fetchDcdnData() {
  try {
    const response = await fetch(DcdnUrl);
    const data = await response.json();

    if (data.user) {
      updateBanner(data.user);
      updateBadges(data.badges);
    }
  } catch (error) {
    console.error('Failed to fetch DCDN data:', error);
  }
}

function updateBanner(userData) {
  const bannerElement = document.getElementById('profileBanner');
  const bannerGifElement = document.getElementById('profileBannerGif');
  const colorBannerElement = document.getElementById('colorBanner');
  const profileCard = document.querySelector('.discord-profile-card');

  if (!bannerElement || !bannerGifElement || !colorBannerElement) return;

  bannerElement.style.display = 'none';
  bannerGifElement.style.display = 'none';
  colorBannerElement.style.display = 'none';

  let themeColor = null;

  // Helper to normalize color to hex format
  const normalizeColor = (color) => {
    if (typeof color === 'number') {
      return `#${color.toString(16).padStart(6, '0')}`;
    }
    if (typeof color === 'string') {
      return color.startsWith('#') ? color : `#${color}`;
    }
    return null;
  };

  if (userData.banner) {
    if (userData.banner.startsWith('a_')) {
      const gifUrl = `${CdnBaseUrl}banners/${userId}/${userData.banner}.gif?size=480`;
      bannerGifElement.src = gifUrl;
      bannerGifElement.style.display = 'block';
    } else {
      const pngUrl = `${CdnBaseUrl}banners/${userId}/${userData.banner}.png?size=480`;
      bannerElement.src = pngUrl;
      bannerElement.style.display = 'block';
    }
    // Get theme color from banner_color or accent_color even if banner exists
    if (userData.banner_color) {
      themeColor = normalizeColor(userData.banner_color);
    } else if (userData.accent_color) {
      themeColor = normalizeColor(userData.accent_color);
    }
  } else if (userData.banner_color) {
    themeColor = normalizeColor(userData.banner_color);
    colorBannerElement.style.backgroundColor = themeColor;
    colorBannerElement.style.display = 'block';
  } else if (userData.accent_color) {
    themeColor = normalizeColor(userData.accent_color);
    colorBannerElement.style.backgroundColor = themeColor;
    colorBannerElement.style.display = 'block';
  }

  // Apply theme color to profile card elements
  if (themeColor && profileCard) {
    applyThemeColors(themeColor);
  }
}

function applyThemeColors(themeColor) {
  const profileCard = document.querySelector('.discord-profile-card');
  if (!profileCard) return;

  // Normalize theme color to hex format
  let hexColor = themeColor;
  if (!hexColor.startsWith('#')) {
    // If it's already a hex string without #, add it
    if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
      hexColor = '#' + hexColor;
    } else {
      // If it's a number, convert to hex
      hexColor = `#${parseInt(hexColor).toString(16).padStart(6, '0')}`;
    }
  }

  // Convert hex color to RGB for rgba usage
  const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(hexColor);
  if (!rgb) return;

  // Apply theme color to profile card elements
  const style = document.createElement('style');
  style.id = 'discord-theme-colors';
  
  // Remove existing theme style if present
  const existingStyle = document.getElementById('discord-theme-colors');
  if (existingStyle) {
    existingStyle.remove();
  }

  style.textContent = `
    .discord-profile-card:hover {
      border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5) !important;
      box-shadow: 0 20px 50px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) !important;
    }
    .profile-banner-container {
      background: linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)) !important;
    }
    .avatar-container {
      border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important;
    }
    .discord-profile-card {
      --theme-color: ${hexColor};
      --theme-color-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
    }
  `;
  
  document.head.appendChild(style);
}

function updateBadges(badges) {
  const badgesContainer = document.getElementById('badgesContainer');
  if (!badgesContainer) return;
  
  badgesContainer.innerHTML = '';

  if (badges && badges.length > 0) {
    badges.forEach(badge => {
      if (badge.icon) {
        const badgeImg = document.createElement('img');
        badgeImg.className = 'badge-icon';
        badgeImg.src = `${CdnBaseUrl}badge-icons/${badge.icon}.png`;
        badgeImg.alt = badge.description || 'Badge';
        badgeImg.title = badge.description || '';
        badgesContainer.appendChild(badgeImg);
      }
    });
  }
}

function connectWebSocket() {
  try {
    updateConnectionStatus('Connecting to Discord...', 'connecting');
    
    socket = new WebSocket('wss://api.lanyard.rest/socket');

    socket.addEventListener('open', function (event) {
      console.log('WebSocket connected');
      updateConnectionStatus('Connected to Discord', 'online');
      fetchDcdnData();
    });

    socket.addEventListener('message', function (event) {
      const message = JSON.parse(event.data);

      switch (message.op) {
        case 1:
          handleHello(message);
          break;
        case 0:
          handleEvent(message);
          break;
      }
    });

    socket.addEventListener('close', function (event) {
      console.log('WebSocket disconnected');
      updateConnectionStatus('Disconnected from Discord', 'offline');

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      setTimeout(connectWebSocket, 5000);
    });

    socket.addEventListener('error', function (error) {
      console.error('WebSocket error:', error);
      updateConnectionStatus('Connection error', 'offline');
      setTimeout(connectWebSocket, 5000);
    });

  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    updateConnectionStatus('Failed to connect', 'offline');
    setTimeout(connectWebSocket, 5000);
  }
}

function updateConnectionStatus(message, status) {
  const connectionStatusElement = document.getElementById('connectionStatus');
  if (!connectionStatusElement) return;
  
  // Remove all status classes
  connectionStatusElement.classList.remove('online', 'offline', 'connecting');
  
  // Add the new status class
  connectionStatusElement.classList.add(status);
  
  // Update the text content
  const statusText = connectionStatusElement.querySelector('span');
  if (statusText) {
    statusText.textContent = message;
  }
}

function handleHello(message) {
  const heartbeatIntervalTime = message.d.heartbeat_interval;

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ op: 3 }));
    }
  }, heartbeatIntervalTime);

  initializeConnection();
}

function initializeConnection() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: userId
      }
    }));
  }
}

function handleEvent(message) {
    switch (message.t) {
        case 'INIT_STATE':
        case 'PRESENCE_UPDATE':
            const userData = message.d;
            updateProfile(userData);
            updateNameplateBackground(userData);
            updateTagInfo(userData);
            updateCustomStatus(userData.activities);

            if (userData.listening_to_spotify && userData.spotify) {
                updateSpotify(userData.spotify);
            } else {
                const spotifyCard = document.getElementById('spotifyCard');
                if (spotifyCard) {
                    spotifyCard.style.display = 'none';
                    spotifyCard.classList.remove('spotify-active');
                }
            }

            updateActivities(userData.activities);
            break;
    }
}

function updateProfile(userData) {
  const discordUser = userData.discord_user;
  const avatarElement = document.getElementById('avatar');
  const avatarGifElement = document.getElementById('avatarGif');
  const avatarDecorationElement = document.getElementById('avatarDecoration');

  if (!avatarElement || !avatarGifElement) return;

  avatarElement.style.display = 'none';
  avatarGifElement.style.display = 'none';

  if (discordUser.avatar && discordUser.avatar.startsWith('a_')) {
    const gifUrl = `${CdnBaseUrl}avatars/${discordUser.id}/${discordUser.avatar}.gif?size=256`;
    avatarGifElement.src = gifUrl;
    avatarGifElement.style.display = 'block';
  } else if (discordUser.avatar) {
    const pngUrl = `${CdnBaseUrl}avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`;
    avatarElement.src = pngUrl;
    avatarElement.style.display = 'block';
  } else {
    const defaultUrl = `${CdnBaseUrl}embed/avatars/${discordUser.discriminator % 5}.png`;
    avatarElement.src = defaultUrl;
    avatarElement.style.display = 'block';
  }

  if (avatarDecorationElement && discordUser.avatar_decoration_data) {
    avatarDecorationElement.style.display = 'block';
    avatarDecorationElement.src = `${CdnBaseUrl}avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png`;
  } else if (avatarDecorationElement) {
    avatarDecorationElement.style.display = 'none';
    avatarDecorationElement.src = '';
  }

  const displayNameElement = document.getElementById('displayName');
  const usernameElement = document.getElementById('username');
  
  if (displayNameElement) {
    displayNameElement.textContent = discordUser.global_name || discordUser.username;
  }
  
  if (usernameElement) {
    usernameElement.textContent = `@${discordUser.username}`;
  }

  updateStatus(userData.discord_status);
  updateDeviceIcons(userData);
}

function updateNameplateBackground(userData) {
  const nameplateData = userData.discord_user?.collectibles?.nameplate;
  const profileHeader = document.getElementById('profileHeader');
  const nameplateVideo = document.getElementById('nameplateVideo');

  if (nameplateData && nameplateData.asset && nameplateVideo) {
    const videoUrl = `${CdnBaseUrl}assets/collectibles/${nameplateData.asset}asset.webm`;

    nameplateVideo.src = videoUrl;
    nameplateVideo.style.display = 'block';
    if (profileHeader) {
      profileHeader.style.backgroundColor = 'transparent';
      profileHeader.style.backgroundImage = 'none';
    }
  } else {
    if (nameplateVideo) {
      nameplateVideo.src = '';
      nameplateVideo.style.display = 'none';
    }
    if (profileHeader) {
      profileHeader.style.backgroundColor = '#2f3136';
      profileHeader.style.backgroundImage = 'none';
    }
  }
}

function updateTagInfo(userData) {
  const primaryGuild = userData.discord_user?.primary_guild;
  const tagInfoElement = document.getElementById('tagInfo');
  
  if (!tagInfoElement) return;
  
  tagInfoElement.innerHTML = '';

  if (primaryGuild && primaryGuild.tag && primaryGuild.badge && primaryGuild.identity_guild_id) {
    const badgeUrl = `${CdnBaseUrl}clan-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png?size=16`;

    const tagContainer = document.createElement('div');
    tagContainer.className = 'tag-container';

    const tagImage = document.createElement('img');
    tagImage.className = 'tag-icon';
    tagImage.src = badgeUrl;
    tagImage.alt = 'Tag Icon';

    const tagText = document.createElement('span');
    tagText.textContent = primaryGuild.tag;

    tagContainer.appendChild(tagImage);
    tagContainer.appendChild(tagText);

    tagInfoElement.appendChild(tagContainer);
  }
}

function updateStatus(status) {
  currentStatus = status;
  const indicator = document.getElementById('statusIndicator');
  
  if (!indicator) return;
  
  // Remove all status classes first
  indicator.classList.remove('status-online', 'status-dnd', 'status-idle', 'status-offline');

  // Add the appropriate status class
  switch (status) {
    case 'dnd':
      indicator.classList.add('status-dnd');
      break;
    case 'online':
      indicator.classList.add('status-online');
      break;
    case 'idle':
      indicator.classList.add('status-idle');
      break;
    default:
      indicator.classList.add('status-offline');
  }
}

function updateDeviceIcons(userData) {
  const deviceIcons = document.getElementById('deviceIcons');
  
  if (!deviceIcons) return;
  
  deviceIcons.innerHTML = '';

  const devices = [];
  if (userData.active_on_discord_desktop) devices.push('desktop');
  if (userData.active_on_discord_mobile) devices.push('mobile');
  if (userData.active_on_discord_web) devices.push('web');
  if (userData.active_on_discord_embedded) devices.push('embedded');

  devices.forEach(device => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `device-icon ${currentStatus}`);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', IconPaths[device]);
    svg.appendChild(path);

    deviceIcons.appendChild(svg);
  });
}

function updateSpotify(spotifyData) {
    const spotifyCard = document.getElementById('spotifyCard');
    if (!spotifyCard) return;
    
    spotifyCard.style.display = 'block';
    spotifyCard.classList.add('spotify-active');
    
    document.getElementById('albumArt').src = spotifyData.album_art_url;
    document.getElementById('trackName').textContent = spotifyData.song;
    document.getElementById('trackArtist').textContent = `by ${spotifyData.artist}`;
    
    const startTime = spotifyData.timestamps.start;
    const endTime = spotifyData.timestamps.end;
    const duration = endTime - startTime;
    
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    function updateProgress() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        document.getElementById('progressBar').style.width = `${progress}%`;
        
        const currentMinutes = Math.floor(elapsed / 60000);
        const currentSeconds = Math.floor((elapsed % 60000) / 1000);
        const totalMinutes = Math.floor(duration / 60000);
        const totalSeconds = Math.floor((duration % 60000) / 1000);
        
        document.getElementById('currentTime').textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        document.getElementById('totalTime').textContent = 
            `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }
    
    updateProgress();
    progressInterval = setInterval(updateProgress, 100);
    
    const spotifyButtons = document.getElementById('spotifyButtons');
    spotifyButtons.innerHTML = '';
    
    const spotifyButton = document.createElement('a');
    spotifyButton.className = 'activity-button';
    spotifyButton.href = spotifyData.track_id ? `https://open.spotify.com/track/${spotifyData.track_id}` : '#';
    spotifyButton.target = '_blank';
    
    const spotifyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spotifyIcon.setAttribute('class', 'button-icon spotify-button-icon');
    spotifyIcon.setAttribute('viewBox', '0 0 496 512');
    spotifyIcon.setAttribute('fill', 'currentColor');
    
    const spotifyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    spotifyPath.setAttribute('d', 'M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z');
    spotifyIcon.appendChild(spotifyPath);
    
    spotifyButton.appendChild(spotifyIcon);
    spotifyButton.appendChild(document.createTextNode('Play on Spotify'));
    
    spotifyButtons.appendChild(spotifyButton);
}

function hideSpotifyCard() {
  const spotifyCard = document.getElementById('spotifyCard');
  if (spotifyCard) {
    spotifyCard.style.display = 'none';
    spotifyCard.classList.remove('spotify-active');
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function updateCustomStatus(activities) {
  const customStatusElement = document.getElementById('customStatus');
  const separatorElement = document.getElementById('statusSeparator');
  const usernameElement = document.getElementById('username');

  if (!customStatusElement) return;

  customStatusElement.innerHTML = '';

  const customStatus = activities ? activities.find(activity => activity.type === 4) : null;

  let hasStatusContent = false;

  if (customStatus) {
    if (customStatus.emoji) {
      if (customStatus.emoji.id) {
        const extension = customStatus.emoji.animated ? 'gif' : 'png';
        const emojiUrl = `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${extension}`;
        customStatusElement.innerHTML += `<img src="${emojiUrl}" alt="emoji" class="custom-status-emoji">`;
        hasStatusContent = true;
      } else if (customStatus.emoji.name) {
        customStatusElement.innerHTML += `<span>${customStatus.emoji.name}</span>`;
        hasStatusContent = true;
      }
    }

    if (customStatus.state) {
      const textSpan = document.createElement('span');
      textSpan.textContent = customStatus.state;
      textSpan.style.whiteSpace = 'nowrap';
      textSpan.style.overflow = 'hidden';
      textSpan.style.textOverflow = 'ellipsis';
      customStatusElement.appendChild(textSpan);
      hasStatusContent = true;
    }
  }

  const hasUsernameContent = usernameElement && usernameElement.textContent.trim() !== '';

  if (separatorElement) {
    if (hasUsernameContent && hasStatusContent) {
      separatorElement.style.display = 'inline';
    } else {
      separatorElement.style.display = 'none';
    }
  }
}

function updateActivities(activities) {
    const activitiesContainer = document.getElementById('activitiesContainer');
    if (!activitiesContainer) return;
    
    activitiesContainer.innerHTML = '';
    
    const validActivities = activities ? activities.filter(activity => 
        activity.type !== 4 && activity.name !== 'Spotify'
    ) : [];

    validActivities.forEach((activity, index) => {
        const activityCard = document.createElement('div');
        activityCard.className = 'discord-activity-card activity-active';
        activityCard.id = `activityCard-${index}`;
        
        let activityTitleText = '';
        switch (activity.type) {
            case 0:
                activityTitleText = 'Playing';
                break;
            case 1:
                activityTitleText = 'Streaming';
                break;
            case 2:
                activityTitleText = 'Listening to';
                break;
            case 3:
                activityTitleText = 'Watching';
                break;
            case 5:
                activityTitleText = 'Competing in';
                break;
            default:
                activityTitleText = 'Active in';
        }
        
        activityCard.innerHTML = `
            <div class="activity-card-header">
                <div class="activity-icon">
                    <svg class="activity-icon" viewBox="0 0 24 24" fill="#b9bbbe">
                        <path d="M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264 21.1990185,7.78625885 L21.8575059,17.0050826 C21.9307825,18.0309548 21.1585512,18.9219909 20.132679,18.9952675 C20.088523,18.9984215 20.0442685,19 20,19 C18.8245863,19 17.8000084,18.2000338 17.5149287,17.059715 L17,15 L7,15 L6.48507125,17.059715 C6.19999155,18.2000338 5.1754137,19 4,19 C2.97151413,19 2.13776159,18.1662475 2.13776159,17.1377616 C2.13776159,17.0934931 2.1393401,17.0492386 2.1424941,17.0050826 L2.80098151,7.78625885 C2.91311838,6.21634264 4.21944161,5 5.79335761,5 Z M14.5,10 C15.3284271,10 16,9.32842712 16,8.5 C16,7.67157288 15.3284271,7 14.5,7 C13.6715729,7 13,7.67157288 13,8.5 C13,9.32842712 13.6715729,10 14.5,10 Z M18.5,13 C19.3284271,13 20,12.3284271 20,11.5 C20,10.6715729 19.3284271,10 18.5,10 C17.6715729,10 17,10.6715729 17,11.5 C17,12.3284271 17.6715729,13 18.5,13 Z M6,9 L4,9 L4,11 L6,11 L6,13 L8,13 L8,11 L10,11 L10,9 L8,9 L8,7 L6,7 L6,9 Z"/>
                    </svg>
                </div>
                <div class="activity-title">${activityTitleText}</div>
            </div>
            <div class="activity-content">
                <div class="activity-image-container">
                    <img class="activity-large-image" src="" alt="Activity">
                    <img class="activity-small-image" src="" alt="Small Icon" style="display: none;">
                </div>
                <div class="activity-info">
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-details">${activity.details || ''}</div>
                    <div class="activity-state">${activity.state || ''}</div>
                    <div class="activity-time" style="display: none;">
                        <svg class="time-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span class="activity-time-text">0:00:00</span>
                    </div>
                    <div class="activity-progress" style="display: none;">
                        <div class="progress-container">
                            <div class="progress-bar"></div>
                        </div>
                        <div class="time-info">
                            <span class="activity-current-time">0:00</span>
                            <span class="activity-end-time">0:00</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="activity-buttons"></div>
        `;
        
        // Image handling code (same as in readme.js)
        const largeImageElement = activityCard.querySelector('.activity-large-image');
        const smallImageElement = activityCard.querySelector('.activity-small-image');
        
        if (activity.assets && activity.assets.large_image) {
            let largeImageUrl = activity.assets.large_image;
            if (largeImageUrl.startsWith('mp:')) {
                largeImageUrl = `https://media.discordapp.net/${largeImageUrl.replace('mp:', '')}`;
            } else if (largeImageUrl.startsWith('spotify:')) {
                largeImageUrl = `https://i.scdn.co/image/${largeImageUrl.replace('spotify:', '')}`;
            } else if (largeImageUrl.startsWith('external:')) {
                largeImageUrl = largeImageUrl.replace('external:', '');
            } else if (largeImageUrl.startsWith('https%3A%2F%2F')) {
                largeImageUrl = decodeURIComponent(largeImageUrl);
            } else {
                largeImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImageUrl}.png?size=512`;
            }
            largeImageElement.src = largeImageUrl;
        } else if (activity.application_id) {
            largeImageElement.src = `https://dcdn.dstn.to/app-icons/${activity.application_id}.png?size=512`;
        }

        if (activity.assets && activity.assets.small_image) {
            let smallImageUrl = activity.assets.small_image;
            if (smallImageUrl.startsWith('mp:')) {
                smallImageUrl = `https://media.discordapp.net/${smallImageUrl.replace('mp:', '')}`;
            } else if (smallImageUrl.startsWith('spotify:')) {
                smallImageUrl = `https://i.scdn.co/image/${smallImageUrl.replace('spotify:', '')}`;
            } else if (smallImageUrl.startsWith('external:')) {
                smallImageUrl = smallImageUrl.replace('external:', '');
            } else {
                smallImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${smallImageUrl}.png?size=128`;
            }
            smallImageElement.src = smallImageUrl;
            smallImageElement.style.display = 'block';
        }

        // Time and progress handling
        const activityTimeElement = activityCard.querySelector('.activity-time');
        const activityProgressElement = activityCard.querySelector('.activity-progress');
        
        if (activity.timestamps && activity.timestamps.start && activity.timestamps.end) {
            activityTimeElement.style.display = 'none';
            activityProgressElement.style.display = 'block';
            
            const startTime = activity.timestamps.start;
            const endTime = activity.timestamps.end;
            const duration = endTime - startTime;
            
            function updateActivityProgress() {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min((elapsed / duration) * 100, 100);
                
                activityProgressElement.querySelector('.progress-bar').style.width = `${progress}%`;
                
                const currentMinutes = Math.floor(elapsed / 60000);
                const currentSeconds = Math.floor((elapsed % 60000) / 1000);
                const totalMinutes = Math.floor(duration / 60000);
                const totalSeconds = Math.floor((duration % 60000) / 1000);
                
                activityProgressElement.querySelector('.activity-current-time').textContent = 
                    `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
                activityProgressElement.querySelector('.activity-end-time').textContent = 
                    `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
                
                if (progress >= 100) {
                    clearInterval(activityIntervals[activity.id]);
                }
            }
            
            if (activityIntervals[activity.id]) {
                clearInterval(activityIntervals[activity.id]);
            }
            
            updateActivityProgress();
            activityIntervals[activity.id] = setInterval(updateActivityProgress, 100);
            
        } else if (activity.created_at) {
            activityTimeElement.style.display = 'flex';
            activityProgressElement.style.display = 'none';
            
            function updateActivityTime() {
                const startTime = activity.created_at;
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const hours = Math.floor(elapsed / 3600);
                const minutes = Math.floor((elapsed % 3600) / 60);
                const seconds = elapsed % 60;
                
                let timeText = '';
                if (hours > 0) {
                    timeText = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                activityCard.querySelector('.activity-time-text').textContent = timeText;
            }

            updateActivityTime();
            activityIntervals[activity.id] = setInterval(updateActivityTime, 1000);
        }

        // Button handling
        if (activity.buttons && activity.buttons.length > 0) {
            const buttonsContainer = activityCard.querySelector('.activity-buttons');
            
            activity.buttons.forEach(buttonText => {
                const button = document.createElement('a');
                button.className = 'activity-button';
                
                let buttonUrl = '#';
                if (activity.metadata && activity.metadata.button_urls) {
                    const buttonIndex = activity.buttons.indexOf(buttonText);
                    if (activity.metadata.button_urls[buttonIndex]) {
                        buttonUrl = activity.metadata.button_urls[buttonIndex];
                    }
                } else if (activity.details_url && buttonText.toLowerCase().includes('listen') || buttonText.toLowerCase().includes('watch')) {
                    buttonUrl = activity.details_url;
                }
                
                button.href = buttonUrl;
                button.target = '_blank';
                button.textContent = buttonText;
                
                buttonsContainer.appendChild(button);
            });
        }
        
        activitiesContainer.appendChild(activityCard);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const discordSection = document.getElementById('discord-activity');
  if (discordSection) {
    connectWebSocket();
  }
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', connectWebSocket);
} else {
  connectWebSocket();
}