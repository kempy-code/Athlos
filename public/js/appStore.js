import { isStaticHosting } from "./api.js";

const STORE_KEY = "athlos_app_v1";

function defaults() {
    return { version: 1, currentPlan: null, planSavedAt: null, workoutLogs: [], readiness: [], goals: [], performanceTests: [], nutritionLogs: [], healthSamples: [], trainingBlocks: [], challenges: [], notificationPreferences: { workout: true, readiness: true, weekly: true } };
}

export function getAppData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
        return saved && saved.version === 1 ? { ...defaults(), ...saved } : defaults();
    } catch {
        return defaults();
    }
}

function persist(next) {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    if (!isStaticHosting()) fetch("/api/user-data", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({data:next}) }).catch(() => {});
    return next;
}

export function updateAppData(changes) {
    return persist({ ...getAppData(), ...changes, version: 1 });
}

function identified(entry, prefix) {
    return { id: globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}`, createdAt: new Date().toISOString(), ...entry };
}

export function saveGoal(goal) {
    const data = getAppData();
    const entry = identified(goal, "goal");
    persist({ ...data, goals: [...data.goals, entry] });
    return entry;
}

export function saveTrainingBlock(block) {
    const data=getAppData();const entry=identified(block,"block");
    persist({...data,trainingBlocks:[...data.trainingBlocks,entry]});return entry;
}

export function saveChallenge(challenge) {
    const data=getAppData();const entry=identified(challenge,"challenge");
    persist({...data,challenges:[...data.challenges,entry]});return entry;
}

export function getPersonalRecords() {
    const logs=getWorkoutLogs().filter(log=>log.status==="completed");
    const longest=logs.reduce((best,log)=>Number(log.distanceKm||0)>Number(best?.distanceKm||0)?log:best,null);
    const fastest=logs.filter(log=>Number(log.distanceKm)>0&&Number(log.durationSeconds||log.durationMinutes*60)>0).reduce((best,log)=>{const pace=Number(log.durationSeconds||log.durationMinutes*60)/Number(log.distanceKm);return !best||pace<best.pace?{log,pace}:best;},null);
    const lifts=new Map();
    logs.flatMap(log=>log.exerciseDetails||[]).forEach(item=>{const load=parseFloat(String(item.load||"").replace(/[^0-9.]/g,""));if(load&&(!lifts.has(item.name)||load>lifts.get(item.name).load))lifts.set(item.name,{name:item.name,load,reps:item.actualReps});});
    return {longest,fastest,lifts:[...lifts.values()].sort((a,b)=>b.load-a.load)};
}

export function updateGoal(id, changes) {
    const data = getAppData();
    return persist({ ...data, goals: data.goals.map(goal => goal.id === id ? { ...goal, ...changes } : goal) });
}

export function savePerformanceTest(result) {
    const data = getAppData();
    const entry = identified(result, "test");
    persist({ ...data, performanceTests: [...data.performanceTests, entry] });
    return entry;
}

export function saveNutritionLog(log) {
    const data = getAppData();
    const entry = identified(log, "nutrition");
    persist({ ...data, nutritionLogs: [...data.nutritionLogs, entry] });
    return entry;
}

export function importHealthSamples(samples, source = "manual") {
    const data = getAppData();
    const clean = samples.filter(item => item && typeof item === "object").slice(0, 1000).map(item => identified({ ...item, source: item.source || source }, "health"));
    persist({ ...data, healthSamples: [...data.healthSamples, ...clean].slice(-5000) });
    return clean.length;
}

export function getTrainingLoad(days = 28, now = new Date()) {
    const cutoff = now.getTime() - days * 86400000;
    const logs = getWorkoutLogs().filter(log => new Date(log.completedAt).getTime() >= cutoff && log.status === "completed");
    const entries = logs.map(log => ({ ...log, load: Number(log.durationMinutes || 45) * Number(log.rpe || 0) }));
    const recentCutoff = now.getTime() - 7 * 86400000;
    const recent = entries.filter(log => new Date(log.completedAt).getTime() >= recentCutoff);
    const recentLoad = recent.reduce((sum, log) => sum + log.load, 0);
    const totalLoad = entries.reduce((sum, log) => sum + log.load, 0);
    const averageWeekly = days ? totalLoad / (days / 7) : totalLoad;
    const ratio = averageWeekly ? recentLoad / averageWeekly : 0;
    const mean = recent.length ? recentLoad / recent.length : 0;
    const variance = recent.length ? recent.reduce((sum, log) => sum + (log.load - mean) ** 2, 0) / recent.length : 0;
    const monotony = variance ? mean / Math.sqrt(variance) : 0;
    return { recentLoad: Math.round(recentLoad), averageWeekly: Math.round(averageWeekly), ratio: ratio.toFixed(2), monotony: monotony.toFixed(2), sessions: recent.length };
}

export async function hydrateAppData() {
    if (isStaticHosting()) return getAppData();
    try {
        const response=await fetch("/api/user-data");
        if(!response.ok)return getAppData();
        const remote=(await response.json()).data;
        if(remote&&typeof remote==="object") {
            const next={...defaults(),...remote,version:1};
            localStorage.setItem(STORE_KEY,JSON.stringify(next));
            return next;
        }
    } catch {}
    return getAppData();
}

export function savePlan(plan) {
    const data = getAppData();
    return persist({ ...data, currentPlan: plan, planSavedAt: new Date().toISOString() });
}

export function loadPlan() { return getAppData().currentPlan; }

export function clearPlan() {
    const data = getAppData();
    return persist({ ...data, currentPlan: null, planSavedAt: null, workoutLogs: [], readiness: [] });
}

export function saveWorkoutLog(log) {
    const data = getAppData();
    const entry = { id: globalThis.crypto?.randomUUID?.() || `log-${Date.now()}`, completedAt: new Date().toISOString(), ...log };
    persist({ ...data, workoutLogs: [...data.workoutLogs, entry] });
    return entry;
}

export function seedDemoData(plan, now = new Date()) {
    const day = 86400000;
    const completed = (name, daysAgo, rpe, exercises, notes) => ({
        id: `demo-${daysAgo}-${name.toLowerCase().replaceAll(" ", "-")}`,
        completedAt: new Date(now.getTime() - daysAgo * day).toISOString(),
        workoutName: name, workoutDay: daysAgo === 0 ? "Today" : `${daysAgo} days ago`,
        status: "completed", completedExercises: exercises, totalExercises: exercises,
        rpe, notes, recommendation: { level: "ready" }
    });
    const readiness = [6, 4, 2, 0].map((daysAgo, index) => ({
        recordedAt: new Date(now.getTime() - daysAgo * day).toISOString(),
        energy: [3, 4, 3, 4][index], sleep: [3, 4, 2, 4][index],
        soreness: [3, 2, 4, 2][index], stress: [3, 2, 3, 2][index], pain: 1,
        recommendation: { level: index === 2 ? "adjust" : "ready" }
    }));
    return persist({
        ...defaults(), currentPlan: plan, planSavedAt: now.toISOString(), demoMode: true,
        workoutLogs: [
            completed("Foundation Strength", 6, 7, 5, "Strong technique across all sets."),
            completed("Aerobic Development", 4, 6, 4, "Controlled pace and breathing."),
            completed("Speed and Mechanics", 2, 8, 5, "Last interval was challenging."),
            completed("Mobility Reset", 0, 3, 4, "Hips feel much better.")
        ],
        readiness
    });
}

export function getWorkoutLogs() { return getAppData().workoutLogs; }

export function saveReadiness(checkin) {
    const data = getAppData();
    const entry = { recordedAt: new Date().toISOString(), ...checkin };
    persist({ ...data, readiness: [...data.readiness, entry] });
    return entry;
}

export function getReadiness() { return getAppData().readiness; }

export function getProgressSummary(totalWorkouts = 0) {
    const logs = getWorkoutLogs();
    const completedLogs = logs.filter(log => log.status === "completed");
    const completed = completedLogs.length;
    const averageRpe = completedLogs.length ? completedLogs.reduce((sum, log) => sum + Number(log.rpe || 0), 0) / completedLogs.length : 0;
    const latest = logs.at(-1) || null;
    return { completed, totalWorkouts, completionRate: totalWorkouts ? Math.min(100, Math.round((completed / totalWorkouts) * 100)) : 0, averageRpe: averageRpe ? averageRpe.toFixed(1) : "-", latest };
}

export function readinessRecommendation(checkin) {
    const score = [checkin.energy, checkin.sleep, 6 - checkin.soreness, 6 - checkin.stress].reduce((sum, value) => sum + Number(value || 3), 0);
    if (score <= 10 || Number(checkin.pain) >= 4) return { score, level: "reduce", title: "Recovery session recommended", volumeMultiplier: .7, text: "Reduce volume by 30%, use comfortable loads, and stop any movement that increases pain.", changes: ["Remove the final working set", "Keep effort at RPE 6 or below", "Replace painful movements"] };
    if (score <= 14) return { score, level: "adjust", title: "Train with adjustments", volumeMultiplier: .85, text: "Keep the session, but extend the warm-up and leave 2–3 repetitions in reserve.", changes: ["Add 5 minutes to the warm-up", "Reduce working load by 10–15%", "Skip optional finishers"] };
    return { score, level: "ready", title: "Ready as planned", volumeMultiplier: 1, text: "Readiness looks good. Complete the planned session while maintaining strong technique.", changes: ["Complete the full session", "Use planned training loads", "Record effort after training"] };
}

export function getWeeklyReview(now = new Date()) {
    const since = now.getTime() - 7 * 86400000;
    const logs = getWorkoutLogs().filter(log => new Date(log.completedAt).getTime() >= since && log.status === "completed");
    const checkins = getReadiness().filter(item => new Date(item.recordedAt).getTime() >= since);
    const averageRpe = logs.length ? logs.reduce((sum, log) => sum + Number(log.rpe || 0), 0) / logs.length : 0;
    const reducedDays = checkins.filter(item => item.recommendation?.level !== "ready").length;
    const tone = averageRpe >= 8 || reducedDays >= 2 ? "manage" : logs.length >= 3 ? "progress" : "build";
    const messages = {
        manage: "You completed meaningful work, but fatigue signals were elevated. Protect adaptation with an easier opening to next week.",
        progress: "Consistency was strong and effort stayed productive. You are ready for a small progression next week.",
        build: "You have started building momentum. Prioritise consistency before increasing training load."
    };
    return { sessions: logs.length, averageRpe: averageRpe ? averageRpe.toFixed(1) : "-", reducedDays, tone, message: messages[tone] };
}
