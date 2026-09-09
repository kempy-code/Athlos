import test from "node:test";
import assert from "node:assert/strict";
import { GYM_STATIONS, stationById } from "../public/js/results/virtualGym.js";

test("virtual gym provides a complete beginner tour", () => {
    assert.ok(GYM_STATIONS.length >= 6);
    for (const station of GYM_STATIONS) {
        assert.ok(station.id && station.name && station.exercise);
        assert.equal(station.steps.length, 4);
        assert.ok(station.beginner && station.mistake && station.animation);
        assert.ok(station.x >= 0 && station.x <= 100);
        assert.ok(station.y >= 0 && station.y <= 100);
    }
});

test("virtual gym stations can be resolved safely", () => {
    assert.equal(stationById("treadmill").exercise, "Treadmill orientation");
    assert.equal(stationById("missing"), null);
});
