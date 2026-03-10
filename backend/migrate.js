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
        const schemaPath = path.join(__dirname, 'sql', 'railway_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const shouldReset = ['1', 'true', 'yes'].includes((process.env.RESET_DB || '').toLowerCase());

        if (shouldReset) {
            await pool.query(`
                DROP TABLE IF EXISTS players CASCADE;
                DROP TABLE IF EXISTS team_finances CASCADE;
                DROP TABLE IF EXISTS stadiums CASCADE;
                DROP TABLE IF EXISTS matches CASCADE;
                DROP TABLE IF EXISTS teams CASCADE;
                DROP TABLE IF EXISTS managers CASCADE;
                DROP TABLE IF EXISTS leagues_regions CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
            `);
            console.log('Tablas existentes eliminadas.');
        }

        await pool.query(schemaSql);
        console.log('Esquema aplicado o ya existe.');
    } catch (err) {
        console.error('Error en la migración:', err);
    } finally {
        await pool.end();
    }
}

migrate();
