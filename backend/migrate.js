import { Pool } from 'pg';

// Cambio menor para forzar build Railway - 2026-03-10

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

async function migrate() {
    try {
        // TEMPORAL: solo crear tablas faltantes
        const missingPath = path.join(__dirname, 'sql', 'create_missing_tables.sql');
        const missingSql = fs.readFileSync(missingPath, 'utf8');
        await pool.query(missingSql);
        console.log('Tablas faltantes creadas.');
    } catch (err) {
        console.error('Error en la migración:', err);
    } finally {
        await pool.end();
    }
}

migrate();
