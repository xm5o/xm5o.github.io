from pathlib import Path


def patch_script_before_body(path: str, script: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if script not in text:
        text = text.replace("</body>", f"  {script}\n</body>", 1)
        file.write_text(text, encoding="utf-8")


index = Path("index.html")
text = index.read_text(encoding="utf-8")

if "css/analytics.css" not in text:
    text = text.replace(
        '<link rel="stylesheet" href="css/loading.css" />',
        '<link rel="stylesheet" href="css/loading.css" />\n  <link rel="stylesheet" href="css/analytics.css" />',
        1,
    )

views_card = """        <div class="site-views-card" aria-label="Site traffic summary">
          <i class="bx bx-show" aria-hidden="true"></i>
          <span>Site Views <strong id="visitorCount" data-value="0">—</strong></span>
          <span class="today-views">Today <strong id="todayVisits">—</strong></span>
        </div>

"""

if 'id="visitorCount"' not in text:
    text = text.replace(
        '        <ul class="footer-nav">',
        views_card + '        <ul class="footer-nav">',
        1,
    )

analytics_script = '  <script type="module" src="scripts/analytics.js"></script>\n'
if 'src="scripts/analytics.js"' not in text:
    text = text.replace(
        '  <script src="scripts/faq.js"></script>\n',
        '  <script src="scripts/faq.js"></script>\n' + analytics_script,
        1,
    )

index.write_text(text, encoding="utf-8")

patch_script_before_body(
    "404.html",
    '<script type="module" src="scripts/analytics.js"></script>',
)
patch_script_before_body(
    "commission/index.html",
    '<script type="module" src="../scripts/analytics.js"></script>',
)
patch_script_before_body(
    "selina/index.html",
    '<script type="module" src="../scripts/analytics.js"></script>',
)

tracker = Path("scripts/analytics.js")
text = tracker.read_text(encoding="utf-8")
text = text.replace("fetch('https://ipapi.co/json/'", "fetch('https://ipwho.is/'")
text = text.replace(
    "if (data?.error) return { ...UNKNOWN_LOCATION };",
    "if (data?.success === false) return { ...UNKNOWN_LOCATION };",
)
text = text.replace(
    "country: data.country_name || 'Unknown',",
    "country: data.country || 'Unknown',",
)
tracker.write_text(text, encoding="utf-8")

privacy = Path("privacy.html")
text = privacy.read_text(encoding="utf-8").replace("ipapi.co", "ipwho.is")
privacy.write_text(text, encoding="utf-8")

checks = {
    "index analytics CSS": "css/analytics.css" in Path("index.html").read_text(encoding="utf-8"),
    "index view counter": 'id="visitorCount"' in Path("index.html").read_text(encoding="utf-8"),
    "index tracker": "scripts/analytics.js" in Path("index.html").read_text(encoding="utf-8"),
    "commission tracker": "../scripts/analytics.js" in Path("commission/index.html").read_text(encoding="utf-8"),
    "selina tracker": "../scripts/analytics.js" in Path("selina/index.html").read_text(encoding="utf-8"),
    "404 tracker": "scripts/analytics.js" in Path("404.html").read_text(encoding="utf-8"),
    "dashboard exists": Path("analytics.html").exists(),
    "tracker uses ipwho.is": "https://ipwho.is/" in Path("scripts/analytics.js").read_text(encoding="utf-8"),
    "tracker has no fingerprinting": "generateDeviceFingerprint" not in Path("scripts/analytics.js").read_text(encoding="utf-8"),
}

failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit("Verification failed: " + ", ".join(failed))

print("All analytics v2 integration checks passed.")
