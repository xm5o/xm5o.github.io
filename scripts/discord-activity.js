class DiscordActivity {
  constructor(userId) {
    this.userId = userId || '1282747277206884436';
    this.apiUrl = `https://api.lanyard.rest/v1/users/${this.userId}`;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.updateInterval = 15000; // 15 seconds
    this.intervalId = null;
    
    this.init();
  }

  async init() {
    await this.fetchDiscordStatus();
    this.startPeriodicUpdates();
  }

  async fetchDiscordStatus() {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        this.updateDiscordWidget(data.data);
        this.retryCount = 0;
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error fetching Discord status:', error);
      this.handleError();
    }
  }

  updateDiscordWidget(userData) {
    const widget = document.getElementById('discord-widget');
    if (!widget) return;

    // Extract user data
    const username = userData.discord_user?.username || 'Unknown';
    const displayName = userData.discord_user?.display_name || username;
    const globalName = userData.discord_user?.global_name || displayName;
    const discriminator = userData.discord_user?.discriminator;
    const avatar = userData.discord_user?.avatar;
    const status = userData.discord_status || 'offline';
    
    // Get custom status if available
    const customStatus = userData.activities?.find(activity => activity.type === 4);
    const statusText = customStatus?.state || '';
    const statusEmoji = customStatus?.emoji;

    // Get activity status (playing, listening, etc.)
    const activity = userData.activities?.find(activity => activity.type !== 4);
    
    // Build avatar URL
    let avatarUrl;
    if (avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${avatar}.${avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`;
    } else {
      // Use default avatar based on user ID or discriminator
      const defaultAvatarId = discriminator && discriminator !== '0' 
        ? parseInt(discriminator) % 5 
        : (parseInt(userData.discord_user.id) >> 22) % 6;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
    }

    // Determine which name to display (prioritize global_name, then display_name, then username)
    const nameToDisplay = globalName || displayName || username;
    const shouldShowUsername = discriminator && discriminator !== '0';

    // Update widget content
    widget.innerHTML = `
      <div class="discord-profile">
        <div class="discord-avatar-container">
          <img src="${avatarUrl}" alt="${nameToDisplay}" class="discord-avatar" 
               onerror="this.onerror=null; this.src='https://cdn.discordapp.com/embed/avatars/0.png';" />
          <div class="discord-status-indicator ${status}"></div>
        </div>
        
        <div class="discord-info">
          <div class="discord-nameplate">
            <div class="discord-display-name">${nameToDisplay}</div>
            ${shouldShowUsername ? `<div class="discord-username">@${username}</div>` : ''}
          </div>
          
          ${statusText ? `
            <div class="discord-custom-status">
              ${statusEmoji ? `<span class="status-emoji">${this.renderEmoji(statusEmoji)}</span>` : ''}
              <span class="status-text">${statusText}</span>
            </div>
          ` : ''}
          
          ${activity ? `
            <div class="discord-activity">
              <div class="activity-type">${this.getActivityTypeText(activity.type)}</div>
              <div class="activity-name">${activity.name}</div>
              ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
              ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    widget.className = `discord-widget ${status}`;
    
    const profile = widget.querySelector('.discord-profile');
    if (profile) {
      profile.classList.remove('loading');
    }
  }

  renderEmoji(emoji) {
    if (emoji.id) {
      const extension = emoji.animated ? 'gif' : 'png';
      return `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.${extension}" alt="${emoji.name}" style="width: 1.4rem; height: 1.4rem; vertical-align: middle;">`;
    } else if (emoji.name) {
      return emoji.name;
    }
    return '';
  }

  getActivityTypeText(type) {
    const activityTypes = {
      0: 'Playing',
      1: 'Streaming',
      2: 'Listening to',
      3: 'Watching',
      5: 'Competing in'
    };
    return activityTypes[type] || 'Activity';
  }

  getStatusIcon(status) {
    const statusIcons = {
      'online': '🟢',
      'idle': '🟡', 
      'dnd': '🔴',
      'offline': '⚫'
    };
    return statusIcons[status] || '⚫';
  }

  handleError() {
    const widget = document.getElementById('discord-widget');
    if (!widget) return;

    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      console.log(`Retrying Discord API request (${this.retryCount}/${this.maxRetries})...`);
      setTimeout(() => {
        this.fetchDiscordStatus();
      }, 5000 * this.retryCount);
    } else {
      console.error('Max retries reached for Discord API');
      widget.innerHTML = `
        <div class="discord-profile error">
          <div class="discord-avatar-container">
            <div class="discord-avatar-placeholder">
              <i class="bx bxl-discord-alt"></i>
            </div>
            <div class="discord-status-indicator offline"></div>
          </div>
          
          <div class="discord-info">
            <div class="discord-nameplate">
              <div class="discord-display-name">Discord</div>
            </div>
            <div class="discord-custom-status">
              <span class="status-text">Status unavailable</span>
            </div>
          </div>
        </div>
      `;
      widget.className = 'discord-widget offline error';
    }
  }

  startPeriodicUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.fetchDiscordStatus();
    }, this.updateInterval);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const discordWidget = document.getElementById('discord-widget');
  if (discordWidget) {
    window.discordActivity = new DiscordActivity('1282747277206884436');
  }
});

window.addEventListener('beforeunload', () => {
  if (window.discordActivity) {
    window.discordActivity.destroy();
  }
});