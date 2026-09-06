import test from "node:test";
import assert from "node:assert/strict";
import { buildStaticPlan } from "../public/js/staticPlan.js";

test("buildStaticPlan turns questionnaire answers into a scheduled plan", () => {
    const plan = buildStaticPlan({
        training_days: 3,
        available_days: ["Monday", "Thursday", "Saturday"],
        primary_goal: "improve_running",
        goal_timeline: "12 weeks",
        session_length: "30-45 minutes",
        sleep_hours: "7-8 hours",
        has_injury: "Yes"
    });

    assert.equal(plan.training_days, 3);
    assert.equal(plan.workouts.length, 3);
    assert.deepEqual(plan.workouts.map(workout => workout.day), ["Monday", "Thursday", "Saturday"]);
    assert.match(plan.program_name, /Improve Running/);
    assert.equal(plan.program_duration, "12 Weeks");
    assert.equal(plan.session_length, "30-45 Minutes");
    assert.match(plan.recovery.injury_management, /restrictions/);
    assert.equal(plan.metadata.generationMode, "local");
});

test("buildStaticPlan safely supplies useful defaults", () => {
    const plan = buildStaticPlan({});

    assert.equal(plan.training_days, 4);
    assert.equal(plan.workouts.length, 4);
    assert.ok(plan.workouts.every(workout => Array.isArray(workout.exercises)));
    assert.ok(plan.workouts.every(workout => workout.name && workout.day));
});
