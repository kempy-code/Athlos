import { getAppData, getTrainingLoad, importHealthSamples, saveChallenge, saveGoal, saveNutritionLog, savePerformanceTest, savePlan, saveTrainingBlock, updateAppData, updateGoal } from "../appStore.js";

export function renderToolkit(container, plan, refresh = () => {}) {
    const data = getAppData();
    const load = getTrainingLoad();
    const adaptation = adaptationAdvice(data, load);
    container.innerHTML = `
    <div class="toolkit-stack">
        <section class="dashboard-section adaptive-panel ${adaptation.level}">
            <div class="section-header"><span class="toolkit-kicker">ADAPTIVE ENGINE</span><h2>${escapeHtml(adaptation.title)}</h2><p>${escapeHtml(adaptation.text)}</p></div>
            <div class="adaptation-actions">${adaptation.actions.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            ${adaptation.level!=="ready"?'<button class="adaptive-apply" type="button">Apply adjustment to next session</button>':""}
            <p class="safety-note">General training guidance only. Stop if pain increases and seek qualified medical care when appropriate.</p>
        </section>

        <section class="toolkit-grid">
            <article class="dashboard-section toolkit-card" id="goals-tool">
                <div class="section-header"><h2>Goals</h2><p>Set a measurable target and track its status.</p></div>
                <form class="compact-form" id="goal-form"><label>Goal<input name="title" placeholder="Run 5 km under 22 minutes" required></label><div class="form-pair"><label>Target<input name="target" placeholder="22:00" required></label><label>Target date<input name="targetDate" type="date" required></label></div><button class="primary-button" type="submit">Add goal</button></form>
                <div class="tool-list">${data.goals.length ? data.goals.map(goalCard).join("") : empty("No goals yet.")}</div>
            </article>

            <article class="dashboard-section toolkit-card" id="tests-tool">
                <div class="section-header"><h2>Performance tests</h2><p>Record benchmarks that can guide future training.</p></div>
                <form class="compact-form" id="test-form"><label>Assessment<select name="type"><option>5 km time trial</option><option>Estimated 1RM</option><option>Vertical jump</option><option>Resting heart rate</option><option>Mobility assessment</option></select></label><div class="form-pair"><label>Result<input name="value" placeholder="e.g. 23:14" required></label><label>Unit<input name="unit" placeholder="min, kg, cm, bpm"></label></div><button class="primary-button" type="submit">Save result</button></form>
                <div class="tool-list">${data.performanceTests.slice(-4).reverse().map(testCard).join("") || empty("No tests recorded.")}</div>
            </article>

            <article class="dashboard-section toolkit-card load-card">
                <div class="section-header"><h2>Training load</h2><p>General workload indicators based on duration × RPE.</p></div>
                <div class="load-metrics">${metric("7-day load", load.recentLoad)}${metric("Weekly baseline", load.averageWeekly)}${metric("Load ratio", load.ratio)}${metric("Sessions", load.sessions)}</div>
                <div class="load-gauge"><span style="width:${Math.min(100, Number(load.ratio) * 65)}%"></span></div>
                <p class="safety-note">This is not an injury prediction. Use it alongside how you feel and professional advice.</p>
            </article>

            <article class="dashboard-section toolkit-card" id="nutrition-tool">
                <div class="section-header"><h2>Nutrition & hydration</h2><p>Record daily adherence against your plan.</p></div>
                <form class="compact-form" id="nutrition-form"><div class="form-pair"><label>Water (L)<input name="water" type="number" min="0" max="10" step=".1" required></label><label>Protein (g)<input name="protein" type="number" min="0" max="500"></label></div><label>Daily note<input name="note" placeholder="Meals, energy or appetite"></label><button class="primary-button" type="submit">Log today</button></form>
                <div class="nutrition-today">${nutritionSummary(data.nutritionLogs.at(-1), plan.nutrition)}</div>
            </article>
        </section>

        <section class="dashboard-section planning-section">
            <div class="section-header"><span class="toolkit-kicker">PROGRAMME PHASES</span><h2>Training blocks</h2><p>Organise training around foundation, build, peak, taper and recovery phases.</p></div>
            <form class="block-form" id="block-form"><label>Phase<select name="phase"><option>Foundation</option><option>Build</option><option>Peak</option><option>Taper</option><option>Recovery</option><option>Competition</option></select></label><label>Weeks<input name="weeks" type="number" min="1" max="16" value="4"></label><label>Primary outcome<input name="outcome" placeholder="Build aerobic capacity" required></label><button class="primary-button" type="submit">Add block</button></form>
            <div class="block-timeline">${data.trainingBlocks.length?data.trainingBlocks.map((block,index)=>blockCard(block,index)).join(""):empty("Add your first training phase.")}</div>
        </section>

        <section class="dashboard-section interval-builder-section">
            <div class="section-header"><span class="toolkit-kicker">SESSION BUILDER</span><h2>Create an interval workout</h2><p>Build a repeatable running, cycling, swimming, or cardio session and add it directly to your schedule.</p></div>
            <form class="block-form" id="interval-form"><label>Sport<select name="sport"><option>Running</option><option>Cycling</option><option>Swimming</option><option>Cardio</option></select></label><label>Day<select name="day">${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day=>`<option>${day}</option>`).join("")}</select></label><label>Work interval<input name="work" placeholder="3 min hard" required></label><label>Recovery<input name="recovery" placeholder="2 min easy" required></label><label>Rounds<input name="rounds" type="number" min="1" max="30" value="6" required></label><button class="primary-button" type="submit">Add to schedule</button></form>
        </section>

        <section class="dashboard-section challenge-section">
            <div class="section-header"><span class="toolkit-kicker">CONSISTENCY OVER EXCESS</span><h2>Personal challenges</h2><p>Create targets that reward sustainable training and recovery.</p></div>
            <form class="block-form" id="challenge-form"><label>Challenge<select name="metric"><option value="sessions">Sessions completed</option><option value="distance">Distance (km)</option><option value="recovery">Readiness check-ins</option></select></label><label>Target<input name="target" type="number" min="1" value="4"></label><label>Name<input name="name" placeholder="Consistent training week" required></label><button class="primary-button" type="submit">Create</button></form>
            <div class="block-timeline">${data.challenges.length?data.challenges.map(challengeCard).join(""):empty("No active challenges.")}</div>
        </section>

        <section class="dashboard-section integrations-section">
            <div class="section-header"><span class="toolkit-kicker">CONNECTED HEALTH</span><h2>Devices and health data</h2><p>Use manual exports today, then activate official connections when developer access is approved.</p></div>
            <div class="integration-grid">
                ${integrationCard("Apple Health", "Requires the Athlos iOS companion app and HealthKit permission.", "iPhone bridge required", "apple")}
                ${integrationCard("Garmin Connect", "OAuth connection for activities, sleep, heart rate and training.", "Developer approval required", "garmin")}
                ${integrationCard("File import", "Import an Athlos JSON or simple CSV export without sharing credentials.", `${data.healthSamples.length} samples imported`, "file")}
            </div>
            <div class="import-panel" hidden><label>Choose JSON or CSV export<input id="health-import" type="file" accept=".json,.csv,text/csv,application/json"></label><p id="import-status" role="status"></p></div>
        </section>

        <section class="dashboard-section preferences-section">
            <div class="section-header"><h2>Reminders</h2><p>Choose what Athlos should remind you about.</p></div>
            <div class="preference-grid">${preference("workout","Today’s workout",data.notificationPreferences.workout)}${preference("readiness","Readiness check",data.notificationPreferences.readiness)}${preference("weekly","Weekly review",data.notificationPreferences.weekly)}</div>
            <button class="secondary-button enable-notifications" type="button">Enable browser notifications</button><p class="notification-status" role="status"></p>
        </section>
    </div>`;

    bindForms(container, data, refresh);
    bindIntegrations(container, refresh);
    bindNotifications(container, data);
    container.querySelector("#interval-form").addEventListener("submit",event=>{event.preventDefault();const workout=buildIntervalWorkout(Object.fromEntries(new FormData(event.currentTarget)));savePlan({...plan,workouts:[...(plan.workouts||[]),workout]});refresh();});
    container.querySelector(".adaptive-apply")?.addEventListener("click",()=>{savePlan(adaptPlan(plan,adaptation));refresh();});
}

