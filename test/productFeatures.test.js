import test from "node:test";
import assert from "node:assert/strict";
import { dailyRecommendation } from "../public/js/results/results.js";
import { rescheduleWorkouts } from "../public/js/results/calendar.js";

test("daily recommendation responds to readiness and training load", () => {
    const ready = dailyRecommendation({ readiness: [] }, { ratio: 0.9 });
    const adjust = dailyRecommendation({ readiness: [] }, { ratio: 1.3 });
    const reduce = dailyRecommendation({ readiness: [{ recommendation: { level: "reduce" } }] }, { ratio: 0.8 });

    assert.equal(ready.level, "ready");
    assert.equal(adjust.level, "adjust");
    assert.equal(reduce.level, "reduce");
});

test("calendar rescheduling moves a workout into a rest day", () => {
    const workouts = [{ day: "Monday", name: "Strength" }];
    const moved = rescheduleWorkouts(workouts, "Monday", "Wednesday");

    assert.equal(moved[0].day, "Wednesday");
    assert.equal(workouts[0].day, "Monday");
});

test("calendar rescheduling swaps occupied days without losing sessions", () => {
    const workouts = [
        { day: "Monday", name: "Strength" },
        { day: "Tuesday", name: "Run" }
    ];
    const moved = rescheduleWorkouts(workouts, "Monday", "Tuesday");

    assert.deepEqual(moved.map(item => [item.day, item.name]), [
        ["Tuesday", "Strength"],
        ["Monday", "Run"]
    ]);
});
