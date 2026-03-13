import { Pool } from 'pg';


import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Solo cargar dotenv en local
if (!process.env.RAILWAY_STATIC_URL && !process.env.RAILWAY_ENVIRONMENT_ID) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

async function migrateAdditional() {
    try {
        // Ejecutar migración adicional principal
        const schemaPath = path.join(__dirname, 'sql', 'railway_schema_additional.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('Migración adicional aplicada o ya existe.');

        // Ejecutar todas las migraciones incrementales en /sql/migrations (excepto nationality)
        const migrationsDir = path.join(__dirname, 'sql', 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const migrationFiles = fs.readdirSync(migrationsDir)
                .filter(f => f.endsWith('.sql') && !f.includes('nationality'))
                .sort();
            for (const file of migrationFiles) {
                const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await pool.query(migrationSql);
                console.log(`Migración incremental aplicada: ${file}`);
            }
        }
    } catch (err) {
        console.error('Error en la migración adicional:', err);
    } finally {
        await pool.end();
    }
}

migrateAdditional();
