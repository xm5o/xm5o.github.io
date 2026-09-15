import settings from './settings.js?v=20260915-2';

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

const DASHBOARD_URL_KEY = 'immortal-site-manager-dashboard-url';
const ACCESS_TOKEN_SESSION = 'immortal-site-manager-access-token';
const CANVAS_SIZE = 720;
const MAX_SOURCE_SIZE = 18 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const themeEngine = window.ProfilePictureTheme
  ? new window.ProfilePictureTheme('[data-profile-theme-source-never]')
  : null;

const state = {
  connected: false,
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

function storedDashboardUrl() {
  try {
    return normalizeBaseUrl(localStorage.getItem(DASHBOARD_URL_KEY) || '');
  } catch {
    return '';
  }
}

function storedAccessToken() {
  try {
    return String(sessionStorage.getItem(ACCESS_TOKEN_SESSION) || '');
  } catch {
    return '';
  }
}

function saveAccessToken(token) {
  try {
    if (token) sessionStorage.setItem(ACCESS_TOKEN_SESSION, token);
    else sessionStorage.removeItem(ACCESS_TOKEN_SESSION);
  } catch {}
}

function getDashboardUrl() {
  return normalizeBaseUrl(apiUrlInput.value || settings.apiBase || storedDashboardUrl());
}

function setConnection(connected, user = null) {
  state.connected = connected;
  state.user = connected ? user : null;
  connectionState.dataset.state = connected ? 'online' : 'offline';
  connectionState.querySelector('strong').textContent = connected
    ? `Signed in${user?.username ? ` · ${user.username}` : ''}`
    : 'Not signed in';
  restoreButton.disabled = !connected;
  updatePublishState();
}

function setPublishStatus(message, type = '') {
  publishStatus.textContent = message;
  publishStatus.classList.remove('success', 'error');
  if (type) publishStatus.classList.add(type);
}

function clearAuth(message = '') {
  saveAccessToken('');
  setConnection(false);
  loginPanel.hidden = false;
  if (message) loginStatus.textContent = message;
}

function consumeOAuthResult() {
  if (!location.hash) return;
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('site_token');
  const error = params.get('site_error');

  if (token) saveAccessToken(token);
  if (error === 'not_owner') {
    loginStatus.textContent = 'That Discord account is not allowed to manage this site.';
  }

  if (token || error) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
}

async function api(path, options = {}) {
  const base = getDashboardUrl();
  const token = storedAccessToken();
  if (!base || !/^https:\/\//i.test(base)) throw new Error('Add a valid HTTPS dashboard URL.');
  if (!token) throw new Error('Sign in with Discord first.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 15000);

  try {
    const response = await fetch(`${base}${path}`, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      signal: controller.signal
    });

    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      clearAuth(payload.error || 'Your sign-in expired. Sign in again.');
      throw new Error(payload.error || 'Your sign-in expired. Sign in again.');
    }
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function startDiscordLogin() {
  const base = getDashboardUrl();
  if (!/^https:\/\//i.test(base)) {
    loginStatus.textContent = 'Add your Selina dashboard HTTPS URL first.';
    apiUrlInput.focus();
    return;
  }

  try { localStorage.setItem(DASHBOARD_URL_KEY, base); } catch {}

  const returnUrl = `${location.origin}${location.pathname}`;
  const loginUrl = `${base}/auth/login?return=${encodeURIComponent(returnUrl)}`;
  loginStatus.textContent = 'Opening Discord sign in...';
  window.location.assign(loginUrl);
}

async function checkSession() {
  const base = getDashboardUrl();
  const token = storedAccessToken();
  if (!base || !token) return;

  connectButton.disabled = true;
  connectButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Checking...';
  loginStatus.textContent = 'Checking your Discord sign in...';

  try {
    const result = await api('/api/site/profile/status');
    setConnection(true, result.user || null);
    loginPanel.hidden = true;
    setPublishStatus(state.sourceImage
      ? 'Preview ready. You can publish this picture.'
      : 'Choose a new image to continue.');
  } catch (error) {
    if (error.name === 'AbortError') loginStatus.textContent = 'The dashboard did not answer in time.';
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
    setPublishStatus(state.connected
      ? 'Preview ready. Drag or zoom the picture, then publish it.'
      : 'Preview ready. Sign in with Discord before publishing.');
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
  publishButton.disabled = !(state.connected && state.sourceImage && state.palette);
}

function exportImage() {
  return cropCanvas.toDataURL('image/jpeg', 0.9);
}

publishButton.addEventListener('click', async () => {
  if (!state.connected || !state.sourceImage) return;
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
    restoreButton.disabled = !state.connected;
    updatePublishState();
  }
});

restoreButton.addEventListener('click', async () => {
  if (!state.connected) return;
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
    restoreButton.disabled = !state.connected;
    updatePublishState();
  }
});

function preloadAuth() {
  consumeOAuthResult();
  const base = normalizeBaseUrl(settings.apiBase || storedDashboardUrl());
  if (base) apiUrlInput.value = base;
  if (base && storedAccessToken()) checkSession();
}

renderPalette(newPalette, null);
preloadAuth();
window.addEventListener('beforeunload', clearSourceUrl);
