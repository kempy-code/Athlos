export const GYM_STATIONS = [
    { id:"squat", name:"Squat rack", exercise:"Barbell squat", area:"Strength floor", x:18, y:30, animation:"squat", equipment:"Rack + barbell", muscles:"Quads · glutes · trunk", steps:["Set the bar across your upper back—not your neck.","Brace, unlock the rack and take two controlled steps back.","Sit between your hips while keeping your whole foot grounded.","Drive the floor away and finish tall without snapping your knees."], mistake:"Letting the knees collapse inward or adding weight before depth feels controlled.", beginner:"Start with a bodyweight box squat, then a goblet squat before using the rack." },
    { id:"bench", name:"Bench station", exercise:"Dumbbell bench press", area:"Strength floor", x:43, y:40, animation:"press", equipment:"Flat bench + dumbbells", muscles:"Chest · triceps · shoulders", steps:["Place feet firmly on the floor and keep your upper back supported.","Start with dumbbells over your chest and wrists stacked.","Lower with control until elbows sit slightly below the bench.","Press up smoothly while keeping shoulders away from your ears."], mistake:"Flaring elbows straight sideways or choosing weights you cannot lower slowly.", beginner:"Ask someone to show you the bench adjustment and begin with light dumbbells." },
    { id:"cable", name:"Cable tower", exercise:"Seated cable row", area:"Machine zone", x:67, y:29, animation:"row", equipment:"Cable stack + row handle", muscles:"Upper back · lats · biceps", steps:["Select a light pin setting and sit with a tall spine.","Reach forward without rounding your lower back.","Pull the handle toward your lower ribs and squeeze shoulder blades.","Return slowly until arms are long, without letting the stack slam."], mistake:"Leaning far backward and turning the movement into a whole-body swing.", beginner:"The numbered weight stack is not universal—test the lightest useful setting first." },
    { id:"treadmill", name:"Cardio deck", exercise:"Treadmill orientation", area:"Cardio deck", x:82, y:55, animation:"run", equipment:"Treadmill", muscles:"Aerobic system · legs", steps:["Stand on the side rails before starting the belt.","Attach the safety clip and select manual mode.","Begin at walking pace, then increase speed in small steps.","Look forward, run naturally and slow down before stepping off."], mistake:"Jumping onto a moving belt, holding the rails while running, or looking at your feet.", beginner:"Learn the stop button first. A 5-minute walk is a completely valid first session." },
    { id:"bike", name:"Bike studio", exercise:"Stationary bike setup", area:"Cardio deck", x:57, y:67, animation:"cycle", equipment:"Exercise bike", muscles:"Quads · glutes · aerobic system", steps:["Set the saddle near hip height before getting on.","At the bottom of the pedal stroke, keep a slight knee bend.","Start with low resistance and a smooth, quiet cadence.","Keep shoulders relaxed and add resistance only when stable."], mistake:"A saddle that is too low, causing excessive knee bend and rocking hips.", beginner:"If your hips sway side to side, lower effort or recheck the saddle position." },
    { id:"mobility", name:"Mobility bay", exercise:"Hip flexor stretch", area:"Recovery studio", x:28, y:72, animation:"stretch", equipment:"Mat", muscles:"Hip flexors · glutes", steps:["Kneel on a padded mat with one foot forward.","Tuck your pelvis gently, as if bringing your belt buckle up.","Shift forward slightly until the front of the rear hip stretches.","Breathe slowly for 20–30 seconds without forcing range."], mistake:"Arching the lower back to create the appearance of a deeper stretch.", beginner:"A mild stretch is enough. Sharp pain or tingling means stop and change position." }
];

