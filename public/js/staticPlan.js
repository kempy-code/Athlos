import { demoPlan } from "./demoPlan.js";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function buildStaticPlan(profile = {}) {
    const requestedDays = clamp(Number(profile.training_days || profile.hybrid_current_sessions || profile.lifting_frequency || 4), 2, 7);
    const availableDays = normaliseDays(profile.available_days);
    const schedule = availableDays.length >= requestedDays ? availableDays.slice(0, requestedDays) : WEEKDAYS.filter(day => !["Wednesday", "Friday"].includes(day)).slice(0, requestedDays);
    const focus = display(profile.training_type || profile.primary_goal || profile.hybrid_goal || profile.gym_goal || profile.sport_name || "Performance");
    const duration = display(profile.goal_timeline || "8 weeks");
    const sessionLength = display(profile.session_length || "45–60 min");
    const workouts = Array.from({ length: requestedDays }, (_, index) => {
        const source = structuredClone(demoPlan.workouts[index % demoPlan.workouts.length]);
        return { ...source, day: schedule[index] || WEEKDAYS[index], duration: index === requestedDays - 1 && requestedDays > 4 ? source.duration : sessionLength, purpose: `${source.purpose}. Supports your ${focus.toLowerCase()} focus.` };
    });

    return {
        ...structuredClone(demoPlan),
        program_name: `${focus} Training Plan`,
        program_duration: duration,
        training_days: requestedDays,
        session_length: sessionLength,
        workouts,
        recovery: {
            ...structuredClone(demoPlan.recovery),
            sleep: display(profile.sleep_hours || demoPlan.recovery.sleep),
            rest_days: WEEKDAYS.filter(day => !schedule.includes(day)).join(" and ") || "Use readiness to guide lighter days",
            injury_management: profile.has_injury === true || String(profile.has_injury).toLowerCase() === "yes" ? "Follow your stated restrictions, stop movements that increase pain, and use qualified medical guidance." : demoPlan.recovery.injury_management
        },
        metadata: { generationMode: "local", note: "Created on this device from your questionnaire answers." }
    };
}

function normaliseDays(value) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return WEEKDAYS.filter(day => values.some(item => String(item).toLowerCase().startsWith(day.toLowerCase().slice(0, 3))));
}
function display(value) { return String(value ?? "").replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)); }
