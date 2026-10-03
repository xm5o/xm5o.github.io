(() => {
  'use strict';

  const USER_ID = '1282747277206884436';
  const DISCORD_CDN = 'https://cdn.discordapp.com';
  const LANYARD_SOCKET = 'wss://api.lanyard.rest/socket';
  const LANYARD_REST = `https://api.lanyard.rest/v1/users/${USER_ID}`;
  const DCDN_PROFILE = `https://dcdn.dstn.to/profile/${USER_ID}`;
  const RECONNECT_DELAYS = [2000, 5000, 10000, 30000];

  const DEVICE_ICONS = {
    desktop: 'bx-desktop',
    mobile: 'bx-mobile-alt',
    web: 'bx-globe',
    embedded: 'bx-joystick'
  };

  const DEVICE_LABELS = {
    desktop: 'Desktop',
    mobile: 'Mobile',
    web: 'Web',
    embedded: 'Console'
  };

  const ACTIVITY_LABELS = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening',
    3: 'Watching',
    5: 'Competing'
  };

  const qs = (selector, root = document) => root.querySelector(selector);

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = hidden;
  }

  function setText(element, value = '') {
    if (!element) return;
    element.textContent = value ?? '';
  }

  function safeHttpUrl(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function normalizeColor(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `#${value.toString(16).padStart(6, '0').slice(-6)}`;
    }

    if (typeof value !== 'string') return '';
    const cleaned = value.trim().replace(/^#/, '');
    return /^[0-9a-f]{6}$/i.test(cleaned) ? `#${cleaned}` : '';
  }

  function hexToRgb(hex) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!match) return null;

    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16)
    };
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function defaultAvatarUrl(user) {
    let index = 0;

    if (user?.discriminator && user.discriminator !== '0') {
      index = Number(user.discriminator) % 5;
    } else {
      try {
        index = Number((BigInt(user?.id || USER_ID) >> 22n) % 6n);
      } catch {
        index = 0;
      }
    }

    return `${DISCORD_CDN}/embed/avatars/${index}.png`;
  }

  function avatarUrl(user) {
    if (!user?.avatar) return defaultAvatarUrl(user);
    const extension = user.avatar.startsWith('a_') ? 'gif' : 'webp';
    return `${DISCORD_CDN}/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
  }

  function resolveActivityAsset(activity, asset, size = 512) {
    if (!asset || typeof asset !== 'string') return '';

    if (asset.startsWith('mp:')) {
      return `https://media.discordapp.net/${asset.slice(3)}`;
    }

    if (asset.startsWith('spotify:')) {
      return `https://i.scdn.co/image/${asset.slice(8)}`;
    }

    let decoded = asset;
    try {
      decoded = decodeURIComponent(asset);
    } catch {
      decoded = asset;
    }

    const httpsIndex = decoded.indexOf('https://');
    const httpIndex = decoded.indexOf('http://');
    const directIndex = httpsIndex >= 0 ? httpsIndex : httpIndex;

    if (directIndex >= 0) {
      return safeHttpUrl(decoded.slice(directIndex));
    }

    if (activity?.application_id) {
      return `${DISCORD_CDN}/app-assets/${activity.application_id}/${asset}.png?size=${size}`;
    }

    return '';
  }

  function activityIconUrl(activity) {
    const asset = resolveActivityAsset(activity, activity?.assets?.small_image || activity?.assets?.large_image, 128);
    if (asset) return asset;

    if (activity?.application_id) {
      return `https://dcdn.dstn.to/app-icons/${activity.application_id}.png?size=128`;
    }

    return '';
  }

  function activityKey(activity) {
    if (!activity) return 'none';
    if (activity.kind === 'spotify') return `spotify:${activity.track_id || activity.song || ''}`;
    return [
      activity.id,
      activity.application_id,
      activity.name,
      activity.details,
      activity.state,
      activity.timestamps?.start
    ].filter(Boolean).join(':');
  }

  class PresenceStore {
    constructor() {
      this.presence = null;
      this.listeners = new Set();
    }

    set(presence) {
      if (!presence?.discord_user) return;
      this.presence = presence;
      this.listeners.forEach(listener => listener(presence));
    }

    subscribe(listener) {
      this.listeners.add(listener);
      if (this.presence) listener(this.presence);
      return () => this.listeners.delete(listener);
    }
  }

  class ProfileRenderer {
    constructor() {
      this.shell = qs('#presenceShell');
      this.banner = qs('#profileBanner');
      this.bannerGif = qs('#profileBannerGif');
      this.colorBanner = qs('#colorBanner');
      this.avatar = qs('#avatar');
      this.avatarGif = qs('#avatarGif');
      this.avatarDecoration = qs('#avatarDecoration');
      this.status = qs('#statusIndicator');
      this.displayName = qs('#displayName');
      this.username = qs('#username');
      this.badges = qs('#badgesContainer');
      this.customStatus = qs('#customStatus');
      this.devices = qs('#deviceIcons');
      this.tagRow = qs('#tagRow');
      this.tagInfo = qs('#tagInfo');
    }

    render(presence) {
      const user = presence.discord_user;
      if (!user) return;

      setText(this.displayName, user.global_name || user.display_name || user.username || 'Immortal');
      setText(this.username, user.username ? `@${user.username}` : '@trr0');

      const avatar = avatarUrl(user);
      const animated = Boolean(user.avatar?.startsWith('a_'));
      this.avatar.src = animated ? '' : avatar;
      this.avatarGif.src = animated ? avatar : '';
      setHidden(this.avatar, animated);
      setHidden(this.avatarGif, !animated);

      const decorationAsset = user.avatar_decoration_data?.asset;
      if (decorationAsset) {
        this.avatarDecoration.src = `${DISCORD_CDN}/avatar-decoration-presets/${decorationAsset}.png?size=160`;
        setHidden(this.avatarDecoration, false);
      } else {
        this.avatarDecoration.removeAttribute('src');
        setHidden(this.avatarDecoration, true);
      }

      this.renderStatus(presence.discord_status);
      this.renderCustomStatus(presence.activities || []);
      this.renderDevices(presence);
      this.renderServerTag(user.primary_guild);
    }

    renderStatus(status = 'offline') {
      const validStatus = ['online', 'idle', 'dnd'].includes(status) ? status : 'offline';
      this.status.className = `presence-status-dot status-${validStatus}`;

      const labels = {
        online: 'Online',
        idle: 'Idle',
        dnd: 'Do not disturb',
        offline: 'Offline'
      };

      this.status.setAttribute('aria-label', labels[validStatus]);
      this.status.title = labels[validStatus];
    }

    renderCustomStatus(activities) {
      const custom = activities.find(activity => activity.type === 4);
      this.customStatus.replaceChildren();

      if (!custom || (!custom.state && !custom.emoji)) {
        setHidden(this.customStatus, true);
        return;
      }

      if (custom.emoji?.id) {
        const img = document.createElement('img');
        const extension = custom.emoji.animated ? 'gif' : 'webp';
        img.src = `${DISCORD_CDN}/emojis/${custom.emoji.id}.${extension}?size=48`;
        img.alt = custom.emoji.name || '';
        this.customStatus.appendChild(img);
      } else if (custom.emoji?.name) {
        const emoji = document.createElement('span');
        emoji.textContent = custom.emoji.name;
        this.customStatus.appendChild(emoji);
      }

      if (custom.state) {
        const text = document.createElement('span');
        text.textContent = custom.state;
        this.customStatus.appendChild(text);
      }

      setHidden(this.customStatus, false);
    }

    renderDevices(presence) {
      this.devices.replaceChildren();

      const activeDevices = [
        ['desktop', presence.active_on_discord_desktop],
        ['mobile', presence.active_on_discord_mobile],
        ['web', presence.active_on_discord_web],
        ['embedded', presence.active_on_discord_embedded]
      ].filter(([, active]) => Boolean(active));

      if (!activeDevices.length) {
        const muted = document.createElement('span');
        muted.className = 'presence-muted';
        muted.textContent = presence.discord_status === 'offline' ? 'Offline' : 'Discord';
        this.devices.appendChild(muted);
        return;
      }

      activeDevices.forEach(([device]) => {
        const chip = document.createElement('span');
        chip.className = 'presence-device';

        const icon = document.createElement('i');
        icon.className = `bx ${DEVICE_ICONS[device]}`;
        icon.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.textContent = DEVICE_LABELS[device];

        chip.append(icon, label);
        this.devices.appendChild(chip);
      });
    }

    renderServerTag(primaryGuild) {
      this.tagInfo.replaceChildren();

      if (!primaryGuild?.tag) {
        setHidden(this.tagRow, true);
        return;
      }

      const chip = document.createElement('span');
      chip.className = 'presence-tag-chip';

      if (primaryGuild.badge && primaryGuild.identity_guild_id) {
        const img = document.createElement('img');
        img.src = `${DISCORD_CDN}/clan-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png?size=32`;
        img.alt = '';
        chip.appendChild(img);
      }

      const text = document.createElement('span');
      text.textContent = primaryGuild.tag;
      chip.appendChild(text);
      this.tagInfo.appendChild(chip);
      setHidden(this.tagRow, false);
    }

    renderExtras(data) {
      const user = data?.user;
      if (!user) return;

      this.renderBanner(user);
      this.renderBadges(data.badges || []);
      this.applyAccent(user.banner_color ?? user.accent_color);
    }

    renderBanner(user) {
      setHidden(this.banner, true);
      setHidden(this.bannerGif, true);
      setHidden(this.colorBanner, true);

      if (user.banner) {
        const animated = user.banner.startsWith('a_');
        const extension = animated ? 'gif' : 'webp';
        const url = `${DISCORD_CDN}/banners/${USER_ID}/${user.banner}.${extension}?size=1024`;

        if (animated) {
          this.bannerGif.src = url;
          setHidden(this.bannerGif, false);
        } else {
          this.banner.src = url;
          setHidden(this.banner, false);
        }
        return;
      }

      const fallback = normalizeColor(user.banner_color ?? user.accent_color);
      if (fallback) {
        this.colorBanner.style.background = fallback;
        setHidden(this.colorBanner, false);
      }
    }

    renderBadges(badges) {
      this.badges.replaceChildren();

      badges.slice(0, 8).forEach(badge => {
        if (!badge?.icon) return;

        const img = document.createElement('img');
        img.src = `${DISCORD_CDN}/badge-icons/${badge.icon}.png`;
        img.alt = badge.description || 'Discord badge';
        img.title = badge.description || 'Discord badge';
        img.loading = 'lazy';
        this.badges.appendChild(img);
      });
    }

    applyAccent(value) {
      const hex = normalizeColor(value);
      const rgb = hexToRgb(hex);
      if (!hex || !rgb || !this.shell) return;

      this.shell.style.setProperty('--presence-profile-accent', hex);
      this.shell.style.setProperty('--presence-profile-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }

  class ActivityRenderer {
    constructor() {
      this.shell = qs('#presenceShell');
      this.stage = qs('#activityStage');
      this.content = qs('#activityContent');
      this.empty = qs('#presenceEmpty');
      this.error = qs('#presenceError');
      this.eyebrow = qs('#activityEyebrow');
      this.source = qs('#activitySource');
      this.type = qs('#activityType');
      this.name = qs('#activityName');
      this.details = qs('#activityDetails');
      this.state = qs('#activityState');
      this.artWrap = qs('#activityArtWrap');
      this.largeImage = qs('#activityLargeImage');
      this.smallImage = qs('#activitySmallImage');
      this.artFallback = qs('#activityArtFallback');
      this.progress = qs('#activityProgress');
      this.progressBar = qs('#activityProgressBar');
      this.currentTime = qs('#activityCurrentTime');
      this.totalTime = qs('#activityTotalTime');
      this.elapsed = qs('#activityElapsed');
      this.elapsedText = qs('#activityElapsedText');
      this.actions = qs('#activityButtons');
      this.secondary = qs('#secondaryActivities');
      this.secondaryList = qs('#secondaryActivitiesList');
      this.timeline = null;
      this.timer = null;
      this.currentKey = '';
    }

    render(presence) {
      this.shell?.classList.remove('is-loading');
      setHidden(this.error, true);

      const activities = this.buildActivities(presence);
      const primary = activities[0] || null;

      if (!primary) {
        this.stopTimeline();
        this.currentKey = 'none';
        setHidden(this.content, true);
        setHidden(this.empty, false);
        setHidden(this.secondary, true);
        return;
      }

      setHidden(this.empty, true);
      setHidden(this.content, false);
      this.renderPrimary(primary);
      this.renderSecondary(activities.slice(1));
    }

    buildActivities(presence) {
      const raw = (presence.activities || []).filter(activity => activity.type !== 4);
      const regular = raw.filter(activity => activity.name !== 'Spotify');

      const activities = [];

      if (presence.listening_to_spotify && presence.spotify) {
        activities.push({
          kind: 'spotify',
          id: 'spotify',
          name: presence.spotify.song,
          details: presence.spotify.artist,
          state: presence.spotify.album ? `From ${presence.spotify.album}` : '',
          track_id: presence.spotify.track_id,
          album_art_url: presence.spotify.album_art_url,
          timestamps: presence.spotify.timestamps || null
        });
      }

      regular
        .slice()
        .sort((a, b) => {
          const priority = { 1: 0, 0: 1, 5: 2, 3: 3, 2: 4 };
          return (priority[a.type] ?? 9) - (priority[b.type] ?? 9);
        })
        .forEach(activity => activities.push({ ...activity, kind: 'discord' }));

      return activities;
    }

    renderPrimary(activity) {
      const key = activityKey(activity);
      const changed = key !== this.currentKey;
      this.currentKey = key;

      setText(this.eyebrow, activity.kind === 'spotify' ? 'Listening now' : 'Current activity');
      setText(this.source, activity.kind === 'spotify' ? 'Spotify' : 'Discord');

      if (activity.kind === 'spotify') {
        setText(this.type, 'Listening');
        setText(this.name, activity.name || 'Spotify');
        setText(this.details, activity.details || '');
        setText(this.state, activity.state || '');
        this.renderArtwork(activity.album_art_url, '', 'Album artwork');
        this.renderActions([
          activity.track_id
            ? {
                label: 'Open in Spotify',
                url: `https://open.spotify.com/track/${activity.track_id}`,
                icon: 'bxl-spotify'
              }
            : null
        ].filter(Boolean));
      } else {
        setText(this.type, ACTIVITY_LABELS[activity.type] || 'Active');
        setText(this.name, activity.name || 'Discord activity');
        setText(this.details, activity.details || '');
        setText(this.state, activity.state || '');

        const large = resolveActivityAsset(activity, activity.assets?.large_image, 512)
          || (activity.application_id ? `https://dcdn.dstn.to/app-icons/${activity.application_id}.png?size=512` : '');
        const small = resolveActivityAsset(activity, activity.assets?.small_image, 128);

        this.renderArtwork(large, small, activity.assets?.large_text || activity.name || 'Activity artwork');
        this.renderActions(this.getActivityActions(activity));
      }

      this.setTimeline(activity.timestamps, activity.created_at);

      if (changed && this.content) {
        this.content.style.animation = 'none';
        void this.content.offsetWidth;
        this.content.style.animation = '';
      }
    }

    renderArtwork(large, small, alt) {
      const largeUrl = safeHttpUrl(large);
      const smallUrl = safeHttpUrl(small);

      if (largeUrl) {
        this.largeImage.src = largeUrl;
        this.largeImage.alt = alt || 'Activity artwork';
        setHidden(this.largeImage, false);
        this.artWrap?.classList.add('has-image');
      } else {
        this.largeImage.removeAttribute('src');
        this.largeImage.alt = '';
        setHidden(this.largeImage, true);
        this.artWrap?.classList.remove('has-image');
      }

      if (smallUrl) {
        this.smallImage.src = smallUrl;
        this.smallImage.alt = '';
        setHidden(this.smallImage, false);
      } else {
        this.smallImage.removeAttribute('src');
        setHidden(this.smallImage, true);
      }
    }

    getActivityActions(activity) {
      const actions = [];
      const labels = Array.isArray(activity.buttons) ? activity.buttons : [];
      const urls = activity.metadata?.button_urls || [];

      labels.forEach((button, index) => {
        const label = typeof button === 'string' ? button : button?.label;
        const candidate = typeof button === 'object' ? button?.url : urls[index];
        const url = safeHttpUrl(candidate);

        if (label && url) {
          actions.push({
            label,
            url,
            icon: label.toLowerCase().includes('watch') ? 'bx-play' : 'bx-link-external'
          });
        }
      });

      if (!actions.length) {
        const fallback = safeHttpUrl(activity.details_url || activity.state_url);
        if (fallback) {
          actions.push({
            label: 'Open activity',
            url: fallback,
            icon: 'bx-link-external'
          });
        }
      }

      return actions.slice(0, 2);
    }

    renderActions(actions) {
      this.actions.replaceChildren();

      actions.forEach(action => {
        const url = safeHttpUrl(action.url);
        if (!url) return;

        const link = document.createElement('a');
        link.className = 'presence-action';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const icon = document.createElement('i');
        icon.className = `bx ${action.icon || 'bx-link-external'}`;
        icon.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.textContent = action.label;

        link.append(icon, label);
        this.actions.appendChild(link);
      });
    }

    renderSecondary(activities) {
      this.secondaryList.replaceChildren();

      if (!activities.length) {
        setHidden(this.secondary, true);
        return;
      }

      activities.slice(0, 3).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'presence-secondary-item';

        const iconUrl = activity.kind === 'spotify'
          ? safeHttpUrl(activity.album_art_url)
          : safeHttpUrl(activityIconUrl(activity));

        if (iconUrl) {
          const img = document.createElement('img');
          img.src = iconUrl;
          img.alt = '';
          img.loading = 'lazy';
          item.appendChild(img);
        }

        const label = document.createElement('span');
        label.textContent = activity.name || (activity.kind === 'spotify' ? 'Spotify' : 'Discord');

        item.appendChild(label);
        this.secondaryList.appendChild(item);
      });

      setHidden(this.secondary, false);
    }

    setTimeline(timestamps, createdAt) {
      const start = Number(timestamps?.start || createdAt || 0);
      const end = Number(timestamps?.end || 0);

      if (!start) {
        this.timeline = null;
        this.stopTimeline();
        setHidden(this.progress, true);
        setHidden(this.elapsed, true);
        return;
      }

      this.timeline = { start, end };
      this.updateTimeline();
      this.startTimeline();
    }

    updateTimeline() {
      if (!this.timeline) return;

      const now = Date.now();
      const elapsed = Math.max(0, now - this.timeline.start);

      if (this.timeline.end > this.timeline.start) {
        const duration = this.timeline.end - this.timeline.start;
        const progress = Math.max(0, Math.min(100, (elapsed / duration) * 100));

        setHidden(this.progress, false);
        setHidden(this.elapsed, true);
        this.progressBar.style.width = `${progress}%`;
        setText(this.currentTime, formatDuration(Math.min(elapsed, duration)));
        setText(this.totalTime, formatDuration(duration));
      } else {
        setHidden(this.progress, true);
        setHidden(this.elapsed, false);
        setText(this.elapsedText, formatDuration(elapsed));
      }
    }

    startTimeline() {
      this.stopTimeline();
      if (!this.timeline || document.hidden) return;

      this.timer = window.setInterval(() => this.updateTimeline(), 1000);
    }

    stopTimeline() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    pauseTimeline() {
      this.stopTimeline();
    }

    resumeTimeline() {
      if (!this.timeline) return;
      this.updateTimeline();
      this.startTimeline();
    }

    showError() {
      this.shell?.classList.remove('is-loading');
      this.stopTimeline();
      setHidden(this.content, true);
      setHidden(this.empty, true);
      setHidden(this.secondary, true);
      setHidden(this.error, false);
    }
  }

  class ConnectionManager {
    constructor(store, activityRenderer, profileRenderer) {
      this.store = store;
      this.activityRenderer = activityRenderer;
      this.profileRenderer = profileRenderer;
      this.socket = null;
      this.heartbeat = null;
      this.reconnectTimer = null;
      this.reconnectAttempt = 0;
      this.paused = false;
      this.started = false;
      this.hasLiveSocket = false;
      this.connection = qs('#connectionStatus');
      this.retryButton = qs('#presenceRetry');
      this.retryButton?.addEventListener('click', () => this.retry());
    }

    start() {
      if (this.started) return;
      this.started = true;

      this.fetchProfileExtras();
      this.fetchRest(false);
      this.connect();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.paused = true;
          this.activityRenderer.pauseTimeline();
          this.clearReconnect();
          this.closeSocket();
        } else {
          this.paused = false;
          this.activityRenderer.resumeTimeline();
          this.fetchRest(true);
          this.connect();
        }
      });
    }

    async fetchProfileExtras() {
      try {
        const response = await fetch(DCDN_PROFILE, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        this.profileRenderer.renderExtras(data);
      } catch {
        // Profile extras are optional. Lanyard remains the source of live presence data.
      }
    }

    async fetchRest(silent = false) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);

      try {
        const response = await fetch(LANYARD_REST, {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Lanyard REST returned ${response.status}`);

        const payload = await response.json();
        if (!payload?.success || !payload.data?.discord_user) {
          throw new Error('Lanyard REST payload was incomplete');
        }

        this.store.set(payload.data);

        if (!this.hasLiveSocket) {
          this.setConnection('fallback', 'Live data');
        }

        return true;
      } catch {
        if (!silent && !this.store.presence) {
          window.setTimeout(() => {
            if (!this.store.presence && !this.hasLiveSocket) {
              this.activityRenderer.showError();
              this.setConnection('offline', 'Unavailable');
            }
          }, 1200);
        }
        return false;
      } finally {
        clearTimeout(timeout);
      }
    }

    connect() {
      if (this.paused || document.hidden) return;
      if (this.socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.socket.readyState)) return;

      this.setConnection('connecting', 'Connecting');

      try {
        const socket = new WebSocket(LANYARD_SOCKET);
        this.socket = socket;

        socket.addEventListener('message', event => {
          let message;
          try {
            message = JSON.parse(event.data);
          } catch {
            return;
          }

          if (message.op === 1) {
            this.handleHello(message.d?.heartbeat_interval);
            return;
          }

          if (message.op === 0) {
            this.handleEvent(message);
          }
        });

        socket.addEventListener('open', () => {
          this.hasLiveSocket = true;
          this.reconnectAttempt = 0;
          this.clearReconnect();
          this.setConnection('live', 'Live');
        });

        socket.addEventListener('close', () => {
          if (this.socket === socket) {
            this.socket = null;
          }

          this.hasLiveSocket = false;
          this.clearHeartbeat();

          if (this.paused || document.hidden) return;

          this.setConnection(this.store.presence ? 'fallback' : 'offline', this.store.presence ? 'Live data' : 'Reconnecting');
          this.fetchRest(true);
          this.scheduleReconnect();
        });

        socket.addEventListener('error', () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        });
      } catch {
        this.hasLiveSocket = false;
        this.fetchRest(true);
        this.scheduleReconnect();
      }
    }

    handleHello(interval) {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

      this.socket.send(JSON.stringify({
        op: 2,
        d: {
          subscribe_to_ids: [USER_ID]
        }
      }));

      this.clearHeartbeat();

      if (Number.isFinite(interval) && interval > 0) {
        this.heartbeat = window.setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ op: 3 }));
          }
        }, interval);
      }
    }

    handleEvent(message) {
      if (!['INIT_STATE', 'PRESENCE_UPDATE'].includes(message.t)) return;

      const presence = message.t === 'INIT_STATE'
        ? message.d?.[USER_ID]
        : message.d;

      if (!presence?.discord_user) return;
      if (message.t === 'PRESENCE_UPDATE' && presence.user_id && presence.user_id !== USER_ID) return;

      this.store.set(presence);
      this.setConnection('live', 'Live');
    }

    scheduleReconnect() {
      if (this.reconnectTimer || this.paused || document.hidden) return;

      const index = Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1);
      const delay = RECONNECT_DELAYS[index];
      this.reconnectAttempt += 1;

      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, delay);
    }

    retry() {
      this.reconnectAttempt = 0;
      this.clearReconnect();
      this.setConnection('connecting', 'Connecting');
      this.fetchRest(false);
      this.connect();
    }

    setConnection(state, label) {
      if (!this.connection) return;
      this.connection.dataset.state = state;
      setText(this.connection.querySelector('span:last-child'), label);
    }

    clearHeartbeat() {
      if (this.heartbeat) {
        clearInterval(this.heartbeat);
        this.heartbeat = null;
      }
    }

    clearReconnect() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }

    closeSocket() {
      this.clearHeartbeat();

      if (this.socket) {
        const socket = this.socket;
        this.socket = null;

        try {
          socket.close(1000, 'Page hidden');
        } catch {
          // Ignore close errors.
        }
      }

      this.hasLiveSocket = false;
    }
  }

  function initDiscordPresence() {
    const section = qs('#discord-activity');
    if (!section) return;

    const store = new PresenceStore();
    const profileRenderer = new ProfileRenderer();
    const activityRenderer = new ActivityRenderer();
    const connection = new ConnectionManager(store, activityRenderer, profileRenderer);

    store.subscribe(presence => {
      profileRenderer.render(presence);
      activityRenderer.render(presence);
    });

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      connection.start();
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, {
      rootMargin: '420px 0px'
    });

    observer.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscordPresence, { once: true });
  } else {
    initDiscordPresence();
  }
})();
