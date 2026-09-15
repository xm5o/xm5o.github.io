const MAX_IMAGE_BYTES = Math.floor(2.5 * 1024 * 1024);
const GITHUB_API_VERSION = '2026-03-10';

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function corsHeaders(origin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff'
  };

  if (origin && origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }

  return headers;
}

function json(data, status, origin, allowedOrigin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin, allowedOrigin)
  });
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
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

  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    diff |= (x[i] || 0) ^ (y[i] || 0);
  }

  return diff === 0;
}

function bearerToken(request) {
  const auth = String(request.headers.get('Authorization') || '');
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'Immortal-Profile-Uploader'
  };
}

function githubContentsUrl(repo, path, ref = '') {
  const encodedPath = String(path)
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  const suffix = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  return `https://api.github.com/repos/${repo}/contents/${encodedPath}${suffix}`;
}

async function getCurrentFile(env) {
  const response = await fetch(
    githubContentsUrl(env.GITHUB_REPO, env.PROFILE_PATH, env.GITHUB_BRANCH),
    { headers: githubHeaders(env.GITHUB_TOKEN) }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.sha) {
    throw new Error(payload.message || `GitHub could not read the current profile image (${response.status}).`);
  }

  return payload;
}

async function updateProfileOnGitHub(env, bytes, currentSha) {
  const response = await fetch(
    githubContentsUrl(env.GITHUB_REPO, env.PROFILE_PATH),
    {
      method: 'PUT',
      headers: {
        ...githubHeaders(env.GITHUB_TOKEN),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update site profile picture',
        content: bytesToBase64(bytes),
        branch: env.GITHUB_BRANCH,
        sha: currentSha
      })
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `GitHub rejected the profile update (${response.status}).`);
  }

  return payload;
}

function validateEnvironment(env) {
  const missing = [];
  for (const key of ['GITHUB_TOKEN', 'ADMIN_KEY', 'GITHUB_REPO', 'GITHUB_BRANCH', 'PROFILE_PATH', 'ALLOWED_ORIGIN']) {
    if (!String(env[key] || '').trim()) missing.push(key);
  }
  return missing;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = normalizeOrigin(request.headers.get('Origin'));
    const allowedOrigin = normalizeOrigin(env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      if (!origin || origin !== allowedOrigin) {
        return json({ ok: false, error: 'Origin not allowed.' }, 403, origin, allowedOrigin);
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigin)
      });
    }

    if (origin && origin !== allowedOrigin) {
      return json({ ok: false, error: 'Origin not allowed.' }, 403, origin, allowedOrigin);
    }

    const missing = validateEnvironment(env);
    if (missing.length) {
      return json(
        { ok: false, error: `Worker setup is incomplete: ${missing.join(', ')}` },
        503,
        origin,
        allowedOrigin
      );
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json(
        {
          ok: true,
          service: 'immortal-profile-uploader',
          repository: env.GITHUB_REPO,
          branch: env.GITHUB_BRANCH,
          path: env.PROFILE_PATH
        },
        200,
        origin,
        allowedOrigin
      );
    }

    if (request.method === 'GET' && url.pathname === '/auth-check') {
      const authorized = await safeEqual(bearerToken(request), env.ADMIN_KEY);
      return authorized
        ? json({ ok: true, authorized: true }, 200, origin, allowedOrigin)
        : json({ ok: false, error: 'Invalid publisher key.' }, 401, origin, allowedOrigin);
    }

    if (request.method === 'POST' && url.pathname === '/profile') {
      const authorized = await safeEqual(bearerToken(request), env.ADMIN_KEY);
      if (!authorized) {
        return json({ ok: false, error: 'Invalid publisher key.' }, 401, origin, allowedOrigin);
      }

      const type = String(request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
      if (type !== 'image/jpeg') {
        return json({ ok: false, error: 'Only JPEG profile images are accepted.' }, 415, origin, allowedOrigin);
      }

      const declaredLength = Number(request.headers.get('Content-Length') || 0);
      if (declaredLength > MAX_IMAGE_BYTES) {
        return json({ ok: false, error: 'The prepared image is too large.' }, 413, origin, allowedOrigin);
      }

      const bytes = new Uint8Array(await request.arrayBuffer());
      if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
        return json({ ok: false, error: 'The prepared image is empty or too large.' }, 400, origin, allowedOrigin);
      }

      if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        return json({ ok: false, error: 'The uploaded file is not a valid JPEG.' }, 400, origin, allowedOrigin);
      }

      try {
        const current = await getCurrentFile(env);
        const result = await updateProfileOnGitHub(env, bytes, current.sha);

        return json(
          {
            ok: true,
            commitUrl: result?.commit?.html_url || null,
            sha: result?.content?.sha || null
          },
          200,
          origin,
          allowedOrigin
        );
      } catch (error) {
        console.error('[ProfileUploader]', error);
        return json(
          { ok: false, error: error.message || 'Could not update the profile picture.' },
          502,
          origin,
          allowedOrigin
        );
      }
    }

    return json({ ok: false, error: 'Not found.' }, 404, origin, allowedOrigin);
  }
};
