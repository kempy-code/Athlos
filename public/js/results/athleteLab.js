import { getAppData, getPersonalRecords, savePerformanceTest } from "../appStore.js";

const ZONES = [
    { id: "strength", label: "Strength Deck", icon: "◆", description: "Build force, resilience and movement quality.", tags: ["strength", "squat", "press", "deadlift", "row", "carry"] },
    { id: "speed", label: "Speed Lane", icon: "➜", description: "Develop acceleration, mechanics and repeatable speed.", tags: ["run", "sprint", "speed", "interval", "plyometric"] },
    { id: "engine", label: "Engine Room", icon: "◉", description: "Improve aerobic power and sustainable conditioning.", tags: ["cardio", "cycle", "row", "aerobic", "tempo", "conditioning"] },
    { id: "recovery", label: "Recovery Studio", icon: "≈", description: "Restore range, reduce stiffness and prepare to train.", tags: ["mobility", "stretch", "recovery", "warm", "cool"] }
];

export function renderAthleteLab(container, plan, refresh = () => {}) {
    if (!container) return;
    const data = getAppData();
    const records = buildPBSeries(data.performanceTests);
    container.innerHTML = `<div class="athlete-lab">
        <section class="dashboard-section lab-intro">
            <div><span class="lab-kicker">ATHLOS EXPERIMENTAL</span><h2>Your Athlete Lab</h2><p>Explore training environments, understand your best performances and turn data into the next useful action.</p></div>
            <div class="lab-score"><span>ATHLETE LEVEL</span><strong>${athleteLevel(data)}</strong><small>${data.workoutLogs.filter(item => item.status === "completed").length} sessions logged</small></div>
        </section>
        <section class="dashboard-section gym-section">
            <div class="section-header"><span class="lab-kicker">INTERACTIVE SPACE</span><h2>Explore the Athlos Gym</h2><p>Select a zone to see exercises from your programme that fit its training purpose.</p></div>
            <div class="gym-layout">
                <div class="gym-scene" role="group" aria-label="Interactive gym training zones">
                    <div class="gym-wall"><span>ATHLOS PERFORMANCE LAB</span></div>
                    <div class="gym-floor"></div>
                    ${ZONES.map((zone, index) => `<button class="gym-zone zone-${index + 1}${index === 0 ? " active" : ""}" data-zone="${zone.id}" type="button"><span>${zone.icon}</span><strong>${zone.label}</strong><small>Explore</small></button>`).join("")}
                </div>
                <aside class="zone-panel" aria-live="polite"></aside>
            </div>
        </section>
        <section class="dashboard-section pb-section">
            <div class="section-header"><span class="lab-kicker">PERFORMANCE VAULT</span><h2>Personal best visualiser</h2><p>Log comparable results over time. Athlos highlights improvement and suggests a sensible next target.</p></div>
            <div class="pb-layout">
                <form class="pb-form" id="pb-form">
                    <label>Performance test<select name="type"><option>5 km time trial</option><option>100 m sprint</option><option>Back squat</option><option>Deadlift</option><option>Bench press</option><option>Vertical jump</option></select></label>
                    <div><label>Result<input name="value" type="number" min="0" step="0.01" required placeholder="e.g. 22.5"></label><label>Unit<select name="unit"><option>minutes</option><option>seconds</option><option>kg</option><option>cm</option></select></label></div>
                    <button class="primary-button" type="submit">Add performance</button>
                </form>
                <div class="pb-vault">${renderPBVault(records)}</div>
            </div>
        </section>
        <section class="lab-feature-grid">
            ${feature("Training fingerprint", trainingFingerprint(data), "Your current balance across strength, speed, engine and recovery.")}
            ${feature("Next unlock", nextUnlock(data), "A small milestone chosen from your recent activity.")}
            ${feature("Top record", topRecord(data), "Your strongest recorded workout or benchmark result.")}
        </section>
    </div>`;

    const renderZone = id => {
        const zone = ZONES.find(item => item.id === id) || ZONES[0];
        const exercises = zoneExercises(plan, zone);
        container.querySelector(".zone-panel").innerHTML = `<span class="zone-icon">${zone.icon}</span><span class="lab-kicker">${zone.label.toUpperCase()}</span><h3>${zone.description}</h3><div class="zone-exercises">${exercises.length ? exercises.map(item => `<article><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></article>`).join("") : `<p>No matching exercise is in this plan yet. Ask the AI Coach to add one.</p>`}</div><button type="button" class="secondary-button" data-open-workouts>View full workout library</button>`;
        container.querySelector("[data-open-workouts]")?.addEventListener("click", () => document.querySelector('[data-tab="workouts"]')?.click());
    };
    container.querySelectorAll("[data-zone]").forEach(button => button.addEventListener("click", () => {
        container.querySelectorAll("[data-zone]").forEach(item => item.classList.toggle("active", item === button));
        renderZone(button.dataset.zone);
    }));
    renderZone("strength");
    container.querySelector("#pb-form")?.addEventListener("submit", event => {
        event.preventDefault();
        const result = Object.fromEntries(new FormData(event.currentTarget));
        savePerformanceTest({ ...result, value: Number(result.value) });
        refresh();
        requestAnimationFrame(() => document.querySelector('[data-tab="lab"]')?.click());
    });
    const testSelect = container.querySelector('#pb-form [name="type"]');
    const unitSelect = container.querySelector('#pb-form [name="unit"]');
    testSelect?.addEventListener("change", () => {
        unitSelect.value = /squat|deadlift|press/i.test(testSelect.value) ? "kg" : /jump/i.test(testSelect.value) ? "cm" : /sprint/i.test(testSelect.value) ? "seconds" : "minutes";
    });
}

