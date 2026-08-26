import { apiFetch } from "./api.js";

export async function getCurrentUser() {
    try { return (await apiFetch("/api/auth/me")).user; } catch { return null; }
}

export function renderAuth(container, { staticMode = false } = {}) {
    const resetToken = new URLSearchParams(window.location.search).get("reset");
    document.body.classList.add("public-site");
    document.getElementById("onboarding-progress")?.setAttribute("hidden", "");
    container.innerHTML = `
    <div class="landing-page">
        <section class="landing-hero">
            <div class="hero-grid" data-parallax="-0.05" aria-hidden="true"></div>
            <div class="hero-glow hero-glow-one" data-parallax="0.13" aria-hidden="true"></div>
            <div class="hero-glow hero-glow-two" data-parallax="-0.08" aria-hidden="true"></div>
            <div class="hero-copy">
                <span class="eyebrow">PERSONALISED PERFORMANCE</span>
                <h1>Train with a plan that understands you.</h1>
                <p class="hero-lead">Athlos turns your goals, schedule, experience and recovery into a practical training system—then adapts alongside you.</p>
                <div class="hero-actions">${staticMode ? `<button class="landing-button primary" id="try-demo" type="button">Launch interactive demo</button><a class="landing-button secondary" href="https://github.com/kempy-code/Athlos#run-the-full-app" target="_blank" rel="noreferrer">Run full app</a>` : `<button class="landing-button primary" data-open-auth="register">Build my plan</button><button class="landing-button secondary" data-open-auth="login">Sign in</button><button class="landing-button ghost" id="try-demo" type="button">Explore demo</button>`}</div>
                <div class="hero-proof"><span>No generic templates</span><span>Built around your week</span><span>AI coach included</span></div>
            </div>
            <div class="hero-product" data-parallax="-0.035">
                <div class="product-top"><span>THIS WEEK</span><strong>Performance plan</strong></div>
                <div class="readiness-ring"><div><strong>86</strong><span>Ready</span></div></div>
                <div class="session-preview"><b>TODAY</b><div><strong>Threshold development</strong><small>Warm-up · 5 intervals · Cool-down</small></div><span>52 min</span></div>
                <div class="metric-row"><div><strong>4</strong><span>Sessions</span></div><div><strong>3h 40m</strong><span>Volume</span></div><div><strong>+8%</strong><span>Progress</span></div></div>
            </div>
        </section>

        <section class="landing-section">
            <div class="section-heading"><span class="eyebrow">ONE COACHING SYSTEM</span><h2>Everything your training needs, connected.</h2><p>Athlos keeps the plan, the work and the feedback loop in one clear place.</p></div>
            <div class="feature-grid">
                <article class="feature-card large"><span>01</span><h3>Training built around you</h3><p>Tell Athlos about your sport, goals, experience, equipment and available time. Your plan starts with your real life.</p><div class="mini-schedule"><i>MON <b>Strength</b></i><i>WED <b>Intervals</b></i><i>SAT <b>Long session</b></i></div></article>
                <article class="feature-card"><span>02</span><h3>AI Coach</h3><p>Ask about a session, adjust your week or understand why the plan has changed.</p></article>
                <article class="feature-card"><span>03</span><h3>Recovery-aware</h3><p>Readiness and history help keep hard days hard and easy days genuinely useful.</p></article>
                <article class="feature-card"><span>04</span><h3>Clear progress</h3><p>See completed work, consistency and milestones without drowning in charts.</p></article>
            </div>
        </section>

        <section class="landing-section process-section">
            <div class="section-heading"><span class="eyebrow">HOW IT WORKS</span><h2>From goals to your next session.</h2></div>
            <div class="process-grid"><article><b>1</b><h3>Build your profile</h3><p>Answer focused questions about your training and lifestyle.</p></article><article><b>2</b><h3>Get your complete plan</h3><p>Receive workouts, nutrition guidance and recovery priorities.</p></article><article><b>3</b><h3>Train, log and adapt</h3><p>Track your work and use your AI Coach to move forward.</p></article></div>
        </section>

        <section class="coach-section">
            <div><span class="eyebrow">YOUR AI COACH</span><h2>Answers grounded in your plan.</h2><p>Get practical guidance about pacing, substitutions, soreness, missed sessions and what to do next.</p></div>
            <div class="coach-chat"><div class="chat-user">I only have 30 minutes today. What should I prioritise?</div><div class="chat-coach"><span>A</span><p>Keep the warm-up, complete the first three quality intervals, then finish with five easy minutes. That preserves the main adaptation without rushing recovery.</p></div></div>
        </section>

        ${staticMode ? `<section class="pages-demo-gateway" id="member-access"><span class="eyebrow">GITHUB PAGES EDITION</span><h2>Explore Athlos without an account.</h2><p>This static showcase includes the complete sample dashboard, workout tracking, readiness tools, progress analytics and an offline demonstration of the AI Coach. Your demo changes stay in this browser.</p><button class="landing-button primary" id="pages-demo-button" type="button">Open the athlete dashboard</button><small>Secure accounts, cloud sync and live AI generation require the full Node server.</small></section>` : `<section class="auth-gateway" id="member-access">
            <div class="auth-message"><span class="eyebrow">START TRAINING</span><h2>Your programme starts here.</h2><p>Create a secure account to save your plan and continue from any device.</p><ul><li>Personalised weekly programme</li><li>Workout and readiness history</li><li>Nutrition and recovery guidance</li><li>Personal AI Coach</li></ul></div>
            <div class="auth-card">
                <div class="auth-tabs" ${resetToken?"hidden":""}><button class="active" type="button" data-auth-tab="login">Sign in</button><button type="button" data-auth-tab="register">Create account</button></div>
                <form id="login-form" ${resetToken?"hidden":""}><h2>Welcome back</h2><p>Continue your training journey.</p><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="next-button" type="submit">Sign in</button><button class="forgot-password" type="button">Forgot password?</button></form>
                <form id="register-form" hidden><h2>Create your account</h2><p>Build your personalised training plan.</p><label>Name<input name="name" autocomplete="name" maxlength="80" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="new-password" minlength="10" required><small>Use at least 10 characters.</small></label><button class="next-button" type="submit">Create account</button></form>
                ${resetToken?`<form id="reset-password-form"><h2>Choose a new password</h2><p>This reset link can be used once.</p><label>New password<input name="password" type="password" autocomplete="new-password" minlength="10" required></label><button class="next-button" type="submit">Update password</button></form>`:""}
                <p id="auth-error" role="alert"></p><p class="auth-privacy">Your data stays private and is never sold.</p>
            </div>
        </section>`}
    </div>`;

    container.querySelector("#pages-demo-button")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("athlos:open-demo")));
    const error = container.querySelector("#auth-error");
    if (staticMode) {
        container.querySelector("#try-demo")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("athlos:open-demo")));
        initialiseLandingEffects(container);
        return;
    }
    const selectTab = (name, scroll = false) => {
        container.querySelectorAll("[data-auth-tab]").forEach(item => item.classList.toggle("active", item.dataset.authTab === name));
        container.querySelector("#login-form").hidden = name !== "login";
        container.querySelector("#register-form").hidden = name !== "register";
        error.textContent = "";
        if (scroll) container.querySelector("#member-access").scrollIntoView({ behavior: "smooth", block: "center" });
    };
    container.querySelectorAll("[data-auth-tab]").forEach(button => button.addEventListener("click", () => selectTab(button.dataset.authTab)));
    container.querySelectorAll("[data-open-auth]").forEach(button => button.addEventListener("click", () => selectTab(button.dataset.openAuth, true)));
    container.querySelector("#try-demo")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("athlos:open-demo")));
    container.querySelector(".forgot-password")?.addEventListener("click",async()=>{const email=window.prompt("Enter the email address for your Athlos account.");if(!email)return;try{const data=await apiFetch("/api/auth/request-password-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});error.textContent=data.preview?`Development reset link: ${data.preview}`:data.message;}catch(problem){error.textContent=problem.message;}});
    container.querySelector("#reset-password-form")?.addEventListener("submit",async event=>{event.preventDefault();const button=event.currentTarget.querySelector("button");button.disabled=true;try{await apiFetch("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:resetToken,password:new FormData(event.currentTarget).get("password")})});window.history.replaceState({},document.title,"/");window.location.reload();}catch(problem){error.textContent=problem.message;button.disabled=false;}});
    initialiseLandingEffects(container);
    container.querySelectorAll("#login-form,#register-form").forEach(form => form.addEventListener("submit", async event => {
        event.preventDefault(); error.textContent = "";
        const button = form.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "Please wait…";
        const endpoint = form.id === "login-form" ? "login" : "register";
        try {
            await apiFetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            localStorage.removeItem("athlos_app_v1"); localStorage.removeItem("athlos_state"); window.location.reload();
        } catch (problem) {
            error.textContent = problem.message; button.disabled = false; button.textContent = endpoint === "login" ? "Sign in" : "Create account";
        }
    }));
}

function initialiseLandingEffects(container) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = container.querySelectorAll(".section-heading, .feature-card, .process-grid article, .coach-section > div, .auth-gateway > *");
    revealItems.forEach(item => item.classList.add("reveal-item"));

    if (reduceMotion) {
        revealItems.forEach(item => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach(item => observer.observe(item));

    const parallaxItems = [...container.querySelectorAll("[data-parallax]")];
    let ticking = false;
    const updateParallax = () => {
        const scrollY = window.scrollY;
        parallaxItems.forEach(item => {
            const speed = Number(item.dataset.parallax) || 0;
            item.style.setProperty("--parallax-y", `${scrollY * speed}px`);
        });
        ticking = false;
    };
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    updateParallax();
}

export async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("athlos_app_v1"); localStorage.removeItem("athlos_state"); window.location.reload();
}
