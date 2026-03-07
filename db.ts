// db.ts
import Database from 'better-sqlite3';

const db = new Database('ads.db');

export function initDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            round_num INTEGER,
            hypothesis TEXT,
            winner TEXT,
            insight TEXT
        );
        CREATE TABLE IF NOT EXISTS sim_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            experiment_id INTEGER,
            variant_name TEXT,
            impressions INTEGER,
            clicks INTEGER,
            conversions INTEGER,
            ctr REAL
        );
    `);
    console.log("✅ Database initialized.");
}

export function logExperiment(round: number, hypothesis: string) {
    const stmt = db.prepare('INSERT INTO experiments (round_num, hypothesis) VALUES (?, ?)');
    const info = stmt.run(round, hypothesis);
    return info.lastInsertRowid;
}

export function updateExperimentResult(id: number, winner: string, insight: string) {
    const stmt = db.prepare('UPDATE experiments SET winner = ?, insight = ? WHERE id = ?');
    stmt.run(winner, insight, id);
}

export function logSimResult(expId: number, name: string, impr: number, clicks: number, conv: number, ctr: number) {
    const stmt = db.prepare('INSERT INTO sim_results (experiment_id, variant_name, impressions, clicks, conversions, ctr) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(expId, name, impr, clicks, conv, ctr);
}