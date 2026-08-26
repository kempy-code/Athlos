# Athlos

Athlos is a personalised, recovery-aware training planner with workout tracking, performance analytics and an AI athlete coach.

## Live demo

The GitHub Pages edition is a static interactive showcase. It includes the sample athlete dashboard, workout logging, readiness tools, analytics and an offline AI Coach demonstration. Demo data is stored in the browser.

[Open the live Athlos demo](https://kempy-code.github.io/Athlos/)

## Run the full app

The full edition adds secure accounts, server-side persistence and live OpenAI plan generation.

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env` and add your own API configuration.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Never commit `.env` or API keys.

## Quality checks

Run `npm run test:release` and `npm run audit` before deployment.