export function buildIntervalWorkout(values) {
    const rounds=Math.max(1,Math.min(30,Number(values.rounds)||1)),sport=String(values.sport||"Cardio"),work=String(values.work||"Hard effort"),recovery=String(values.recovery||"Easy recovery");
    return { day:String(values.day||"Monday"), name:`${sport} Intervals`, type:sport, purpose:`Develop ${sport.toLowerCase()} fitness with controlled repeat efforts.`, duration:"Custom", warmup:["10 minutes progressive preparation"], exercises:[{name:`${rounds} rounds: ${work} / ${recovery}`,category:"Intervals",equipment:sport,sets:String(rounds),reps:work,rest:recovery,coaching_notes:"Keep early repetitions controlled and finish with consistent technique."}], cooldown:["5–10 minutes easy movement","Refuel and record session effort"], progression:"Add one round only after completing every interval with consistent quality." };
}

function bindForms(container, data, refresh) {
    container.querySelector("#goal-form").addEventListener("submit", event => { event.preventDefault(); saveGoal(Object.fromEntries(new FormData(event.currentTarget))); refresh(); });
    container.querySelector("#test-form").addEventListener("submit", event => { event.preventDefault(); savePerformanceTest(Object.fromEntries(new FormData(event.currentTarget))); refresh(); });
    container.querySelector("#nutrition-form").addEventListener("submit", event => { event.preventDefault(); saveNutritionLog(Object.fromEntries(new FormData(event.currentTarget))); refresh(); });
    container.querySelector("#block-form").addEventListener("submit",event=>{event.preventDefault();saveTrainingBlock(Object.fromEntries(new FormData(event.currentTarget)));refresh();});
    container.querySelector("#challenge-form").addEventListener("submit",event=>{event.preventDefault();saveChallenge(Object.fromEntries(new FormData(event.currentTarget)));refresh();});
    container.querySelectorAll("[data-goal-status]").forEach(button => button.addEventListener("click", () => { updateGoal(button.dataset.goalStatus, { status: "completed", completedAt: new Date().toISOString() }); refresh(); }));
}

