import { getWorkoutLogs, readinessRecommendation, saveReadiness, saveWorkoutLog } from "../appStore.js";
import { renderMuscleMap } from "./muscleMap.js";

export function openWorkoutModal(workout, onSaved = () => {}) {
    document.querySelector(".tutorial-welcome")?.remove();
    document.querySelector(".tutorial-layer")?.remove();
    const previousLog=getWorkoutLogs().filter(log=>log.workoutName===workout.name&&Array.isArray(log.exerciseDetails)).at(-1);
    const modal = document.createElement("div");
    modal.className = "workout-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", `${workout.name} workout`);
    modal.innerHTML = `<div class="workout-modal-panel">
        <button class="modal-close" type="button" aria-label="Close workout">×</button>
        <div class="modal-heading"><span>${escapeHtml(workout.day)}</span><h2>${escapeHtml(workout.name)}</h2><p>Check your readiness, complete each exercise, then save the session.</p></div>
        <div class="live-timer" aria-live="polite"><div><span>SESSION TIME</span><strong id="session-clock">00:00</strong></div><div class="timer-actions"><button type="button" data-timer="toggle">Start</button><button type="button" data-timer="rest">Rest 60s</button><button type="button" data-timer="reset">Reset</button></div><p id="rest-status"></p></div>
        ${renderMuscleMap(workout)}
        <form id="workout-log-form">
            <fieldset class="readiness-fieldset"><legend>Today’s readiness</legend>${range("Energy", "energy", 3)}${range("Sleep quality", "sleep", 3)}${range("Soreness", "soreness", 2)}${range("Stress", "stress", 2)}${range("Pain", "pain", 1)}</fieldset>
            <div id="readiness-guidance" class="readiness-guidance"></div>
            ${previousLog ? progressionBanner(previousLog) : ""}
            <fieldset><legend>Exercises</legend>${previousLog?'<p class="previous-session-note">Each set shows the matching result from your last session.</p>':""}<div class="modal-exercises">${workout.exercises.map((exercise, index) => exerciseRow(exercise, index,previousLog)).join("") || "<p>No exercises listed.</p>"}</div></fieldset>
            <label class="form-label">Session effort (RPE)<select name="rpe">${Array.from({length:10}, (_, index) => `<option value="${index + 1}" ${index === 6 ? "selected" : ""}>${index + 1}/10</option>`).join("")}</select></label>
            <label class="form-label">Session notes<textarea name="notes" rows="3" placeholder="What felt strong? What should change next time?"></textarea></label>
            <div class="modal-actions"><button class="secondary-button save-progress" type="button">Save progress</button><button class="primary-button" type="submit">Complete workout</button></div>
        </form>
    </div>`;
    document.body.append(modal);
    document.body.classList.add("modal-open");

    const form = modal.querySelector("form");
    const guidance = modal.querySelector("#readiness-guidance");
    let elapsedSeconds = 0;
    let timerId = null;
    let restSeconds = 0;
    const clock = modal.querySelector("#session-clock");
    const restStatus = modal.querySelector("#rest-status");
    const renderTime = () => { clock.textContent = `${String(Math.floor(elapsedSeconds / 60)).padStart(2,"0")}:${String(elapsedSeconds % 60).padStart(2,"0")}`; restStatus.textContent = restSeconds ? `Rest: ${restSeconds}s` : (restStatus.dataset.summary||""); };
    const stopTimer = () => { clearInterval(timerId); timerId = null; modal.querySelector('[data-timer="toggle"]').textContent = "Start"; };
    const startTimer = () => { if (timerId) return; modal.querySelector('[data-timer="toggle"]').textContent = "Pause"; timerId = setInterval(() => { elapsedSeconds += 1; if (restSeconds > 0) restSeconds -= 1; renderTime(); }, 1000); };
    const close = () => { stopTimer(); modal.remove(); document.body.classList.remove("modal-open"); };
    modal.querySelector('[data-timer="toggle"]').addEventListener("click", () => timerId ? stopTimer() : startTimer());
    modal.querySelector('[data-timer="rest"]').addEventListener("click", () => { restSeconds = 60; startTimer(); renderTime(); });
    modal.querySelector('[data-timer="reset"]').addEventListener("click", () => { stopTimer(); elapsedSeconds = 0; restSeconds = 0; renderTime(); });
    const updateGuidance = () => {
        const values = Object.fromEntries(new FormData(form));
        const recommendation = readinessRecommendation(values);
        guidance.className = `readiness-guidance ${recommendation.level}`;
        guidance.innerHTML = `<strong>${escapeHtml(recommendation.title)}</strong><p>${escapeHtml(recommendation.text)}</p><ul>${recommendation.changes.map(change => `<li>${escapeHtml(change)}</li>`).join("")}</ul>`;
        return { values, recommendation };
    };
    form.addEventListener("input", event => {
        if (event.target.type === "range") event.target.closest("label")?.querySelector("output")?.replaceChildren(`${event.target.value}/5`);
        updateGuidance();
    });
    modal.querySelectorAll("[data-substitute]").forEach(button => button.addEventListener("click", () => {
        const row = button.closest(".modal-exercise");
        const current = row.dataset.exerciseName;
        const replacement = substituteExercise(current);
        row.dataset.exerciseName = replacement.name;
        row.querySelector(".exercise-title").textContent = replacement.name;
        row.querySelector(".substitution-reason").textContent = replacement.reason;
        button.textContent = "Replaced";
        button.disabled = true;
    }));
    modal.querySelectorAll("[data-add-set]").forEach(button=>button.addEventListener("click",()=>{const exercise=button.closest(".modal-exercise"),body=exercise.querySelector(".set-rows"),rows=[...body.querySelectorAll(".set-row")],last=rows.at(-1),next=createSetRow(rows.length,{weight:last?.querySelector('[name="setWeight"]')?.value||"",reps:last?.querySelector('[name="setReps"]')?.value||"",rpe:"",type:"working"},null);body.insertAdjacentHTML("beforeend",next);updateWorkoutSummary(modal);body.querySelector(".set-row:last-child [name='setWeight']")?.focus();}));
    modal.addEventListener("click",event=>{const remove=event.target.closest("[data-remove-set]");if(remove){const rows=remove.closest(".set-rows");if(rows.children.length>1)remove.closest(".set-row").remove();updateWorkoutSummary(modal);return;}const complete=event.target.closest("[data-set-complete]");if(complete){complete.closest(".set-row").classList.toggle("complete",complete.checked);if(complete.checked){restSeconds=Number(complete.closest(".modal-exercise").dataset.restSeconds)||60;startTimer();renderTime();}updateWorkoutSummary(modal);}});
    modal.addEventListener("input",()=>updateWorkoutSummary(modal));
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", event => { if (event.target === modal) close(); });
    const save = status => {
        const { values, recommendation } = updateGuidance();
        const completedExercises = [...form.querySelectorAll(".modal-exercise")].filter(row=>[...row.querySelectorAll('[data-set-complete]')].every(input=>input.checked)).length;
        const exerciseDetails = [...form.querySelectorAll(".modal-exercise")].map(row => ({
            name: row.dataset.exerciseName,
            completed: [...row.querySelectorAll('[data-set-complete]')].every(input=>input.checked),
            sets: [...row.querySelectorAll(".set-row")].map(set=>({type:set.querySelector('[name="setType"]').value,weight:set.querySelector('[name="setWeight"]').value,reps:set.querySelector('[name="setReps"]').value,rpe:set.querySelector('[name="setRpe"]').value,completed:set.querySelector('[data-set-complete]').checked})),
            actualSets: row.querySelectorAll('[data-set-complete]:checked').length,
            actualReps: row.querySelector(".set-row:last-child [name='setReps']")?.value||"",
            load: row.querySelector(".set-row:last-child [name='setWeight']")?.value||""
        }));
        saveReadiness({ energy: Number(values.energy), sleep: Number(values.sleep), soreness: Number(values.soreness), stress: Number(values.stress), pain: Number(values.pain), recommendation });
        saveWorkoutLog({ workoutName: workout.name, workoutDay: workout.day, status, completedExercises, totalExercises: workout.exercises.length, exerciseDetails, durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)), rpe: Number(values.rpe), notes: values.notes || "", recommendation });
        close();
        onSaved();
    };
    form.addEventListener("submit", event => { event.preventDefault(); save("completed"); });
    modal.querySelector(".save-progress").addEventListener("click", event => { event.preventDefault(); save("in-progress"); });
    modal.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    updateGuidance();
    updateWorkoutSummary(modal);
    renderTime();
    modal.querySelector(".modal-close").focus();
}

