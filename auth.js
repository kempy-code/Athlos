import crypto from "node:crypto";
import { promisify } from "node:util";
import { createSession, deleteSession, getSession } from "./db.js";

const scrypt = promisify(crypto.scrypt);
const COOKIE = "athlos_session";
const SESSION_DAYS = 30;

export async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = await scrypt(password, salt, 64);
    return `${salt}:${Buffer.from(derived).toString("hex")}`;
}
export async function verifyPassword(password, stored) {
    const [salt, hash] = String(stored).split(":");
    if (!salt || !hash) return false;
    const derived = await scrypt(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
function digest(token) { return crypto.createHash("sha256").update(token).digest("hex"); }
function cookies(req) { return Object.fromEntries(String(req.headers.cookie || "").split(";").map(value=>value.trim().split("=")).filter(parts=>parts.length===2).map(([key,value])=>[key,decodeURIComponent(value)])); }
export function issueSession(res,userId) {
    const token=crypto.randomBytes(32).toString("base64url");
    const expires=new Date(Date.now()+SESSION_DAYS*86400000);
    createSession(digest(token),userId,expires.toISOString());
    res.cookie(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires});
}
export function revokeSession(req,res) { const token=cookies(req)[COOKIE]; if(token)deleteSession(digest(token)); res.clearCookie(COOKIE,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/"}); }
export function optionalAuth(req,_res,next) { const token=cookies(req)[COOKIE]; const session=token?getSession(digest(token)):null; req.user=session?{id:Number(session.user_id),email:session.email,name:session.name,role:session.role||"athlete",emailVerified:Boolean(session.email_verified)}:null; next(); }
export function requireAuth(req,res,next) { if(!req.user)return res.status(401).json({error:"Please sign in to continue"}); next(); }
export function validateCredentials(email,password,name="") { if(!/^\S+@\S+\.\S+$/.test(email||""))return "Enter a valid email address"; if(String(password||"").length<10)return "Password must be at least 10 characters"; if(name!==undefined&&String(name).trim().length>80)return "Name is too long"; return null; }
