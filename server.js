// ======================================
// ATHLOS SERVER
// server.js
// ======================================

import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import crypto from "node:crypto";
import { fileURLToPath } from "url";
import { addCoachComment, addCoachMessage, assignAthlete, clearCoachMessages, coachCanAccess, consumeAccountToken, createUser, deleteAllUserSessions, deleteUser, getCoachAthletes, getCoachComments, getCoachMessages, getUserByEmail, getUserData, getUserWithPassword, saveAccountToken, saveUserData, setUserRole, updatePassword, verifyUserEmail } from "./db.js";
import { hashPassword, issueSession, optionalAuth, requireAuth, revokeSession, validateCredentials, verifyPassword } from "./auth.js";

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
if(process.env.NODE_ENV==="production")app.set("trust proxy",1);

const PORT = Number(process.env.PORT) || 3000;
// gpt-4o-mini supports Structured Outputs without requiring a verified
// organisation; deployments can override this with OPENAI_MODEL.
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const APP_VERSION = "4.0.0";


// ======================================
// OPENAI
// ======================================

console.log(
    "OpenAI API key:",
    process.env.OPENAI_API_KEY ? "Loaded ✓" : "Missing ✗"
);


const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000, maxRetries: 2 })
    : null;

const generationRequests = new Map();
const authRequests = new Map();

function generationRateLimit(req, res, next) {
    const key = req.ip || "local";
    const now = Date.now();
    const recent = (generationRequests.get(key) || []).filter(time => now - time < 60_000);
    if (recent.length >= 5) return res.status(429).json({ error: "Too many plan requests. Please wait a minute and try again." });
    generationRequests.set(key, [...recent, now]);
    next();
}

function authRateLimit(req,res,next){
    const key=req.ip||"local",now=Date.now();
    const recent=(authRequests.get(key)||[]).filter(time=>now-time<15*60_000);
    if(recent.length>=20)return res.status(429).json({error:"Too many account requests. Try again later."});
    authRequests.set(key,[...recent,now]);next();
}
const tokenDigest=value=>crypto.createHash("sha256").update(value).digest("hex");
async function sendEmail(to,subject,html){
    if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)return false;
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[to],subject,html})});
    return response.ok;
}

function validateProfile(profile) {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return "No athlete profile supplied";
    if (Object.keys(profile).length < 3) return "The athlete profile is incomplete";
    if (JSON.stringify(profile).length > 50_000) return "The athlete profile is too large";
    if (profile.age !== undefined && (!Number.isFinite(Number(profile.age)) || Number(profile.age) < 10 || Number(profile.age) > 100)) return "Athlete age is invalid";
    return null;
}



// ======================================
// ATHLOS PROMPT
// ======================================


const ATHLOS_SYSTEM_PROMPT = `

You are Athlos AI.

You are an elite adaptive athlete coach.

Your job is to create personalised training programs using athlete onboarding data.

Priorities:

1. Athlete safety
2. Injuries and limitations
3. Primary goal
4. Sport demands
5. Available schedule
6. Recovery capacity
7. Performance optimisation


RULES:

- Always use the athlete profile.
- Never ignore injuries.
- Never prescribe unsafe training.
- Adapt for age, experience, school workload and recovery.
- Create realistic programs.
- Include specific exercises.
- Include sets, reps, rest and coaching notes.
- Make workouts practical.


Return a complete plan matching the supplied JSON schema. Use plain strings for
human-readable guidance and arrays for lists. Every workout must include warm_up,
main_workout and cool_down. Every main_workout item must include exercise, sets,
reps, rest and coaching_notes. Nutrition targets must include their units.

Return this conceptual structure:

{
 "program_name": "",
 "program_duration": "",
 "training_days": 0,
 "session_length": "",
 "available_days": [],

 "athlete_summary": {},

 "workouts": [
   {
    "day": "",
    "session_name": "",
    "target_duration_minutes": 0,
    "warm_up": [],
    "main_workout": [],
    "cool_down": []
   }
 ],

 "progression": {},

 "nutrition": {},

 "recovery": {},

 "achievements": []
}

`;



