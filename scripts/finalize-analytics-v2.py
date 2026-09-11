from pathlib import Path
import subprocess

# Restore the original 404 bytes so the analytics addition does not create a full-file line-ending diff.
main_404 = subprocess.check_output(["git", "show", "origin/main:404.html"])
script = b'  <script type="module" src="scripts/analytics.js"></script>'
if script not in main_404:
    newline = b"\r\n" if b"\r\n" in main_404 else b"\n"
    main_404 = main_404.replace(b"</body>", script + newline + b"</body>", 1)
Path("404.html").write_bytes(main_404)

# Reuse the coarse geolocation result for the current tab session instead of calling the provider on every page.
path = Path("scripts/analytics.js")
text = path.read_text(encoding="utf-8")

text = text.replace(
    "  optOut: 'xm5o_analytics_opt_out'\n});",
    "  optOut: 'xm5o_analytics_opt_out',\n  geo: 'xm5o_analytics_geo_v2'\n});",
)

text = text.replace(
    "function safeStorageSet(key, value) {\n  try { localStorage.setItem(key, value); } catch { /* storage may be disabled */ }\n}\n",
    "function safeStorageSet(key, value) {\n  try { localStorage.setItem(key, value); } catch { /* storage may be disabled */ }\n}\n\nfunction safeSessionGet(key) {\n  try { return sessionStorage.getItem(key); } catch { return null; }\n}\n\nfunction safeSessionSet(key, value) {\n  try { sessionStorage.setItem(key, value); } catch { /* storage may be disabled */ }\n}\n",
)

text = text.replace(
    "async function getCoarseLocation() {\n  const controller = new AbortController();",
    "async function getCoarseLocation() {\n  const cached = safeSessionGet(STORAGE_KEYS.geo);\n  if (cached) {\n    try { return { ...UNKNOWN_LOCATION, ...JSON.parse(cached) }; } catch { /* ignore invalid cache */ }\n  }\n\n  const controller = new AbortController();",
)

text = text.replace(
    """    return {
      country: data.country || 'Unknown',
      countryCode: data.country_code || data.country || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown'
    };""",
    """    const coarseLocation = {
      country: data.country || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown'
    };
    safeSessionSet(STORAGE_KEYS.geo, JSON.stringify(coarseLocation));
    return coarseLocation;""",
)

path.write_text(text, encoding="utf-8")

tracker = path.read_text(encoding="utf-8")
dashboard = Path("analytics.html").read_text(encoding="utf-8")
privacy = Path("privacy.html").read_text(encoding="utf-8")
robots = Path("robots.txt").read_text(encoding="utf-8")

checks = {
    "no fingerprinting": "generateDeviceFingerprint" not in tracker and "canvas.toDataURL" not in tracker,
    "no visitor profile collection": "unique_visitors" not in tracker,
    "raw IP not persisted": "data.ip" not in tracker,
    "coarse geo only": all(field in tracker for field in ["data.country", "data.region", "data.city"]),
    "geo reused per tab session": "sessionStorage" in tracker and "xm5o_analytics_geo_v2" in tracker,
    "privacy opt-out": "xm5o_analytics_opt_out" in tracker and "Disable analytics on this browser" in privacy,
    "dashboard noindex": "noindex,nofollow" in dashboard,
    "dashboard does not track itself": "scripts/analytics.js" not in dashboard,
    "dashboard excluded from robots": "Disallow: /analytics.html" in robots,
    "homepage counter": 'id="visitorCount"' in Path("index.html").read_text(encoding="utf-8"),
    "commission tracked": "../scripts/analytics.js" in Path("commission/index.html").read_text(encoding="utf-8"),
    "selina tracked": "../scripts/analytics.js" in Path("selina/index.html").read_text(encoding="utf-8"),
}

failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit("Final analytics verification failed: " + ", ".join(failed))

print("Final analytics verification passed.")