export function progressionSuggestion(previousLog) {
    const exercises = Array.isArray(previousLog?.exerciseDetails) ? previousLog.exerciseDetails : [];
    const completed = exercises.length > 0 && exercises.every(item => item.completed);
    const effort = Number(previousLog?.rpe || 0);
    if (!completed) return { level:"repeat", title:"Repeat before progressing", text:"Complete the planned work with consistent technique before increasing load or volume." };
    if (effort >= 9) return { level:"hold", title:"Hold the current training load", text:"The previous session was very demanding. Repeat or slightly reduce the load rather than progressing today." };
    if (effort > 0 && effort <= 7) return { level:"progress", title:"Small progression available", text:"The previous session was completed at a manageable effort. Add one repetition or approximately 2–5% load while keeping technique consistent." };
    return { level:"repeat", title:"Build another quality exposure", text:"Repeat the planned targets and record effort so Athlos can recommend the next progression." };
}

function progressionBanner(previousLog) { const suggestion=progressionSuggestion(previousLog); return `<aside class="progression-suggestion ${suggestion.level}"><span>NEXT-SESSION GUIDANCE</span><strong>${escapeHtml(suggestion.title)}</strong><p>${escapeHtml(suggestion.text)}</p></aside>`; }

function range(label, name, value) { return `<label class="readiness-control"><span>${label}</span><input type="range" name="${name}" min="1" max="5" value="${value}"><output>${value}/5</output></label>`; }
function exerciseRow(exercise, index, previousLog) { const previous=previousLog?.exerciseDetails?.find(item=>item.name===exercise.name),sets=createInitialSets(exercise,previous);return `<article class="modal-exercise" data-exercise-name="${escapeHtml(exercise.name)}" data-rest-seconds="${parseRest(exercise.rest)}"><header class="exercise-set-heading"><div><span>${index+1}</span><div><strong class="exercise-title">${escapeHtml(exercise.name)}</strong><small>${escapeHtml(exercise.coaching_notes||`${exercise.reps} · ${exercise.rest} rest`)}</small><small class="substitution-reason"></small></div></div><button class="substitute-button" data-substitute type="button">Replace</button></header><div class="set-table-header"><span>Set</span><span>Previous</span><span>kg</span><span>Reps</span><span>RPE</span><span aria-label="Complete">✓</span><span></span></div><div class="set-rows">${sets.map((set,setIndex)=>createSetRow(setIndex,set,previousSet(previous,setIndex))).join("")}</div><button class="add-set-button" data-add-set type="button">＋ Add set</button></article>`; }