// ======================================
// MIDDLEWARE
// ======================================


app.use(
    express.json({
        limit:"2mb"
    })
);

app.use((req,res,next)=>{
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("X-Frame-Options","DENY");
    res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=(self)");
    res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'");
    next();
});

app.use(optionalAuth);


app.use(
    express.static(
        path.join(__dirname,"public")
    )
);



// ======================================
// TEST
// ======================================


app.get("/api/test",(req,res)=>{

    res.json({
        success:true,
        message:"Athlos backend running"
    });

});

app.get("/api/version",(_req,res)=>res.json({name:"athlos",version:APP_VERSION,features:{auth:true,coach:true,userData:true,adaptiveTraining:true,healthImports:true,pwa:true,liveActivity:true,coachRoles:true,accountRecovery:true,trainingAnalytics:true}}));

if(process.env.NODE_ENV!=="production"){
    app.get("/api/debug/status",(_req,res)=>res.json({status:"ok",version:APP_VERSION,node:process.version,model:OPENAI_MODEL,openaiConfigured:Boolean(process.env.OPENAI_API_KEY),dataDirectoryConfigured:Boolean(process.env.DATA_DIR),time:new Date().toISOString()}));
}

app.post("/api/auth/register",authRateLimit, async (req,res) => {
    try {
        const email=String(req.body?.email||"").trim().toLowerCase();
        const name=String(req.body?.name||"").trim();
        const password=String(req.body?.password||"");
        const error=validateCredentials(email,password,name)||(!name?"Enter your name":null);
        if(error)return res.status(400).json({error});
        if(getUserByEmail(email))return res.status(409).json({error:"An account already exists for this email"});
        const user=createUser(email,name,await hashPassword(password));
        const verifyToken=crypto.randomBytes(32).toString("base64url");
        saveAccountToken(tokenDigest(verifyToken),user.id,"verify",new Date(Date.now()+24*60*60_000).toISOString());
        await sendEmail(email,"Verify your Athlos account",`<h1>Welcome to Athlos</h1><p><a href="${req.protocol}://${req.get("host")}/api/auth/verify-email?token=${verifyToken}">Verify your email</a></p>`);
        issueSession(res,user.id);
        res.status(201).json({user});
    } catch(error) { console.error("Registration failed",error); res.status(500).json({error:"Could not create the account"}); }
});

