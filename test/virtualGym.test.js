import test from "node:test";
import assert from "node:assert/strict";
import { GYM_STATIONS, stationById } from "../public/js/results/virtualGym.js";

test("virtual gym provides a complete beginner tour", () => {
    assert.ok(GYM_STATIONS.length >= 6);
    for (const station of GYM_STATIONS) {
        assert.ok(station.id && station.name && station.exercise);
        assert.equal(station.steps.length, 4);
        assert.ok(station.beginner && station.mistake && station.animation);
        assert.equal(station.world.length, 2);
        assert.ok(station.world.every(value => value >= -10 && value <= 10));
    }
});

test("walking math moves and clamps a first-person position", async () => {
    const { movePosition } = await import("../public/js/results/virtualGym.js");
    assert.deepEqual(movePosition({ x: 0, z: 0 }, 0, 1, 0, 2), { x: 0, z: -2 });
    assert.deepEqual(movePosition({ x: 9, z: 0 }, 0, 0, 1, 2), { x: 9.5, z: 0 });
});

test("virtual gym stations can be resolved safely", () => {
    assert.equal(stationById("treadmill").exercise, "Treadmill orientation");
    assert.equal(stationById("missing"), null);
});
