import settings from './settings.js?v=20260915-3';

const $ = id => document.getElementById(id);
const manager = $('manager');
const loginPanel = $('loginPanel');
const apiUrlInput = $('apiUrl');
const connectButton = $('connectButton');
const loginStatus = $('loginStatus');
const connectionState = $('connectionState');
const currentImage = $('currentImage');
const currentPalette = $('currentPalette');
const imageInput = $('imageInput');
const emptyEditor = $('emptyEditor');
const cropEditor = $('cropEditor');
const cropStage = $('cropStage');
const cropCanvas = $('cropCanvas');
const cropContext = cropCanvas.getContext('2d', { willReadFrequently: true });
const zoomRange = $('zoomRange');
const resetCrop = $('resetCrop');
const newPalette = $('newPalette');
const previewStatus = $('previewStatus');
const sitePreview = $('sitePreview');
const previewProfile = $('previewProfile');
const publishButton = $('publishButton');
const restoreButton = $('restoreButton');
const publishStatus = $('publishStatus');
const refreshCurrent = $('refreshCurrent');

// These are the exact storage keys used by Selina Control Center.
const DASHBOARD_URL_KEY = 'selinaDashboardBase';
const ACCESS_TOKEN_KEY = 'selinaDashboardToken';
const OAUTH_STATE_KEY = 'selinaOAuthState';
const PROFILE_RETURN_KEY = 'selinaProfileManagerReturnTo';
const CANVAS_SIZE = 720;
const MAX_SOURCE_SIZE = 18 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const themeEngine = window.ProfilePictureTheme
  ? new window.ProfilePictureTheme('[data-profile-theme-source-never]')
  : null;

const state = {
  connected: false,
  profileApiReady: false,
  user: null,
  sourceImage: null,
  sourceUrl: '',
  baseScale: 1,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  pointerId: null,
  dragStartX: 0,
  dragStartY: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  palette: null,
  currentPalette: null,
  previewTimer: null
};

manager.hidden = false;
restoreButton.disabled = true;

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function safeLocalGet(key) {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function safeLocalSet(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {}
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key) || ''; } catch { return ''; }
}

function safeSessionSet(key, value) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {}
}

function storedDashboardUrl() {
  return normalizeBaseUrl(safeLocalGet(DASHBOARD_URL_KEY));
}

function storedAccessToken() {
  return String(safeLocalGet(ACCESS_TOKEN_KEY)).trim();
}

function getDashboardUrl() {
  return normalizeBaseUrl(
    apiUrlInput.value ||
    storedDashboardUrl() ||
    settings.apiBase ||
    ''
  );
}

function setConnection(connected, user = null, profileApiReady = false) {
  state.connected = connected;
  state.profileApiReady = connected && profileApiReady;
  state.user = connected ? user : null;

  connectionState.dataset.state = connected ? 'online' : 'offline';
  connectionState.querySelector('strong').textContent = connected
    ? `Control Center connected${user?.username ? ` · ${user.username}` : ''}`
    : 'Not signed in';

  restoreButton.disabled = !state.profileApiReady;
  updatePublishState();
}

function setPublishStatus(message, type = '') {
  publishStatus.textContent = message;
  publishStatus.classList.remove('success', 'error');
  if (type) publishStatus.classList.add(type);
}

function clearAuth(message = '') {
  safeLocalSet(ACCESS_TOKEN_KEY, '');
  setConnection(false);
  loginPanel.hidden = false;
  if (message) loginStatus.textContent = message;
}

