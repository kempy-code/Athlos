import { getAppData, getPersonalRecords, savePerformanceTest } from "../appStore.js";
import { renderVirtualGym } from "./virtualGym.js";

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
            <div class="section-header"><span class="lab-kicker">VIRTUAL ORIENTATION</span><h2>Walk through the Athlos Gym</h2><p>Explore a sample gym, approach a checkpoint and learn how to use each station before your first visit.</p></div>
            <div id="virtual-gym-root"></div>
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

    renderVirtualGym(container.querySelector("#virtual-gym-root"), plan);
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

function athleteLevel(data) { const xp = data.workoutLogs.filter(item => item.status === "completed").length * 120 + data.readiness.length * 25 + data.performanceTests.length * 60; return `${Math.floor(xp / 500) + 1}`; }
function trainingFingerprint(data) { const completed = data.workoutLogs.filter(item => item.status === "completed"); return completed.length ? `${completed.length} sessions · ${Math.round(completed.reduce((sum, item) => sum + Number(item.rpe || 0), 0) / completed.length * 10) / 10} avg RPE` : "Complete a workout to reveal it"; }
function nextUnlock(data) { const count = data.workoutLogs.filter(item => item.status === "completed").length; const next = Math.ceil((count + 1) / 5) * 5; return `${next - count} session${next - count === 1 ? "" : "s"} to ${next}-workout badge`; }
function topRecord(data) { const records = getPersonalRecords(); const test = data.performanceTests.at(-1); return records.lifts[0] ? `${records.lifts[0].name} · ${records.lifts[0].load} kg` : records.longest?.distanceKm ? `${Number(records.longest.distanceKm).toFixed(1)} km activity` : test ? `${test.type} · ${test.value} ${test.unit || ""}` : "Add a performance result"; }
function feature(title, value, text) { return `<article class="dashboard-section lab-feature"><span class="lab-kicker">${title}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(text)}</p></article>`; }
function format(value) { return Number(value.toFixed(2)).toString(); }
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