export function renderVirtualGym(container, plan = {}) {
    if (!container) return;
    let active = 0, rotation = 0, zoom = 1;
    container.innerHTML = `<div class="virtual-gym">
        <div class="gym-hud"><div><span class="gym-live-dot"></span><strong>GYM TOUR</strong><small>Choose a glowing checkpoint</small></div><button type="button" data-gym-reset>Reset view</button></div>
        <div class="gym-viewport" tabindex="0" aria-label="Virtual gym. Use arrow keys or the controls to look around.">
            <div class="gym-world">
                <div class="vg-wall wall-back"><b>ATHLOS</b><span>MOVE WITH CONFIDENCE</span></div><div class="vg-wall wall-left"></div><div class="vg-wall wall-right"></div><div class="vg-floor"></div>
                <div class="equipment eq-rack"><i></i><i></i><em></em></div><div class="equipment eq-bench"><i></i><em></em></div><div class="equipment eq-cable"><i></i><i></i><em></em></div><div class="equipment eq-tread"><i></i><em></em></div><div class="equipment eq-bike"><i></i><em></em></div><div class="equipment eq-mat"></div>
                ${GYM_STATIONS.map((station,index)=>`<button type="button" class="gym-checkpoint${index===0?" active":""}" data-station="${station.id}" style="--x:${station.x}%;--y:${station.y}%"><span>${index+1}</span><b>${station.name}</b></button>`).join("")}
            </div>
            <div class="gym-compass"><span>N</span><i></i></div>
            <div class="gym-controls" aria-label="Gym view controls"><button data-move="left" aria-label="Look left">←</button><button data-move="in" aria-label="Move closer">＋</button><button data-move="out" aria-label="Move back">−</button><button data-move="right" aria-label="Look right">→</button></div>
            <div class="gym-welcome">Click a numbered station to walk over</div>
        </div>
        <aside class="exercise-guide" aria-live="polite"></aside>
    </div>`;
    const world=container.querySelector(".gym-world"), guide=container.querySelector(".exercise-guide"), compass=container.querySelector(".gym-compass i");
    const updateView=()=>{world.style.transform=`translateZ(${(zoom-1)*180}px) rotateY(${rotation}deg)`;compass.style.transform=`rotate(${rotation}deg)`;};
    const select=index=>{
        active=(index+GYM_STATIONS.length)%GYM_STATIONS.length;
        const station=GYM_STATIONS[active];
        container.querySelectorAll(".gym-checkpoint").forEach((node,i)=>node.classList.toggle("active",i===active));
        rotation=Math.max(-9,Math.min(9,(50-station.x)/4));zoom=1.06;updateView();
        guide.innerHTML=guideMarkup(station,plan);
        container.querySelector(".gym-welcome").textContent=`Checkpoint ${active+1} of ${GYM_STATIONS.length} · ${station.area}`;
        guide.querySelector("[data-replay]")?.addEventListener("click",()=>{const demo=guide.querySelector(".motion-demo");demo.classList.remove("playing");requestAnimationFrame(()=>requestAnimationFrame(()=>demo.classList.add("playing")));});
        guide.querySelector("[data-next-station]")?.addEventListener("click",()=>select(active+1));
    };
    container.querySelectorAll("[data-station]").forEach((button,index)=>button.addEventListener("click",()=>select(index)));
    container.querySelectorAll("[data-move]").forEach(button=>button.addEventListener("click",()=>move(button.dataset.move)));
    container.querySelector("[data-gym-reset]").addEventListener("click",()=>{rotation=0;zoom=1;updateView();});
    container.querySelector(".gym-viewport").addEventListener("keydown",event=>{const map={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"in",ArrowDown:"out"};if(map[event.key]){event.preventDefault();move(map[event.key]);}});
    function move(direction){if(direction==="left")rotation=Math.min(12,rotation+3);if(direction==="right")rotation=Math.max(-12,rotation-3);if(direction==="in")zoom=Math.min(1.18,zoom+.04);if(direction==="out")zoom=Math.max(.92,zoom-.04);updateView();}
    select(0);
}

export function stationById(id){return GYM_STATIONS.find(station=>station.id===id)||null;}
function guideMarkup(station,plan){const inPlan=JSON.stringify(plan).toLowerCase().includes(station.exercise.toLowerCase().split(" ").at(-1));return `<div class="guide-top"><div><span class="guide-zone">${station.area}</span><h3>${station.exercise}</h3><p>${station.equipment} · ${station.muscles}</p></div><span class="plan-match ${inPlan?"yes":""}">${inPlan?"In your plan":"Learn the movement"}</span></div>${motionDemo(station.animation)}<button type="button" class="replay-demo" data-replay>↻ Replay demonstration</button><ol class="exercise-steps">${station.steps.map((step,index)=>`<li><span>${index+1}</span><p>${step}</p></li>`).join("")}</ol><div class="beginner-cues"><article><span>BEGINNER TIP</span><p>${station.beginner}</p></article><article class="mistake"><span>COMMON MISTAKE</span><p>${station.mistake}</p></article></div><div class="guide-actions"><button type="button" class="primary-button" data-next-station>Next checkpoint</button><small>Practise with a qualified coach when possible. Stop if an exercise causes pain.</small></div>`;}
function motionDemo(type){return `<div class="motion-demo motion-${type} playing" role="img" aria-label="Animated demonstration"><div class="demo-grid"></div><div class="demo-equipment"><i></i><i></i><b></b></div><div class="athlete-figure"><span class="head"></span><span class="torso"></span><span class="arm arm-a"></span><span class="arm arm-b"></span><span class="leg leg-a"></span><span class="leg leg-b"></span></div><div class="motion-path"><span></span></div><small>FORM DEMO · SIDE VIEW</small></div>`;}
