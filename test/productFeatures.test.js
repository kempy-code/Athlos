import test from "node:test";
import assert from "node:assert/strict";
import { dailyRecommendation } from "../public/js/results/results.js";
import { rescheduleWorkouts } from "../public/js/results/calendar.js";
import { createInitialSets, progressionSuggestion } from "../public/js/results/workoutModal.js";
import { muscleGroupsForWorkout } from "../public/js/results/muscleMap.js";
import { buildIntervalWorkout } from "../public/js/results/toolkit.js";
import { activitiesCsv } from "../public/js/results/activityHistory.js";
import { monthlyReport } from "../public/js/results/progress.js";

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

test("progression requires completed manageable training", () => {
    assert.equal(progressionSuggestion({ rpe:7, exerciseDetails:[{ completed:true }] }).level,"progress");
    assert.equal(progressionSuggestion({ rpe:9, exerciseDetails:[{ completed:true }] }).level,"hold");
    assert.equal(progressionSuggestion({ rpe:6, exerciseDetails:[{ completed:false }] }).level,"repeat");
});

test("workout tracker creates individual editable sets from the prescription", () => {
    const sets=createInitialSets({sets:"3",reps:"8"},{sets:[{weight:"60",reps:"8"},{weight:"62.5",reps:"8"},{weight:"62.5",reps:"7"}]});
    assert.equal(sets.length,3);
    assert.deepEqual(sets.map(set=>set.weight),["60","62.5","62.5"]);
    assert.ok(sets.every(set=>set.completed===false));
});

test("muscle map derives training emphasis from workout exercises", () => {
    const muscles=muscleGroupsForWorkout({exercises:[{name:"Back Squat",sets:4},{name:"Bench Press",sets:3}]});
    assert.equal(muscles.quads,4);
    assert.equal(muscles.glutes,4);
    assert.equal(muscles.chest,3);
});

test("interval builder creates a safe scheduled workout", () => {
    const workout=buildIntervalWorkout({ sport:"Running",day:"Thursday",work:"2 min hard",recovery:"1 min easy",rounds:8 });
    assert.equal(workout.day,"Thursday");
    assert.equal(workout.exercises[0].sets,"8");
    assert.match(workout.progression,/Add one round/);
});

test("activity export safely quotes commas and monthly report summarises work", () => {
    const now=new Date("2026-09-11T12:00:00Z"),logs=[{completedAt:"2026-09-10T12:00:00Z",status:"completed",workoutName:"Run, easy",sportType:"run",durationMinutes:30,distanceKm:5,rpe:5,notes:"Good"}];
    assert.match(activitiesCsv(logs),/"Run, easy"/);
    const report=monthlyReport(logs,1,now);
    assert.equal(report.sessions,1);
    assert.equal(report.distance,"5.0");
});
