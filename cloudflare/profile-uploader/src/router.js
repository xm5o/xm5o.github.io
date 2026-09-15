import baseWorker from './index.js';
import { handleExtended } from './extended.js';

const EXTENDED_PATHS = new Set(['/activity', '/seo', '/snapshots', '/snapshots/restore']);

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function cors(origin, allowed) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
  if (origin && origin === allowed) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return headers;
}

function json(data, status, origin, allowed) {
  return new Response(JSON.stringify(data), { status, headers: cors(origin, allowed) });
}

function bearer(request) {
  return String(request.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
}

async function safeEqual(a, b) {
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(a || ''))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(b || '')))
  ]);
  const x = new Uint8Array(left);
  const y = new Uint8Array(right);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!EXTENDED_PATHS.has(url.pathname)) return baseWorker.fetch(request, env);

    const origin = normalizeOrigin(request.headers.get('Origin'));
    const allowed = normalizeOrigin(env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      if (!origin || origin !== allowed) return json({ ok: false, error: 'Origin not allowed.' }, 403, origin, allowed);
      return new Response(null, { status: 204, headers: cors(origin, allowed) });
    }

    if (origin && origin !== allowed) return json({ ok: false, error: 'Origin not allowed.' }, 403, origin, allowed);
    for (const key of ['GITHUB_TOKEN', 'ADMIN_KEY', 'GITHUB_REPO', 'GITHUB_BRANCH', 'PROFILE_PATH', 'ALLOWED_ORIGIN']) {
      if (!String(env[key] || '').trim()) return json({ ok: false, error: `Worker setup is incomplete: ${key}` }, 503, origin, allowed);
    }

    if (!(await safeEqual(bearer(request), env.ADMIN_KEY))) {
      return json({ ok: false, error: 'Invalid publisher key.' }, 401, origin, allowed);
    }

    return (await handleExtended(request, env, origin, allowed)) || json({ ok: false, error: 'Not found.' }, 404, origin, allowed);
  }
};
