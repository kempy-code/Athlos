const base=process.env.ATHLOS_URL||"http://127.0.0.1:3000";
async function json(path){const response=await fetch(`${base}${path}`);const type=response.headers.get("content-type")||"";if(!type.includes("application/json"))throw new Error(`${path} returned ${type||"non-JSON"}. An old server is probably running.`);return {response,data:await response.json()};}
try{
    const version=await json("/api/version");
    const status=await json("/api/debug/status");
    console.log(`Athlos ${version.data.version} is reachable at ${base}`);
    console.log(`Authentication: ${version.data.features.auth?"ready":"missing"}`);
    console.log(`AI Coach: ${version.data.features.coach?"ready":"missing"}`);
    console.log(`OpenAI key: ${status.data.openaiConfigured?"configured":"missing"}`);
    console.log(`Database directory: ${status.data.dataDirectoryConfigured?"configured":"using local ./data"}`);
}catch(error){console.error(`Athlos doctor failed: ${error.message}`);console.error("Stop the existing server, run npm start again, then rerun npm run doctor.");process.exitCode=1;}
