# Athlos — Assignment Evidence Guide

## The problem

Generic programmes ignore schedule, experience, available equipment and daily recovery. Athlos builds a personalised programme, makes it robust to inconsistent AI output, and creates a feedback loop through readiness and workout logging.

## Target user

Athlos is designed for a recreational athlete who wants structured training but does not have continuous access to a coach. The user needs clear sessions, sensible adjustments, progress evidence and explanations they can understand.

## Core user journey

1. A visitor learns what Athlos does on the public website.
2. They can explore the demo athlete without creating an account.
3. Registration unlocks a private, persistent profile.
4. Onboarding collects goals, training history, schedule and health constraints.
5. The server requests a structured plan and the client normalises missing or inconsistent fields.
6. The athlete logs readiness and actual exercise performance.
7. Athlos recommends completing, adjusting or reducing the session.
8. The progress page produces a seven-day review from real activity.

## Technical highlights

- Secure salted password hashes and server-managed sessions
- Per-user plan, readiness, workout and coach-message storage
- Structured AI generation with a defensive normalisation layer
- Actionable readiness scoring with explicit session changes
- Exercise-level sets, repetitions/time and load recording
- Responsive dashboard and public product website
- Demo data that uses the same application pipeline as a real plan
- Live session and rest timers, exercise substitutions and drag-and-drop rescheduling
- Goal tracking, benchmark tests, nutrition/hydration logging and workload indicators
- Installable offline-capable Progressive Web App
- Normalized JSON/CSV health-data import plus documented Apple Health and Garmin connection paths
- Native GPS activity recording with route shape, distance, pace and kilometre splits
- Personal records, previous strength values and sport-filtered performance charts
- Training phases, adaptive one-click session changes and recovery-safe challenges
- Athlete and coach roles with private feedback and assignment controls
- Email verification/reset token infrastructure, authentication throttling and full data export
- Automated unit, integration and static release-quality tests

## Safety and ethics

Athlos provides general training guidance rather than diagnosis or medical treatment. High pain and poor recovery trigger reduced-load advice. The interface tells users to stop movements that increase pain and seek qualified care for persistent symptoms. Personal data is isolated by account and secrets remain server-side.

## Evaluation plan

Test with at least five target users. Ask each person to create or open a plan, find the next workout, log readiness, record an exercise and explain the weekly review. Measure task completion, time on task, errors and confidence from 1–5. Record feedback, prioritise recurring problems, then document before-and-after evidence.

## Demonstration script

1. Open the public page and briefly explain the problem.
2. Select **Explore demo**.
3. Show the populated calendar and plan.
4. Start the next workout and change readiness to demonstrate adaptation.
5. Record actual sets, repetitions and load, then save progress.
6. Open Progress and explain the weekly review.
7. Ask the demo AI Coach how to shorten a session.
8. Finish with the automated checks: `npm run test:release` and `npm run audit`.

## Known limitations and next steps

- Apple Health activation requires an iOS companion target with HealthKit permission. Garmin live sync requires approval and OAuth credentials from the Garmin Connect Developer Programme; manual exports can be imported now.
- AI advice depends on the quality of user input and must retain clear safety boundaries.
- Production deployment still needs managed HTTPS hosting, a production database, monitoring and rate limiting.
- Future evaluation should compare adherence and user confidence against a static programme.
