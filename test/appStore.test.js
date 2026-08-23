import test from "node:test";
import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
const store = await import("../public/js/appStore.js");

test("saves a plan and workout history", () => {
    memory.clear();
    store.savePlan({ program_name: "Test plan" });
    store.saveWorkoutLog({ workoutName: "Strength", status: "completed", rpe: 7, completedExercises: 4 });
    assert.equal(store.loadPlan().program_name, "Test plan");
    assert.equal(store.getProgressSummary(4).completionRate, 25);
    assert.equal(store.getProgressSummary(4).averageRpe, "7.0");
});

test("readiness recommendations reduce unsafe sessions", () => {
    const result = store.readinessRecommendation({ energy: 1, sleep: 1, soreness: 5, stress: 5, pain: 4 });
    assert.equal(result.level, "reduce");
});

test("clearing a plan also clears its logs", () => {
    store.clearPlan();
    assert.equal(store.loadPlan(), null);
    assert.deepEqual(store.getWorkoutLogs(), []);
});

test("demo athlete includes realistic history and a weekly review", () => {
    memory.clear();
    store.seedDemoData({ program_name: "Demo" }, new Date("2026-08-19T00:00:00Z"));
    assert.equal(store.getWorkoutLogs().length, 4);
    assert.equal(store.getWeeklyReview(new Date("2026-08-19T00:00:00Z")).tone, "progress");
});

test("readiness provides actionable plan changes", () => {
    const result = store.readinessRecommendation({ energy: 2, sleep: 2, soreness: 5, stress: 4, pain: 4 });
    assert.equal(result.volumeMultiplier, .7);
    assert.ok(result.changes.length >= 3);
});

test("training load uses duration and effort from completed sessions", () => {
    memory.clear();
    store.saveWorkoutLog({ workoutName: "Intervals", status: "completed", durationMinutes: 30, rpe: 8 });
    store.saveWorkoutLog({ workoutName: "Draft", status: "in-progress", durationMinutes: 60, rpe: 10 });
    const load = store.getTrainingLoad(7);
    assert.equal(load.recentLoad, 240);
    assert.equal(load.sessions, 1);
});
