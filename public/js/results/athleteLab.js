import { getAppData, getPersonalRecords, getReadiness, getTrainingLoad, getWorkoutLogs, updateAthleteLab } from "../appStore.js";
import { muscleGroupsForWorkout } from "./muscleMap.js";

const DAY = 86400000;
const PHASES = ["Foundation", "Build", "Peak", "Deload", "Race"];

const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
const title = value => String(value || "").replace(/\b\w/g, letter => letter.toUpperCase());

export function seasonPhase(data = getAppData()) {
    const phase = data?.athleteLab?.seasonPhase;
    return PHASES.includes(phase) ? phase : "Build";
}

export function eventCountdown(events = [], now = new Date()) {
    return events.filter(event => event?.date && new Date(event.date).getTime() >= now.getTime())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(event => ({ ...event, days: Math.ceil((new Date(event.date).getTime() - now.getTime()) / DAY) }));
}

export function createWeeklyStory(logs = [], readiness = []) {
    const since = Date.now() - 7 * DAY;
    const sessions = logs.filter(log => log.status === "completed" && new Date(log.completedAt).getTime() >= since);
    const averageRpe = sessions.length ? sessions.reduce((sum, item) => sum + Number(item.rpe || 0), 0) / sessions.length : 0;
    const recoveryFlags = readiness.filter(item => new Date(item.recordedAt).getTime() >= since && item.recommendation?.level !== "ready").length;
    if (!sessions.length) return "Your next chapter starts with one logged session. Keep it simple, then let the data tell the story.";
    if (recoveryFlags >= 2) return `${sessions.length} sessions completed while recovery asked for patience. The win this week is smart consistency, not forcing extra volume.`;
    if (averageRpe >= 8) return `${sessions.length} high-intent sessions gave this week real edge. Recover deliberately so the work becomes adaptation.`;
    return `${sessions.length} sessions built quiet momentum. Your effort stayed controlled, which is exactly what makes the next progression sustainable.`;
}

export function projectFuture(logs = [], weeks = 8) {
    const since = Date.now() - 28 * DAY;
    const recent = logs.filter(log => log.status === "completed" && new Date(log.completedAt).getTime() >= since);
    const weeklySessions = recent.length / 4;
    const currentLoad = recent.reduce((sum, log) => sum + Number(log.durationMinutes || 45) * Number(log.rpe || 5), 0) / 4;
    return { weeklySessions: Math.round(weeklySessions * 10) / 10, currentLoad: Math.round(currentLoad), projectedLoad: Math.round(currentLoad * (1 + Math.min(.18, weeks * .022))), weeks };
}

