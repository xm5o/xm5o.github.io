/**
 * Auto Theme From Profile Picture
 * Reads the profile picture, finds its dominant color (like Discord/Spotify
 * do for album art / avatars), and applies it to the site's CSS variables:
 * --main-color, --secondary-color, --accent-color, and their *-rgb versions.
 *
 * Runs once per page load. Falls back silently to the default colors already
 * set in css/style.css if anything goes wrong (no image, canvas blocked, etc).
 */

class ProfilePictureTheme {
  constructor(imageSelector = '.profile-img') {
    this.imageSelector = imageSelector;
    this.sampleSize = 48; // downscale for fast, cheap pixel sampling
    this.init();
  }

  init() {
    const img = document.querySelector(this.imageSelector);
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      this.extractAndApply(img);
    } else {
      img.addEventListener('load', () => this.extractAndApply(img), { once: true });
    }
  }

  extractAndApply(img) {
    try {
      const dominant = this.getDominantColor(img);
      if (!dominant) return;

      const palette = this.buildPalette(dominant);
      this.applyPalette(palette);
    } catch (err) {
      // Canvas can throw on cross-origin images, corrupted files, etc.
      // Site already looks fine with its default colors, so just stop quietly.
      console.warn('Profile picture theming skipped:', err);
    }
  }

  getDominantColor(img) {
    const canvas = document.createElement('canvas');
    canvas.width = this.sampleSize;
    canvas.height = this.sampleSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, this.sampleSize, this.sampleSize);

    const { data } = ctx.getImageData(0, 0, this.sampleSize, this.sampleSize);

    // Bucket colors together (like a mini version of what Discord/Spotify do)
    // instead of a flat average, so one dominant hue wins instead of the
    // whole image blending into grey-brown mush.
    const buckets = new Map();
    const bucketSize = 24; // group nearby shades together

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue; // skip transparent pixels

      // Skip near-white / near-black / very desaturated pixels —
      // these are usually background, not the interesting part of the pic
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

      const weight = 1 + saturation * 2; // favor more colorful pixels
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

    // Keep the color readable against a near-black background:
    // not too dark (invisible), not too washed out (blinding), decent saturation.
    const main = this.hslToRgb(hsl.h, Math.max(hsl.s, 0.35), this.clamp(hsl.l, 0.42, 0.62));
    const secondary = this.hslToRgb((hsl.h + 18) % 360, Math.max(hsl.s * 0.9, 0.3), this.clamp(hsl.l + 0.12, 0.5, 0.72));
    const accent = this.hslToRgb((hsl.h - 24 + 360) % 360, Math.max(hsl.s * 0.8, 0.25), this.clamp(hsl.l - 0.16, 0.25, 0.4));

    return { main, secondary, accent };
  }

  applyPalette({ main, secondary, accent }) {
    const root = document.documentElement.style;

    root.setProperty('--main-color', this.toHex(main));
    root.setProperty('--secondary-color', this.toHex(secondary));
    root.setProperty('--accent-color', this.toHex(accent));

    root.setProperty('--main-color-rgb', `${main.r}, ${main.g}, ${main.b}`);
    root.setProperty('--secondary-color-rgb', `${secondary.r}, ${secondary.g}, ${secondary.b}`);
    root.setProperty('--accent-color-rgb', `${accent.r}, ${accent.g}, ${accent.b}`);
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
