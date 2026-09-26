const PLATFORM_DOMAINS = [
  ["Instagram", "instagram.com"],
  ["TikTok", "tiktok.com"],
  ["Snapchat", "snapchat.com/add"],
  ["X", "x.com"],
  ["YouTube", "youtube.com"],
  ["Twitch", "twitch.tv"],
  ["Reddit", "reddit.com"],
  ["GitHub", "github.com"],
  ["Pinterest", "pinterest.com"],
  ["Threads", "threads.net"],
  ["Tumblr", "tumblr.com"],
  ["SoundCloud", "soundcloud.com"]
];

const DIRECT = {
  Instagram: u => `https://www.instagram.com/${encodeURIComponent(u)}/`,
  TikTok: u => `https://www.tiktok.com/@${encodeURIComponent(u)}`,
  Snapchat: u => `https://www.snapchat.com/add/${encodeURIComponent(u)}`,
  X: u => `https://x.com/${encodeURIComponent(u)}`,
  YouTube: u => `https://www.youtube.com/@${encodeURIComponent(u)}`,
  Twitch: u => `https://www.twitch.tv/${encodeURIComponent(u)}`,
  Reddit: u => `https://www.reddit.com/user/${encodeURIComponent(u)}/`,
  GitHub: u => `https://github.com/${encodeURIComponent(u)}`,
  Pinterest: u => `https://www.pinterest.com/${encodeURIComponent(u)}/`,
  Threads: u => `https://www.threads.net/@${encodeURIComponent(u)}`,
  Tumblr: u => `https://${encodeURIComponent(u)}.tumblr.com/`,
  SoundCloud: u => `https://soundcloud.com/${encodeURIComponent(u)}`
};

let currentQueries = [];
let findings = loadFindings();

function lines(id) {
  return document.getElementById(id).value
    .split(/\n|,/)
    .map(v => v.trim())
    .filter(Boolean);
}

function cleanHandle(v) {
  return v.trim().replace(/^@/, "").replace(/\s+/g, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function variants(handle) {
  const h = cleanHandle(handle);
  const out = [h];
  const compact = h.replace(/[._-]/g, "");
  if (compact && compact !== h) out.push(compact);
  if (h.includes(".")) out.push(h.replace(/\./g, "_"));
  if (h.includes("_")) out.push(h.replace(/_/g, "."));
  if (h.includes("-")) out.push(h.replace(/-/g, "_"));
  return unique(out).slice(0, 4);
}

function searchUrl(query) {
  const e = document.getElementById("engine").value;
  const q = encodeURIComponent(query);
  if (e === "bing") return `https://www.bing.com/search?q=${q}`;
  if (e === "duck") return `https://duckduckgo.com/?q=${q}`;
  return `https://www.google.com/search?q=${q}`;
}

function addQuery(list, group, type, target, query, url = null) {
  const key = `${group}|\u0000|${query}|\u0000|${url || ""}`;
  if (list.some(x => x.key === key)) return;
  list.push({ key, group, type, target, query, url: url || searchUrl(query) });
}

function buildQueries() {
  const handles = unique(lines("usernames").map(cleanHandle));
  const name = document.getElementById("displayName").value.trim();
  const bios = lines("bioPhrases");
  const urls = lines("knownUrls");
  const allVariants = unique(handles.flatMap(variants));

  const q = [];

  for (const handle of handles) {
    addQuery(q, "Exact web matches", "Exact username", `@${handle}`, `"${handle}"`);
    addQuery(q, "Link hubs", "Public link pages", `@${handle}`, `"${handle}" (site:linktr.ee OR site:beacons.ai OR site:carrd.co OR site:solo.to OR site:bio.link)`);

    for (const [platform, domain] of PLATFORM_DOMAINS) {
      addQuery(q, "Platform checks", platform, `@${handle}`, `"${handle}" site:${domain}`, DIRECT[platform] ? DIRECT[platform](handle) : null);
    }
  }

  for (const alt of allVariants) {
    if (handles.includes(alt)) continue;
    addQuery(q, "Username variants", "Variant", `@${alt}`, `"${alt}"`);
    addQuery(q, "Username variants", "Snapchat", `@${alt}`, `"${alt}" site:snapchat.com/add`);
    addQuery(q, "Username variants", "Link hubs", `@${alt}`, `"${alt}" (site:linktr.ee OR site:beacons.ai OR site:carrd.co OR site:solo.to)`);
  }

  if (name) {
    addQuery(q, "Cross-signals", "Display name", name, `"${name}" (${handles.map(h => `"${h}"`).join(" OR ") || "social"} )`);
    for (const [platform, domain] of PLATFORM_DOMAINS) {
      addQuery(q, "Cross-signals", platform, name, `"${name}" site:${domain}`);
    }
  }

  for (const phrase of bios.slice(0, 6)) {
    addQuery(q, "Bio phrase matches", "Exact phrase", phrase, `"${phrase}"`);
    for (const handle of handles.slice(0, 4)) {
      addQuery(q, "Bio phrase matches", "Phrase + username", `@${handle}`, `"${phrase}" "${handle}"`);
    }
  }

  for (const url of urls.slice(0, 10)) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      addQuery(q, "Known-link graph", "Known public URL", host, `"${url}"`, url);
      for (const handle of handles.slice(0, 4)) {
        addQuery(q, "Known-link graph", "URL + username", host, `"${handle}" "${host}"`);
      }
    } catch {}
  }

  currentQueries = q;
  renderSearches(handles, name, bios, urls);
}

