class ProfilePictureTheme {
  constructor(imageSelector = '.profile-img') {
    this.imageSelector = imageSelector;
    this.sampleSize = 48;
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

  run(img) {
    try {
      const dominant = this.getDominantColor(img);
      if (!dominant) return;
      this.applyPalette(this.buildPalette(dominant));
    } catch (error) {
      console.warn('Profile picture theming skipped:', error);
    }
  }

  getDominantColor(img) {
    const canvas = document.createElement('canvas');
    canvas.width = this.sampleSize;
    canvas.height = this.sampleSize;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, this.sampleSize, this.sampleSize);
    const { data } = ctx.getImageData(0, 0, this.sampleSize, this.sampleSize);

    const buckets = new Map();
    const bucketSize = 24;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lightness = (max + min) / 510;
      const saturation = max === min
        ? 0
        : (max - min) / (255 - Math.abs(max + min - 255));

      if (lightness < 0.08 || lightness > 0.92) continue;

      const key = [
        Math.round(r / bucketSize),
        Math.round(g / bucketSize),
        Math.round(b / bucketSize)
      ].join(',');

      const weight = 1 + saturation * 2;
      const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += weight;
      bucket.r += r * weight;
      bucket.g += g * weight;
      bucket.b += b * weight;
      buckets.set(key, bucket);
    }

    if (!buckets.size) return null;

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

    const main = this.hslToRgb(
      hsl.h,
      Math.max(hsl.s, 0.35),
      this.clamp(hsl.l, 0.42, 0.62)
    );

    const secondary = this.hslToRgb(
      (hsl.h + 18) % 360,
      Math.max(hsl.s * 0.9, 0.3),
      this.clamp(hsl.l + 0.12, 0.5, 0.72)
    );

    const accent = this.hslToRgb(
      (hsl.h - 24 + 360) % 360,
      Math.max(hsl.s * 0.8, 0.25),
      this.clamp(hsl.l - 0.16, 0.25, 0.4)
    );

    return { main, secondary, accent };
  }

  applyPalette({ main, secondary, accent }) {
    const style = document.documentElement.style;

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
    const part = (value) => Math.round(value).toString(16).padStart(2, '0');
    return `#${part(r)}${part(g)}${part(b)}`;
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }

    return { h: h * 60, s, l };
  }

  hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;

    if (s === 0) {
      const value = Math.round(l * 255);
      return { r: value, g: value, b: value };
    }

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

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProfilePictureTheme();
});
