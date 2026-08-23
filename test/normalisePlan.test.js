import test from "node:test";
import assert from "node:assert/strict";
import { normalisePlan } from "../public/js/results/normalisePlan.js";

test("normalises structured output workouts", () => {
    const plan = normalisePlan({ workouts: [{ day: "Monday", session_name: "Strength", target_duration_minutes: 45, warm_up: ["Jog"], main_workout: [{ exercise: "Squat", sets: "3", reps: "8", rest: "90 sec" }], cool_down: ["Walk"] }], nutrition: { calorie_target: "2400 kcal" }, recovery: { sleep_target: "8 hours" } });
    assert.equal(plan.workouts[0].exercises[0].name, "Squat");
    assert.equal(plan.workouts[0].duration, "45 min");
    assert.equal(plan.nutrition.calories, "2400 kcal");
    assert.equal(plan.recovery.sleep, "8 hours");
});

test("tolerates absent sections", () => {
    const plan = normalisePlan({});
    assert.deepEqual(plan.workouts, []);
    assert.deepEqual(plan.exercises, []);
});
