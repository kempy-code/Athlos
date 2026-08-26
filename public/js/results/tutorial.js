const STORAGE_KEY = "athlos_tutorial_complete_v1";

const steps = [
    { selector: ".dashboard-hero", title: "Your training headquarters", body: "See the shape of your program and start the next session without hunting through menus." },
    { selector: ".dashboard-stats", title: "Your plan at a glance", body: "These quick facts keep the key targets visible while you train." },
    { selector: ".dashboard-tabs", title: "Everything has a home", body: "Open your schedule, workouts, nutrition, progress, activity history, AI Coach and athlete tools here." },
    { selector: "[data-tab='activity']", title: "Build your training history", body: "Log completed sessions and review what you did, how it felt and how your performance changes." },
    { selector: "[data-tab='coach']", title: "Meet your AI Coach", body: "Ask questions about your plan, recovery or upcoming sessions. It uses your Athlos context to make answers more useful." },
    { selector: "#start-next-workout-btn", title: "You are ready", body: "Start the next workout when you are ready. You can replay this tour at any time from the Tour button." }
];

export function initialiseTutorial(dashboard) {
    const replay = dashboard.querySelector("#dashboard-help-btn");
    replay?.addEventListener("click", () => startTutorial(dashboard));

    if (!localStorage.getItem(STORAGE_KEY)) {
        window.setTimeout(() => showWelcome(dashboard), 450);
    }
}

function showWelcome(dashboard) {
    if (document.querySelector(".tutorial-welcome")) return;
    const dialog = document.createElement("div");
    dialog.className = "tutorial-welcome";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "tutorial-welcome-title");
    dialog.innerHTML = `<div class="tutorial-welcome-card"><span class="eyebrow">WELCOME TO ATHLOS</span><h2 id="tutorial-welcome-title">Find your feet in 60 seconds</h2><p>Take a quick tour of your plan, workout history and AI coaching tools.</p><div><button class="secondary-button" type="button" data-tutorial-later>Maybe later</button><button class="primary-button" type="button" data-tutorial-start>Start tour</button></div></div>`;
    document.body.append(dialog);
    dialog.querySelector("[data-tutorial-start]").addEventListener("click", () => { dialog.remove(); startTutorial(dashboard); });
    dialog.querySelector("[data-tutorial-later]").addEventListener("click", () => dialog.remove());
    dialog.querySelector("[data-tutorial-start]").focus();
}

function startTutorial(dashboard) {
    document.querySelector(".tutorial-layer")?.remove();
    let index = 0;
    const layer = document.createElement("div");
    layer.className = "tutorial-layer";
    layer.innerHTML = `<div class="tutorial-shade"></div><div class="tutorial-popover" role="dialog" aria-modal="true"><div class="tutorial-progress"></div><span class="tutorial-step"></span><h2></h2><p></p><div class="tutorial-actions"><button type="button" data-skip>Skip</button><div><button type="button" data-back>Back</button><button type="button" data-next>Next</button></div></div></div>`;
    document.body.append(layer);
    const popover = layer.querySelector(".tutorial-popover");

    let scrollFrame = 0;
    const close = complete => {
        if (complete) localStorage.setItem(STORAGE_KEY, "true");
        layer.remove();
        window.removeEventListener("resize", render);
        window.removeEventListener("scroll", onScroll, true);
        document.removeEventListener("keydown", onKey);
        cancelAnimationFrame(scrollFrame);
    };
    const onKey = event => {
        if (event.key === "Escape") close(false);
        if (event.key === "ArrowRight") move(1);
        if (event.key === "ArrowLeft") move(-1);
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) event.preventDefault();
    };
    const move = amount => {
        if (index + amount >= steps.length) return close(true);
        index = Math.max(0, index + amount);
        render();
    };
    const onScroll = () => {
        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(positionCurrentStep);
    };
    function positionCurrentStep() {
        const target = dashboard.querySelector(steps[index].selector);
        if (!target || !document.body.contains(layer)) return;
        const rect = target.getBoundingClientRect();
        updateSpotlight(rect);
        positionPopover(popover, rect);
    }
    function updateSpotlight(rect) {
        const left = Math.max(8, rect.left - 7);
        const top = Math.max(8, rect.top - 7);
        layer.style.setProperty("--spot-x", `${left}px`);
        layer.style.setProperty("--spot-y", `${top}px`);
        layer.style.setProperty("--spot-w", `${Math.max(0, Math.min(window.innerWidth - left - 8, rect.width + 14))}px`);
        layer.style.setProperty("--spot-h", `${Math.max(0, Math.min(window.innerHeight - top - 8, rect.height + 14))}px`);
    }
    function render() {
        const step = steps[index];
        const target = dashboard.querySelector(step.selector);
        if (!target) return move(1);
        target.scrollIntoView({ behavior: "auto", block: "center" });
        const rect = target.getBoundingClientRect();
        updateSpotlight(rect);
        layer.querySelector(".tutorial-step").textContent = `STEP ${index + 1} OF ${steps.length}`;
        layer.querySelector("h2").textContent = step.title;
        layer.querySelector("p").textContent = step.body;
        layer.querySelector(".tutorial-progress").style.setProperty("--progress", `${((index + 1) / steps.length) * 100}%`);
        layer.querySelector("[data-back]").disabled = index === 0;
        layer.querySelector("[data-next]").textContent = index === steps.length - 1 ? "Finish" : "Next";
        requestAnimationFrame(() => positionPopover(popover, rect));
    }
    layer.querySelector("[data-skip]").addEventListener("click", () => close(true));
    layer.querySelector("[data-back]").addEventListener("click", () => move(-1));
    layer.querySelector("[data-next]").addEventListener("click", () => move(1));
    window.addEventListener("resize", render);
    window.addEventListener("scroll", onScroll, true);
    layer.addEventListener("wheel", event => event.preventDefault(), { passive: false });
    layer.addEventListener("touchmove", event => event.preventDefault(), { passive: false });
    document.addEventListener("keydown", onKey);
    render();
    layer.querySelector("[data-next]").focus();
}

function positionPopover(popover, rect) {
    const gap = 18;
    const width = Math.min(390, window.innerWidth - 24);
    let left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left));
    let top = rect.bottom + gap;
    if (top + popover.offsetHeight > window.innerHeight - 12) top = Math.max(12, rect.top - popover.offsetHeight - gap);
    popover.style.width = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}
