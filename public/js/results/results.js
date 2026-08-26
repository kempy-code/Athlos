// =====================================
// ATHLOS RESULTS CONTROLLER
// public/js/results/results.js
// =====================================

import { createDashboard } from "./dashboard.js";
import { normalisePlan } from "./normalisePlan.js";
import { renderCalendar } from "./calendar.js";
import { renderWorkouts } from "./workouts.js";
import { renderNutrition } from "./nutrition.js";
import { renderRecovery } from "./recovery.js";
import { renderAchievements } from "./achievements.js";
import { renderExercises } from "./exercises.js";
import { renderProgress } from "./progress.js";
import { openWorkoutModal } from "./workoutModal.js";
import { clearPlan, getAppData, getWorkoutLogs, savePlan } from "../appStore.js";
import { resetState } from "../state.js";
import { renderCoach } from "./coach.js";
import { logout } from "../authClient.js";
import { renderAccount } from "./account.js";
import { renderToolkit } from "./toolkit.js";
import { renderActivityHistory } from "./activityHistory.js";
import { initialiseTutorial } from "./tutorial.js";

export function loadDashboard(rawPlan) {

    if (!rawPlan) {
        console.error("Athlos: No plan received");
        return;
    }

    const container = document.querySelector(".container");

    if (!container) {
        console.error("Athlos: Dashboard container '.container' was not found");
        return;
    }

    const plan = normalisePlan(rawPlan);
    const demoMode = Boolean(getAppData().demoMode);
    const dashboard = createDashboard(plan);

    container.replaceChildren(dashboard);

    const getTab = id => dashboard.querySelector(`#${id}`);
    const completedNames = new Set(getWorkoutLogs().filter(log => log.status === "completed").map(log => log.workoutName));
    const nextWorkout = plan.workouts.find(workout => !completedNames.has(workout.name)) || plan.workouts[0];
    const title = dashboard.querySelector("#next-workout-name");
    const day = dashboard.querySelector("#next-workout-day");
    const stats = dashboard.querySelector("#dashboard-stats");

    if (title) {
        title.textContent = nextWorkout?.name || "Training Session";
    }

    if (day) {
        day.textContent = nextWorkout?.day || nextWorkout?.type || "Workout";
    }

    if (stats) {
        stats.innerHTML = [
            statCard("Duration", plan.metadata.duration),
            statCard("Training Days", plan.metadata.trainingDays),
            statCard("Calories", plan.nutrition.calories),
            statCard("Sleep", plan.recovery.sleep)
        ].join("");
    }

    dashboard.querySelector("#start-next-workout-btn")?.addEventListener("click", () => {
        if (nextWorkout) openWorkoutModal(nextWorkout, () => loadDashboard(rawPlan));
    });
    dashboard.querySelector("#start-over-btn")?.addEventListener("click", () => {
        if (window.confirm("Create a new plan? Your current plan and workout history will be cleared.")) {
            clearPlan();
            resetState();
            window.location.reload();
        }
    });

    document.getElementById("onboarding-progress")?.setAttribute("hidden", "");
    const home = getTab("home-tab");

    if (home) {
        const welcome = document.createElement("div");
        const actions = document.createElement("div");
        const homeWorkouts = document.createElement("div");
        const homeRecovery = document.createElement("div");
        const homeNutrition = document.createElement("div");

        welcome.innerHTML = onboardingChecklist(plan, nextWorkout);
        actions.innerHTML = quickActions(nextWorkout);
        home.replaceChildren(welcome, actions, homeWorkouts, homeRecovery, homeNutrition);
        renderWorkouts(homeWorkouts, nextWorkout ? [nextWorkout] : [], "Next workout");
        renderRecovery(homeRecovery, plan.recovery);
        renderNutrition(homeNutrition, plan.nutrition, true);
        home.querySelector("#home-start-workout")?.addEventListener("click", () => {
            if (nextWorkout) openWorkoutModal(nextWorkout, () => loadDashboard(rawPlan));
        });
    }

    const calendar = getTab("calendar-tab");

    if (calendar) {
        renderCalendar(calendar, plan.workouts, movedWorkouts => {
            const updated = { ...plan, workouts: movedWorkouts };
            savePlan(updated);
            loadDashboard(updated);
        });
    }

    // dashboard.js defines workouts-tab; it does not define exercises-tab.
    const workouts = getTab("workouts-tab");

    if (workouts) {
        renderWorkouts(workouts, plan.workouts);
        const exerciseLibrary = document.createElement("div");
        workouts.append(exerciseLibrary);
        renderExercises(exerciseLibrary, plan.exercises);
    }

    const nutrition = getTab("nutrition-tab");

    if (nutrition) {
        renderNutrition(nutrition, plan.nutrition);
    }

    const progress = getTab("progress-tab");

    if (progress) {
        renderAchievements(progress, plan.achievements, plan.milestones);
        renderProgress(progress, plan);
    }

    const activity=getTab("activity-tab");
    if(activity)renderActivityHistory(activity, () => loadDashboard(rawPlan));

    const coach=getTab("coach-tab");
    if(coach)renderCoach(coach, { demoMode });
    const toolkit=getTab("toolkit-tab");
    if(toolkit)renderToolkit(toolkit, plan, () => loadDashboard(rawPlan));
    const account=getTab("account-tab");
    if(account) {
        if (demoMode) account.innerHTML = `<section class="dashboard-section demo-account"><div class="section-header"><h2>Demo athlete</h2><p>This is realistic sample data for exploring Athlos. Create an account to build and securely save your own plan.</p></div><button class="primary-button" data-exit-demo type="button">Exit demo and create an account</button></section>`;
        else renderAccount(account);
    }

    const accountBar=document.createElement("div");
    accountBar.className="account-bar";
    accountBar.innerHTML=demoMode ? `<span>Demo athlete · Sample training data</span><button type="button">Exit demo</button>` : `<span>Securely saved to your Athlos account</span><button type="button">Sign out</button>`;
    accountBar.querySelector("button").addEventListener("click", demoMode ? exitDemo : logout);
    dashboard.querySelector("[data-exit-demo]")?.addEventListener("click", exitDemo);
    dashboard.prepend(accountBar);

    dashboard.querySelectorAll("[data-open-tab]").forEach(button => {
        button.addEventListener("click", () => {
            dashboard.querySelector(`[data-tab="${button.dataset.openTab}"]`)?.click();
            dashboard.querySelector(".dashboard-command-bar")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    initialiseTutorial(dashboard);

    dashboard.addEventListener("athlos:start-workout", event => {
        openWorkoutModal(event.detail.workout, () => loadDashboard(rawPlan));
    });
}

function quickActions(nextWorkout) {
    return `<section class="quick-action-panel" aria-labelledby="quick-actions-title">
        <div class="quick-action-heading"><div><span class="eyebrow">TODAY</span><h2 id="quick-actions-title">What do you want to do?</h2></div><p>Everything important is one tap away.</p></div>
        <div class="quick-action-grid">
            <button type="button" class="quick-action primary" id="home-start-workout"><span>▶</span><div><strong>Start training</strong><small>${escapeHtml(nextWorkout?.name || "Next planned session")}</small></div></button>
            <button type="button" class="quick-action" data-open-tab="activity"><span>＋</span><div><strong>Log activity</strong><small>Add a completed workout</small></div></button>
            <button type="button" class="quick-action" data-open-tab="toolkit"><span>♥</span><div><strong>Check readiness</strong><small>Adjust today’s training</small></div></button>
            <button type="button" class="quick-action" data-open-tab="coach"><span>✦</span><div><strong>Ask AI Coach</strong><small>Get plan-aware guidance</small></div></button>
        </div>
    </section>`;
}

function onboardingChecklist(plan, nextWorkout) {
    const completed = getWorkoutLogs().filter(log => log.status === "completed").length;
    const items = [
        [true, "Your athlete profile and plan are ready"],
        [Boolean(nextWorkout), "Review your next training session"],
        [completed > 0, completed > 0 ? "First workout logged" : "Complete and log your first workout"],
        [false, "Ask the AI Coach one training question"]
    ];
    const done = items.filter(([value]) => value).length;
    return `<section class="getting-started-card" aria-labelledby="getting-started-title">
        <div><span class="eyebrow">GETTING STARTED</span><h2 id="getting-started-title">Make Athlos yours</h2><p>${done} of ${items.length} starter steps complete. Your next best action is ready below.</p></div>
        <div class="checklist" role="list">${items.map(([value, label]) => `<div class="checklist-item${value ? " complete" : ""}" role="listitem"><span aria-hidden="true">${value ? "✓" : ""}</span><strong>${escapeHtml(label)}</strong></div>`).join("")}</div>
    </section>`;
}

function exitDemo() {
    clearPlan();
    window.location.reload();
}

function statCard(title, value) {
    return `
        <div class="stat-card">
            <span>${escapeHtml(title)}</span>
            <strong>${escapeHtml(displayValue(value) || "-")}</strong>
        </div>
    `;
}

function displayValue(value) {
    if (Array.isArray(value)) {
        return value.map(displayValue).filter(Boolean).join(", ");
    }

    if (value && typeof value === "object") {
        return value.text || value.label || value.name || "";
    }

    return value == null ? "" : String(value);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