function bindIntegrations(container, refresh) {
    const panel = container.querySelector(".import-panel");
    container.querySelector('[data-integration="file"]').addEventListener("click", () => { panel.hidden = !panel.hidden; if (!panel.hidden) container.querySelector("#health-import").focus(); });
    container.querySelector('[data-integration="apple"]').addEventListener("click", event => { event.currentTarget.closest(".integration-card").querySelector("small").textContent = "Install the planned iOS companion to grant HealthKit access."; });
    container.querySelector('[data-integration="garmin"]').addEventListener("click", event => { event.currentTarget.closest(".integration-card").querySelector("small").textContent = "Add Garmin client credentials after programme approval."; });
    container.querySelector("#health-import").addEventListener("change", async event => {
        const file = event.target.files[0]; if (!file) return;
        const status = container.querySelector("#import-status");
        try {
            const text = await file.text();
            const samples = file.name.toLowerCase().endsWith(".json") ? parseJsonExport(text) : parseCsv(text);
            const count = importHealthSamples(samples, file.name.toLowerCase().includes("apple") ? "apple-health-export" : "manual-import");
            status.textContent = `Imported ${count} health samples.`;
            setTimeout(refresh, 500);
        } catch (error) { status.textContent = `Import failed: ${error.message}`; }
    });
}

function bindNotifications(container, data) {
    container.querySelectorAll("[data-preference]").forEach(input => input.addEventListener("change", () => {
        updateAppData({ notificationPreferences: { ...getAppData().notificationPreferences, [input.dataset.preference]: input.checked } });
    }));
    container.querySelector(".enable-notifications").addEventListener("click", async () => {
        const status = container.querySelector(".notification-status");
        if (!("Notification" in window)) { status.textContent = "Notifications are not supported in this browser."; return; }
        const permission = await Notification.requestPermission();
        status.textContent = permission === "granted" ? "Notifications enabled." : "Notifications were not enabled.";
        if (permission === "granted") new Notification("Athlos reminders enabled", { body: "Your training reminders are ready." });
    });
}

function adaptationAdvice(data, load) {
    const latest = data.readiness.at(-1)?.recommendation;
    if (latest?.level === "reduce" || Number(load.ratio) > 1.5) return { level:"reduce", title:"Reduce today’s training load", text:"Recent recovery or workload signals are elevated. Protect the next training block by reducing volume today.", actions:["Remove one working set","Keep effort at RPE 6","Move the next hard session by 24 hours"] };
    if (latest?.level === "adjust" || Number(load.ratio) > 1.25) return { level:"adjust", title:"Train with adjustments", text:"You can train, but a small reduction should improve session quality and recovery.", actions:["Extend the warm-up","Reduce load by 10%","Skip the optional finisher"] };
    return { level:"ready", title:"Plan is on track", text:"Current workload and readiness support completing the planned session.", actions:["Complete planned volume","Log actual performance","Check readiness tomorrow"] };
}

