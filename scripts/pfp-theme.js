const CONFIG = {
  useAI: true,

  groqApiKey: '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',

  endpoint: 'https://api.groq.com/openai/v1/chat/completions',

  model: 'qwen/qwen3.6-27b',

  timeoutMs: 8000,

  cachePrefix: 'pfpTheme:ai:'
};

class ProfilePictureTheme {
  constructor(imageSelector = '.profile-img') {
    this.imageSelector = imageSelector;
    this.sampleSize = 48; // downscale for fast, cheap local pixel sampling
    this.aiSampleSize = 128; // downscale for the AI image payload
    this.init();
  }

  init() {
    const img = document.querySelector(this.imageSelector);
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      this.run(img);
    } else {
      img.addEventListener('load', () => this.run(img), { once: true });
    }
  }

  async run(img) {
    let localPalette = null;
    try {
      const dominant = this.getDominantColor(img);
      if (dominant) {
        localPalette = this.buildPalette(dominant);
        this.applyPalette(localPalette);
      }
    } catch (err) {
      console.warn('Local profile picture theming skipped:', err);
    }

    if (!CONFIG.useAI) return;
    if (!CONFIG.groqApiKey && CONFIG.endpoint.includes('api.groq.com')) {
      return;
    }

    try {
      const aiPalette = await this.getAIPalette(img);
      if (aiPalette) this.applyPalette(aiPalette, { animate: true });
    } catch (err) {
      console.warn('AI profile picture theming skipped:', err);
    }
  }

  getDominantColor(img) {
    const canvas = document.createElement('canvas');
    canvas.width = this.sampleSize;
    canvas.height = this.sampleSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, this.sampleSize, this.sampleSize);

    const { data } = ctx.getImageData(0, 0, this.sampleSize, this.sampleSize);

    const buckets = new Map();
    const bucketSize = 24; // group nearby shades together

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue; // skip transparent pixels

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lightness = (max + min) / 2 / 255;
      const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
      if (lightness < 0.08 || lightness > 0.92) continue;

      const key = [
        Math.round(r / bucketSize),
        Math.round(g / bucketSize),
        Math.round(b / bucketSize)
      ].join(',');

      const weight = 1 + saturation * 2;
      const existing = buckets.get(key);
      if (existing) {
        existing.count += weight;
        existing.r += r * weight;
        existing.g += g * weight;
        existing.b += b * weight;
      } else {
        buckets.set(key, { count: weight, r: r * weight, g: g * weight, b: b * weight });
      }
    }

    if (buckets.size === 0) return null;

    let best = null;
    for (const bucket of buckets.values()) {
      if (!best || bucket.count > best.count) best = bucket;
    }

    return {
      r: Math.round(best.r / best.count),
      g: Math.round(best.g / best.count),
      b: Math.round(best.b / best.count)
    };
  }

  buildPalette({ r, g, b }) {
    const hsl = this.rgbToHsl(r, g, b);

    const main = this.hslToRgb(hsl.h, Math.max(hsl.s, 0.35), this.clamp(hsl.l, 0.42, 0.62));
    const secondary = this.hslToRgb((hsl.h + 18) % 360, Math.max(hsl.s * 0.9, 0.3), this.clamp(hsl.l + 0.12, 0.5, 0.72));
    const accent = this.hslToRgb((hsl.h - 24 + 360) % 360, Math.max(hsl.s * 0.8, 0.25), this.clamp(hsl.l - 0.16, 0.25, 0.4));

    return { main, secondary, accent };
  }

  async getAIPalette(img) {
    const dataUrl = this.imageToDataUrl(img, this.aiSampleSize);
    const cacheKey = CONFIG.cachePrefix + this.hashString(dataUrl);

    const cached = this.readCache(cacheKey);
    if (cached) return cached;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

    const prompt = [
      'Look at this profile picture and design a 3-color theme for a website',
      'that has a near-black background (#0a0a0a) and light text.',
      '',
      'Return ONLY a raw JSON object, no markdown, no code fences, no',
      'explanation, in exactly this shape:',
      '{"main":"#rrggbb","secondary":"#rrggbb","accent":"#rrggbb"}',
      '',
      'Rules:',
      '- "main" should be the color that best represents the picture\'s',
      '  dominant, most characterful hue, adjusted to be clearly legible as',
      '  text/UI color on a near-black background (not too dark, not neon).',
      '- "secondary" should be a lighter, complementary variant of "main".',
      '- "accent" should be a darker, more muted variant for subtle UI',
      '  elements like borders or hover states.',
      '- All three must be valid 6-digit hex colors starting with #.',
      '- Prioritize a color a human would actually call "the picture\'s',
      '  color", not a flat average of every pixel.'
    ].join('\n');

    let response;
    try {
      response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(CONFIG.groqApiKey ? { Authorization: `Bearer ${CONFIG.groqApiKey}` } : {})
        },
        body: JSON.stringify({
          model: CONFIG.model,
          temperature: 0.3,
          max_tokens: 300,
          // qwen3.6-27b is a hybrid thinking model — by default it writes out
          // a long <think>...</think> reasoning block before the actual
          // answer, which was eating the whole max_tokens budget and cutting
          // off before it ever got to the JSON. "none" skips straight to
          // the answer.
          reasoning_effort: 'none',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let detail = '';
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || JSON.stringify(errBody);
      } catch {
        try { detail = await response.text(); } catch { /* ignore */ }
      }
      console.warn('Groq API error body:', detail);
      throw new Error(`Groq API responded with ${response.status}: ${detail}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const palette = this.parsePaletteResponse(raw);
    if (!palette) {
      console.warn('Raw Groq response that failed to parse:', raw);
      throw new Error('Could not parse a valid palette from AI response');
    }

    this.writeCache(cacheKey, palette);
    return palette;
  }

  parsePaletteResponse(raw) {
    if (!raw || typeof raw !== 'string') return null;

    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json|```/g, '')
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return null;
    }

    const toRgb = (hex) => {
      if (typeof hex !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(hex)) return null;
      const clean = hex.replace('#', '');
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
      };
    };

    const main = toRgb(parsed.main);
    const secondary = toRgb(parsed.secondary);
    const accent = toRgb(parsed.accent);
    if (!main || !secondary || !accent) return null;

    return { main, secondary, accent };
  }

  imageToDataUrl(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36);
  }

  readCache(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  writeCache(key, palette) {
    try {
      localStorage.setItem(key, JSON.stringify(palette));
    } catch {
      // Storage full or unavailable, not worth failing over.
    }
  }

  applyPalette({ main, secondary, accent }, { animate = false } = {}) {
    const root = document.documentElement;

    if (animate) {
      root.style.setProperty('--pfp-theme-transition', 'background-color 1.2s ease, color .6s ease, border-color .6s ease');
    }

    const style = root.style;
    style.setProperty('--main-color', this.toHex(main));
    style.setProperty('--secondary-color', this.toHex(secondary));
    style.setProperty('--accent-color', this.toHex(accent));

    style.setProperty('--main-color-rgb', `${main.r}, ${main.g}, ${main.b}`);
    style.setProperty('--secondary-color-rgb', `${secondary.r}, ${secondary.g}, ${secondary.b}`);
    style.setProperty('--accent-color-rgb', `${accent.r}, ${accent.g}, ${accent.b}`);
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  toHex({ r, g, b }) {
    const part = (n) => n.toString(16).padStart(2, '0');
    return `#${part(r)}${part(g)}${part(b)}`;
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return { h, s, l };
  }

  hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pfpTheme = new ProfilePictureTheme('.profile-img');
});