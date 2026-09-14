const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_ORDER = { Morning: 0, Afternoon: 1, Evening: 2, "Any time": 3 };

export function sessionsForDay(workouts, day) {
    return workouts.map((workout, index) => ({ workout, index }))
        .filter(({ workout }) => normaliseDay(workout?.day) === normaliseDay(day))
        .sort((a, b) => (TIME_ORDER[a.workout.time_of_day] ?? 3) - (TIME_ORDER[b.workout.time_of_day] ?? 3));
}

export function moveSession(workouts, index, targetDay, timeOfDay) {
    if (!Number.isInteger(index) || !workouts[index] || !DAYS.includes(targetDay)) return workouts;
    return workouts.map((workout, i) => i === index ? {
        ...workout, day: targetDay, ...(timeOfDay ? { time_of_day: timeOfDay } : {})
    } : workout);
}

// Retain the old helper for callers that explicitly request a day swap.
export function rescheduleWorkouts(workouts, sourceDay, targetDay) {
    const source = sessionsForDay(workouts, sourceDay)[0]?.index;
    const target = sessionsForDay(workouts, targetDay)[0]?.index;
    if (source == null || !DAYS.includes(targetDay) || sourceDay === targetDay) return workouts;
    return workouts.map((workout, index) => index === source ? { ...workout, day: targetDay }
        : index === target ? { ...workout, day: sourceDay } : workout);
}

