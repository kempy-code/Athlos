import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
process.env.DATA_DIR=path.join(os.tmpdir(),`athlos-test-${process.pid}`);
const auth=await import("../auth.js");

test("password hashes are salted and verifiable",async()=>{
    const first=await auth.hashPassword("a-strong-password");
    const second=await auth.hashPassword("a-strong-password");
    assert.notEqual(first,second);
    assert.equal(await auth.verifyPassword("a-strong-password",first),true);
    assert.equal(await auth.verifyPassword("wrong-password",first),false);
});

test("credentials require valid email and strong password",()=>{
    assert.match(auth.validateCredentials("bad","short"),/email/i);
    assert.match(auth.validateCredentials("athlete@example.com","short"),/10 characters/i);
    assert.equal(auth.validateCredentials("athlete@example.com","long-password","Athlete"),null);
});
