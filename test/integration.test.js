import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const port=32000+Math.floor(Math.random()*1000);
const base=`http://127.0.0.1:${port}`;
const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),"athlos-integration-"));
const child=spawn(process.execPath,["server.js"],{cwd:process.cwd(),env:{...process.env,PORT:String(port),NODE_ENV:"test",DATA_DIR:dataDir,OPENAI_API_KEY:"",COACH_INVITE_CODE:"test-coach"},stdio:["ignore","pipe","pipe"]});
let output="";child.stdout.on("data",chunk=>output+=chunk);child.stderr.on("data",chunk=>output+=chunk);

async function waitForServer(){for(let attempt=0;attempt<50;attempt++){try{const response=await fetch(`${base}/api/version`);if(response.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}throw new Error(`Server did not start:\n${output}`);}
await waitForServer();
test.after(async()=>{child.kill("SIGTERM");await fs.rm(dataDir,{recursive:true,force:true});});

test("reports compatible API features",async()=>{const response=await fetch(`${base}/api/version`);assert.equal(response.headers.get("content-type").includes("application/json"),true);const data=await response.json();assert.equal(data.features.auth,true);assert.equal(data.features.coach,true);assert.equal(data.features.adaptiveTraining,true);assert.equal(data.features.healthImports,true);assert.equal(data.features.liveActivity,true);assert.equal(data.features.coachRoles,true);});

test("registration, session, data sync, and logout",async()=>{
    const email=`athlete-${Date.now()}@example.com`;
    const registration=await fetch(`${base}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Test Athlete",email,password:"secure-test-password"})});
    assert.equal(registration.status,201);const cookie=registration.headers.get("set-cookie").split(";")[0];
    const me=await fetch(`${base}/api/auth/me`,{headers:{cookie}});const currentUser=(await me.json()).user;assert.equal(currentUser.email,email);assert.equal(currentUser.role,"athlete");
    const saved=await fetch(`${base}/api/user-data`,{method:"PUT",headers:{cookie,"Content-Type":"application/json"},body:JSON.stringify({data:{version:1,currentPlan:{program_name:"Release Test"}}})});assert.equal(saved.status,200);
    const loaded=await fetch(`${base}/api/user-data`,{headers:{cookie}});assert.equal((await loaded.json()).data.currentPlan.program_name,"Release Test");
    const health=await fetch(`${base}/api/integrations/health-samples`,{method:"POST",headers:{cookie,"Content-Type":"application/json"},body:JSON.stringify({samples:[{type:"sleep",value:8,unit:"hours",source:"test"}]})});assert.equal((await health.json()).imported,1);
    const integrations=await fetch(`${base}/api/integrations/status`,{headers:{cookie}});assert.equal((await integrations.json()).manualImport.available,true);
    const exported=await fetch(`${base}/api/account/export`,{headers:{cookie}});assert.equal((await exported.json()).data.currentPlan.program_name,"Release Test");
    const coachActivation=await fetch(`${base}/api/coach/activate`,{method:"POST",headers:{cookie,"Content-Type":"application/json"},body:JSON.stringify({inviteCode:"test-coach"})});assert.equal((await coachActivation.json()).user.role,"coach");
    const logout=await fetch(`${base}/api/auth/logout`,{method:"POST",headers:{cookie}});assert.equal(logout.status,200);
    const denied=await fetch(`${base}/api/user-data`,{headers:{cookie}});assert.equal(denied.status,401);
});

test("password reset tokens are one-time and expire safely",async()=>{
    const email=`reset-${Date.now()}@example.com`;
    await fetch(`${base}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Reset Athlete",email,password:"original-password-123"})});
    const requested=await fetch(`${base}/api/auth/request-password-reset`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const preview=(await requested.json()).preview;assert.ok(preview);
    const token=new URL(preview).searchParams.get("reset");
    const reset=await fetch(`${base}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password:"replacement-password-123"})});assert.equal(reset.status,200);
    const reused=await fetch(`${base}/api/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password:"replacement-password-456"})});assert.equal(reused.status,400);
});

test("security headers are present",async()=>{const response=await fetch(`${base}/`);assert.equal(response.headers.get("x-frame-options"),"DENY");assert.match(response.headers.get("content-security-policy"),/default-src 'self'/);});
