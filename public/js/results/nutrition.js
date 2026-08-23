export function renderNutrition(container, nutrition = {}, compact = false) {
    if (!container) return;
    const targets = [["🔥", "Calories", nutrition.calories], ["🥩", "Protein", nutrition.protein], ["🍚", "Carbohydrates", nutrition.carbohydrates], ["🥑", "Fat", nutrition.fat], ["💧", "Hydration", nutrition.hydration]];
    const meals = nutrition.meals || {};
    const ideas = toList(meals.ideas).concat(toList(nutrition.guidance));
    container.innerHTML = `<section class="dashboard-section nutrition-section">
        <div class="section-header"><h2>Nutrition Targets</h2><p>Fuel training and recovery</p></div>
        <div class="nutrition-grid">${targets.map(([icon, title, value]) => nutritionCard(icon, title, value)).join("")}</div>
        ${nutrition.notes ? `<div class="nutrition-coach-card"><h3>Coach Notes</h3><p>${escapeHtml(display(nutrition.notes))}</p></div>` : ""}
        ${compact ? "" : `<div class="meal-grid">${["breakfast", "lunch", "dinner", "snacks"].map(key => mealCard(titleCase(key), meals[key])).join("")}${ideas.length ? mealCard("Meal Ideas", ideas) : ""}</div>`}
    </section>`;
}
function nutritionCard(icon, title, value) { return `<div class="nutrition-card"><div class="nutrition-icon" aria-hidden="true">${icon}</div><div><span>${escapeHtml(title)}</span><strong>${escapeHtml(display(value) || "-")}</strong></div></div>`; }
function mealCard(title, content) { const values = toList(content); return values.length ? `<article class="meal-card"><h4>${escapeHtml(title)}</h4><ul>${values.map(value => `<li>${escapeHtml(display(value))}</li>`).join("")}</ul></article>` : ""; }
function toList(value) { return value == null || value === "" ? [] : (Array.isArray(value) ? value : [value]); }
function titleCase(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function display(value) { if (Array.isArray(value)) return value.map(display).filter(Boolean).join(", "); if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${titleCase(key.replaceAll("_", " "))}: ${display(item)}`).join("; "); return value == null ? "" : String(value); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