app.post("/api/auth/login",authRateLimit, async (req,res) => {
    const email=String(req.body?.email||"").trim().toLowerCase();
    const password=String(req.body?.password||"");
    const user=getUserByEmail(email);
    if(!user||!(await verifyPassword(password,user.password_hash)))return res.status(401).json({error:"Email or password is incorrect"});
    issueSession(res,user.id);
    res.json({user:{id:user.id,email:user.email,name:user.name,created_at:user.created_at}});
});
app.post("/api/auth/request-password-reset",authRateLimit,async(req,res)=>{
    const email=String(req.body?.email||"").trim().toLowerCase(),user=getUserByEmail(email);
    let preview;
    if(user){const token=crypto.randomBytes(32).toString("base64url");saveAccountToken(tokenDigest(token),user.id,"reset",new Date(Date.now()+60*60_000).toISOString());const url=`${req.protocol}://${req.get("host")}/?reset=${token}`;await sendEmail(email,"Reset your Athlos password",`<h1>Reset your password</h1><p><a href="${url}">Choose a new password</a></p><p>This link expires in one hour.</p>`);if(process.env.NODE_ENV!=="production")preview=url;}
    res.json({success:true,message:"If that account exists, reset instructions have been sent.",preview});
});
app.post("/api/auth/reset-password",authRateLimit,async(req,res)=>{
    const password=String(req.body?.password||"");if(password.length<10)return res.status(400).json({error:"Password must be at least 10 characters"});
    const row=consumeAccountToken(tokenDigest(String(req.body?.token||"")),"reset");if(!row)return res.status(400).json({error:"Reset link is invalid or expired"});
    updatePassword(row.user_id,await hashPassword(password));res.json({success:true});
});
app.get("/api/auth/verify-email",(req,res)=>{const row=consumeAccountToken(tokenDigest(String(req.query.token||"")),"verify");if(!row)return res.status(400).send("Verification link is invalid or expired.");verifyUserEmail(row.user_id);res.redirect("/?verified=1");});
app.post("/api/auth/logout",requireAuth,(req,res)=>{revokeSession(req,res);res.json({success:true});});
app.get("/api/auth/me",(req,res)=>res.json({user:req.user}));
app.post("/api/auth/change-password",requireAuth,async(req,res)=>{
    const current=String(req.body?.currentPassword||"");const next=String(req.body?.newPassword||"");
    if(next.length<10)return res.status(400).json({error:"New password must be at least 10 characters"});
    const user=getUserWithPassword(req.user.id);if(!user||!(await verifyPassword(current,user.password_hash)))return res.status(401).json({error:"Current password is incorrect"});
    updatePassword(req.user.id,await hashPassword(next));issueSession(res,req.user.id);res.json({success:true});
});
app.delete("/api/auth/account",requireAuth,async(req,res)=>{
    const user=getUserWithPassword(req.user.id);if(!user||!(await verifyPassword(String(req.body?.password||""),user.password_hash)))return res.status(401).json({error:"Password is incorrect"});
    revokeSession(req,res);deleteUser(req.user.id);res.json({success:true});
});
app.post("/api/auth/signout-all",requireAuth,(req,res)=>{deleteAllUserSessions(req.user.id);revokeSession(req,res);res.json({success:true});});

app.get("/api/account/export",requireAuth,(req,res)=>{res.setHeader("Content-Disposition",`attachment; filename="athlos-export-${req.user.id}.json"`);res.json({exportedAt:new Date().toISOString(),user:req.user,data:getUserData(req.user.id),coachMessages:getCoachMessages(req.user.id,1000),coachComments:getCoachComments(req.user.id)});});

app.get("/api/user-data",requireAuth,(req,res)=>res.json({data:getUserData(req.user.id)}));
app.put("/api/user-data",requireAuth,(req,res)=>{
    const data=req.body?.data;
    if(!data||typeof data!=="object"||Array.isArray(data)||JSON.stringify(data).length>1_000_000)return res.status(400).json({error:"Invalid user data"});
    saveUserData(req.user.id,data);res.json({success:true});
});

app.get("/api/integrations/status",requireAuth,(_req,res)=>res.json({
    appleHealth:{available:false,requires:"Athlos iOS companion with HealthKit capability"},
    garmin:{available:Boolean(process.env.GARMIN_CLIENT_ID&&process.env.GARMIN_CLIENT_SECRET),requires:process.env.GARMIN_CLIENT_ID?"OAuth connection":"Garmin Connect Developer Programme approval"},
    manualImport:{available:true,formats:["json","csv"]}
}));

app.post("/api/integrations/health-samples",requireAuth,(req,res)=>{
    const samples=req.body?.samples;
    if(!Array.isArray(samples)||samples.length>1000)return res.status(400).json({error:"Provide up to 1,000 health samples"});
    const data=getUserData(req.user.id);
    const clean=samples.filter(item=>item&&typeof item==="object"&&!Array.isArray(item)).map(item=>({...item,source:String(item.source||"integration").slice(0,80),importedAt:new Date().toISOString()}));
    saveUserData(req.user.id,{...data,healthSamples:[...(data.healthSamples||[]),...clean].slice(-5000)});
    res.status(201).json({imported:clean.length});
});

