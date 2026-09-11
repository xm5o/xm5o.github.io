from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
index_path = ROOT / 'index.html'
style_path = ROOT / 'css' / 'style.css'
contact_path = ROOT / 'css' / 'contact.css'


def sub_once(text, pattern, replacement, label, flags=0):
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, got {count}')
    return updated


index = index_path.read_text(encoding='utf-8')

# Move the large inline About tab controller out of <head>.
index = sub_once(
    index,
    r'\n\s*<script>\s*// About Me Tab Switching Logic.*?</script>\s*',
    '\n',
    'inline About script',
    re.S,
)

# Restore the Commission CTA while keeping the existing visual language.
index = sub_once(
    index,
    r'<!--\s*(<a href="commission/index\.html" class="cta-btn commission-cta enhanced-btn secondary-btn">.*?</a>)\s*-->',
    r'\1',
    'Commission CTA',
    re.S,
)

# Load the extracted About controller with the rest of the page scripts.
needle = '  <script src="scripts/home.js"></script>\n'
if 'scripts/about.js' not in index:
    if needle not in index:
        raise RuntimeError('Could not find home.js script insertion point')
    index = index.replace(needle, needle + '  <script src="scripts/about.js"></script>\n', 1)

# Remove dead commented UI that is already preserved in Git history.
cleanup_patterns = [
    (r'\n\s*<!-- <link rel="preload".*?-->\s*', '\n', 'old preload comments'),
    (r'\n\s*<!-- <a href="#upcoming".*?-->\s*', '\n', 'old upcoming nav'),
    (r'\n\s*<!-- <div class="mobile-language-toggle">.*?-->\s*', '\n', 'old mobile language toggle'),
    (r'\n\s*<!-- <button id="desktop-language-toggle".*?-->\s*', '\n', 'old desktop language toggle'),
    (r'\n\s*<!-- New Stats Section -->\s*<!-- <div class="hero-stats">.*?-->\s*', '\n', 'old hero stats'),
    (r'\n\s*<!-- Game Collection Section -->\s*<!-- <section class="game-collection".*?</section> -->\s*', '\n', 'old game collection'),
]

for pattern, replacement, label in cleanup_patterns:
    updated, count = re.subn(pattern, replacement, index, count=1, flags=re.S)
    if count == 1:
        index = updated
    elif label in {'old game collection'}:
        # This block may already have been removed in a future edit; that is safe.
        pass
    else:
        print(f'warning: {label} was not found; continuing')

# Trim excessive blank lines created by historical commented blocks.
index = re.sub(r'\n{4,}', '\n\n\n', index)
index_path.write_text(index, encoding='utf-8')

style = style_path.read_text(encoding='utf-8')
style_marker = '/* === 2026 Mobile & Performance Polish === */'
if style_marker not in style:
    style += r'''

/* === 2026 Mobile & Performance Polish === */
/* Keep the existing design, but avoid rendering heavy below-the-fold sections
   until they are close to the viewport. */
@supports (content-visibility: auto) {
  #discord-activity,
  #about,
  #now,
  #services,
  #projects,
  #music,
  #faq,
  #contact,
  .footer {
    content-visibility: auto;
    contain-intrinsic-size: 1px 900px;
  }

  .footer {
    contain-intrinsic-size: 1px 260px;
  }
}

@media (max-width: 768px) {
  .header {
    width: calc(100% - 1.5rem);
    top: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: 1.4rem;
  }

  .logo {
    font-size: clamp(1.85rem, 7vw, 2.35rem);
  }

  .home {
    padding-top: 7rem;
  }

  .cta-group.enhanced-cta {
    gap: 0.8rem;
    margin-top: 1.4rem;
  }

  .cta-group.enhanced-cta .enhanced-btn {
    min-height: 3.2rem;
    padding: 0.85rem 1rem;
  }

  .footer {
    padding-top: 2.25rem;
  }

  .footer-container {
    gap: 1.25rem;
  }

  .site-views-card {
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .header {
    width: calc(100% - 1rem);
    top: 0.5rem;
    padding: 0.75rem 0.9rem;
  }

  .home {
    padding-top: 6.5rem;
  }

  .cta-group.enhanced-cta {
    width: 100%;
  }

  .cta-group.enhanced-cta .enhanced-btn {
    width: 100%;
    justify-content: center;
  }
}
'''
style_path.write_text(style, encoding='utf-8')

contact = contact_path.read_text(encoding='utf-8')
contact_marker = '/* === 2026 Contact Mobile Polish === */'
if contact_marker not in contact:
    contact += r'''

/* === 2026 Contact Mobile Polish === */
@media (max-width: 768px) {
  .contact {
    min-height: auto;
    padding: 4.5rem 4% 2.5rem;
  }

  .contact-container,
  .enhanced-contact-container {
    gap: 1.5rem;
  }

  .secondary-contact,
  .enhanced-secondary-contact {
    gap: 1rem;
    margin-top: 0;
  }

  /* Keep the useful CTA + reply-time message on phones and remove the
     repeated explanatory cards that made the section unnecessarily tall. */
  .secondary-contact > .contact-card,
  .enhanced-secondary-contact > .enhanced-contact-card {
    display: none;
  }

  .enhanced-response-notice {
    width: min(100%, 38rem);
    margin: 0 auto;
    padding: 1rem 1.15rem;
    gap: 0.9rem;
    border-radius: 1.25rem;
  }

  .notice-icon-wrapper {
    width: 3rem;
    height: 3rem;
    min-width: 3rem;
  }

  .notice-text,
  .enhanced-notice-text {
    font-size: clamp(1rem, 4vw, 1.1rem);
    line-height: 1.45;
  }

  .floating-contact-elements {
    display: none;
  }
}

@media (max-width: 600px) {
  .contact .discord-features.enhanced-features {
    display: none;
  }

  .enhanced-discord-cta {
    margin-top: 1rem;
  }
}
'''
contact_path.write_text(contact, encoding='utf-8')

# Lightweight sanity checks before the workflow commits anything.
final_index = index_path.read_text(encoding='utf-8')
assert 'scripts/about.js' in final_index
assert 'href="commission/index.html" class="cta-btn commission-cta' in final_index
assert '<!-- <a href="commission/index.html"' not in final_index
assert '// About Me Tab Switching Logic' not in final_index
assert final_index.count('<html') == 1 and final_index.count('</html>') == 1
assert final_index.count('<body') == 1 and final_index.count('</body>') == 1

print('Mobile & Performance Polish patch applied successfully.')
