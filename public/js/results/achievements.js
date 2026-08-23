export function renderAchievements(container, achievements = [], milestones = []) {
    if (!container) return;
    container.innerHTML = `<section class="dashboard-section"><div class="section-header"><h2>Progress & Achievements</h2><p>Track your journey</p></div>
        <h3>Program Milestones</h3><div class="milestone-grid">${cards(milestones, milestoneCard, "No milestones listed yet.")}</div>
        <h3>Achievements</h3><div class="achievement-grid">${cards(achievements, achievementCard, "No achievements listed yet.")}</div>
    </section>`;
}
function cards(values, renderer, fallback) { return Array.isArray(values) && values.length ? values.map(renderer).join("") : `<p>${fallback}</p>`; }
function milestoneCard(value, index) { const item = object(value); const title = item.goal || item.name || item.title || value || `Milestone ${index + 1}`; return `<article class="milestone-card"><strong>${escapeHtml(item.week ? `Week ${item.week}` : `Milestone ${index + 1}`)}</strong><h4>${escapeHtml(display(title))}</h4>${item.measurement ? `<p>${escapeHtml(display(item.measurement))}</p>` : ""}${item.target ? `<span>Target: ${escapeHtml(display(item.target))}</span>` : ""}</article>`; }
function achievementCard(value) { const item = object(value); return `<article class="achievement-card"><div class="achievement-icon" aria-hidden="true">🏆</div><h4>${escapeHtml(display(item.name || item.title || value || "Achievement"))}</h4>${item.description ? `<p>${escapeHtml(display(item.description))}</p>` : ""}${item.requirement ? `<span>${escapeHtml(display(item.requirement))}</span>` : ""}</article>`; }
function object(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function display(value) { return Array.isArray(value) ? value.join(", ") : (value == null ? "" : String(value)); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
