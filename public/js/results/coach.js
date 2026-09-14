import { loadPlan } from "../appStore.js";
import { normalisePlan } from "./normalisePlan.js";

export async function renderCoach(container, { demoMode = false, onPlanChanged = () => {} } = {}) {
    if (!container) return;
    let messages = [], pending = null, busy = false;
    container.innerHTML = `<section class="dashboard-section athlete-coach">
        <header class="athlete-coach-header"><div class="section-header"><span class="coach-eyebrow">YOUR TRAINING PARTNER</span><h2>AI Coach</h2><p>Talk through your training or make a change to your week.</p></div><span class="coach-status">${demoMode ? "Demo conversation" : "Connected to your plan"}</span></header>
        <div class="coach-mode-switch" aria-label="Coach mode"><button type="button" data-mode="plan" aria-pressed="true">Plan & coaching</button><button type="button" data-mode="chat" aria-pressed="false">Advice only</button></div>
        <div class="coach-prompts"><button type="button">Add an easy Wednesday morning run</button><button type="button">Review my week</button><button type="button">Make my next session shorter</button></div>
        <div id="coach-messages" class="coach-messages" role="log" aria-label="Coach conversation" aria-live="polite"></div>
        <div class="coach-proposal" hidden></div>
        <form id="coach-form" class="coach-form" data-mode="plan"><label for="coach-input">Message your coach</label><div><textarea id="coach-input" name="message" rows="2" maxlength="2000" placeholder="Add a morning run on Wednesday and keep my gym session…" required></textarea><button class="primary-button" type="submit">Send</button></div><small class="coach-mode">Plan changes appear as a preview for you to apply.</small></form>
        <div class="coach-footer"><p>Training guidance informed by your plan and recent sessions.</p><button id="clear-coach" class="text-button" type="button">Clear conversation</button></div><p class="coach-feedback" role="status"></p>
    </section>`;
    const list = container.querySelector("#coach-messages"), form = container.querySelector("form");
    const input = form.querySelector("textarea"), send = form.querySelector('button[type="submit"]');
    const preview = container.querySelector(".coach-proposal"), feedback = container.querySelector(".coach-feedback");
    function show() {
        list.innerHTML = messages.length ? messages.map(item => `<article class="coach-message ${item.role === "user" ? "user" : "assistant"}"><span>${item.role === "user" ? "You" : "Athlos Coach"}</span><p>${formatMessage(item.content)}</p></article>`).join("") : '<div class="coach-empty"><span>✦</span><strong>What would make this week work better?</strong><p>Ask about a session, add a second workout to a day, or adjust your training around life.</p></div>';
        list.scrollTop = list.scrollHeight;
    }
    function setBusy(value) {
        busy = value; send.disabled = value; send.textContent = value ? "Thinking…" : "Send";
        container.querySelector("#clear-coach").disabled = value;
        container.querySelectorAll("[data-mode]").forEach(button => button.disabled = value);
    }
    function clearProposal() { pending = null; preview.hidden = true; preview.replaceChildren(); }
    function proposal(data) {
        pending = data;
        const before = normalisePlan(loadPlan()).workouts, after = normalisePlan(data.plan).workouts;
        let added = 0;
        const changedExisting = data.changes.filter(change => change.action !== "add");
        const removed = changedExisting.filter(change => change.action === "remove").map(change => change.workout_index);
        const details = data.changes.map(change => {
            const original = before[change.workout_index];
            const current = change.action === "add" ? after[before.length - removed.length + added++]
                : after[change.workout_index - removed.filter(index => index < change.workout_index).length];
            const label = change.action === "add" ? "Add session" : change.action === "remove" ? "Remove session" : "Update session";
            return `<li><span class="proposal-action">${label}</span><strong>${escapeHtml(change.action === "remove" ? original?.name : current?.name)}</strong>
                ${original ? `<small>Was: ${escapeHtml(original.day)} · ${escapeHtml(original.time_of_day)} · ${escapeHtml(original.name)}</small>` : ""}
                ${change.action !== "remove" ? `<p>${escapeHtml(current?.day)} · ${escapeHtml(current?.time_of_day)} · ${escapeHtml(current?.duration)}</p>${change.exercises ? `<details><summary>Review ${current?.exercises.length || 0} exercises</summary><ul>${(current?.exercises || []).map(ex => `<li>${escapeHtml(ex.name)} — ${escapeHtml(ex.sets)} × ${escapeHtml(ex.reps)}</li>`).join("")}</ul></details>` : ""}` : ""}</li>`;
        }).join("");
        preview.innerHTML = `<header><div><span class="coach-eyebrow">REVIEW CHANGES</span><h3>Your updated week</h3></div><small>${after.length} sessions</small></header><ul class="proposal-changes">${details}</ul><div class="proposal-actions"><button type="button" class="primary-button" data-apply>Apply changes</button><button type="button" class="secondary-button" data-discard>Discard</button></div><p class="proposal-feedback" role="status">Your current plan stays in place until you apply.</p>`;
        preview.hidden = false;
        preview.querySelector("[data-discard]").addEventListener("click", () => { clearProposal(); feedback.textContent = "Proposal discarded. Your plan has not changed."; });
        preview.querySelector("[data-apply]").addEventListener("click", async () => {
            const apply = preview.querySelector("[data-apply]"), discard = preview.querySelector("[data-discard]");
            apply.disabled = discard.disabled = true; setBusy(true); apply.textContent = "Saving…";
            try {
                const saved = await request("/api/coach/apply", { method: "POST", body: JSON.stringify({ changes: pending.changes, baseRevision: pending.baseRevision }) });
                clearProposal();
                await onPlanChanged(saved.plan);
            } catch (error) {
                preview.querySelector(".proposal-feedback").textContent = error.message;
                apply.disabled = discard.disabled = false; apply.textContent = "Apply changes";
            } finally { setBusy(false); }
        });
    }
    show();
    if (demoMode) {
        messages = [{ role: "assistant", content: "You’re exploring the demo coach. Live conversations and plan editing are available in the server-hosted Athlos app. Your demo schedule can still be rearranged in the calendar." }];
        show();
    } else {
        setBusy(true);
        try { messages = (await request("/api/coach/messages")).messages || []; show(); }
        catch (error) { feedback.textContent = error.message; }
        finally { setBusy(false); }
    }
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message || busy) return;
        clearProposal(); feedback.textContent = "";
        messages.push({ role: "user", content: message }); show(); input.value = ""; setBusy(true);
        try {
            const data = demoMode ? { message: "This is a sample conversation. Open your server-hosted Athlos app to request personalised coaching or AI plan changes. You can move individual sessions and create double days in this demo’s calendar." }
                : await request("/api/coach", { method: "POST", body: JSON.stringify({ message, modifyPlan: form.dataset.mode === "plan" }) });
            messages.push({ role: "assistant", content: data.message }); show();
            if (data.plan && data.changes?.length) proposal(data);
        } catch (error) {
            feedback.textContent = error.message;
            input.value = message;
        } finally { setBusy(false); }
    });
    container.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
        form.dataset.mode = button.dataset.mode;
        container.querySelectorAll("[data-mode]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        form.querySelector(".coach-mode").textContent = button.dataset.mode === "plan" ? "Plan changes appear as a preview for you to apply." : "Advice only. Switch to Plan & coaching to request changes.";
    }));
    container.querySelectorAll(".coach-prompts button").forEach(button => button.addEventListener("click", () => {
        input.value = button.textContent; input.focus();
    }));
    container.querySelector("#clear-coach").addEventListener("click", async () => {
        if (busy) return;
        setBusy(true);
        try { if (!demoMode) await request("/api/coach/messages", { method: "DELETE" }); messages = []; clearProposal(); show(); feedback.textContent = ""; }
        catch (error) { feedback.textContent = error.message; }
        finally { setBusy(false); }
    });
}
async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
    const data = await response.json().catch(() => { throw new Error("The coach server returned an invalid response. Restart Athlos and try again."); });
    if (!response.ok) throw new Error(data.error || "The coach is unavailable. Please try again.");
    return data;
}
export function formatMessage(value) {
    return escapeHtml(value).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replaceAll("\n", "<br>");
}
function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