async function requestJson(path, options = {}) {
  const base = getDashboardUrl();
  if (!base || !/^https:\/\//i.test(base)) {
    throw new Error('Add a valid HTTPS Control Center backend URL.');
  }

  const headers = { ...(options.headers || {}) };
  if (options.auth !== false) {
    const token = storedAccessToken();
    if (!token) throw new Error('Sign in with Discord first.');
    headers.Authorization = `Bearer ${token}`;
  }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 15000);

  try {
    const response = await fetch(`${base}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      signal: controller.signal
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `${response.status} ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function api(path, options = {}) {
  try {
    return await requestJson(path, options);
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      clearAuth(error.message || 'Your Control Center sign-in expired. Sign in again.');
    }
    throw error;
  }
}

async function startDiscordLogin() {
  const base = getDashboardUrl();
  if (!/^https:\/\//i.test(base)) {
    loginStatus.textContent = 'Add the current Selina Control Center backend URL first.';
    apiUrlInput.focus();
    return;
  }

  connectButton.disabled = true;
  connectButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Connecting...';
  loginStatus.textContent = 'Checking Selina’s Discord login...';

  try {
    safeLocalSet(DASHBOARD_URL_KEY, base);
    safeLocalSet(PROFILE_RETURN_KEY, `${location.origin}${location.pathname}`);
    safeLocalSet(ACCESS_TOKEN_KEY, '');
    safeSessionSet(OAUTH_STATE_KEY, '');

    let config;
    try {
      config = await requestJson('/api/oauth/config', { auth: false });
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The Control Center backend did not answer in time.');
      throw new Error('Cannot reach the Selina Control Center backend. Check its current HTTPS URL.');
    }

    if (!config.enabled) {
      throw new Error('Discord login is not enabled on the Control Center backend.');
    }

    const result = await requestJson('/api/oauth/start', {
      auth: false,
      method: 'POST',
      body: {}
    });

    if (!result.state || !result.authorizeUrl) {
      throw new Error('Selina returned an invalid Discord login response.');
    }

    safeSessionSet(OAUTH_STATE_KEY, result.state);
    location.href = result.authorizeUrl;
  } catch (error) {
    connectButton.disabled = false;
    connectButton.innerHTML = '<i class="bx bxl-discord-alt"></i> Sign in with Discord';
    loginStatus.textContent = error.message || 'Could not start Discord login.';
  }
}

async function finishDiscordLoginHere() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const stateParam = params.get('state');
  if (!code || !stateParam) return false;

  const savedState = safeSessionGet(OAUTH_STATE_KEY);
  if (!savedState || savedState !== stateParam) {
    history.replaceState({}, document.title, location.pathname);
    loginStatus.textContent = 'Discord login state did not match. Try again.';
    return true;
  }

  try {
    const result = await requestJson('/api/oauth/exchange', {
      auth: false,
      method: 'POST',
      body: { code, state: stateParam }
    });

    if (!result.token) throw new Error('Discord login did not return a Control Center token.');

    safeLocalSet(ACCESS_TOKEN_KEY, result.token);
    safeSessionSet(OAUTH_STATE_KEY, '');
    safeLocalSet(PROFILE_RETURN_KEY, '');
    history.replaceState({}, document.title, location.pathname);
    return true;
  } catch (error) {
    history.replaceState({}, document.title, location.pathname);
    loginStatus.textContent = error.message || 'Discord login failed.';
    return true;
  }
}

async function checkSession() {
  const base = getDashboardUrl();
  const token = storedAccessToken();
  if (!base || !token) return false;

  connectButton.disabled = true;
  connectButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Checking...';
  loginStatus.textContent = 'Checking your Control Center session...';

  try {
    // This is an existing Control Center route, so it proves the shared token works.
    await api('/api/overview');
    setConnection(true, null, false);
    loginPanel.hidden = true;

    try {
      const result = await api('/api/site/profile/status');
      setConnection(true, result.user || null, true);
      setPublishStatus(state.sourceImage
        ? 'Preview ready. You can publish this picture.'
        : 'Choose a new image to continue.');
    } catch (error) {
      if (error.status === 404) {
        state.profileApiReady = false;
        restoreButton.disabled = true;
        updatePublishState();
        setPublishStatus(
          'Control Center connected. The Profile Manager routes still need to be installed on the active Selina backend.',
          'error'
        );
      } else {
        throw error;
      }
    }

    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      loginStatus.textContent = 'The Control Center backend did not answer in time.';
    } else if (error.status !== 401 && error.status !== 403) {
      loginStatus.textContent = error.message || 'Could not connect to Control Center.';
    }
    return false;
  } finally {
    connectButton.disabled = false;
    connectButton.innerHTML = '<i class="bx bxl-discord-alt"></i> Sign in with Discord';
  }
}

connectButton.addEventListener('click', startDiscordLogin);
apiUrlInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') startDiscordLogin();
});

function rgbText(color) {
  return `${color.r}, ${color.g}, ${color.b}`;
}

function paletteFrom(element) {
  if (!themeEngine || !element) return null;
  try {
    const dominant = themeEngine.getDominantColor(element);
    return dominant ? themeEngine.buildPalette(dominant) : null;
  } catch (error) {
    console.warn('[Profile Manager] Could not extract palette:', error);
    return null;
  }
}

function paletteHex(palette) {
  if (!palette || !themeEngine) return null;
  return {
    main: themeEngine.toHex(palette.main),
    secondary: themeEngine.toHex(palette.secondary),
    accent: themeEngine.toHex(palette.accent)
  };
}

function renderPalette(container, palette) {
  if (!container) return;
  const colors = paletteHex(palette);
  if (!colors) {
    container.innerHTML = '<span class="swatch"><span>No colors yet</span></span>';
    return;
  }

  container.innerHTML = [
    ['Main', colors.main],
    ['Secondary', colors.secondary],
    ['Accent', colors.accent]
  ].map(([label, hex]) => `
    <span class="swatch" title="${label}: ${hex}">
      <span class="swatch-dot" style="background:${hex}"></span>
      <span>${hex}</span>
    </span>`).join('');
}