function renderSearches(handles, name, bios, urls) {
  const section = document.getElementById("searchSection");
  const findingsSection = document.getElementById("findingsSection");
  section.classList.remove("hidden");
  findingsSection.classList.remove("hidden");

  document.getElementById("queryCount").textContent = `${currentQueries.length} searches`;
  const summary = document.getElementById("signalSummary");
  const signals = [
    `${handles.length} username${handles.length === 1 ? "" : "s"}`,
    name ? "display name" : null,
    bios.length ? `${bios.length} bio phrase${bios.length === 1 ? "" : "s"}` : null,
    urls.length ? `${urls.length} known URL${urls.length === 1 ? "" : "s"}` : null
  ].filter(Boolean);
  summary.innerHTML = signals.map(s => `<span class="signal">${escapeHtml(s)}</span>`).join("");

  renderQueryGroups();
  renderFindings();
}

function renderQueryGroups() {
  const filter = document.getElementById("queryFilter").value.trim().toLowerCase();
  const root = document.getElementById("queryGroups");
  root.innerHTML = "";

  const filtered = currentQueries.filter(x => !filter || [x.group, x.type, x.target, x.query].join(" ").toLowerCase().includes(filter));
  const groups = [...new Set(filtered.map(x => x.group))];

  for (const group of groups) {
    const wrap = document.createElement("section");
    const title = document.createElement("h3");
    title.className = "groupTitle";
    const items = filtered.filter(x => x.group === group);
    title.textContent = `${group} · ${items.length}`;
    wrap.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "groupGrid";

    for (const item of items) {
      const node = document.getElementById("queryTemplate").content.cloneNode(true);
      node.querySelector(".queryType").textContent = item.type;
      node.querySelector(".queryTarget").textContent = item.target;
      node.querySelector(".queryText").textContent = item.query;
      node.querySelector(".queryOpen").href = item.url;
      node.querySelector(".queryCopy").addEventListener("click", async e => {
        await navigator.clipboard.writeText(item.query);
        const b = e.currentTarget;
        const old = b.textContent;
        b.textContent = "Copied";
        setTimeout(() => b.textContent = old, 900);
      });
      grid.appendChild(node);
    }

    wrap.appendChild(grid);
    root.appendChild(wrap);
  }
}

function evidenceScore(data) {
  return (data.linked ? 60 : 0) + (data.handle ? 25 : 0) + (data.name ? 8 : 0) + (data.bio ? 7 : 0);
}

function evidenceLabel(score) {
  if (score >= 60) return "Strong public link";
  if (score >= 30) return "Some supporting evidence";
  return "Weak evidence";
}

function saveFindings() {
  localStorage.setItem("ppf-findings-v2", JSON.stringify(findings));
}