app.post("/api/coach/activate",requireAuth,(req,res)=>{if(!process.env.COACH_INVITE_CODE||String(req.body?.inviteCode)!==process.env.COACH_INVITE_CODE)return res.status(403).json({error:"Coach invite code is invalid"});res.json({user:setUserRole(req.user.id,"coach")});});
app.get("/api/coach/athletes",requireAuth,(req,res)=>{if(req.user.role!=="coach"&&req.user.role!=="admin")return res.status(403).json({error:"Coach access required"});res.json({athletes:getCoachAthletes(req.user.id)});});
app.post("/api/coach/athletes",requireAuth,(req,res)=>{if(req.user.role!=="coach"&&req.user.role!=="admin")return res.status(403).json({error:"Coach access required"});const athlete=getUserByEmail(String(req.body?.email||"").trim().toLowerCase());if(!athlete)return res.status(404).json({error:"Athlete account not found"});assignAthlete(req.user.id,athlete.id);res.status(201).json({success:true});});
app.get("/api/coach/athletes/:id",requireAuth,(req,res)=>{const id=Number(req.params.id);if((req.user.role!=="coach"&&req.user.role!=="admin")||!coachCanAccess(req.user.id,id))return res.status(403).json({error:"Athlete access denied"});res.json({data:getUserData(id),comments:getCoachComments(id)});});
app.post("/api/coach/athletes/:id/comments",requireAuth,(req,res)=>{const id=Number(req.params.id),content=String(req.body?.content||"").trim();if((req.user.role!=="coach"&&req.user.role!=="admin")||!coachCanAccess(req.user.id,id))return res.status(403).json({error:"Athlete access denied"});if(!content||content.length>2000)return res.status(400).json({error:"Enter a comment under 2,000 characters"});addCoachComment(req.user.id,id,content);res.status(201).json({success:true});});
app.get("/api/coach/comments",requireAuth,(req,res)=>res.json({comments:getCoachComments(req.user.id)}));

app.get("/api/coach/messages",requireAuth,(req,res)=>res.json({messages:getCoachMessages(req.user.id,30)}));
app.delete("/api/coach/messages",requireAuth,(req,res)=>{clearCoachMessages(req.user.id);res.json({success:true});});

app.post("/api/coach",requireAuth,generationRateLimit,async(req,res)=>{
    try {
        if(!openai)return res.status(503).json({error:"AI Coach is not configured"});
        const message=String(req.body?.message||"").trim();
        if(!message||message.length>2000)return res.status(400).json({error:"Enter a message under 2,000 characters"});
        const data=getUserData(req.user.id);
        const history=getCoachMessages(req.user.id,10).map(({role,content})=>({role,content}));
        const response=await openai.responses.create({model:OPENAI_MODEL,instructions:`You are Athlos Coach, a concise, encouraging training assistant. Use the athlete's stored plan and logs. Never diagnose injuries or replace medical care. If pain, serious symptoms, eating disorders, or unsafe training are mentioned, recommend stopping and consulting an appropriate qualified professional. Do not invent completed workouts or measurements. Give practical next actions and explain plan adjustments. Athlete context: ${JSON.stringify({profile:data.profile||{},plan:data.currentPlan||null,recentLogs:(data.workoutLogs||[]).slice(-5),readiness:(data.readiness||[]).slice(-3)})}`,input:[...history,{role:"user",content:message}],max_output_tokens:500});
        const answer=response.output_text?.trim()||"I couldn’t create a coaching response. Please try again.";
        addCoachMessage(req.user.id,"user",message);addCoachMessage(req.user.id,"assistant",answer);
        res.json({message:answer});
    } catch(error){console.error("Coach error",error);res.status(500).json({error:"The AI Coach is temporarily unavailable"});}
});




// ======================================
// JSON HELPERS
// ======================================