export function renderCalendar(container, workouts = [], onMove = () => {}) {
    if (!container) return;
    workouts = Array.isArray(workouts) ? workouts : [];
    const matched = new Set(DAYS.flatMap(day => sessionsForDay(workouts, day).map(item => item.index)));
    const unscheduled = workouts.map((workout, index) => ({ workout, index })).filter(item => !matched.has(item.index));
    const sessionButton = ({ workout, index }) => `<button type="button" class="calendar-session" data-session="${index}" draggable="true" aria-label="${escapeHtml(workout.day)} ${escapeHtml(workout.time_of_day || "Any time")}: ${escapeHtml(workout.name)}">
        <span class="calendar-session-time">${escapeHtml(workout.time_of_day || "Any time")}</span>
        <strong>${escapeHtml(workout.name || "Training session")}</strong>
        <span class="calendar-session-meta">${escapeHtml(workout.type || "Training")} · ${escapeHtml(workout.duration || "—")}</span>
    </button>`;
    container.innerHTML = `<section class="dashboard-section schedule-section">
        <div class="section-header"><h2>Training calendar</h2><p>${workouts.length} sessions across ${DAYS.filter(day => sessionsForDay(workouts, day).length).length} training days. Select a session to see its workout.</p></div>
        <div class="calendar-wrapper"><div class="calendar-grid">
        ${DAYS.map(day => {
            const sessions = sessionsForDay(workouts, day);
            return `<section class="calendar-day-column ${sessions.length ? "has-training" : "is-rest"}" data-day="${day}" aria-label="${day}">
                <header><span>${day.slice(0, 3)}</span><small>${sessions.length > 1 ? sessions.length + " sessions" : ""}</small></header>
                ${sessions.length ? sessions.map(sessionButton).join("") : '<p class="calendar-rest">Rest day<span>Recover & recharge</span></p>'}
            </section>`;
        }).join("")}</div>
        ${unscheduled.length ? `<div class="calendar-unscheduled"><h3>Other sessions</h3><p>Choose a day in the session details to place these on your week.</p>${unscheduled.map(sessionButton).join("")}</div>` : ""}
        <div id="calendar-details" class="calendar-details" aria-live="polite"><p>Select a session above to see the details.</p></div></div>
    </section>`;
    const details = container.querySelector("#calendar-details");
    function select(index) {
        const workout = workouts[index];
        if (!workout) return;
        container.querySelectorAll("[data-session]").forEach(button => {
            button.classList.toggle("selected", Number(button.dataset.session) === index);
            button.setAttribute("aria-pressed", String(Number(button.dataset.session) === index));
        });
        const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
        details.innerHTML = `<div class="calendar-detail-heading"><div><span class="calendar-session-time">${escapeHtml(workout.day)} · ${escapeHtml(workout.time_of_day || "Any time")}</span><h3>${escapeHtml(workout.name)}</h3><p>${escapeHtml(workout.purpose || "")}</p></div><button type="button" class="primary-button" data-start-session>Start session</button></div>
            <div class="calendar-detail-info"><p><strong>Training</strong>${escapeHtml(workout.type || "Training")}</p><p><strong>Duration</strong>${escapeHtml(workout.duration || "—")}</p><p><strong>Exercises</strong>${exercises.length}</p></div>
            ${workout.warmup?.length ? `<details><summary>Warm-up</summary><ul>${workout.warmup.map(item => `<li>${escapeHtml(typeof item === "string" ? item : item.name || item.exercise || "")}</li>`).join("")}</ul></details>` : ""}
            <h4>Session plan</h4><ul class="calendar-exercises">${exercises.length ? exercises.map(ex => `<li><strong>${escapeHtml(typeof ex === "string" ? ex : ex?.name || ex?.exercise || "Exercise")}</strong><span>${escapeHtml(typeof ex === "object" ? [ex.sets && ex.sets !== "-" ? ex.sets + " sets" : "", ex.reps, ex.rest && ex.rest !== "-" ? ex.rest + " rest" : ""].filter(Boolean).join(" · ") : "")}</span></li>`).join("") : "<li>No exercises listed for this session.</li>"}</ul>
            ${workout.cooldown?.length ? `<details><summary>Cool-down</summary><ul>${workout.cooldown.map(item => `<li>${escapeHtml(typeof item === "string" ? item : item.name || item.exercise || "")}</li>`).join("")}</ul></details>` : ""}
            <form class="calendar-move-form"><label>Day<select name="day">${DAYS.map(day => `<option ${normaliseDay(workout.day) === normaliseDay(day) ? "selected" : ""}>${day}</option>`).join("")}</select></label><label>Time<select name="time">${Object.keys(TIME_ORDER).map(time => `<option ${(workout.time_of_day || "Any time") === time ? "selected" : ""}>${time}</option>`).join("")}</select></label><button class="secondary-button" type="submit">Update session time</button><small>Other sessions stay where they are.</small></form>`;
        details.querySelector("[data-start-session]").addEventListener("click", () => {
            container.dispatchEvent(new CustomEvent("athlos:start-workout", { bubbles: true, detail: { workout } }));
        });
        details.querySelector("form").addEventListener("submit", event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onMove(moveSession(workouts, index, data.get("day"), data.get("time")));
        });
    }
    container.querySelectorAll("[data-session]").forEach(button => {
        button.addEventListener("click", () => select(Number(button.dataset.session)));
        button.addEventListener("dragstart", event => {
            event.dataTransfer.setData("application/x-athlos-session", button.dataset.session);
            event.dataTransfer.effectAllowed = "move";
        });
    });
    container.querySelectorAll("[data-day]").forEach(column => {
        column.addEventListener("dragover", event => { event.preventDefault(); column.classList.add("drag-target"); });
        column.addEventListener("dragleave", () => column.classList.remove("drag-target"));
        column.addEventListener("drop", event => {
            event.preventDefault(); column.classList.remove("drag-target");
            const index = event.dataTransfer.getData("application/x-athlos-session");
            if (index !== "") onMove(moveSession(workouts, Number(index), column.dataset.day));
        });
    });
    const today = DAYS[(new Date().getDay() + 6) % 7];
    select(sessionsForDay(workouts, today)[0]?.index ?? (workouts.length ? 0 : -1));
}
function normaliseDay(value) {
    const text = String(value || "").toLowerCase();
    return DAYS.find(day => text.includes(day.toLowerCase()) || text.trim() === day.slice(0, 3).toLowerCase())?.toLowerCase() || text;
}
function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
