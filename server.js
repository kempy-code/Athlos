import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

console.log(
    "Groq API key loaded:",
    process.env.GROQ_API_KEY ? "YES" : "NO"
);


const app = express();

const PORT = 3000;



// ===============================
// PATH SETUP
// ===============================

const __filename =
    fileURLToPath(import.meta.url);


const __dirname =
    path.dirname(__filename);



// ===============================
// MIDDLEWARE
// ===============================

app.use(
    express.json()
);


app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);



// ===============================
// GROQ SETUP
// ===============================

const groq =
new Groq({

    apiKey:
    process.env.GROQ_API_KEY

});




// ===============================
// TEST ROUTE
// ===============================

app.get(
"/api/test",
(req,res)=>{

    res.json({

        status:
        "Athlos backend running"

    });

});




// ===============================
// AI GENERATION
// ===============================

app.post(
"/api/chat",
async(req,res)=>{


try{


const {
    profile
}
=
req.body;



if(!profile){

    return res.status(400)
    .json({

        error:
        "No athlete profile supplied"

    });

}



const completion =
await groq.chat.completions.create({

model:
"llama-3.3-70b-versatile",



messages:[


{

role:"system",

content:
`
You are Athlos AI.

You are an elite fitness programming engine.

Your job is to convert athlete onboarding data into a structured training database.

IMPORTANT RULES:

- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No comments.
- Every field must exist.
- Use null when information is unavailable.


Return this exact structure:


{
"program_metadata":{

"program_name":"",
"created_date":"",
"duration_weeks":"",
"training_type":"",
"level":"",
"focus":"",
"equipment":"",
"coach_notes":""

},


"athlete_profile":{

"age":"",
"gender":"",
"height":"",
"weight":"",
"experience":"",
"training_history":"",
"previous_programs":""

},


"goals_constraints":{

"primary_goal":"",
"timeline":"",
"event":"",
"target":"",
"limitations":"",
"injuries":"",
"availability":""

},


"weekly_schedule":[

{

"week":"",
"day":"",
"session":"",
"duration":"",
"intensity":"",
"exercises":[]

}

],



"workouts":[

{

"id":"",
"name":"",
"type":"",
"purpose":"",
"duration":"",
"warmup":"",
"main_work":"",
"cooldown":"",
"progression":""

}

],



"exercise_library":[

{

"name":"",
"category":"",
"equipment":"",
"muscles":"",
"instructions":"",
"sets":"",
"reps":"",
"rest":""

}

],



"nutrition_targets":{

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
"recovery_tips":[]

},



"progress_milestones":[

{

"week":"",
"goal":"",
"measurement":"",
"target":""

}

],



"achievements":[

{

"name":"",
"description":"",
"requirement":""

}

],



"education":[

{

"title":"",
"content":""

}

]

}


Create a realistic personalised plan from the athlete data.
`


},


{


role:"user",

content:
JSON.stringify(
profile,
null,
2
)

}

],


temperature:
0.2,


max_tokens:
8000


});





let aiResponse =
completion
.choices[0]
.message
.content;



// Remove accidental markdown

aiResponse =
aiResponse
.replace(
/```json/g,
""
)
.replace(
/```/g,
""
)
.trim();




let parsed;


try{


parsed =
JSON.parse(
aiResponse
);


}

catch(error){


console.log(
"JSON parsing failed"
);


console.log(
aiResponse
);



return res.status(500)
.json({

error:
"AI returned invalid JSON",

raw:
aiResponse

});


}




res.json({

success:true,

plan:parsed

});



}



catch(error){


console.error(
"Groq Error:"
);


console.error(
error
);



res.status(500)
.json({

error:
"AI request failed"

});


}



});





// ===============================
// FRONTEND FALLBACK
// ===============================

app.get(
"/",
(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public",
"index.html"
)
);

});





// ===============================
// START SERVER
// ===============================

app.listen(
PORT,
()=>{

console.log(
`Server running on http://localhost:${PORT}`
);

});