export function buildPBSeries(tests = []) {
    const groups = new Map();
    tests.forEach(test => {
        const value = Number(test.value);
        if (!test.type || !Number.isFinite(value)) return;
        const key = `${test.type}|${test.unit || ""}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ ...test, value });
    });
    return [...groups.values()].map(values => {
        const latest = values.at(-1), first = values[0];
        const lowerIsBetter = /time|sprint|run/i.test(latest.type) || /second|minute/i.test(latest.unit);
        const best = values.reduce((current, item) => lowerIsBetter ? (item.value < current.value ? item : current) : (item.value > current.value ? item : current));
        const improvement = first.value ? ((lowerIsBetter ? first.value - best.value : best.value - first.value) / first.value) * 100 : 0;
        const target = best.value * (lowerIsBetter ? 0.98 : 1.025);
        return { type: latest.type, unit: latest.unit || "", values, best: best.value, improvement, target, lowerIsBetter };
    }).sort((a, b) => b.values.length - a.values.length);
}

function renderPBVault(series) {
    if (!series.length) return `<div class="pb-empty"><span>↗</span><h3>Your first PB starts here</h3><p>Add a result to unlock progress graphs, comparisons and target projections.</p></div>`;
    return series.map(item => {
        const max = Math.max(...item.values.map(value => value.value), 1);
        return `<article class="pb-card"><div class="pb-card-head"><div><span>${escapeHtml(item.type)}</span><strong>${format(item.best)} ${escapeHtml(item.unit)}</strong></div><em>${item.improvement > 0 ? `+${item.improvement.toFixed(1)}%` : "Baseline"}</em></div><div class="pb-bars">${item.values.slice(-8).map((value, index) => `<span style="height:${Math.max(12, value.value / max * 100)}%" title="Attempt ${index + 1}: ${format(value.value)} ${escapeHtml(item.unit)}"></span>`).join("")}</div><p>Next target <strong>${format(item.target)} ${escapeHtml(item.unit)}</strong> · ${item.values.length} attempt${item.values.length === 1 ? "" : "s"}</p></article>`;
    }).join("");
}

function zoneExercises(plan, zone) {
    const values = [...(plan.exercises || []), ...(plan.workouts || []).flatMap(workout => workout.exercises || [])];
    const unique = new Map();
    values.forEach(value => {
        const item = typeof value === "string" ? { name: value } : value || {};
        const name = item.name || item.exercise || item.title;
        if (!name) return;
        const text = `${name} ${item.type || ""} ${item.notes || ""}`.toLowerCase();
        if (zone.tags.some(tag => text.includes(tag))) unique.set(name, { name, detail: item.sets ? `${item.sets} sets · ${item.reps || item.duration || "quality reps"}` : item.duration || item.reps || "Programme exercise" });
    });
    return [...unique.values()].slice(0, 5);
}
function athleteLevel(data) { const xp = data.workoutLogs.filter(item => item.status === "completed").length * 120 + data.readiness.length * 25 + data.performanceTests.length * 60; return `${Math.floor(xp / 500) + 1}`; }
function trainingFingerprint(data) { const completed = data.workoutLogs.filter(item => item.status === "completed"); return completed.length ? `${completed.length} sessions · ${Math.round(completed.reduce((sum, item) => sum + Number(item.rpe || 0), 0) / completed.length * 10) / 10} avg RPE` : "Complete a workout to reveal it"; }
function nextUnlock(data) { const count = data.workoutLogs.filter(item => item.status === "completed").length; const next = Math.ceil((count + 1) / 5) * 5; return `${next - count} session${next - count === 1 ? "" : "s"} to ${next}-workout badge`; }
function topRecord(data) { const records = getPersonalRecords(); const test = data.performanceTests.at(-1); return records.lifts[0] ? `${records.lifts[0].name} · ${records.lifts[0].load} kg` : records.longest?.distanceKm ? `${Number(records.longest.distanceKm).toFixed(1)} km activity` : test ? `${test.type} · ${test.value} ${test.unit || ""}` : "Add a performance result"; }
function feature(title, value, text) { return `<article class="dashboard-section lab-feature"><span class="lab-kicker">${title}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(text)}</p></article>`; }
function format(value) { return Number(value.toFixed(2)).toString(); }
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
