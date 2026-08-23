import { getWorkoutLogs, saveWorkoutLog } from "../appStore.js";

export function renderActivityHistory(container, refresh = () => {}) {
    const logs = getWorkoutLogs().slice().sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt));
    const summary = summarise(logs);
    container.innerHTML = `
        <section class="activity-hero">
            <div><span>ATHLOS ACTIVITY</span><h2>Your training, remembered.</h2><p>Every planned and independent session in one history, across every sport.</p></div>
            <div class="activity-hero-actions"><button class="secondary-button" id="start-live-activity" type="button">Start live activity</button><button class="primary-button" id="open-activity-form" type="button">Log manually</button></div>
        </section>
        <section class="activity-summary">
            ${summaryCard("Activities",summary.count)}${summaryCard("Training time",formatMinutes(summary.minutes))}${summaryCard("Distance",summary.distance ? `${summary.distance.toFixed(1)} km` : "—")}${summaryCard("Average effort",summary.averageRpe ? `${summary.averageRpe}/10` : "—")}
        </section>
        <section class="activity-layout">
            <div class="activity-feed">
                <div class="activity-toolbar"><div class="activity-filters"><button class="active" data-filter="all">All</button><button data-filter="run">Running</button><button data-filter="ride">Cycling</button><button data-filter="strength">Strength</button><button data-filter="other">Other</button></div><label class="activity-search"><span class="sr-only">Search activities</span><input type="search" placeholder="Search workouts"></label></div>
                <div class="activity-list">${logs.length ? logs.map(activityRow).join("") : emptyState()}</div>
            </div>
            <aside class="activity-detail" id="activity-detail">${logs.length ? detail(logs[0], logs) : emptyDetail()}</aside>
        </section>
        <dialog class="manual-activity-dialog" id="manual-activity-dialog">
            <form method="dialog" id="manual-activity-form">
                <div class="dialog-heading"><div><span>ADD TRAINING</span><h2>Log an activity</h2></div><button value="cancel" aria-label="Close">×</button></div>
                <div class="form-pair"><label>Activity name<input name="workoutName" placeholder="Morning 5 km" required></label><label>Sport<select name="sportType"><option value="run">Running</option><option value="ride">Cycling</option><option value="swim">Swimming</option><option value="strength">Strength</option><option value="team">Team sport</option><option value="mobility">Mobility</option><option value="other">Other</option></select></label></div>
                <div class="form-triple"><label>Date<input name="activityDate" type="date" value="${new Date().toISOString().slice(0,10)}" required></label><label>Duration (min)<input name="durationMinutes" type="number" min="1" max="1440" required></label><label>Effort (RPE)<input name="rpe" type="number" min="1" max="10" value="6" required></label></div>
                <div class="form-pair"><label>Distance (km)<input name="distanceKm" type="number" min="0" step=".01"></label><label>Elevation (m)<input name="elevationMetres" type="number" min="0"></label></div>
                <label>Notes<textarea name="notes" rows="3" placeholder="How did the session feel?"></textarea></label>
                <div class="dialog-actions"><button class="secondary-button" value="cancel" type="button" data-close-dialog>Cancel</button><button class="primary-button" value="default" type="submit">Save activity</button></div>
            </form>
        </dialog>`;
    container.insertAdjacentHTML("beforeend", liveTrackerMarkup());

    bindActivityEvents(container, logs, refresh);
    bindLiveTracker(container, refresh);
}

function bindActivityEvents(container, logs, refresh) {
    const dialog = container.querySelector("#manual-activity-dialog");
    container.querySelector("#open-activity-form").addEventListener("click", () => dialog.showModal());
    container.querySelector("[data-close-dialog]").addEventListener("click", () => dialog.close());
    container.querySelector("#manual-activity-form").addEventListener("submit", event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        const completedAt = new Date(`${values.activityDate}T12:00:00`).toISOString();
        saveWorkoutLog({ ...values, completedAt, status:"completed", source:"manual", durationMinutes:Number(values.durationMinutes), distanceKm:Number(values.distanceKm||0), elevationMetres:Number(values.elevationMetres||0), rpe:Number(values.rpe), completedExercises:0, totalExercises:0 });
        dialog.close(); refresh();
    });
    const applyFilters = () => {
        const active = container.querySelector("[data-filter].active")?.dataset.filter || "all";
        const query = container.querySelector(".activity-search input").value.trim().toLowerCase();
        container.querySelectorAll(".activity-row").forEach(row => {
            const matchesType = active === "all" || category(row.dataset.sport) === active;
            const matchesText = !query || row.textContent.toLowerCase().includes(query);
            row.hidden = !(matchesType && matchesText);
        });
    };
    container.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
        container.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active",item===button)); applyFilters();
    }));
    container.querySelector(".activity-search input").addEventListener("input", applyFilters);
    container.querySelectorAll("[data-activity-id]").forEach(button => button.addEventListener("click", () => {
        const log = logs.find(item => item.id === button.dataset.activityId);
        if (log) container.querySelector("#activity-detail").innerHTML = detail(log, logs);
        container.querySelectorAll(".activity-row").forEach(item => item.classList.toggle("selected",item===button));
    }));
}

