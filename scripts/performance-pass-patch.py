from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    data = file_path.read_bytes()
    if old not in data:
        raise SystemExit(f"Missing expected pattern for {label} in {path}")
    file_path.write_bytes(data.replace(old, new, 1))


# Homepage: remove duplicate/blocking resources, defer head scripts, and let the
# small lazy loader start below-the-fold features only when they are needed.
replace_once(
    'index.html',
    b'  <link rel="stylesheet" href="css/discord-activity.css" />\n  <link rel="stylesheet" href="css/contact.css" />\n',
    b'',
    'blocking below-fold styles',
)
replace_once(
    'index.html',
    b'  <link rel="stylesheet" href="css/analytics.css" />\n',
    b'  <link rel="stylesheet" href="css/analytics.css" />\n  <link rel="stylesheet" href="css/performance.css" />\n',
    'performance stylesheet',
)
replace_once(
    'index.html',
    b"  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>\n  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\" />\n<script src=\"scripts/loading.js\"></script>\n  <script src=\"scripts/pfp-theme.js\"></script>\n",
    b"  <link rel='preconnect' href='https://unpkg.com' crossorigin>\n  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>\n  <script src=\"scripts/loading.js\" defer></script>\n  <script src=\"scripts/pfp-theme.js\" defer></script>\n",
    'icon/head scripts',
)
replace_once(
    'index.html',
    b'  <script src="scripts/projects.js"></script>\n  <script src="scripts/discord-activity.js"></script>\n',
    b'',
    'eager project/discord scripts',
)
replace_once(
    'index.html',
    b'  <script src="scripts/faq.js"></script>\n  <script type="module" src="scripts/analytics.js"></script>\n',
    b'  <script src="scripts/faq.js"></script>\n  <script src="scripts/lazy-init.js"></script>\n',
    'lazy loader',
)

# The universal transition applied animated transitions to every DOM node and
# every property. Components already define their own intentional transitions.
style_path = Path('css/style.css')
style = style_path.read_bytes()
for newline in (b'\r\n', b'\n'):
    needle = b'  transition: all 0.2s ease-in-out;' + newline
    if needle in style:
        style_path.write_bytes(style.replace(needle, b'', 1))
        break
else:
    raise SystemExit('Universal transition rule not found')

# Discord status UI only displays whole seconds. Updating progress bars ten
# times per second burns CPU/GPU without a visible benefit.
discord_path = Path('scripts/discord-activity.js')
discord = discord_path.read_bytes()
replacements = [
    (b'progressInterval = setInterval(updateProgress, 100);', b'progressInterval = setInterval(updateProgress, 1000);'),
    (b'activityIntervals[activity.id] = setInterval(updateActivityProgress, 100);', b'activityIntervals[activity.id] = setInterval(updateActivityProgress, 1000);'),
    (
        b"    activitiesContainer.innerHTML = '';\n    \n    const validActivities",
        b"    Object.values(activityIntervals).forEach(interval => clearInterval(interval));\n    activityIntervals = {};\n    activitiesContainer.innerHTML = '';\n    \n    const validActivities",
    ),
    (
        b'    function updateProgress() {\n        const now = Date.now();',
        b'    function updateProgress() {\n        if (document.hidden) return;\n        const now = Date.now();',
    ),
    (
        b'            function updateActivityProgress() {\n                const now = Date.now();',
        b'            function updateActivityProgress() {\n                if (document.hidden) return;\n                const now = Date.now();',
    ),
    (
        b'            function updateActivityTime() {\n                const startTime = activity.created_at;',
        b'            function updateActivityTime() {\n                if (document.hidden) return;\n                const startTime = activity.created_at;',
    ),
]
for old, new in replacements:
    if old not in discord:
        raise SystemExit(f'Discord patch pattern not found: {old[:70]!r}')
    discord = discord.replace(old, new, 1)
discord_path.write_bytes(discord)

print('Performance patch applied successfully')
