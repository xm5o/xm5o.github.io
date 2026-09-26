# Public Profile Finder V2

A mobile-first public-OSINT workspace hosted inside the main GitHub Pages site.

## What changed

V2 is no longer a simple username-link generator.

It accepts multiple public signals:
- Known public usernames
- A public display name
- Exact phrases copied from public bios
- Known public profile or link-hub URLs

It then builds structured search packs for:
- Exact username matches
- Platform-specific searches
- Snapchat public-profile searches
- Limited username punctuation variants
- Linktree, Beacons, Carrd, Solo.to and Bio.link
- Display-name cross-signals
- Exact public bio phrase matches
- Known public URL relationships

The evidence board lets the researcher save public candidate URLs and score visible evidence. A direct public cross-link is weighted much more heavily than a matching username.

Findings are stored locally in the browser and may be exported as JSON.

## Boundaries

This project is designed for public information only.

It intentionally excludes:
- Phone or email reverse lookup
- Leaked or breached databases
- Private-account bypasses
- Authentication/session scraping
- Face recognition or photo matching
- Precise location tracking
- Claims that a username match alone proves account ownership

## Live path

/tools/public-profile-finder/
