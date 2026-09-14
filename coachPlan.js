import crypto from "node:crypto";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const nullableText = { type: ["string", "null"] };
const list = { type: ["array", "null"], items: { type: "string" } };
const exercise = {
    type: "object", additionalProperties: false,
    required: ["name", "sets", "reps", "rest", "coaching_notes"],
    properties: Object.fromEntries(["name", "sets", "reps", "rest", "coaching_notes"].map(key => [key, { type: "string" }]))
};
const fields = {
    action: { type: "string", enum: ["add", "update", "remove"] },
    workout_index: { type: ["integer", "null"] },
    day: { type: ["string", "null"], enum: [...DAYS, null] },
    time_of_day: { type: ["string", "null"], enum: ["Morning", "Afternoon", "Evening", "Any time", null] },
    name: nullableText, type: nullableText, purpose: nullableText, duration: nullableText,
    warmup: list, cooldown: list,
    exercises: { type: ["array", "null"], items: exercise }
};
export const coachPlanChangeSchema = {
    type: "object", additionalProperties: false, required: ["summary", "changes"],
    properties: {
        summary: { type: "string" },
        changes: { type: "array", maxItems: 14, items: {
            type: "object", additionalProperties: false, required: Object.keys(fields), properties: fields
        } }
    }
};

export const COACH_EDIT_INSTRUCTIONS = `You are Athlos Coach. Answer the athlete and propose precise plan edits when requested.
The current stored plan is authoritative. Earlier assistant messages may describe proposals that were never applied.
Use the conversation to understand follow-up corrections. Do not claim changes are saved: the athlete must apply the preview.
For questions, or when clarification is needed, return an empty changes array and answer in summary.
Use original workout_index values for update/remove; null for add. For updates, null means preserve the existing field.
Adding a morning run to an occupied day MUST add a separate complete workout, leaving the other session and other days intact.
Double training days are supported. Specify Morning/Afternoon/Evening when requested; otherwise Any time.
Do not combine two sports into one renamed workout. Moving one session never swaps or deletes another session.
Only remove a session when the athlete explicitly requests removal. Preserve exercises, sets, reps, and warm-up unless a change is requested.
For every added session supply name, day, time_of_day, type, purpose, duration, warmup, cooldown, and a nonempty exercises array with practical prescriptions.
For volume changes adjust the actual sets, reps or duration of relevant exercises, not just their titles.
Respect the athlete's goals, experience, injuries, availability and recovery. Explain meaningful increases in weekly training load and suggest manageable timing.
Do not invent completed training. Do not diagnose or prescribe through pain. Keep the summary concise.`;

export function planRevision(plan) {
    return crypto.createHash("sha256").update(JSON.stringify(plan ?? null)).digest("hex");
}

// Apply all operations against original indices. Validate the whole proposal before saving anything.
export function applyCoachPlanChanges(plan, changes) {
    if (!Array.isArray(plan?.workouts) || !Array.isArray(changes) || changes.length > 14) throw new Error("Invalid plan changes");
    const workouts = plan.workouts.map((workout, index) => ({ ...workout, id: workout.id || `session-${index + 1}` }));
    const touched = new Set();
    const removed = new Set();
    for (const change of changes) {
        if (!change || !["add", "update", "remove"].includes(change.action)) throw new Error("Unknown plan action");
        const index = change.workout_index;
        if (change.action !== "add") {
            if (!Number.isInteger(index) || index < 0 || index >= plan.workouts.length || touched.has(index)) throw new Error("The proposal refers to an invalid or repeated session");
            touched.add(index);
        } else if (index !== null) throw new Error("New sessions cannot replace existing sessions");
        if (change.action === "remove") { removed.add(index); continue; }
        const next = change.action === "add" ? { id: crypto.randomUUID() } : { ...workouts[index] };
        for (const field of ["day", "time_of_day", "name", "type", "purpose", "duration"]) {
            const value = change[field];
            if (value == null) continue;
            if (typeof value !== "string" || !value.trim() || value.length > 2000) throw new Error(`Invalid ${field}`);
            if (field === "day" && !DAYS.includes(value)) throw new Error("Choose a valid weekday");
            if (field === "time_of_day" && !["Morning", "Afternoon", "Evening", "Any time"].includes(value)) throw new Error("Choose a valid session time");
            next[field] = value.trim();
        }
        for (const field of ["warmup", "cooldown"]) {
            if (change[field] == null) continue;
            if (!Array.isArray(change[field]) || change[field].length > 30 || change[field].some(item => typeof item !== "string" || item.length > 2000)) throw new Error(`Invalid ${field}`);
            next[field] = [...change[field]];
        }
        if (change.exercises != null) {
            if (!Array.isArray(change.exercises) || !change.exercises.length || change.exercises.length > 40) throw new Error("Sessions need between 1 and 40 exercises");
            next.exercises = change.exercises.map(item => {
                if (!item || ["name", "sets", "reps", "rest", "coaching_notes"].some(key => typeof item[key] !== "string" || item[key].length > 2000) || !item.name.trim()) throw new Error("An exercise prescription is incomplete");
                return Object.fromEntries(["name", "sets", "reps", "rest", "coaching_notes"].map(key => [key, item[key]]));
            });
        }
        if (change.action === "add" && (!DAYS.includes(next.day) || !next.name || !next.type || !next.purpose || !next.duration || !next.exercises?.length || !Array.isArray(next.warmup) || !Array.isArray(next.cooldown))) throw new Error("The new session is incomplete");
        // Keep legacy aliases consistent so normalization cannot restore old values.
        if (change.name != null && "session_name" in next) next.session_name = next.name;
        if (change.exercises != null && "main_workout" in next) next.main_workout = next.exercises;
        if (change.warmup != null && "warm_up" in next) next.warm_up = next.warmup;
        if (change.cooldown != null && "cool_down" in next) next.cool_down = next.cooldown;
        if (change.duration != null) delete next.target_duration_minutes;
        if (change.action === "add") workouts.push(next); else workouts[index] = next;
    }
    const remaining = workouts.filter((_, index) => !removed.has(index));
    if (!remaining.length) throw new Error("Keep at least one session in the plan");
    const trainingDays = new Set(remaining.map(item => item.day)).size;
    return { ...plan, workouts: remaining, training_days: trainingDays,
        ...(plan.metadata ? { metadata: { ...plan.metadata, trainingDays } } : {}),
        coachModification: { createdAt: new Date().toISOString(), changes } };
}
