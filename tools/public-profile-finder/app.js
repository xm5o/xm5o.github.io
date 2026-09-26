const platforms = [
  {
    name: "Instagram",
    profile: u => `https://www.instagram.com/${encodeURIComponent(u)}/`,
    query: u => `"${u}" site:instagram.com`
  },
  {
    name: "TikTok",
    profile: u => `https://www.tiktok.com/@${encodeURIComponent(u)}`,
    query: u => `"${u}" site:tiktok.com`
  },
  {
    name: "Snapchat",
    profile: u => `https://www.snapchat.com/add/${encodeURIComponent(u)}`,
    query: u => `"${u}" site:snapchat.com/add`
  },
  {
    name: "X",
    profile: u => `https://x.com/${encodeURIComponent(u)}`,
    query: u => `"${u}" site:x.com`
  },
  {
    name: "YouTube",
    profile: u => `https://www.youtube.com/@${encodeURIComponent(u)}`,
    query: u => `"${u}" site:youtube.com`
  },
  {
    name: "Twitch",
    profile: u => `https://www.twitch.tv/${encodeURIComponent(u)}`,
    query: u => `"${u}" site:twitch.tv`
  },
  {
    name: "GitHub",
    profile: u => `https://github.com/${encodeURIComponent(u)}`,
    query: u => `"${u}" site:github.com`
  },
  {
    name: "Reddit",
    profile: u => `https://www.reddit.com/user/${encodeURIComponent(u)}/`,
    query: u => `"${u}" site:reddit.com/user`
  },
  {
    name: "Pinterest",
    profile: u => `https://www.pinterest.com/${encodeURIComponent(u)}/`,
    query: u => `"${u}" site:pinterest.com`
  }
];

function cleanUsername(raw) {
  return raw
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "")
    .split(/[/?#]/)[0]
    .trim();
}

function googleSearch(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function render() {
  const username = cleanUsername(document.querySelector("#username").value);
  const alt = cleanUsername(document.querySelector("#altUsername").value);
  const results = document.querySelector("#results");
  const summary = document.querySelector("#summary");

  results.innerHTML = "";

  if (!username) {
    summary.classList.add("hidden");
    return;
  }

  const usernames = [...new Set([username, alt].filter(Boolean))];

  summary.classList.remove("hidden");
  summary.innerHTML = `
    <strong>${usernames.length} username${usernames.length > 1 ? "s" : ""} ready</strong>
    <p>Open candidate profiles, compare public display names, profile photos, bios and links, then mark only matches you verify yourself.</p>
  `;

  for (const u of usernames) {
    for (const platform of platforms) {
      const template = document.querySelector("#resultTemplate");
      const card = template.content.cloneNode(true);

      card.querySelector(".platform").textContent = platform.name;
      card.querySelector(".handle").textContent = `@${u}`;
      card.querySelector(".profileLink").href = platform.profile(u);
      card.querySelector(".searchLink").href = googleSearch(platform.query(u));

      const checkbox = card.querySelector(".confirmed");
      const status = card.querySelector(".status");

      checkbox.addEventListener("change", () => {
        status.textContent = checkbox.checked ? "Confirmed by you" : "Candidate";
      });

      results.appendChild(card);
    }
  }
}

document.querySelector("#searchBtn").addEventListener("click", render);
document.querySelector("#username").addEventListener("keydown", e => {
  if (e.key === "Enter") render();
});
document.querySelector("#altUsername").addEventListener("keydown", e => {
  if (e.key === "Enter") render();
});