function applyPreviewPalette(palette) {
  const colors = paletteHex(palette);
  if (!colors) return;
  sitePreview.style.setProperty('--main-color', colors.main);
  sitePreview.style.setProperty('--secondary-color', colors.secondary);
  sitePreview.style.setProperty('--accent-color', colors.accent);
  sitePreview.style.setProperty('--preview-main-rgb', rgbText(palette.main));
}

function refreshCurrentPalette() {
  if (!currentImage.complete || !currentImage.naturalWidth) return;
  state.currentPalette = paletteFrom(currentImage);
  renderPalette(currentPalette, state.currentPalette);
  if (!state.palette && state.currentPalette) applyPreviewPalette(state.currentPalette);
}

currentImage.addEventListener('load', refreshCurrentPalette);
if (currentImage.complete) refreshCurrentPalette();

function loadCurrentImage() {
  currentImage.src = `../../assets/pfp.jpg?v=${Date.now()}`;
}

refreshCurrent.addEventListener('click', loadCurrentImage);

function clearSourceUrl() {
  if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl);
  state.sourceUrl = '';
}

function coverScale(image) {
  return Math.max(CANVAS_SIZE / image.naturalWidth, CANVAS_SIZE / image.naturalHeight);
}

function clampOffsets() {
  if (!state.sourceImage) return;
  const scale = state.baseScale * state.zoom;
  const width = state.sourceImage.naturalWidth * scale;
  const height = state.sourceImage.naturalHeight * scale;
  const maxX = Math.max(0, (width - CANVAS_SIZE) / 2);
  const maxY = Math.max(0, (height - CANVAS_SIZE) / 2);
  state.offsetX = Math.min(maxX, Math.max(-maxX, state.offsetX));
  state.offsetY = Math.min(maxY, Math.max(-maxY, state.offsetY));
}

function renderCrop({ updatePreview = false } = {}) {
  if (!state.sourceImage || !cropContext) return;
  clampOffsets();

  const scale = state.baseScale * state.zoom;
  const width = state.sourceImage.naturalWidth * scale;
  const height = state.sourceImage.naturalHeight * scale;
  const x = (CANVAS_SIZE - width) / 2 + state.offsetX;
  const y = (CANVAS_SIZE - height) / 2 + state.offsetY;

  cropContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  cropContext.fillStyle = '#080808';
  cropContext.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  cropContext.drawImage(state.sourceImage, x, y, width, height);

  if (updatePreview) scheduleThemePreview();
}

function resetCropState() {
  if (!state.sourceImage) return;
  state.baseScale = coverScale(state.sourceImage);
  state.zoom = 1;
  state.offsetX = 0;
  state.offsetY = 0;
  zoomRange.value = '1';
  renderCrop({ updatePreview: true });
}

function scheduleThemePreview() {
  clearTimeout(state.previewTimer);
  state.previewTimer = setTimeout(updateThemePreview, 80);
}

function updateThemePreview() {
  if (!state.sourceImage) return;
  state.palette = paletteFrom(cropCanvas);
  renderPalette(newPalette, state.palette);
  applyPreviewPalette(state.palette);
  previewProfile.src = cropCanvas.toDataURL('image/jpeg', 0.84);
  previewStatus.textContent = state.palette ? 'Matches live theme' : 'Could not read colors';
  updatePublishState();
}

async function loadSelectedFile(file) {
  if (!file) return;
  if (!allowedTypes.has(file.type)) {
    setPublishStatus('Use a JPG, PNG, or WebP image.', 'error');
    return;
  }
  if (file.size > MAX_SOURCE_SIZE) {
    setPublishStatus('That image is too large. Choose an image under 18 MB.', 'error');
    return;
  }

  clearSourceUrl();
  const url = URL.createObjectURL(file);
  state.sourceUrl = url;
  const image = new Image();
  image.decoding = 'async';

  image.onload = () => {
    state.sourceImage = image;
    emptyEditor.hidden = true;
    cropEditor.hidden = false;
    resetCropState();

    if (state.profileApiReady) {
      setPublishStatus('Preview ready. Drag or zoom the picture, then publish it.');
    } else if (state.connected) {
      setPublishStatus('Preview ready. Control Center is connected, but its Profile Manager routes are not installed yet.', 'error');
    } else {
      setPublishStatus('Preview ready. Sign in with Discord before publishing.');
    }
  };

  image.onerror = () => {
    setPublishStatus('Could not open that image.', 'error');
    clearSourceUrl();
  };

  image.src = url;
}

