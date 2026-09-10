const MUSCLE_RULES = [
    ["chest", /bench|chest|push.?up|fly|press-up/],
    ["shoulders", /shoulder|overhead|military|lateral raise|front raise|push press/],
    ["back", /row|pull.?up|pulldown|lat |chin.?up|deadlift/],
    ["biceps", /curl|chin.?up|bicep/],
    ["triceps", /tricep|dip|skull|pushdown|bench|press|push.?up/],
    ["core", /plank|carry|core|crunch|sit.?up|dead bug|pallof/],
    ["quads", /squat|lunge|leg press|step.?up|extension|run|sprint|cycle|bike/],
    ["hamstrings", /deadlift|romanian|hinge|hamstring|leg curl|good morning|run|sprint/],
    ["glutes", /squat|lunge|deadlift|hinge|hip thrust|bridge|step.?up|run|sprint/],
    ["calves", /calf|run|sprint|jump|pogo|skip/]
];

export function muscleGroupsForWorkout(workout) {
    const exercises=Array.isArray(workout?.exercises)?workout.exercises:[];
    const counts={};
    const sessionText=`${workout?.name||""} ${workout?.type||""} ${workout?.purpose||""}`.toLowerCase();
    exercises.forEach(exercise=>{
        const text=`${exercise?.name||exercise?.exercise||exercise||""} ${exercise?.muscles||exercise?.muscle_group||exercise?.category||""}`.toLowerCase();
        MUSCLE_RULES.forEach(([muscle,pattern])=>{if(pattern.test(text))counts[muscle]=(counts[muscle]||0)+Math.max(1,Number(exercise?.sets)||1);});
    });
    if(!Object.keys(counts).length&&/run|sprint|aerobic|endurance|cycle|bike|conditioning/.test(sessionText)){counts.quads=2;counts.hamstrings=2;counts.glutes=2;counts.calves=1;counts.core=1;}
    if(!Object.keys(counts).length)counts["full-body"]=1;
    return counts;
}

export function renderMuscleMap(workout, compact=false) {
    const groups=muscleGroupsForWorkout(workout),active=name=>groups[name]?"active":"",intensity=name=>Math.min(1,.35+(groups[name]||0)/10);
    const labels=Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([name,sets])=>`<span><i style="opacity:${intensity(name)}"></i>${title(name)} <b>${sets} set${sets===1?"":"s"}</b></span>`).join("");
    return `<section class="muscle-map ${compact?"compact":""}" aria-label="Muscles trained"><div class="muscle-map-heading"><div><span>MUSCLE FOCUS</span><strong>${primary(groups)}</strong></div><small>Estimated from exercise selection</small></div><div class="muscle-map-content"><svg viewBox="0 0 220 330" role="img" aria-label="Body muscle diagram"><g class="body-base"><circle cx="110" cy="28" r="19"/><rect x="83" y="50" width="54" height="91" rx="25"/><rect x="46" y="58" width="27" height="104" rx="13"/><rect x="147" y="58" width="27" height="104" rx="13"/><rect x="82" y="135" width="25" height="139" rx="13"/><rect x="113" y="135" width="25" height="139" rx="13"/><ellipse cx="94" cy="298" rx="26" ry="11"/><ellipse cx="126" cy="298" rx="26" ry="11"/></g><g class="muscles"><path class="${active("shoulders")}" data-muscle="shoulders" d="M82 61 Q68 55 62 72 L76 88 Q81 78 88 72Z M138 61 Q152 55 158 72 L144 88 Q139 78 132 72Z"/><path class="${active("chest")}" data-muscle="chest" d="M89 67 Q110 57 110 89 Q91 94 84 80Z M131 67 Q110 57 110 89 Q129 94 136 80Z"/><path class="${active("back")}" data-muscle="back" d="M89 67 Q110 52 131 67 L126 117 Q110 134 94 117Z"/><path class="${active("biceps")}" data-muscle="biceps" d="M57 82 Q69 76 74 91 L69 120 Q54 118 52 104Z M163 82 Q151 76 146 91 L151 120 Q166 118 168 104Z"/><path class="${active("triceps")}" data-muscle="triceps" d="M53 108 Q66 113 69 124 L64 150 Q49 149 47 134Z M167 108 Q154 113 151 124 L156 150 Q171 149 173 134Z"/><path class="${active("core")}" data-muscle="core" d="M96 91 L124 91 L126 128 Q110 139 94 128Z"/><path class="${active("glutes")}" data-muscle="glutes" d="M83 126 Q96 118 109 136 L104 157 Q87 160 80 148Z M137 126 Q124 118 111 136 L116 157 Q133 160 140 148Z"/><path class="${active("quads")}" data-muscle="quads" d="M84 151 Q96 145 106 158 L104 215 Q92 226 82 211Z M136 151 Q124 145 114 158 L116 215 Q128 226 138 211Z"/><path class="${active("hamstrings")}" data-muscle="hamstrings" d="M86 157 Q96 151 105 164 L102 218 Q92 226 84 210Z M134 157 Q124 151 115 164 L118 218 Q128 226 136 210Z"/><path class="${active("calves")}" data-muscle="calves" d="M84 222 Q94 211 103 226 L100 271 Q89 278 82 262Z M136 222 Q126 211 117 226 L120 271 Q131 278 138 262Z"/></g></svg><div class="muscle-legend">${labels}</div></div></section>`;
}
function primary(groups){return Object.entries(groups).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name])=>title(name)).join(" · ");}
function title(value){return value.split("-").map(word=>word[0].toUpperCase()+word.slice(1)).join(" ");}
