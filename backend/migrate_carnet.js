import { Pool } from 'pg';
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

async function migrateCarnet() {
    try {
        const sqlPath = path.join(__dirname, 'sql', 'carnet_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log('Migración Carnet de Manager aplicada correctamente.');
    } catch (err) {
        console.error('Error en la migración del carnet:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrateCarnet();