function adaptPlan(plan,adaptation){const workouts=(plan.workouts||[]).map((workout,index)=>{if(index!==0)return workout;const exercises=adaptation.level==="reduce"?(workout.exercises||[]).slice(0,Math.max(1,Math.ceil((workout.exercises||[]).length*.7))):(workout.exercises||[]);return{...workout,name:`${workout.name} · Adjusted`,purpose:`${workout.purpose||""} Athlos adjustment: ${adaptation.actions.join("; ")}.`,exercises};});return{...plan,workouts,adaptationHistory:[...(plan.adaptationHistory||[]),{createdAt:new Date().toISOString(),level:adaptation.level,actions:adaptation.actions}]};}

function goalCard(goal) { const targetDate=goal.targetDate?new Date(`${goal.targetDate}T12:00:00`):null,days=targetDate?Math.ceil((targetDate-Date.now())/86400000):null,overdue=days!==null&&days<0&&goal.status!=="completed",timeline=goal.status==="completed"?"Goal achieved":overdue?`${Math.abs(days)} days overdue`:days===0?"Due today":`${days} days remaining`; return `<article class="tool-row goal-forecast"><div><strong>${escapeHtml(goal.title)}</strong><span>Target ${escapeHtml(goal.target)} · ${escapeHtml(timeline)}</span><div class="goal-track"><i style="width:${goal.status==="completed"?100:Math.max(8,Math.min(92,100-Math.max(0,days||0)))}%"></i></div></div>${goal.status === "completed" ? '<b class="complete-chip">Complete</b>' : `<button data-goal-status="${goal.id}" class="tiny-button" type="button">${overdue ? "Review" : "Mark complete"}</button>`}</article>`; }
function blockCard(block,index){return`<article><span>BLOCK ${index+1}</span><strong>${escapeHtml(block.phase)}</strong><p>${escapeHtml(block.outcome)} · ${escapeHtml(block.weeks)} weeks</p></article>`;}
function challengeCard(item){const data=getAppData(),value=item.metric==="sessions"?data.workoutLogs.filter(log=>log.status==="completed").length:item.metric==="distance"?data.workoutLogs.reduce((sum,log)=>sum+Number(log.distanceKm||0),0):data.readiness.length;const progress=Math.min(100,Math.round(value/Number(item.target)*100));return`<article><span>${progress}% COMPLETE</span><strong>${escapeHtml(item.name)}</strong><p>${Number(value).toFixed(item.metric==="distance"?1:0)} / ${escapeHtml(item.target)} ${escapeHtml(item.metric)}</p></article>`;}
function testCard(test) { return `<article class="tool-row"><div><strong>${escapeHtml(test.type)}</strong><span>${new Date(test.createdAt).toLocaleDateString()}</span></div><b>${escapeHtml(test.value)} ${escapeHtml(test.unit || "")}</b></article>`; }
function metric(label,value){return `<div><span>${label}</span><strong>${value}</strong></div>`;}
function nutritionSummary(log, target){return log ? `<strong>Latest: ${escapeHtml(log.water)} L water · ${escapeHtml(log.protein || "-")} g protein</strong><span>Plan target: ${escapeHtml(target.hydration || "-")} · ${escapeHtml(target.protein || "-")} protein</span>` : "<span>No nutrition entry today.</span>";}
function integrationCard(name,text,status,key){return `<article class="integration-card"><div class="integration-icon">${name[0]}</div><h3>${name}</h3><p>${text}</p><small>${status}</small><button class="secondary-button" data-integration="${key}" type="button">${key === "file" ? "Import file" : "Connection details"}</button></article>`;}
function preference(key,label,checked){return `<label class="preference"><span>${label}</span><input type="checkbox" data-preference="${key}" ${checked ? "checked" : ""}></label>`;}
function empty(message){return `<p class="tool-empty">${message}</p>`;}
function parseJsonExport(text){const parsed=JSON.parse(text);const value=Array.isArray(parsed)?parsed:(parsed.samples||parsed.data||[]);if(!Array.isArray(value))throw new Error("JSON must contain a samples array.");return value;}
function parseCsv(text){const [header,...rows]=text.trim().split(/\r?\n/);if(!header)return[];const keys=header.split(",").map(item=>item.trim());return rows.filter(Boolean).map(row=>Object.fromEntries(row.split(",").map((value,index)=>[keys[index]||`field${index}`,value.trim()])));}
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
