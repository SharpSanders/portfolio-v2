const yearEl = document.getElementById("year");
const gridEl = document.getElementById("projectsGrid");
const searchInput = document.getElementById("searchInput");
const tagSelect = document.getElementById("tagSelect");

yearEl.textContent = new Date().getFullYear();

let allProjects = [];
let activeTag = "all";
let activeQuery = "";

async function loadProjects() {
  const res = await fetch("./projects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects.json");
  const data = await res.json();
  allProjects = Array.isArray(data) ? data : [];
  buildTagOptions(allProjects);
  render();
}

function buildTagOptions(projects) {
  const tags = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => tags.add(String(t))));
  const sorted = ["all", ...Array.from(tags).sort((a,b) => a.localeCompare(b))];

  tagSelect.innerHTML = "";
  for (const tag of sorted) {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag === "all" ? "All tags" : tag;
    tagSelect.appendChild(opt);
  }
}

function matches(project) {
  const q = activeQuery.trim().toLowerCase();
  const inText = !q
    ? true
    : [
        project.title,
        project.description,
        ...(project.tags || [])
      ].join(" ").toLowerCase().includes(q);

  const inTag = activeTag === "all"
    ? true
    : (project.tags || []).map(String).includes(activeTag);

  return inText && inTag;
}

function card(project) {
  const title = project.title || "Untitled";
  const desc = project.description || "";
  const tags = project.tags || [];
  const repo = project.repo || "#";
  const live = project.live || "#";
  const img = project.image || "";

  const el = document.createElement("article");
  el.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "thumb";
  if (img) {
    const image = document.createElement("img");
    image.loading = "lazy";
    image.alt = `${title} screenshot`;
    image.src = img;
    thumb.appendChild(image);
  } else {
    thumb.textContent = "No screenshot";
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const titleRow = document.createElement("div");
  titleRow.className = "card-title-row";

  const h3 = document.createElement("h3");
  h3.textContent = title;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = "Featured";

  titleRow.appendChild(h3);
  titleRow.appendChild(badge);

  const p = document.createElement("p");
  p.className = "desc";
  p.textContent = desc;

  const tagWrap = document.createElement("div");
  tagWrap.className = "tags";
  tags.slice(0, 6).forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    tagWrap.appendChild(span);
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const liveBtn = document.createElement("a");
  liveBtn.className = "primary";
  liveBtn.href = live;
  liveBtn.target = "_blank";
  liveBtn.rel = "noreferrer";
  liveBtn.textContent = "Live Demo";

  const repoBtn = document.createElement("a");
  repoBtn.href = repo;
  repoBtn.target = "_blank";
  repoBtn.rel = "noreferrer";
  repoBtn.textContent = "Repo";

  actions.appendChild(liveBtn);
  actions.appendChild(repoBtn);

  body.appendChild(titleRow);
  body.appendChild(p);
  body.appendChild(tagWrap);
  body.appendChild(actions);

  el.appendChild(thumb);
  el.appendChild(body);

  return el;
}

function render() {
  gridEl.innerHTML = "";

  const filtered = allProjects.filter(matches);

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `
      <div class="card-body">
        <h3>No matching projects</h3>
        <p class="desc">Try a different search term or tag filter.</p>
      </div>
    `;
    gridEl.appendChild(empty);
    return;
  }

  filtered.forEach(p => gridEl.appendChild(card(p)));
}

searchInput.addEventListener("input", (e) => {
  activeQuery = e.target.value || "";
  render();
});

tagSelect.addEventListener("change", (e) => {
  activeTag = e.target.value || "all";
  render();
});

loadProjects().catch((err) => {
  gridEl.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h3>Projects failed to load</h3>
        <p class="desc">${String(err.message || err)}</p>
      </div>
    </div>
  `;
});
