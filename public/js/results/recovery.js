export function renderRecovery(container, recovery = {}) {
    if (!container) return;
    const tips = toList(recovery.recovery_tips || recovery.tips);
    container.innerHTML = `<section class="dashboard-section recovery-section">
        <div class="section-header"><h2>Recovery</h2><p>Optimise adaptation and performance</p></div>
        <div class="recovery-grid">${card("Sleep", recovery.sleep, "🛌")}${card("Mobility", recovery.mobility, "🤸")}${card("Rest Days", recovery.restDays || recovery.rest_days, "🌿")}${card("Injury Management", recovery.injuryManagement || recovery.injury_management, "🩹")}</div>
        ${tips.length ? `<div class="recovery-tips"><h3>Recovery Checklist</h3><div class="tips-list">${tips.map(tip => `<div class="recovery-tip"><span aria-hidden="true">✓</span><p>${escapeHtml(display(tip))}</p></div>`).join("")}</div></div>` : ""}
    </section>`;
}
function card(title, value, icon) { return `<article class="recovery-card"><div class="recovery-icon" aria-hidden="true">${icon}</div><div><span>${escapeHtml(title)}</span><p>${escapeHtml(display(value) || "No information provided.")}</p></div></article>`; }
function toList(value) { return Array.isArray(value) ? value : (value ? [value] : []); }
function display(value) { if (Array.isArray(value)) return value.map(display).join(", "); if (value && typeof value === "object") return Object.values(value).map(display).join("; "); return value == null ? "" : String(value); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
