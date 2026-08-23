import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "athlos.db"));
db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        payload TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS coach_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user','assistant')),
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS coach_assignments (
        coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        athlete_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(coach_id,athlete_id)
    );
    CREATE TABLE IF NOT EXISTS coach_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        athlete_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS account_tokens (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);
try{db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'athlete' CHECK(role IN ('athlete','coach','admin'))");}catch{}
try{db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");}catch{}

export function createUser(email, name, passwordHash) {
    const result = db.prepare("INSERT INTO users(email,name,password_hash) VALUES(?,?,?)").run(email, name, passwordHash);
    db.prepare("INSERT INTO user_data(user_id,payload) VALUES(?,?)").run(result.lastInsertRowid, JSON.stringify({ version: 1 }));
    return getUserById(result.lastInsertRowid);
}
export function getUserByEmail(email) { return db.prepare("SELECT * FROM users WHERE email = ?").get(email); }
export function getUserById(id) { return db.prepare("SELECT id,email,name,role,email_verified,created_at FROM users WHERE id = ?").get(id); }
export function getUserWithPassword(id) { return db.prepare("SELECT * FROM users WHERE id=?").get(id); }
export function updatePassword(id,passwordHash) { db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(passwordHash,id); db.prepare("DELETE FROM sessions WHERE user_id=?").run(id); }
export function deleteUser(id) { db.prepare("DELETE FROM users WHERE id=?").run(id); }
export function createSession(tokenHash, userId, expiresAt) { db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").run(tokenHash,userId,expiresAt); }
export function getSession(tokenHash) { return db.prepare("SELECT s.*,u.email,u.name,u.role,u.email_verified FROM sessions s JOIN users u ON u.id=s.user_id WHERE token_hash=? AND expires_at > datetime('now')").get(tokenHash); }
export function deleteSession(tokenHash) { db.prepare("DELETE FROM sessions WHERE token_hash=?").run(tokenHash); }
export function cleanupSessions() { db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run(); }
export function getUserData(userId) { const row=db.prepare("SELECT payload FROM user_data WHERE user_id=?").get(userId); try{return JSON.parse(row?.payload||"{}");}catch{return {}; } }
export function saveUserData(userId,payload) { db.prepare("INSERT INTO user_data(user_id,payload,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=CURRENT_TIMESTAMP").run(userId,JSON.stringify(payload)); }
export function addCoachMessage(userId,role,content) { db.prepare("INSERT INTO coach_messages(user_id,role,content) VALUES(?,?,?)").run(userId,role,content); }
export function getCoachMessages(userId,limit=12) { return db.prepare("SELECT role,content,created_at FROM (SELECT * FROM coach_messages WHERE user_id=? ORDER BY id DESC LIMIT ?) ORDER BY id ASC").all(userId,limit); }
export function clearCoachMessages(userId) { db.prepare("DELETE FROM coach_messages WHERE user_id=?").run(userId); }
export function setUserRole(id,role){db.prepare("UPDATE users SET role=? WHERE id=?").run(role,id);return getUserById(id);}
export function assignAthlete(coachId,athleteId){db.prepare("INSERT OR IGNORE INTO coach_assignments(coach_id,athlete_id) VALUES(?,?)").run(coachId,athleteId);}
export function getCoachAthletes(coachId){return db.prepare("SELECT u.id,u.name,u.email,u.created_at FROM coach_assignments a JOIN users u ON u.id=a.athlete_id WHERE a.coach_id=? ORDER BY u.name").all(coachId);}
export function coachCanAccess(coachId,athleteId){return Boolean(db.prepare("SELECT 1 ok FROM coach_assignments WHERE coach_id=? AND athlete_id=?").get(coachId,athleteId));}
export function addCoachComment(coachId,athleteId,content){db.prepare("INSERT INTO coach_comments(coach_id,athlete_id,content) VALUES(?,?,?)").run(coachId,athleteId,content);}
export function getCoachComments(athleteId){return db.prepare("SELECT c.content,c.created_at,u.name coach_name FROM coach_comments c JOIN users u ON u.id=c.coach_id WHERE c.athlete_id=? ORDER BY c.id DESC LIMIT 50").all(athleteId);}
export function saveAccountToken(tokenHash,userId,type,expiresAt){db.prepare("DELETE FROM account_tokens WHERE user_id=? AND type=?").run(userId,type);db.prepare("INSERT INTO account_tokens(token_hash,user_id,type,expires_at) VALUES(?,?,?,?)").run(tokenHash,userId,type,expiresAt);}
export function consumeAccountToken(tokenHash,type){const row=db.prepare("SELECT * FROM account_tokens WHERE token_hash=? AND type=? AND expires_at>datetime('now')").get(tokenHash,type);if(row)db.prepare("DELETE FROM account_tokens WHERE token_hash=?").run(tokenHash);return row;}
export function verifyUserEmail(id){db.prepare("UPDATE users SET email_verified=1 WHERE id=?").run(id);}
export function deleteAllUserSessions(userId){db.prepare("DELETE FROM sessions WHERE user_id=?").run(userId);}

cleanupSessions();
