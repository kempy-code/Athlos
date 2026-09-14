const MUSCLE_RULES = [
    ["chest", /bench|chest|push.?up|fly|press-up/],
    ["shoulders", /shoulder|overhead|military|lateral raise|front raise|push press/],
    ["back", /row|pull.?up|pulldown|lat |chin.?up|deadlift/],
    ["biceps", /bicep|chin.?up|(?<!leg |hamstring )curl/],
    ["triceps", /tricep|dip|skull|pushdown|bench|press|push.?up/],
    ["core", /plank|carry|core|crunch|sit.?up|dead bug|pallof/],
    ["quads", /squat|lunge|leg press|step.?up|leg extension|run|sprint|cycle|bike/],
    ["hamstrings", /deadlift|romanian|hinge|hamstring|leg curl|good morning|run|sprint/],
    ["glutes", /squat|lunge|deadlift|hinge|hip thrust|bridge|step.?up|run|sprint/],
    ["calves", /calf|run|sprint|jump|pogo|skip/]
];

export function muscleGroupsForWorkout(workout) {
    const counts = {};
    for (const exercise of Array.isArray(workout?.exercises) ? workout.exercises : []) {
        const text = `${exercise?.name || exercise?.exercise || exercise || ""} ${exercise?.muscles || exercise?.muscle_group || ""}`.toLowerCase();
        const sets = Array.isArray(exercise?.sets) ? exercise.sets.filter(set => set.type !== "warmup").length : parseInt(exercise?.sets, 10);
        if (!Number.isFinite(sets) || sets <= 0) continue;
        for (const [muscle, pattern] of MUSCLE_RULES) {
            if (pattern.test(text)) counts[muscle] = (counts[muscle] || 0) + Math.min(sets, 50);
        }
    }
    return counts;
}

// Separate anterior/posterior regions prevent the chest/back and quads/hamstrings overlapping.
const FRONT = [
    ["chest", "M58 65 Q68 58 79 63 L78 85 Q64 91 53 81Z"],
    ["shoulders", "M52 64 Q39 65 37 82 L48 88 55 76Z"],
    ["biceps", "M38 88 Q32 101 33 113 L41 117 Q48 106 48 91Z"],
    ["core", "M64 92 L78 92 78 145 65 151 61 127Z"],
    ["quads", "M59 163 Q64 156 76 165 L74 212 Q70 232 62 233 L54 221Z"],
    ["calves", "M57 243 Q51 260 57 283 L63 301 67 284 68 246Z"]
];
const BACK = [
    ["back", "M58 67 L78 60 78 113 66 140 55 106Z"],
    ["shoulders", "M52 64 Q39 65 37 82 L48 88 55 76Z"],
    ["triceps", "M37 89 Q32 102 33 115 L41 119 Q48 109 48 91Z"],
    ["glutes", "M62 146 Q72 140 78 151 L78 171 Q65 183 54 170Z"],
    ["hamstrings", "M55 179 Q68 187 77 177 L72 222 65 234 57 224Z"],
    ["calves", "M57 243 Q50 256 56 278 L63 289 68 278 69 245Z"]
];
const SILHOUETTE = "M70 49 L69 57 Q61 61 51 62 Q34 62 30 81 L25 111 17 143 13 162 Q12 174 17 178 Q20 181 23 173 L27 157 34 140 43 118 48 100 Q52 125 49 144 Q45 157 48 182 L48 216 49 237 49 269 53 302 48 314 Q45 322 53 324 L67 323 Q72 321 69 311 L70 286 74 258 73 239 79 192 L81 192 87 239 86 258 90 286 91 311 Q88 321 93 323 L107 324 Q115 322 112 314 L107 302 111 269 111 237 112 216 112 182 Q115 157 111 144 Q108 125 112 100 L117 118 126 140 133 157 137 173 Q140 181 143 178 Q148 174 147 162 L143 143 135 111 130 81 Q126 62 109 62 Q99 61 91 57 L90 49Z";

function body(view, groups) {
    const regions = view === "Front" ? FRONT : BACK;
    const paths = regions.map(([name, path]) => {
        const active = groups[name] > 0;
        return `<g data-muscle="${name}" class="muscle-region ${active ? "is-active" : ""}"><title>${title(name)}${active ? ": " + groups[name] + " targeted sets" : ": no mapped sets"}</title><path d="${path}"/><path d="${path}" transform="translate(160 0) scale(-1 1)"/></g>`;
    }).join("");
    return `<figure class="muscle-figure"><svg viewBox="0 0 160 336" role="img" aria-label="${view} view of trained muscle groups"><path class="muscle-silhouette" d="${SILHOUETTE}"/><path class="muscle-silhouette" d="M62 26 Q61 7 80 6 Q99 7 98 26 L95 39 Q91 51 80 53 Q69 51 65 39Z"/>${paths}<path class="muscle-midline" d="${view === "Front" ? "M80 92V145 M65 107H95 M64 122H96 M65 137H95" : "M80 65V140"}"/></svg><figcaption>${view}</figcaption></figure>`;
}

export function renderMuscleMap(workout, compact = false) {
    const groups = muscleGroupsForWorkout(workout);
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...Object.values(groups));
    return `<section class="muscle-map ${compact ? "compact" : ""}" aria-label="Muscles trained">
        <div class="muscle-map-heading"><div><span>MUSCLE FOCUS</span><strong>${sorted.length ? sorted.slice(0, 3).map(([name]) => title(name)).join(" · ") : "Training focus"}</strong></div></div>
        <div class="muscle-map-content"><div class="muscle-body-views">${body("Front", groups)}${body("Back", groups)}</div>
        <div class="muscle-legend">${sorted.length ? sorted.map(([name, sets]) => `<div class="muscle-stat"><span>${title(name)}</span><b>${sets} <small>sets</small></b><div class="muscle-bar" aria-hidden="true"><i style="width:${Math.round(sets / max * 100)}%"></i></div></div>`).join("") : '<p class="muscle-unmapped">No set-based muscle estimate for this session. Check the exercise descriptions for its focus.</p>'}</div></div>
        <p class="muscle-map-note">Estimated from exercise names and prescribed sets. A set can target several groups; this is not a measure of muscle activation.</p>
    </section>`;
}
function title(value) { return value[0].toUpperCase() + value.slice(1); }