const stringArray = { type: "array", items: { type: "string" } };
const exerciseSchema = {
    type: "object",
    additionalProperties: false,
    required: ["exercise", "sets", "reps", "rest", "coaching_notes"],
    properties: {
        exercise: { type: "string" },
        sets: { type: "string" },
        reps: { type: "string" },
        rest: { type: "string" },
        coaching_notes: { type: "string" }
    }
};
const planSchema = {
    type: "object",
    additionalProperties: false,
    required: ["program_name", "program_duration", "training_days", "session_length", "available_days", "athlete_summary", "workouts", "progression", "nutrition", "recovery", "achievements"],
    properties: {
        program_name: { type: "string" },
        program_duration: { type: "string" },
        training_days: { type: "integer" },
        session_length: { type: "string" },
        available_days: stringArray,
        athlete_summary: {
            type: "object", additionalProperties: false,
            required: ["overview", "goal", "considerations"],
            properties: { overview: { type: "string" }, goal: { type: "string" }, considerations: stringArray }
        },
        workouts: {
            type: "array", minItems: 1,
            items: {
                type: "object", additionalProperties: false,
                required: ["day", "session_name", "type", "purpose", "target_duration_minutes", "warm_up", "main_workout", "cool_down"],
                properties: {
                    day: { type: "string" }, session_name: { type: "string" }, type: { type: "string" },
                    purpose: { type: "string" }, target_duration_minutes: { type: "integer" },
                    warm_up: stringArray, main_workout: { type: "array", items: exerciseSchema }, cool_down: stringArray
                }
            }
        },
        progression: {
            type: "object", additionalProperties: false,
            required: ["overview", "milestones"],
            properties: { overview: { type: "string" }, milestones: stringArray }
        },
        nutrition: {
            type: "object", additionalProperties: false,
            required: ["calories", "protein", "carbohydrates", "fat", "hydration", "coach_notes", "meal_ideas"],
            properties: {
                calories: { type: "string" }, protein: { type: "string" }, carbohydrates: { type: "string" },
                fat: { type: "string" }, hydration: { type: "string" }, coach_notes: { type: "string" }, meal_ideas: stringArray
            }
        },
        recovery: {
            type: "object", additionalProperties: false,
            required: ["sleep", "mobility", "rest_days", "injury_management", "recovery_tips"],
            properties: {
                sleep: { type: "string" }, mobility: { type: "string" }, rest_days: { type: "string" },
                injury_management: { type: "string" }, recovery_tips: stringArray
            }
        },
        achievements: stringArray
    }
};




// ======================================
// ATHLOS AI ROUTE
// ======================================


app.post(
"/api/chat",
generationRateLimit,
requireAuth,
async(req,res)=>{


try{


const {profile}=req.body || {};



const profileError = validateProfile(profile);
if(profileError){

    return res.status(400).json({

        error:profileError

    });

}

if (!openai) {
    return res.status(503).json({ error: "Plan generation is not configured" });
}



console.log(
    "\nGenerating Athlos plan..."
);


const response = await openai.responses.create({
    model: OPENAI_MODEL,


    input:[

        {
            role:"system",
            content:ATHLOS_SYSTEM_PROMPT
        },


        {

            role:"user",

            content:
`
Create a complete Athlos training plan.

Athlete profile:

${JSON.stringify(
profile,
null,
2
)}

`

        }

    ],


    text: {
        format: {
            type: "json_schema",
            name: "athlos_training_plan",
            strict: true,
            schema: planSchema
        }
    }

});





console.log(
"OpenAI response received ✓"
);



const plan = JSON.parse(response.output_text);





if(
    !plan.workouts ||
    plan.workouts.length===0
){

    throw new Error(
        "AI returned empty workouts"
    );

}



res.json({

    success:true,

    plan

});





}

catch(error){


console.error(
"\n===== ATHLOS ERROR ====="
);


console.error(error);



res.status(500).json({
    error:"OpenAI generation failed",
    details: process.env.NODE_ENV === "development" ? error.message : undefined
});


}


});





// ======================================
// FRONTEND
// ======================================


app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});





app.get(
/^(?!\/api).*/,
(req,res)=>{

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


app.listen(
PORT,
()=>{


console.log("");

console.log(
"===================================="
);

console.log(
" ATHLOS SERVER RUNNING ✓"
);

console.log(
"===================================="
);


console.log(
` Local: http://localhost:${PORT}`
);


console.log(` Model: ${OPENAI_MODEL}`);


console.log(" JSON Mode: Structured Output ✓");


console.log(
"===================================="
);


}
);