export function createInitialSets(exercise,previous) { const count=Math.max(1,Math.min(20,parseInt(exercise?.sets)||previous?.sets?.length||1));return Array.from({length:count},(_,index)=>{const old=previousSet(previous,index);return{type:old?.type||"working",weight:old?.weight??previous?.load??"",reps:old?.reps??exercise?.reps??"",rpe:old?.rpe??"",completed:false};}); }
function previousSet(previous,index){if(Array.isArray(previous?.sets))return previous.sets[index]||null;if(!previous)return null;return index<Number(previous.actualSets||0)?{weight:previous.load,reps:previous.actualReps,type:"working"}:null;}
function createSetRow(index,set,previous){const prior=previous?[previous.weight,previous.reps].filter(value=>value!==""&&value!=null).join(" × "):"—";return `<div class="set-row"><label><span class="sr-only">Set ${index+1} type</span><select name="setType" aria-label="Set ${index+1} type"><option value="working" ${set.type==="working"?"selected":""}>${index+1}</option><option value="warmup" ${set.type==="warmup"?"selected":""}>W</option><option value="drop" ${set.type==="drop"?"selected":""}>D</option><option value="failure" ${set.type==="failure"?"selected":""}>F</option></select></label><span class="previous-set">${escapeHtml(prior)}</span><label><span class="sr-only">Set ${index+1} weight</span><input name="setWeight" inputmode="decimal" value="${escapeHtml(set.weight)}" placeholder="0"></label><label><span class="sr-only">Set ${index+1} repetitions</span><input name="setReps" inputmode="numeric" value="${escapeHtml(set.reps)}" placeholder="0"></label><label><span class="sr-only">Set ${index+1} RPE</span><input name="setRpe" inputmode="decimal" value="${escapeHtml(set.rpe)}" placeholder="—"></label><label class="set-complete"><input data-set-complete type="checkbox" aria-label="Complete set ${index+1}" ${set.completed?"checked":""}><i>✓</i></label><button data-remove-set type="button" aria-label="Remove set ${index+1}">×</button></div>`;}
function parseRest(value){const number=parseInt(value);return Number.isFinite(number)?Math.max(15,Math.min(600,number)):60;}
function updateWorkoutSummary(modal){const rows=[...modal.querySelectorAll(".set-row")],complete=rows.filter(row=>row.querySelector('[data-set-complete]')?.checked),volume=complete.reduce((sum,row)=>sum+(Number(row.querySelector('[name="setWeight"]')?.value)||0)*(Number(row.querySelector('[name="setReps"]')?.value)||0),0);modal.querySelector("#rest-status").dataset.summary=`${complete.length}/${rows.length} sets · ${Math.round(volume).toLocaleString()} kg volume`;if(!restSeconds)modal.querySelector("#rest-status").textContent=modal.querySelector("#rest-status").dataset.summary;}
function substituteExercise(name) {
    const text = String(name).toLowerCase();
    const rules = [
        [/squat|lunge|split squat/, "Supported Reverse Lunge", "Similar knee-dominant pattern with easier balance and load control."],
        [/deadlift|hinge|good morning/, "Cable Pull-through", "Maintains the hip-hinge pattern with a more manageable loading profile."],
        [/bench|push.?up|press/, "Incline Dumbbell Press", "Preserves horizontal pressing with adjustable range and independent loading."],
        [/row|pull.?up|pulldown/, "Chest-supported Row", "Preserves upper-body pulling while reducing lower-back demand."],
        [/run|stride|interval|sprint/, "Low-impact Bike Intervals", "Preserves the energy-system target with less impact."],
        [/jump|pogo|hop/, "Fast Calf Raise", "Trains lower-leg stiffness without ballistic landing demand."]
    ];
    const match = rules.find(([pattern]) => pattern.test(text));
    return match ? { name: match[1], reason: match[2] } : { name: "Cable or Band Alternative", reason: "Uses the closest available movement pattern with adjustable resistance." };
}
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
