import { getWorkoutLogs, readinessRecommendation, saveReadiness, saveWorkoutLog } from "../appStore.js";

export function openWorkoutModal(workout, onSaved = () => {}) {
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
        <form id="workout-log-form">
            <fieldset class="readiness-fieldset"><legend>Today’s readiness</legend>${range("Energy", "energy", 3)}${range("Sleep quality", "sleep", 3)}${range("Soreness", "soreness", 2)}${range("Stress", "stress", 2)}${range("Pain", "pain", 1)}</fieldset>
            <div id="readiness-guidance" class="readiness-guidance"></div>
            ${previousLog ? progressionBanner(previousLog) : ""}
            <fieldset><legend>Exercises</legend>${previousLog?'<p class="previous-session-note">Previous performance is shown beneath each exercise.</p>':""}<div class="modal-exercises">${workout.exercises.map((exercise, index) => exerciseRow(exercise, index,previousLog)).join("") || "<p>No exercises listed.</p>"}</div></fieldset>
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
    const renderTime = () => { clock.textContent = `${String(Math.floor(elapsedSeconds / 60)).padStart(2,"0")}:${String(elapsedSeconds % 60).padStart(2,"0")}`; restStatus.textContent = restSeconds ? `Rest: ${restSeconds}s` : ""; };
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
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", event => { if (event.target === modal) close(); });
    const save = status => {
        const { values, recommendation } = updateGuidance();
        const completedExercises = form.querySelectorAll('input[name="exercise"]:checked').length;
        const exerciseDetails = [...form.querySelectorAll(".modal-exercise")].map(row => ({
            name: row.dataset.exerciseName,
            completed: row.querySelector('[name="exercise"]').checked,
            actualSets: Number(row.querySelector('[name="actualSets"]').value || 0),
            actualReps: row.querySelector('[name="actualReps"]').value,
            load: row.querySelector('[name="load"]').value
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
function exerciseRow(exercise, index, previousLog) { const previous=previousLog?.exerciseDetails?.find(item=>item.name===exercise.name);return `<div class="modal-exercise" data-exercise-name="${escapeHtml(exercise.name)}"><label class="exercise-check"><input type="checkbox" name="exercise" value="${index}"><span><strong class="exercise-title">${escapeHtml(exercise.name)}</strong><small>${escapeHtml(`${exercise.sets} sets • ${exercise.reps} • ${exercise.rest} rest`)}</small>${previous?`<small class="previous-value">Last: ${escapeHtml(previous.actualSets)} × ${escapeHtml(previous.actualReps)} ${previous.load?`· ${escapeHtml(previous.load)}`:""}</small>`:""}<small class="substitution-reason"></small></span></label><button class="substitute-button" data-substitute type="button">Replace exercise</button><div class="actual-performance"><label>Sets<input name="actualSets" type="number" min="0" max="20" value="${Number(exercise.sets) || ""}" inputmode="numeric"></label><label>Reps / time<input name="actualReps" value="${escapeHtml(exercise.reps)}"></label><label>Load<input name="load" placeholder="${escapeHtml(previous?.load||"e.g. 40 kg")}"></label></div></div>`; }
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
