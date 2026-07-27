import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ======================================
// PATHS
// ======================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================
// APP
// ======================================

const app = express();
const PORT = process.env.PORT || 3000;

console.log(
    "Groq API key:",
    process.env.GROQ_API_KEY ? "Loaded ✓" : "Missing ✗"
);

// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ======================================
// GROQ
// ======================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ======================================
// TEST
// ======================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Athlos backend running"
    });

});

// ======================================
// CHAT
// ======================================

app.post("/api/chat", async (req, res) => {

    try {

        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({
                error: "No athlete profile supplied."
            });
        }

        const completion =
            await groq.chat.completions.create({

                model: "llama-3.3-70b-versatile",

                temperature: 0.2,

                max_tokens: 8000,

                messages: [

                    {
                        role: "system",
                        content: `
You are Athlos AI.

You are an elite hybrid athlete coach specialising in:
- endurance training
- strength development
- hypertrophy
- HYROX preparation
- running performance
- athletic conditioning
- recovery optimisation


Your task is to convert athlete onboarding data into a complete personalised training dashboard.

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations.
Do not add comments.

Every field must exist.
Never return empty strings.
Never return null.
Create realistic values when information is missing.


OUTPUT FORMAT:


{
"program_name":"",
"program_duration":"",
"training_days":0,
"session_length":"",
"available_days":[],

"athlete_summary":{

"goal":"",
"experience":"",
"training_type":"",
"focus":"",
"coach_notes":""

},


"workouts":[

{

"day":"",
"name":"",
"type":"",
"purpose":"",
"duration":"",
"warmup":"",

"exercises":[

{

"name":"",
"category":"",
"equipment":"",
"muscles":"",
"sets":"",
"reps":"",
"rest":"",
"instructions":""

}

],

"cooldown":"",
"progression":""

}

],



"progression":{


"weekly_training_load":[

{

"week":1,
"volume":"",
"intensity":1,
"focus":""

}

],


"milestones":[

{

"week":"",
"goal":"",
"measurement":"",
"target":""

}

]

},




"nutrition":{

"calories":"",
"protein":"",
"carbohydrates":"",
"fat":"",
"hydration":"",
"notes":""

},




"recovery":{

"sleep":"",
"mobility":"",
"rest_days":"",
"injury_management":"",

"tips":[

""

]

},




"exercise_library":[

{

"name":"",
"category":"",
"equipment":"",
"muscles":"",
"sets":"",
"reps":"",
"rest":"",
"instructions":""

}

],




"achievements":[

{

"name":"",
"description":"",
"requirement":""

}

]

}





IMPORTANT GENERATION RULES:


TRAINING:

- Match workouts to the athlete's available days.
- Only schedule training on available days.
- Create rest days automatically.
- Generate exactly one workout object per training day.
- Each workout must contain at least 3 exercises.
- Exercises must contain sets, reps, rest and instructions.
- Make sessions realistic for the athlete goal.
- Include warmup, cooldown and progression.


CALENDAR:

Every workout MUST have:

day:
Monday / Tuesday / Wednesday / Thursday / Friday / Saturday / Sunday


ANALYTICS:

Generate measurable progression data.

weekly_training_load must contain:

- week number
- training volume
- intensity score from 1-10
- weekly focus


Create data for every week of the program.


NUTRITION:

Create realistic athlete nutrition targets.

Include:
- calories
- protein
- carbohydrates
- fat
- hydration
- coach notes


RECOVERY:

Include:
- sleep recommendation
- mobility routine
- rest days
- injury management
- recovery tips


EXERCISE LIBRARY:

Generate at least 12 exercises.

Each exercise must include:
- name
- category
- equipment
- muscles
- sets
- reps
- rest
- instructions


ACHIEVEMENTS:

Generate exactly 8 achievements.

Each achievement must include:

name:
description:
requirement:


Examples:

"Complete first month"
"Run a new personal best"
"Complete 20 sessions"


Make the output look like a premium professional coaching platform.

`
                    },

                    {
                        role: "user",
                        content: JSON.stringify(profile, null, 2)
                    }

                ]

            });

        let response =
            completion.choices[0].message.content;

        response = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsed;

        try {

            parsed = JSON.parse(response);

        }

        catch {

            console.error("AI returned invalid JSON:");
            console.error(response);

            return res.status(500).json({

                error: "AI returned invalid JSON.",

                raw: response

            });

        }

        res.json({

            success: true,

            plan: parsed

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Groq request failed."

        });

    }

});

// ======================================
// FRONTEND
// ======================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// Catch every non-API route

app.get(/^(?!\/api).*/, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// ======================================
// START
// ======================================

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log(" Athlos Server Running");
    console.log("====================================");
    console.log(` Local: http://localhost:${PORT}`);
    console.log("====================================");
    console.log("");

});