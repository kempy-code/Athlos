export async function apiFetch(url, options = {}) {
    let response;
    try { response = await fetch(url, options); }
    catch { throw new Error("Cannot reach the Athlos server. Start or restart it with npm start, then reload this page."); }
    const contentType=response.headers.get("content-type")||"";
    const text=await response.text();
    if(!contentType.includes("application/json")) {
        throw new Error(`Athlos server is out of date or returned an invalid response (${response.status}). Restart npm start and reload the page.`);
    }
    let data;
    try { data=text?JSON.parse(text):{}; }
    catch { throw new Error("Athlos received an unreadable server response. Restart the server and try again."); }
    if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
    return data;
}
