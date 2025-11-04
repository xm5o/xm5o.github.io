class DiscordActivity {
  constructor(userId) {
    this.userId = userId || '1282747277206884436';
    this.apiUrl = `https://api.lanyard.rest/v1/users/${this.userId}`;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.updateInterval = 500; // 0.5 seconds
    this.intervalId = null;
    this.userData = null;

    this.init();
  }

  // Device detection function
  isDesktop() {
    return window.innerWidth >= 1024 && !('ontouchstart' in window || navigator.maxTouchPoints > 0);
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

    // Store userData for expanded view
    this.userData = userData;

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

    // Extract timestamp if available
    const timestampText = activity?.timestamps ? this.formatActivityTimestamp(activity.timestamps) : '';

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

    // Check if desktop for clickable functionality
    const isDesktop = this.isDesktop();
    const clickableClass = isDesktop ? 'clickable' : '';
    const clickableAttr = isDesktop ? 'tabindex="0" role="button" aria-label="View Discord profile details"' : '';

    // Update widget content
    widget.innerHTML = `
      <div class="discord-profile ${clickableClass}" ${clickableAttr}>
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
              ${timestampText ? `<div class="activity-timestamp">${timestampText}</div>` : ''}
            </div>
          ` : ''}
        </div>
        ${isDesktop ? '<div class="click-indicator"><i class="bx bx-expand-alt"></i></div>' : ''}
      </div>
    `;

    widget.className = `discord-widget ${status}`;

    const profile = widget.querySelector('.discord-profile');
    if (profile) {
      profile.classList.remove('loading');

      // Add click event listener for desktop only
      if (isDesktop) {
        profile.addEventListener('click', () => this.showExpandedView());
        profile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.showExpandedView();
          }
        });
      }
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
      'idle': '🌙',
      'dnd': '⛔',
      'offline': '⚫'
    };
    return statusIcons[status] || '⚫';
  }

  formatActivityTimestamp(timestamps) {
    if (!timestamps || typeof timestamps !== 'object') {
      return '';
    }

    const now = Date.now();
    let seconds = 0;
    let label = '';

    if (timestamps.start) {
      seconds = Math.floor((now - timestamps.start) / 1000);
      label = 'elapsed';
    }
    else if (timestamps.end) {
      seconds = Math.floor((timestamps.end - now) / 1000);
      label = 'remaining';

      if (seconds < 0) {
        return '';
      }
    } else {
      return '';
    }

    if (seconds < 0) {
      seconds = 0;
    }

    // Format time into HH:MM:SS or MM:SS
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      timeString = `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    return `${timeString} ${label}`;
  }

  showExpandedView() {
    if (!this.userData) return;

    const existingModal = document.getElementById('discord-expanded-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const userData = this.userData;
    const username = userData.discord_user?.username || 'Unknown';
    const displayName = userData.discord_user?.display_name || username;
    const globalName = userData.discord_user?.global_name || displayName;
    const discriminator = userData.discord_user?.discriminator;
    const avatar = userData.discord_user?.avatar;
    const status = userData.discord_status || 'offline';
    const userId = userData.discord_user?.id;

    const customStatus = userData.activities?.find(activity => activity.type === 4);
    const statusText = customStatus?.state || '';
    const statusEmoji = customStatus?.emoji;

    const activity = userData.activities?.find(activity => activity.type !== 4);

    // Extract timestamp if available
    const timestampText = activity?.timestamps ? this.formatActivityTimestamp(activity.timestamps) : '';

    // Build avatar URL
    let avatarUrl;
    if (avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
    } else {
      const defaultAvatarId = discriminator && discriminator !== '0'
        ? parseInt(discriminator) % 5
        : (parseInt(userId) >> 22) % 6;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
    }

    const nameToDisplay = globalName || displayName || username;
    const shouldShowUsername = discriminator && discriminator !== '0';

    const badges = this.getMockBadges(userData);

    const clanTag = this.extractClanTag(displayName);

    const modal = document.createElement('div');
    modal.id = 'discord-expanded-modal';
    modal.className = 'discord-expanded-modal';
    modal.innerHTML = `
      <div class="discord-modal-overlay">
        <div class="discord-modal-content">
          <button class="discord-modal-close" aria-label="Close">&times;</button>
          
          <div class="discord-expanded-header">
            <div class="discord-expanded-avatar-container">
              <img src="${avatarUrl}" alt="${nameToDisplay}" class="discord-expanded-avatar" 
                   onerror="this.onerror=null; this.src='https://cdn.discordapp.com/embed/avatars/0.png';" />
              <div class="discord-expanded-status-indicator ${status}"></div>
            </div>
            
            <div class="discord-expanded-info">
              <div class="discord-expanded-nameplate">
                <div class="discord-expanded-display-name">
                  ${clanTag ? `<span class="clan-tag">${clanTag}</span>` : ''}
                  ${nameToDisplay}
                </div>
                ${shouldShowUsername ? `<div class="discord-expanded-username">@${username}#${discriminator}</div>` : `<div class="discord-expanded-username">@${username}</div>`}
              </div>
              
              ${statusText ? `
                <div class="discord-expanded-custom-status">
                  ${statusEmoji ? `<span class="status-emoji">${this.renderEmoji(statusEmoji)}</span>` : ''}
                  <span class="status-text">${statusText}</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${badges.length > 0 ? `
            <div class="discord-badges-section">
              <h3>Badges</h3>
              <div class="discord-badges">
                ${badges.map(badge => `
                  <div class="discord-badge" title="${badge.name}">
                    <i class="${badge.icon}"></i>
                    <span>${badge.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${activity ? `
            <div class="discord-activity-section">
              <h3>Activity</h3>
              <div class="discord-expanded-activity">
                <div class="activity-type">${this.getActivityTypeText(activity.type)}</div>
                <div class="activity-name">${activity.name}</div>
                ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
                ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
                ${timestampText ? `<div class="activity-timestamp">${timestampText}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <div class="discord-actions">
            <a href="https://discord.com/users/${userId}" target="_blank" class="discord-message-btn">
              <i class="bx bxl-discord-alt"></i>
              Send Message
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.discord-modal-close');
    const overlay = modal.querySelector('.discord-modal-overlay');

    closeBtn.addEventListener('click', () => this.closeExpandedView());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeExpandedView();
      }
    });

    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeExpandedView();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  }

  closeExpandedView() {
    const modal = document.getElementById('discord-expanded-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  getMockBadges(userData) {
    const badges = [];

    if (userData.discord_status === 'online') {
      badges.push({ name: 'Active User', icon: 'bx bx-check-circle' });
    }

    if (userData.activities?.some(activity => activity.type === 0)) {
      badges.push({ name: 'Gamer', icon: 'bx bx-game' });
    }

    if (userData.activities?.some(activity => activity.type === 2)) {
      badges.push({ name: 'Music Lover', icon: 'bx bx-music' });
    }

    badges.push({ name: 'Discord User', icon: 'bx bxl-discord-alt' });

    return badges;
  }

  extractClanTag(displayName) {
    const clanTagMatch = displayName?.match(/^[\[\{\(]([A-Z0-9]{2,6})[\]\}\)]/);
    return clanTagMatch ? clanTagMatch[0] : null;
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