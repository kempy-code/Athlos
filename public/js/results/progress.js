import { getPersonalRecords, getProgressSummary, getWeeklyReview, getWorkoutLogs, getReadiness } from "../appStore.js";

export function renderProgress(container, plan) {
    if (!container) return;
    const summary = getProgressSummary(plan.workouts.length);
    const logs = getWorkoutLogs().slice().reverse();
    const readiness = getReadiness().at(-1);
    const review = getWeeklyReview();
    const records = getPersonalRecords();
    const safeBadges=achievementBadges(getWorkoutLogs(),getReadiness());
    container.insertAdjacentHTML("afterbegin", `<section class="dashboard-section progress-summary">
        <div class="section-header"><h2>Training Progress</h2><p>Your completed work and recent feedback</p></div>
        <div class="progress-stat-grid">${stat("Sessions complete", summary.completed)}${stat("Plan completion", `${summary.completionRate}%`)}${stat("Average effort", summary.averageRpe === "-" ? "-" : `${summary.averageRpe}/10`)}${stat("Latest readiness", readiness?.recommendation?.level || "Not checked")}</div>
        <div class="completion-track" aria-label="Plan completion"><span style="width:${summary.completionRate}%"></span></div>
        <article class="weekly-review ${review.tone}"><div><span>ATHLOS WEEKLY REVIEW</span><h3>${weeklyTitle(review.tone)}</h3><p>${escapeHtml(review.message)}</p></div><dl><div><dt>Sessions</dt><dd>${review.sessions}</dd></div><div><dt>Average RPE</dt><dd>${review.averageRpe}</dd></div><div><dt>Adjusted days</dt><dd>${review.reducedDays}</dd></div></dl></article>
        <div class="analytics-panel"><div class="analytics-heading"><div><h3>Performance analytics</h3><p>Explore training volume by sport and time range.</p></div><div><select data-chart-sport aria-label="Filter by sport"><option value="all">All sports</option><option value="run">Running</option><option value="strength">Strength</option><option value="ride">Cycling</option><option value="other">Other</option></select><select data-chart-range aria-label="Filter by date"><option value="28">4 weeks</option><option value="7">7 days</option><option value="3650">All time</option></select></div></div><div class="training-chart" role="img" aria-label="Training minutes chart"></div></div>
        <div class="records-grid">${recordCard("Longest activity",records.longest?.distanceKm?`${Number(records.longest.distanceKm).toFixed(2)} km`:"—")}${recordCard("Best pace",records.fastest?formatPace(records.fastest.pace):"—")}${recordCard("Top strength record",records.lifts[0]?`${records.lifts[0].name} · ${records.lifts[0].load} kg`:"—")}</div>
        <div class="safe-achievements">${safeBadges.map(item=>`<article class="${item.earned?"earned":""}"><span>${item.earned?"✓":"○"}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div>
        <h3>Workout history</h3>
        <div class="workout-history">${logs.length ? logs.map(historyRow).join("") : `<p class="empty-message">Complete your first workout to begin tracking progress.</p>`}</div>
    </section>`);
    const chart=container.querySelector(".training-chart"),sport=container.querySelector("[data-chart-sport]"),range=container.querySelector("[data-chart-range]");
    const draw=()=>renderChart(chart,getWorkoutLogs(),sport.value,Number(range.value));sport.addEventListener("change",draw);range.addEventListener("change",draw);draw();
}
function weeklyTitle(tone) { return tone === "manage" ? "Absorb the work" : tone === "progress" ? "Momentum is building" : "Build the rhythm"; }
function recordCard(label,value){return`<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;}
function formatPace(seconds){const minutes=Math.floor(seconds/60),remainder=Math.round(seconds%60);return`${minutes}:${String(remainder).padStart(2,"0")} /km`;}
function renderChart(container,logs,sport,days){const cutoff=Date.now()-days*86400000;const filtered=logs.filter(log=>new Date(log.completedAt).getTime()>=cutoff&&(sport==="all"||logSport(log)===sport));const buckets=Array.from({length:Math.min(days,28)},(_,index)=>({date:new Date(Date.now()-(Math.min(days,28)-1-index)*86400000),minutes:0}));filtered.forEach(log=>{const key=new Date(log.completedAt).toDateString();const bucket=buckets.find(item=>item.date.toDateString()===key);if(bucket)bucket.minutes+=Number(log.durationMinutes||45);});const max=Math.max(1,...buckets.map(item=>item.minutes));container.innerHTML=`<div class="chart-bars">${buckets.map(item=>`<div class="chart-bar" title="${item.date.toLocaleDateString()}: ${item.minutes} minutes"><span style="height:${Math.max(3,item.minutes/max*100)}%"></span></div>`).join("")}</div><div class="chart-axis"><span>${buckets[0]?.date.toLocaleDateString(undefined,{day:"numeric",month:"short"})||""}</span><span>Training minutes</span><span>Today</span></div>`;}
function logSport(log){const text=`${log.sportType||""} ${log.workoutName||""}`.toLowerCase();if(/run|sprint|interval/.test(text))return"run";if(/ride|cycle|bike/.test(text))return"ride";if(/strength|lift|squat|press/.test(text))return"strength";return"other";}
function achievementBadges(logs,readiness){const week=Date.now()-7*86400000,completed=logs.filter(log=>log.status==="completed"&&new Date(log.completedAt).getTime()>=week),easy=completed.filter(log=>Number(log.rpe)<=5);return[{title:"Consistent athlete",text:"Complete three sessions in seven days.",earned:completed.length>=3},{title:"Recovery respected",text:"Record three readiness check-ins.",earned:readiness.filter(item=>new Date(item.recordedAt).getTime()>=week).length>=3},{title:"Easy means easy",text:"Complete a low-intensity recovery session.",earned:easy.length>=1}];}
function stat(label, value) { return `<div class="progress-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`; }
function historyRow(log) { return `<article class="history-row"><div><strong>${escapeHtml(log.workoutName || "Workout")}</strong><span>${new Date(log.completedAt).toLocaleDateString()} · ${log.status === "in-progress" ? "In progress" : "Complete"}</span></div><div><span>${escapeHtml(log.completedExercises || 0)}/${escapeHtml(log.totalExercises || 0)} exercises</span><strong>RPE ${escapeHtml(log.rpe || "-")}</strong></div></article>`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