function loadFindings() {
  try { return JSON.parse(localStorage.getItem("ppf-findings-v2") || "[]"); }
  catch { return []; }
}

function renderFindings() {
  const root = document.getElementById("findings");
  root.innerHTML = "";

  if (!findings.length) {
    root.innerHTML = '<p class="privacy">No findings yet. Search first, then add public candidate profiles with the evidence you observed.</p>';
    return;
  }

  findings.slice().sort((a,b) => evidenceScore(b) - evidenceScore(a)).forEach((f, idx) => {
    const score = evidenceScore(f);
    const tags = [];
    if (f.linked) tags.push("public cross-link +60");
    if (f.handle) tags.push("exact handle +25");
    if (f.name) tags.push("display name +8");
    if (f.bio) tags.push("bio phrase +7");

    const card = document.createElement("article");
    card.className = "finding";
    card.innerHTML = `
      <div class="findingTop">
        <div>
          <h3>${escapeHtml(f.platform)} ${f.observed ? "· @" + escapeHtml(f.observed) : ""}</h3>
          <a class="findingUrl" href="${escapeAttr(f.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.url)}</a>
        </div>
        <span class="score">${score}/100 · ${evidenceLabel(score)}</span>
      </div>
      <div class="evidenceList">${tags.map(t => `<span class="evidenceTag">${t}</span>`).join("") || '<span class="evidenceTag">no supporting signal marked</span>'}</div>
      ${f.notes ? `<p class="findingNotes">${escapeHtml(f.notes)}</p>` : ""}
      <div class="findingButtons">
        <a class="buttonLink ghost" href="${escapeAttr(f.url)}" target="_blank" rel="noopener noreferrer">Open</a>
        <button class="ghost deleteFinding" data-id="${f.id}" type="button">Delete</button>
      </div>
    `;
    root.appendChild(card);
  });

  root.querySelectorAll(".deleteFinding").forEach(b => b.addEventListener("click", () => {
    findings = findings.filter(f => String(f.id) !== b.dataset.id);
    saveFindings();
    renderFindings();
  }));
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeAttr(v) { return escapeHtml(v); }

document.getElementById("buildSearches").addEventListener("click", buildQueries);
document.getElementById("queryFilter").addEventListener("input", renderQueryGroups);

document.getElementById("copyAll").addEventListener("click", async () => {
  await navigator.clipboard.writeText(currentQueries.map(x => x.query).join("\n"));
  const b = document.getElementById("copyAll");
  const old = b.textContent;
  b.textContent = "Copied";
  setTimeout(() => b.textContent = old, 900);
});

document.getElementById("findingForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: Date.now(),
    url: document.getElementById("candidateUrl").value.trim(),
    observed: cleanHandle(document.getElementById("candidateHandle").value),
    platform: document.getElementById("candidatePlatform").value,
    linked: document.getElementById("evLinked").checked,
    handle: document.getElementById("evHandle").checked,
    name: document.getElementById("evName").checked,
    bio: document.getElementById("evBio").checked,
    notes: document.getElementById("candidateNotes").value.trim()
  };
  findings.push(data);
  saveFindings();
  e.target.reset();
  renderFindings();
});

document.getElementById("clearFindings").addEventListener("click", () => {
  if (!findings.length) return;
  if (confirm("Clear the local evidence board on this device?")) {
    findings = [];
    saveFindings();
    renderFindings();
  }
});

document.getElementById("exportJson").addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    publicInputs: {
      usernames: unique(lines("usernames").map(cleanHandle)),
      displayName: document.getElementById("displayName").value.trim(),
      bioPhrases: lines("bioPhrases"),
      knownUrls: lines("knownUrls")
    },
    findings: findings.map(f => ({...f, evidenceScore: evidenceScore(f)}))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "public-profile-case.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("loadExample").addEventListener("click", () => {
  document.getElementById("usernames").value = "example.user\nexample_user";
  document.getElementById("displayName").value = "Example";
  document.getElementById("bioPhrases").value = "public phrase from bio";
  document.getElementById("knownUrls").value = "https://instagram.com/example.user";
});

renderFindings();