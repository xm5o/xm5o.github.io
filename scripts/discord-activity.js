const userId = '1017838899499905074';
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

  if (!bannerElement || !bannerGifElement || !colorBannerElement) return;

  bannerElement.style.display = 'none';
  bannerGifElement.style.display = 'none';
  colorBannerElement.style.display = 'none';

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
  } else if (userData.banner_color) {
    colorBannerElement.style.backgroundColor = userData.banner_color;
    colorBannerElement.style.display = 'block';
  } else if (userData.accent_color) {
    const color = `#${userData.accent_color.toString(16).padStart(6, '0')}`;
    colorBannerElement.style.backgroundColor = color;
    colorBannerElement.style.display = 'block';
  }
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
        hideSpotifyCard();
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

  const albumArtElement = document.getElementById('albumArt');
  const trackNameElement = document.getElementById('trackName');
  const trackArtistElement = document.getElementById('trackArtist');
  
  if (albumArtElement) albumArtElement.src = spotifyData.album_art_url;
  if (trackNameElement) trackNameElement.textContent = spotifyData.song;
  if (trackArtistElement) trackArtistElement.textContent = `by ${spotifyData.artist}`;

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

    const progressBar = document.getElementById('progressBar');
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');
    
    if (progressBar) progressBar.style.width = `${progress}%`;

    const currentMinutes = Math.floor(elapsed / 60000);
    const currentSeconds = Math.floor((elapsed % 60000) / 1000);
    const totalMinutes = Math.floor(duration / 60000);
    const totalSeconds = Math.floor((duration % 60000) / 1000);

    if (currentTimeElement) {
      currentTimeElement.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }
    
    if (totalTimeElement) {
      totalTimeElement.textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }

    if (progress >= 100) {
      clearInterval(progressInterval);
    }
  }

  updateProgress();
  progressInterval = setInterval(updateProgress, 100);
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
  const activityCard = document.getElementById('activityCard');
  
  if (!activityCard) return;

  const validActivities = activities ? activities.filter(activity =>
    activity.type !== 4 && activity.name !== 'Spotify'
  ) : [];

  if (validActivities.length > 0) {
    const activity = validActivities[0];
    currentActivity = activity;
    activityCard.style.display = 'block';
    activityCard.classList.add('activity-active');

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

    const activityTitleElement = document.getElementById('activityTitle');
    const activityNameElement = document.getElementById('activityName');
    const activityDetailsElement = document.getElementById('activityDetails');
    const activityStateElement = document.getElementById('activityState');
    
    if (activityTitleElement) activityTitleElement.textContent = activityTitleText;
    if (activityNameElement) activityNameElement.textContent = activity.name;

    if (activityDetailsElement) {
      if (activity.details) {
        activityDetailsElement.textContent = activity.details;
        activityDetailsElement.style.display = 'block';
      } else {
        activityDetailsElement.textContent = '';
        activityDetailsElement.style.display = 'none';
      }
    }

    if (activityStateElement) {
      if (activity.state) {
        activityStateElement.textContent = activity.state;
        activityStateElement.style.display = 'block';
      } else {
        activityStateElement.textContent = '';
        activityStateElement.style.display = 'none';
      }
    }

    const largeImageElement = document.getElementById('activityLargeImage');
    const smallImageElement = document.getElementById('activitySmallImage');

    if (largeImageElement) {
      if (activity.assets && activity.assets.large_image) {
        let largeImageUrl = activity.assets.large_image;
        if (largeImageUrl.startsWith('mp:')) {
          largeImageUrl = `https://media.discordapp.net/${largeImageUrl.replace('mp:', '')}`;
        } else if (largeImageUrl.startsWith('spotify:')) {
          largeImageUrl = `https://i.scdn.co/image/${largeImageUrl.replace('spotify:', '')}`;
        } else if (largeImageUrl.startsWith('external:')) {
          largeImageUrl = largeImageUrl.replace('external:', '');
        } else {
          largeImageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImageUrl}.png?size=512`;
        }
        largeImageElement.src = largeImageUrl;
      } else {
        largeImageElement.src = `https://dcdn.dstn.to/app-icons/${activity.application_id}.png?size=512`;
      }
    }

    if (smallImageElement) {
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
      } else {
        smallImageElement.src = '';
        smallImageElement.style.display = 'none';
      }
    }

    if (activityInterval) {
      clearInterval(activityInterval);
    }

    function updateActivityTime() {
      const activityTimeElement = document.getElementById('activityTimeText');
      if (!activityTimeElement) return;
      
      if (currentActivity && currentActivity.created_at) {
        const startTime = currentActivity.created_at;
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
        activityTimeElement.textContent = timeText;
      } else {
        activityTimeElement.textContent = '0:00';
      }
    }

    updateActivityTime();
    activityInterval = setInterval(updateActivityTime, 1000);

  } else {
    activityCard.style.display = 'none';
    activityCard.classList.remove('activity-active');
    currentActivity = null;
    if (activityInterval) {
      clearInterval(activityInterval);
      activityInterval = null;
    }
  }
}

function showError(message) {
  const container = document.querySelector('.discord-container');
  if (container) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }
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