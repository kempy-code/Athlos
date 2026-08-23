// =====================================
// ATHLOS WORKOUT RENDERER
// public/js/results/workouts.js
// =====================================

export function renderWorkouts(container, workouts = [], heading = "Workout Library") {

    if (!container) {
        return;
    }

    const sessions = Array.isArray(workouts)
        ? workouts
        : (workouts == null ? [] : [workouts]);

    container.innerHTML = `
        <section class="dashboard-section">
            <div class="section-header">
                <h2>${escapeHtml(heading)}</h2>
                <p>Your personalised training sessions</p>
            </div>
            <div class="workout-grid">
                ${sessions.length
                    ? sessions.map(createWorkoutCard).join("")
                    : emptyState()
                }
            </div>
        </section>
    `;

    container.querySelectorAll("[data-start-workout]").forEach(button => {
        button.addEventListener("click", () => {
            const workout = sessions[Number(button.dataset.startWorkout)];
            if (workout) container.dispatchEvent(new CustomEvent("athlos:start-workout", { bubbles: true, detail: { workout } }));
        });
    });
}

function createWorkoutCard(workout, index) {

    const session = toObject(workout);
    const exercises = getExercises(session);
    const name = firstValue(session.session_name, session.name, session.title, session.session, "Training Session");
    const type = firstValue(session.type, session.session_type, session.focus, "Workout");
    const day = firstValue(session.day, session.training_day, `Session ${index + 1}`);
    const duration = sessionDuration(session);
    const purpose = firstValue(session.purpose, session.goal, session.objective, session.focus, "-");
    const warmup = firstArray(session.warmup, session.warm_up, session.warmUp, []);
    const cooldown = firstArray(
        session.cooldown,
        session.cool_down,
        session.coolDown,
        session.mobility_finisher,
        []
    );

    return `
        <article class="workout-card">
            <div class="workout-header">
                <span class="workout-number">${escapeHtml(day)}</span>
                <h3>${escapeHtml(name)}</h3>
                <span class="workout-type">${escapeHtml(type)}</span>
            </div>

            <div class="workout-info">
                <div><strong>Duration</strong><span>${escapeHtml(duration)}</span></div>
                <div><strong>Focus</strong><span>${escapeHtml(purpose)}</span></div>
            </div>

            <div class="workout-section">
                <h4>Warm Up</h4>
                ${renderContent(warmup, "Dynamic warm up")}
            </div>

            <div class="workout-section">
                <h4>Exercises</h4>
                <div class="exercise-list">
                    ${exercises.length
                        ? exercises.map(createExerciseRow).join("")
                        : "<p>No exercises listed.</p>"
                    }
                </div>
            </div>

            <div class="workout-section">
                <h4>Cool Down</h4>
                ${renderContent(cooldown, "Mobility and stretching")}
            </div>

            <button class="workout-start" data-start-workout="${index}" type="button">Start workout</button>

        </article>
    `;
}

function getExercises(session) {

    const source = firstArray(
        session.exercises,
        session.main_workout,
        session.mainWorkout,
        session.workout,
        session.blocks,
        []
    );

    return source.flatMap(flattenExercise);
}

function flattenExercise(value) {

    if (typeof value === "string" || typeof value === "number") {
        return [{ name: String(value) }];
    }

    if (!isObject(value)) {
        return [];
    }

    if (Array.isArray(value.exercises)) {
        return value.exercises.flatMap(flattenExercise);
    }

    return [value];
}

function createExerciseRow(exercise) {

    if (typeof exercise === "string" || typeof exercise === "number") {
        return `
            <div class="exercise-row">
                <div class="exercise-name">${escapeHtml(exercise)}</div>
            </div>
        `;
    }

    const item = toObject(exercise);
    const name = firstValue(item.name, item.exercise, item.title, item.movement, "Exercise");
    const muscles = firstValue(item.muscles, item.muscle_group, "");
    const sets = firstValue(item.sets, "-");
    const reps = firstValue(item.reps, item.repetitions, item.duration, item.time, "-");
    const rest = firstValue(item.rest, restLabel(item.rest_seconds), item.rest_time, "-");

    return `
        <div class="exercise-row">
            <div class="exercise-name">
                <h5>${escapeHtml(name)}</h5>
                ${muscles ? `<small>${escapeHtml(muscles)}</small>` : ""}
            </div>
            <div class="exercise-stats">
                <span>${escapeHtml(labelValue(sets, "sets"))}</span>
                <span>${escapeHtml(labelValue(reps, "reps"))}</span>
                <span>${escapeHtml(rest)}</span>
            </div>
        </div>
    `;
}

function renderContent(value, fallback) {
    const text = contentText(value) || fallback;
    return `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`;
}

function contentText(value) {
    if (Array.isArray(value)) {
        return value.map(contentText).filter(Boolean).join("\n");
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (value && typeof value === "object") {
        const name = firstValue(value.exercise, value.name, value.title, "");
        const detail = firstValue(value.duration, value.reps, value.instructions, value.coaching_notes, "");
        return [name, detail].filter(Boolean).join(" — ");
    }

    return "";
}

function sessionDuration(session) {
    const value = firstValue(
        session.duration,
        session.target_duration_minutes,
        session.duration_minutes,
        session.session_duration,
        "-"
    );

    return typeof value === "number" ? `${value} min` : String(value);
}

function emptyState() {
    return `
        <div class="coming-soon-card">
            <h2>No workouts available</h2>
            <p>Your AI coach has not generated sessions yet.</p>
        </div>
    `;
}

function toObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== "");
}

function firstArray(...values) {
    return values.find(Array.isArray) || [];
}

function restLabel(seconds) {
    return typeof seconds === "number" ? `${seconds} sec` : undefined;
}

function labelValue(value, label) {
    const text = String(value);
    return text === "-" || text.toLowerCase().includes(label) ? text : `${text} ${label}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