function liveTrackerMarkup() {
    return `<dialog class="live-activity-dialog" id="live-activity-dialog"><div class="live-tracker">
        <div class="dialog-heading"><div><span>LIVE ACTIVITY</span><h2>Ready to move</h2></div><button data-close-live type="button" aria-label="Close">×</button></div>
        <label class="live-sport">Sport<select id="live-sport"><option value="run">Running</option><option value="ride">Cycling</option><option value="walk">Walking</option></select></label>
        <div class="gps-status" id="gps-status">GPS has not started.</div>
        <div class="live-map"><svg id="route-map" viewBox="0 0 600 300" role="img" aria-label="Recorded route"><defs><linearGradient id="route-gradient"><stop stop-color="#ff9a72"/><stop offset="1" stop-color="#e64b16"/></linearGradient></defs><polyline id="route-line" fill="none" stroke="url(#route-gradient)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" points=""/></svg><span id="map-placeholder">Your route will appear here</span></div>
        <div class="live-metrics"><div><span>TIME</span><strong id="live-time">00:00</strong></div><div><span>DISTANCE</span><strong id="live-distance">0.00 km</strong></div><div><span>PACE</span><strong id="live-pace">—</strong></div><div><span>GPS</span><strong id="live-accuracy">—</strong></div></div>
        <div class="split-panel"><h3>Kilometre splits</h3><div id="live-splits"><p>No splits recorded yet.</p></div></div>
        <div class="live-controls"><button class="primary-button" data-live-action="start" type="button">Start</button><button class="secondary-button" data-live-action="pause" type="button" disabled>Pause</button><button class="danger-button" data-live-action="finish" type="button" disabled>Finish & save</button></div>
    </div></dialog>`;
}

function bindLiveTracker(container, refresh) {
    const dialog=container.querySelector("#live-activity-dialog");
    const state={watchId:null,timerId:null,elapsed:0,lastTick:null,points:[],distanceKm:0,splits:[],lastSplitDistance:0,lastSplitElapsed:0,running:false};
    const $=selector=>dialog.querySelector(selector);
    container.querySelector("#start-live-activity").addEventListener("click",()=>dialog.showModal());
    $("[data-close-live]").addEventListener("click",()=>{stopLive(state);dialog.close();});
    $("[data-live-action='start']").addEventListener("click",()=>{
        if(!navigator.geolocation){$("#gps-status").textContent="GPS is not supported in this browser.";return;}
        state.running=true;state.lastTick=Date.now();$("#gps-status").textContent="Requesting location permission…";
        state.timerId=setInterval(()=>{if(state.running){const now=Date.now();state.elapsed+=Math.round((now-state.lastTick)/1000);state.lastTick=now;renderLive(dialog,state);}},1000);
        state.watchId=navigator.geolocation.watchPosition(position=>recordPosition(dialog,state,position),error=>{$("#gps-status").textContent=gpsError(error);},{enableHighAccuracy:true,maximumAge:2000,timeout:15000});
        $("[data-live-action='start']").disabled=true;$("[data-live-action='pause']").disabled=false;$("[data-live-action='finish']").disabled=false;$("#live-sport").disabled=true;
    });
    $("[data-live-action='pause']").addEventListener("click",event=>{state.running=!state.running;state.lastTick=Date.now();event.currentTarget.textContent=state.running?"Pause":"Resume";$("#gps-status").textContent=state.running?"Recording resumed.":"Activity paused.";});
    $("[data-live-action='finish']").addEventListener("click",()=>{
        stopLive(state);if(state.elapsed<1){$("#gps-status").textContent="Record some activity before saving.";return;}
        const sport=$("#live-sport").value;
        saveWorkoutLog({workoutName:`${labelSport(sport)} activity`,sportType:sport,status:"completed",source:"gps",durationMinutes:Math.max(1,Math.round(state.elapsed/60)),durationSeconds:state.elapsed,distanceKm:Number(state.distanceKm.toFixed(3)),rpe:6,routePoints:state.points.slice(-2000),splits:state.splits,completedExercises:0,totalExercises:0,notes:"Recorded with Athlos Live Activity"});
        dialog.close();refresh();
    });
}

