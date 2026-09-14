import test from "node:test";
import assert from "node:assert/strict";
import { applyCoachPlanChanges, planRevision } from "../coachPlan.js";
import { normalisePlan } from "../public/js/results/normalisePlan.js";
import { moveSession, sessionsForDay } from "../public/js/results/calendar.js";
import { formatMessage } from "../public/js/results/coach.js";
import { nextScheduledWorkout } from "../public/js/results/results.js";

const exercise = { name: "Back squat", sets: "3", reps: "8", rest: "2 min", coaching_notes: "Controlled" };
const plan = { program_name: "Hybrid", nutrition: { calories: "2400 kcal" }, workouts: [
    { id: "tuesday-gym", day: "Tuesday", session_name: "Full body gym", time_of_day: "Evening", main_workout: [exercise], warm_up: ["Easy walk"], cool_down: ["Walk"], target_duration_minutes: 60 },
    { id: "wednesday-gym", day: "Wednesday", name: "Full body gym", time_of_day: "Evening", exercises: [exercise] }
] };
const addRun = { action: "add", workout_index: null, day: "Wednesday", time_of_day: "Morning", name: "Easy aerobic run", type: "Running", purpose: "Easy aerobic training", duration: "30 min", warmup: ["Walk 5 minutes"], cooldown: ["Walk 5 minutes"], exercises: [{ name: "Easy run", sets: "1", reps: "20 min", rest: "None", coaching_notes: "Conversational effort" }] };

test("adding a morning run preserves Tuesday and Wednesday gym details through normalization", () => {
    const result = applyCoachPlanChanges(plan, [addRun]);
    assert.equal(plan.workouts.length, 2);
    assert.deepEqual(result.workouts.slice(0, 2), plan.workouts);
    assert.equal(result.training_days, 2);
    assert.equal(result.workouts.length, 3);
    const normalized = normalisePlan(normalisePlan(result));
    assert.deepEqual(sessionsForDay(normalized.workouts, "Wednesday").map(item => [item.workout.name, item.workout.time_of_day]), [["Easy aerobic run", "Morning"], ["Full body gym", "Evening"]]);
    assert.equal(normalized.workouts[0].exercises[0].sets, "3");
    assert.equal(normalized.metadata.programName, "Hybrid");
    assert.equal(normalized.nutrition.calories, "2400 kcal");
    assert.equal(normalized.workouts[2].id, result.workouts[2].id);
});

test("moving one session onto an occupied day leaves all other sessions intact", () => {
    const workouts = applyCoachPlanChanges(plan, [addRun]).workouts;
    const moved = moveSession(workouts, 2, "Tuesday", "Morning");
    assert.equal(sessionsForDay(moved, "Tuesday").length, 2);
    assert.deepEqual(moved.slice(0, 2), workouts.slice(0, 2));
    assert.equal(workouts[2].day, "Wednesday");
});

test("plan edits preserve prescriptions and keep legacy aliases consistent", () => {
    const result = applyCoachPlanChanges(plan, [{ action: "update", workout_index: 0, name: "Strength A", day: "Thursday", duration: "45 min" }]);
    const workout = normalisePlan(result).workouts[0];
    assert.equal(workout.name, "Strength A");
    assert.equal(workout.duration, "45 min");
    assert.equal(workout.exercises[0].sets, "3");
    assert.deepEqual(result.workouts[1], plan.workouts[1]);
});

test("invalid proposals cannot partially mutate a plan", () => {
    const original = JSON.stringify(plan);
    for (const changes of [
        [{ ...addRun, exercises: [] }],
        [{ action: "update", workout_index: 99, day: "Monday" }],
        [{ action: "update", workout_index: 0, day: "Funday" }],
        [{ action: "remove", workout_index: 0 }, { action: "remove", workout_index: 1 }],
        [{ action: "update", workout_index: 0, name: "A" }, { action: "update", workout_index: 0, name: "B" }]
    ]) assert.throws(() => applyCoachPlanChanges(plan, changes));
    assert.equal(JSON.stringify(plan), original);
});

test("revisions detect a plan changed after the preview", () => {
    assert.notEqual(planRevision(plan), planRevision(applyCoachPlanChanges(plan, [addRun])));
    assert.equal(planRevision(plan), planRevision(structuredClone(plan)));
});

test("coach formatting supports emphasis while escaping generated HTML", () => {
    assert.equal(formatMessage("**Wednesday**\n<script>alert(1)</script>"), "<strong>Wednesday</strong><br>&lt;script&gt;alert(1)&lt;/script&gt;");
});

test("completing one session does not hide a second same-name session or next week's workout", () => {
    const workouts = [{ id: "am", name: "Run", day: "Wednesday", time_of_day: "Morning" }, { id: "pm", name: "Run", day: "Wednesday", time_of_day: "Evening" }];
    const now = new Date(2026, 8, 16, 12);
    const logs = [{ workoutId: "am", workoutName: "Run", workoutDay: "Wednesday", status: "completed", completedAt: new Date(2026, 8, 16, 8).toISOString() }];
    assert.equal(nextScheduledWorkout(workouts, logs, now).id, "pm");
    assert.equal(nextScheduledWorkout(workouts, logs, new Date(2026, 8, 23, 7)).id, "am");
});