export function muscleBalance(workouts = []) {
    const totals = {};
    workouts.forEach(workout => Object.entries(muscleGroupsForWorkout(workout)).forEach(([muscle, sets]) => { totals[muscle] = (totals[muscle] || 0) + sets; }));
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

export function comparePeriods(logs = [], now = new Date()) {
    const end = now.getTime();
    const period = entries => ({ sessions: entries.length, minutes: entries.reduce((sum, entry) => sum + Number(entry.durationMinutes || 0), 0), load: entries.reduce((sum, entry) => sum + Number(entry.durationMinutes || 45) * Number(entry.rpe || 5), 0) });
    const recent = logs.filter(log => log.status === "completed" && new Date(log.completedAt).getTime() >= end - 7 * DAY && new Date(log.completedAt).getTime() <= end);
    const previous = logs.filter(log => log.status === "completed" && new Date(log.completedAt).getTime() >= end - 14 * DAY && new Date(log.completedAt).getTime() < end - 7 * DAY);
    return { recent: period(recent), previous: period(previous) };
}

export function renderAthleteLab(container, plan, refresh) {
    const data = getAppData();
    const lab = { athlete: {}, events: [], recipes: [], journal: [], confidence: {}, atmosphere: "focus", commentator: true, ...(data.athleteLab || {}) };
    const logs = getWorkoutLogs();
    const readiness = getReadiness();
    const records = getPersonalRecords();
    const phase = seasonPhase(data);
    const events = eventCountdown(lab.events);
    const future = projectFuture(logs);
    const comparison = comparePeriods(logs);
    const balance = muscleBalance(plan.workouts || []);
    const topMuscles = balance.slice(0, 6);
    const highest = Math.max(1, ...topMuscles.map(([, sets]) => sets));
    const load = getTrainingLoad();
    const athleteName = lab.athlete.displayName || "Athlete";
    const activeEvent = events[0];

    container.innerHTML = `
        <section class="lab-shell" data-atmosphere="${escapeHtml(lab.atmosphere)}">
            <header class="lab-hero">
                <div class="lab-orb lab-orb-one" aria-hidden="true"></div><div class="lab-orb lab-orb-two" aria-hidden="true"></div>
                <div class="lab-hero-copy"><span class="eyebrow">ATHLETE LAB</span><h2>${escapeHtml(athleteName)}'s performance universe</h2><p>${escapeHtml(lab.athlete.motto || "Train with intent. See the story behind the work.")}</p><div class="lab-hero-actions"><button class="primary-button" type="button" data-lab-action="focus">Enter focus mode</button><button class="secondary-button" type="button" data-lab-action="workout">Start next session</button></div></div>
                <div class="athlete-card"><span>ATHLETE CARD</span><strong>${escapeHtml(athleteName)}</strong><p>${escapeHtml(lab.athlete.sport || plan.metadata?.programName || "Multi-discipline training")}</p><dl><div><dt>Phase</dt><dd>${escapeHtml(phase)}</dd></div><div><dt>7 day load</dt><dd>${load.recentLoad}</dd></div><div><dt>Streak</dt><dd>${recentStreak(logs)} days</dd></div></dl></div>
            </header>

            <div class="lab-command-grid" aria-label="Athlete Lab shortcuts">
                <button type="button" data-lab-action="calendar"><b>↗</b><span>Season map</span><small>Plan the next move</small></button>
                <button type="button" data-lab-action="coach"><b>✦</b><span>Coach studio</span><small>Shape your programme</small></button>
                <button type="button" data-lab-action="activity"><b>◷</b><span>Workout replay</span><small>Relive the work</small></button>
                <button type="button" data-lab-action="toolkit"><b>+</b><span>Build a challenge</span><small>Give this block a mission</small></button>
            </div>

            <div class="lab-grid lab-primary-grid">
                <section class="lab-panel season-panel"><div class="panel-heading"><div><span class="eyebrow">SEASON MAP</span><h3>Your phase, on purpose</h3></div><span class="phase-pill">${escapeHtml(phase)}</span></div><div class="phase-rail">${PHASES.map(item => `<button type="button" data-phase="${item}" class="${item === phase ? "is-active" : ""}"><i></i>${item}</button>`).join("")}</div><p>${phaseCopy(phase)}</p>${activeEvent ? `<div class="event-countdown"><span>${activeEvent.days}</span><div><strong>days to ${escapeHtml(activeEvent.name)}</strong><small>${escapeHtml(activeEvent.type || "Event")} · ${new Date(activeEvent.date).toLocaleDateString(undefined, { day:"numeric", month:"short" })}</small></div></div>` : `<p class="lab-muted">Add an event below and the season will have a finish line.</p>`}</section>
                <section class="lab-panel story-panel"><div class="panel-heading"><div><span class="eyebrow">AUTO COMMENTATOR</span><h3>What your week says</h3></div><label class="lab-switch"><input type="checkbox" data-commentator ${lab.commentator ? "checked" : ""}><span></span></label></div><p class="story-quote">“${escapeHtml(lab.commentator ? createWeeklyStory(logs, readiness) : "Commentator is paused. Turn it on whenever you want a plain-language weekly read.")}"</p><div class="story-metrics"><span><b>${comparison.recent.sessions}</b> sessions</span><span><b>${comparison.recent.minutes}</b> mins</span><span><b>${comparison.recent.load}</b> load</span></div></section>
            </div>

            <div class="lab-grid lab-analytics-grid">
                <section class="lab-panel galaxy-panel"><div class="panel-heading"><div><span class="eyebrow">TRAINING LOAD GALAXY</span><h3>Orbit of the last 28 days</h3></div><small>Each star is a completed session</small></div><div class="galaxy" aria-label="Training session galaxy">${galaxy(logs)}</div><div class="galaxy-key"><span><i class="low"></i> easier</span><span><i class="mid"></i> steady</span><span><i class="high"></i> hard</span></div></section>
                <section class="lab-panel readiness-panel"><div class="panel-heading"><div><span class="eyebrow">READINESS RADAR</span><h3>Today's signal</h3></div><span class="readiness-score">${readinessScore(readiness)}</span></div>${radar(readiness.at(-1))}<p class="lab-muted">A visual check-in, not medical advice. Let pain and fatigue override the numbers.</p></section>
                <section class="lab-panel projection-panel"><div class="panel-heading"><div><span class="eyebrow">FUTURE YOU</span><h3>${future.weeks}-week projection</h3></div><span class="estimate-label">estimate</span></div><div class="projection-number"><strong>${future.projectedLoad}</strong><span>weekly load</span></div><div class="projection-bars"><i style="height:${Math.max(16, future.currentLoad / Math.max(1, future.projectedLoad) * 100)}%"></i><i style="height:74%"></i><i style="height:82%"></i><i style="height:90%"></i><i style="height:100%"></i></div><p>At ${future.weeklySessions || 1} sessions/week, a gentle progression could take your average load from ${future.currentLoad} to about ${future.projectedLoad}.</p></section>
            </div>

            <div class="lab-grid lab-two-grid">
                <section class="lab-panel muscle-panel"><div class="panel-heading"><div><span class="eyebrow">MUSCLE BALANCE</span><h3>Where your plan puts its energy</h3></div><button class="text-button" type="button" data-lab-action="workout">Open training</button></div><div class="muscle-balance">${topMuscles.length ? topMuscles.map(([muscle, sets]) => `<div><span>${title(muscle)}</span><i><b style="width:${sets / highest * 100}%"></b></i><strong>${sets}</strong></div>`).join("") : `<p class="lab-muted">Add set-based exercises to see your training balance.</p>`}</div><p class="lab-muted">A set can count for more than one muscle. This shows planned emphasis, not activation.</p></section>
                <section class="lab-panel vault-panel"><div class="panel-heading"><div><span class="eyebrow">PB VAULT</span><h3>Your bright spots</h3></div><button class="text-button" type="button" data-lab-action="activity">View logbook</button></div><div class="pb-list">${personalBests(records)}</div></section>
            </div>

            <div class="lab-grid lab-two-grid">
                <section class="lab-panel replay-panel"><div class="panel-heading"><div><span class="eyebrow">WORKOUT REPLAY</span><h3>Recent sessions, in sequence</h3></div><span>${logs.filter(log => log.status === "completed").length} logged</span></div><div class="replay-timeline">${replay(logs)}</div></section>
                <section class="lab-panel confidence-panel"><div class="panel-heading"><div><span class="eyebrow">EXERCISE CONFIDENCE</span><h3>How at home you feel</h3></div><span>tap to rate</span></div><div class="confidence-list">${(plan.workouts || []).slice(0, 4).map(workout => confidenceRow(workout, lab.confidence?.[workout.name] || 0)).join("") || '<p class="lab-muted">Your next plan will unlock confidence markers.</p>'}</div></section>
            </div>

            <div class="lab-grid lab-two-grid">
                <section class="lab-panel recipes-panel"><div class="panel-heading"><div><span class="eyebrow">WORKOUT RECIPES</span><h3>Keep your favourite formats</h3></div></div><div class="recipe-list">${lab.recipes.length ? lab.recipes.slice(-3).map(recipe => `<article><strong>${escapeHtml(recipe.name)}</strong><p>${escapeHtml(recipe.description || "Saved training recipe")}</p></article>`).join("") : '<p class="lab-muted">Save a session below and it becomes a repeatable recipe.</p>'}</div><form class="lab-inline-form" data-recipe-form><select name="workout">${(plan.workouts || []).map(workout => `<option value="${escapeHtml(workout.name)}">${escapeHtml(workout.name)}</option>`).join("")}</select><button class="secondary-button" type="submit">Save recipe</button></form></section>
                <section class="lab-panel journal-panel"><div class="panel-heading"><div><span class="eyebrow">ATHLETE JOURNAL</span><h3>Keep the detail that data misses</h3></div></div><div class="journal-entry">${lab.journal.length ? escapeHtml(lab.journal.at(-1).text) : "No note yet. Capture what felt useful, difficult or different."}</div><form class="journal-form" data-journal-form><textarea name="note" required maxlength="300" placeholder="One sentence for future you…"></textarea><button class="primary-button" type="submit">Save note</button></form></section>
            </div>

            <section class="lab-panel lab-settings"><div><span class="eyebrow">MAKE IT YOURS</span><h3>Identity, atmosphere and finish lines</h3><p>Everything here stays private to your Athlos account or this browser in demo mode.</p></div><form data-athlete-form><label>Name<input name="displayName" value="${escapeHtml(lab.athlete.displayName)}" placeholder="Your name"></label><label>Sport / identity<input name="sport" value="${escapeHtml(lab.athlete.sport)}" placeholder="e.g. Hybrid athlete"></label><label>Motto<input name="motto" value="${escapeHtml(lab.athlete.motto)}" placeholder="Your training cue"></label><button class="primary-button" type="submit">Update athlete card</button></form><form class="event-form" data-event-form><label>Next event<input name="name" required placeholder="e.g. City Half Marathon"></label><label>Date<input name="date" type="date" required></label><button class="secondary-button" type="submit">Add countdown</button></form><div class="atmosphere-picker"><span>Atmosphere</span>${["focus", "ember", "calm"].map(item => `<button type="button" data-atmosphere="${item}" class="${lab.atmosphere === item ? "is-active" : ""}">${title(item)}</button>`).join("")}</div></section>
        </section>`;

    container.querySelectorAll("[data-lab-action]").forEach(button => button.addEventListener("click", () => {
        const action = button.dataset.labAction;
        if (action === "focus") { container.querySelector(".lab-shell")?.classList.toggle("is-focus"); button.textContent = container.querySelector(".lab-shell")?.classList.contains("is-focus") ? "Exit focus mode" : "Enter focus mode"; return; }
        if (action === "workout") document.querySelector("#start-next-workout-btn")?.click();
        else container.closest(".athlos-dashboard")?.querySelector(`[data-tab="${action}"]`)?.click();
    }));
    container.querySelectorAll("[data-phase]").forEach(button => button.addEventListener("click", () => { updateAthleteLab({ seasonPhase: button.dataset.phase }); refresh(); }));
    container.querySelector("[data-commentator]")?.addEventListener("change", event => { updateAthleteLab({ commentator: event.target.checked }); refresh(); });
    container.querySelectorAll("[data-atmosphere]").forEach(button => button.addEventListener("click", () => { updateAthleteLab({ atmosphere: button.dataset.atmosphere }); refresh(); }));
    container.querySelectorAll("[data-confidence]").forEach(button => button.addEventListener("click", () => { updateAthleteLab({ confidence: { ...lab.confidence, [button.dataset.confidence]: Number(button.dataset.rating) } }); refresh(); }));
    container.querySelector("[data-athlete-form]")?.addEventListener("submit", event => { event.preventDefault(); const values = new FormData(event.currentTarget); updateAthleteLab({ athlete: { displayName: values.get("displayName").trim(), sport: values.get("sport").trim(), motto: values.get("motto").trim() } }); refresh(); });
    container.querySelector("[data-event-form]")?.addEventListener("submit", event => { event.preventDefault(); const values = new FormData(event.currentTarget); updateAthleteLab({ events: [...lab.events, { id: crypto.randomUUID?.() || `event-${Date.now()}`, name: values.get("name").trim(), date: values.get("date"), type: "Event" }] }); refresh(); });
    container.querySelector("[data-recipe-form]")?.addEventListener("submit", event => { event.preventDefault(); const name = new FormData(event.currentTarget).get("workout"); const workout = (plan.workouts || []).find(item => item.name === name); updateAthleteLab({ recipes: [...lab.recipes, { id: crypto.randomUUID?.() || `recipe-${Date.now()}`, name, description: `${workout?.duration || "Focused"} session · ${workout?.type || "Training"}` }] }); refresh(); });
    container.querySelector("[data-journal-form]")?.addEventListener("submit", event => { event.preventDefault(); const note = new FormData(event.currentTarget).get("note").trim(); if (!note) return; updateAthleteLab({ journal: [...lab.journal, { id: crypto.randomUUID?.() || `note-${Date.now()}`, createdAt: new Date().toISOString(), text: note }].slice(-30) }); refresh(); });
}

function phaseCopy(phase) { return { Foundation:"Build movement confidence and make training repeatable.", Build:"Progress the work gradually while keeping recovery in the plan.", Peak:"Sharpen the sessions that matter most and protect freshness.", Deload:"Make room for adaptation. Less is deliberately more.", Race:"Keep the plan simple, trust your preparation and arrive ready." }[phase]; }
function recentStreak(logs) { const days = new Set(logs.filter(log => log.status === "completed").map(log => new Date(log.completedAt).toDateString())); let streak = 0; for (let day = new Date(); days.has(day.toDateString()); day.setDate(day.getDate() - 1)) streak++; return streak; }
function readinessScore(readiness) { const item = readiness.at(-1); if (!item) return "—"; return Math.round(([item.energy, item.sleep, 6 - item.soreness, 6 - item.stress].reduce((sum, value) => sum + Number(value || 3), 0) / 20) * 100); }
function radar(item = {}) { const value = key => Math.max(18, Math.min(100, (Number(item[key] || 3) / 5) * 100)); const points = [[50, 7], [91, 38], [76, 91], [24, 91], [9, 38]].map(([x, y], i) => { const keys = ["energy", "sleep", "soreness", "stress", "pain"]; const adjusted = keys[i] === "soreness" || keys[i] === "stress" || keys[i] === "pain" ? 6 - Number(item[keys[i]] || 3) : Number(item[keys[i]] || 3); const scale = Math.max(.18, Math.min(1, adjusted / 5)); return `${50 + (x - 50) * scale},${50 + (y - 50) * scale}`; }).join(" "); return `<svg class="readiness-radar" viewBox="0 0 100 100" role="img" aria-label="Readiness radar"><polygon points="50,7 91,38 76,91 24,91 9,38"/><polygon class="radar-fill" points="${points}"/><circle cx="50" cy="50" r="3"/><text x="50" y="5">Energy</text><text x="94" y="36">Sleep</text><text x="80" y="97">Low stress</text><text x="0" y="97">Low soreness</text><text x="0" y="36">Low pain</text></svg>`; }
function galaxy(logs) { const sessions = logs.filter(log => log.status === "completed").slice(-18); if (!sessions.length) return '<p class="lab-muted">Log a session to place its star in your training universe.</p>'; return sessions.map((log, index) => { const rpe = Number(log.rpe || 5); const x = 8 + ((index * 37) % 82); const y = 10 + ((index * 23) % 72); return `<button type="button" class="star rpe-${rpe >= 8 ? "high" : rpe >= 6 ? "mid" : "low"}" style="left:${x}%;top:${y}%;--size:${8 + rpe * 1.5}px" title="${escapeHtml(log.workoutName || "Completed session")} · RPE ${rpe}"></button>`; }).join(""); }
function personalBests(records) { const cards = []; if (records.longest) cards.push(["Distance", `${Number(records.longest.distanceKm).toFixed(1)} km`, records.longest.workoutName]); if (records.fastest) cards.push(["Fastest pace", `${Math.floor(records.fastest.pace / 60)}:${String(Math.round(records.fastest.pace % 60)).padStart(2, "0")} /km`, records.fastest.log.workoutName]); records.lifts.slice(0, 2).forEach(lift => cards.push(["Top lift", `${lift.load} kg × ${lift.reps || "—"}`, lift.name])); return cards.length ? cards.map(([label, value, note]) => `<article><span>${label}</span><strong>${value}</strong><small>${escapeHtml(note || "Logged session")}</small></article>`).join("") : '<p class="lab-muted">Complete detailed sets or a distance session to unlock your PB vault.</p>'; }
function replay(logs) { const items = logs.filter(log => log.status === "completed").slice(-5).reverse(); return items.length ? items.map((log, index) => `<article><i style="--height:${Math.max(24, Number(log.rpe || 5) * 11)}%"></i><div><strong>${escapeHtml(log.workoutName || "Training session")}</strong><span>${new Date(log.completedAt).toLocaleDateString(undefined, { weekday:"short", day:"numeric", month:"short" })} · RPE ${log.rpe || "—"}</span></div><b>#${items.length - index}</b></article>`).join("") : '<p class="lab-muted">Your completed sessions will become a replay timeline.</p>'; }
function confidenceRow(workout, rating) { return `<div class="confidence-row"><div><strong>${escapeHtml(workout.name)}</strong><small>${escapeHtml(workout.type || "Training")}</small></div><span>${[1,2,3,4,5].map(value => `<button type="button" class="${value <= rating ? "is-active" : ""}" data-confidence="${escapeHtml(workout.name)}" data-rating="${value}" aria-label="Rate ${escapeHtml(workout.name)} ${value} out of 5">●</button>`).join("")}</span></div>`; }