function recordPosition(dialog,state,position){
    if(!state.running)return;
    const point={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:Math.round(position.coords.accuracy),elevation:position.coords.altitude,time:new Date(position.timestamp).toISOString()};
    const previous=state.points.at(-1);
    if(previous&&point.accuracy<=100){const segment=haversine(previous,point);if(segment<.25)state.distanceKm+=segment;}
    if(!previous||haversine(previous,point)>.003)state.points.push(point);
    while(state.distanceKm-state.lastSplitDistance>=1){const seconds=state.elapsed-state.lastSplitElapsed;state.splits.push({kilometre:state.splits.length+1,seconds});state.lastSplitDistance+=1;state.lastSplitElapsed=state.elapsed;}
    dialog.querySelector("#gps-status").textContent=point.accuracy<=30?"GPS signal is strong.":point.accuracy<=75?"GPS accuracy is moderate.":"Waiting for a stronger GPS signal…";
    renderLive(dialog,state,point.accuracy);
}
function renderLive(dialog,state,accuracy){
    const clock=seconds=>`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
    dialog.querySelector("#live-time").textContent=clock(state.elapsed);dialog.querySelector("#live-distance").textContent=`${state.distanceKm.toFixed(2)} km`;dialog.querySelector("#live-pace").textContent=state.distanceKm>.02?`${clock(Math.round(state.elapsed/state.distanceKm))}/km`:"—";if(accuracy)dialog.querySelector("#live-accuracy").textContent=`±${accuracy} m`;
    dialog.querySelector("#live-splits").innerHTML=state.splits.length?state.splits.map(split=>`<div><span>KM ${split.kilometre}</span><strong>${clock(split.seconds)}</strong></div>`).join(""):"<p>No splits recorded yet.</p>";
    const points=normaliseRoute(state.points);dialog.querySelector("#route-line").setAttribute("points",points);dialog.querySelector("#map-placeholder").hidden=Boolean(points);
}
function normaliseRoute(points){if(points.length<2)return"";const lats=points.map(p=>p.lat),lngs=points.map(p=>p.lng);const minLat=Math.min(...lats),maxLat=Math.max(...lats),minLng=Math.min(...lngs),maxLng=Math.max(...lngs);const latRange=maxLat-minLat||.001,lngRange=maxLng-minLng||.001;return points.map(p=>`${30+((p.lng-minLng)/lngRange)*540},${270-((p.lat-minLat)/latRange)*240}`).join(" ");}
function haversine(a,b){const radius=6371,toRad=value=>value*Math.PI/180;const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);const value=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;return 2*radius*Math.atan2(Math.sqrt(value),Math.sqrt(1-value));}
function stopLive(state){if(state.watchId!==null)navigator.geolocation.clearWatch(state.watchId);clearInterval(state.timerId);state.watchId=null;state.timerId=null;state.running=false;}
function gpsError(error){return({1:"Location permission was not granted.",2:"Your location is currently unavailable.",3:"GPS timed out. Move outdoors and try again."})[error.code]||"GPS could not start.";}

function activityRow(log,index) {
    const sport = inferSport(log);
    const metrics = [formatMinutes(Number(log.durationMinutes||0)), Number(log.distanceKm)>0 ? `${Number(log.distanceKm).toFixed(1)} km` : "", log.rpe ? `RPE ${log.rpe}` : ""].filter(Boolean).join(" · ");
    return `<button class="activity-row ${index===0?"selected":""}" data-activity-id="${escapeHtml(log.id)}" data-sport="${escapeHtml(sport)}" type="button"><span class="sport-icon">${sportIcon(sport)}</span><div><span>${formatDate(log.completedAt)}</span><strong>${escapeHtml(log.workoutName||"Training session")}</strong><small>${escapeHtml(metrics||log.status)}</small></div><b aria-hidden="true">›</b></button>`;
}

function detail(log, allLogs) {
    const sport=inferSport(log); const insight=activityInsight(log,allLogs); const exercises=Array.isArray(log.exerciseDetails)?log.exerciseDetails:[];
    return `<div class="detail-header"><span>${sportIcon(sport)} ${escapeHtml(labelSport(sport))}</span><h3>${escapeHtml(log.workoutName||"Training session")}</h3><p>${formatDate(log.completedAt)}</p></div>
    <div class="detail-metrics">${detailMetric("Time",formatMinutes(Number(log.durationMinutes||0)))}${detailMetric("Distance",Number(log.distanceKm)>0?`${Number(log.distanceKm).toFixed(2)} km`:"—")}${detailMetric("Effort",log.rpe?`${log.rpe}/10`:"—")}${detailMetric("Elevation",Number(log.elevationMetres)>0?`${log.elevationMetres} m`:"—")}</div>
    ${exercises.length?`<div class="detail-exercises"><h4>Exercise performance</h4>${exercises.map(item=>`<div><span>${item.completed?"✓":"○"} ${escapeHtml(item.name)}</span><strong>${escapeHtml(item.actualSets||"—")} × ${escapeHtml(item.actualReps||"—")} ${item.load?`· ${escapeHtml(item.load)}`:""}</strong></div>`).join("")}</div>`:""}
    ${log.notes?`<div class="activity-notes"><h4>Session notes</h4><p>${escapeHtml(log.notes)}</p></div>`:""}
    <div class="activity-insight"><span>ATHLOS INSIGHT</span><strong>${escapeHtml(insight.title)}</strong><p>${escapeHtml(insight.text)}</p></div>`;
}

function activityInsight(log, logs) {
    const sameSport=logs.filter(item=>inferSport(item)===inferSport(log)&&item.id!==log.id);
    const currentLifts=(log.exerciseDetails||[]).map(item=>({name:item.name,load:parseFloat(String(item.load||"").replace(/[^0-9.]/g,""))})).filter(item=>item.load);
    const priorLifts=logs.filter(item=>item.id!==log.id).flatMap(item=>item.exerciseDetails||[]);
    const newBest=currentLifts.find(item=>item.load>Math.max(0,...priorLifts.filter(previous=>previous.name===item.name).map(previous=>parseFloat(String(previous.load||"").replace(/[^0-9.]/g,""))||0)));
    if(newBest)return{title:`New ${newBest.name} record`,text:`${newBest.load} kg is your highest recorded load for this movement. Progress conservatively and repeat it with strong technique before increasing again.`};
    const bestDistance=Math.max(0,...sameSport.map(item=>Number(item.distanceKm||0)));
    if(Number(log.distanceKm)>bestDistance&&Number(log.distanceKm)>0)return{title:"New distance best",text:"This is your longest recorded activity in this sport. Keep the next session controlled so the extra volume can be absorbed."};
    if(Number(log.rpe)>=9)return{title:"High-effort session",text:"This was a demanding workout. Athlos recommends avoiding another high-intensity session tomorrow."};
    if(Number(log.rpe)<=4)return{title:"Recovery work banked",text:"Low-intensity volume supports consistency without adding excessive fatigue."};
    return{title:"Productive training",text:"The session sits in a useful effort range. Your next readiness check will determine whether progression is appropriate."};
}

function summarise(logs){const completed=logs.filter(item=>item.status==="completed");const rpes=completed.filter(item=>Number(item.rpe)>0);return{count:completed.length,minutes:completed.reduce((s,x)=>s+Number(x.durationMinutes||0),0),distance:completed.reduce((s,x)=>s+Number(x.distanceKm||0),0),averageRpe:rpes.length?(rpes.reduce((s,x)=>s+Number(x.rpe),0)/rpes.length).toFixed(1):null};}
function inferSport(log){if(log.sportType)return log.sportType;const text=`${log.workoutName} ${log.workoutDay}`.toLowerCase();if(/run|interval|sprint|aerobic/.test(text))return"run";if(/ride|cycle|bike/.test(text))return"ride";if(/strength|squat|press|lift/.test(text))return"strength";if(/swim/.test(text))return"swim";return"other";}
function category(sport){return["run","ride","strength"].includes(sport)?sport:"other";}
function sportIcon(sport){return({run:"R",ride:"C",swim:"S",strength:"W",team:"T",mobility:"M",other:"A"})[sport]||"A";}
function labelSport(sport){return({run:"Running",ride:"Cycling",swim:"Swimming",strength:"Strength",team:"Team sport",mobility:"Mobility",other:"Activity"})[sport]||"Activity";}
function formatMinutes(value){if(!value)return"—";const h=Math.floor(value/60),m=value%60;return h?`${h}h ${m}m`:`${m} min`;}
function formatDate(value){const date=new Date(value);return Number.isNaN(date.getTime())?"Date not recorded":date.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});}
function summaryCard(label,value){return`<article><span>${label}</span><strong>${value}</strong></article>`;}
function detailMetric(label,value){return`<div><span>${label}</span><strong>${value}</strong></div>`;}
function emptyState(){return'<div class="activity-empty"><strong>No activities recorded</strong><p>Log a workout to start building your history.</p></div>';}
function emptyDetail(){return'<div class="activity-empty"><strong>Select an activity</strong><p>Detailed performance and Athlos insights will appear here.</p></div>';}
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
