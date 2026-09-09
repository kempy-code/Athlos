import test from "node:test";
import assert from "node:assert/strict";
import { buildPBSeries } from "../public/js/results/athleteLab.js";

test("PB series recognises lower timed results as improvements", () => {
    const [series] = buildPBSeries([
        { type: "5 km time trial", unit: "minutes", value: 24 },
        { type: "5 km time trial", unit: "minutes", value: 22.8 }
    ]);
    assert.equal(series.best, 22.8);
    assert.equal(Math.round(series.improvement), 5);
    assert.ok(series.target < series.best);
});

test("PB series recognises higher strength results as improvements", () => {
    const [series] = buildPBSeries([
        { type: "Back squat", unit: "kg", value: 80 },
        { type: "Back squat", unit: "kg", value: 100 }
    ]);
    assert.equal(series.best, 100);
    assert.equal(series.improvement, 25);
    assert.ok(series.target > series.best);
});