imageInput.addEventListener('change', () => loadSelectedFile(imageInput.files?.[0]));
resetCrop.addEventListener('click', resetCropState);

zoomRange.addEventListener('input', () => {
  state.zoom = Number(zoomRange.value) || 1;
  renderCrop();
});
zoomRange.addEventListener('change', () => renderCrop({ updatePreview: true }));

cropStage.addEventListener('pointerdown', event => {
  if (!state.sourceImage) return;
  state.dragging = true;
  state.pointerId = event.pointerId;
  state.dragStartX = event.clientX;
  state.dragStartY = event.clientY;
  state.dragOffsetX = state.offsetX;
  state.dragOffsetY = state.offsetY;
  cropStage.setPointerCapture?.(event.pointerId);
});

cropStage.addEventListener('pointermove', event => {
  if (!state.dragging || event.pointerId !== state.pointerId) return;
  const rect = cropCanvas.getBoundingClientRect();
  const scale = CANVAS_SIZE / rect.width;
  state.offsetX = state.dragOffsetX + (event.clientX - state.dragStartX) * scale;
  state.offsetY = state.dragOffsetY + (event.clientY - state.dragStartY) * scale;
  renderCrop();
});

function finishDrag(event) {
  if (!state.dragging || (event?.pointerId != null && event.pointerId !== state.pointerId)) return;
  state.dragging = false;
  if (state.pointerId != null) cropStage.releasePointerCapture?.(state.pointerId);
  state.pointerId = null;
  renderCrop({ updatePreview: true });
}

cropStage.addEventListener('pointerup', finishDrag);
cropStage.addEventListener('pointercancel', finishDrag);

function updatePublishState() {
  publishButton.disabled = !(
    state.connected &&
    state.profileApiReady &&
    state.sourceImage &&
    state.palette
  );
}

function exportImage() {
  return cropCanvas.toDataURL('image/jpeg', 0.9);
}

publishButton.addEventListener('click', async () => {
  if (!state.profileApiReady || !state.sourceImage) return;
  if (!window.confirm('Update the live site profile picture?')) return;

  publishButton.disabled = true;
  restoreButton.disabled = true;
  publishButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Updating...';
  setPublishStatus('Updating the profile picture through Selina...');

  try {
    const result = await api('/api/site/profile', {
      method: 'POST',
      timeout: 30000,
      body: { imageData: exportImage() }
    });

    setPublishStatus(result.commitUrl
      ? 'Profile picture updated. GitHub Pages may take a short moment to refresh.'
      : 'Profile picture updated successfully.', 'success');
    currentImage.src = `../../assets/pfp.jpg?v=${Date.now()}`;
    state.currentPalette = state.palette;
    renderPalette(currentPalette, state.currentPalette);
  } catch (error) {
    setPublishStatus(error.name === 'AbortError' ? 'The update timed out.' : error.message, 'error');
  } finally {
    publishButton.innerHTML = '<i class="bx bx-upload"></i> Update profile picture';
    restoreButton.disabled = !state.profileApiReady;
    updatePublishState();
  }
});

restoreButton.addEventListener('click', async () => {
  if (!state.profileApiReady) return;
  if (!window.confirm('Restore the previous profile picture?')) return;

  restoreButton.disabled = true;
  publishButton.disabled = true;
  restoreButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Restoring...';
  setPublishStatus('Restoring the previous picture...');

  try {
    await api('/api/site/profile/restore', { method: 'POST', timeout: 30000, body: {} });
    setPublishStatus('Previous profile picture restored.', 'success');
    currentImage.src = `../../assets/pfp.jpg?v=${Date.now()}`;
    previewProfile.src = currentImage.src;
    state.sourceImage = null;
    state.palette = null;
    emptyEditor.hidden = false;
    cropEditor.hidden = true;
    imageInput.value = '';
    renderPalette(newPalette, null);
    previewStatus.textContent = 'Waiting for image';
  } catch (error) {
    setPublishStatus(error.name === 'AbortError' ? 'The restore timed out.' : error.message, 'error');
  } finally {
    restoreButton.innerHTML = '<i class="bx bx-undo"></i> Restore previous';
    restoreButton.disabled = !state.profileApiReady;
    updatePublishState();
  }
});

async function preloadAuth() {
  const base = normalizeBaseUrl(storedDashboardUrl() || settings.apiBase || '');
  if (base) apiUrlInput.value = base;

  await finishDiscordLoginHere();

  if (getDashboardUrl() && storedAccessToken()) {
    await checkSession();
  }
}

renderPalette(newPalette, null);
preloadAuth();
window.addEventListener('beforeunload', clearSourceUrl);
