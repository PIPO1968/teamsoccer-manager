import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

const createManagersTable = `
CREATE TABLE IF NOT EXISTS managers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country_id INTEGER NOT NULL
);
`;

const createTeamsTable = `
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  manager_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL
);
`;

async function migrate() {
    try {
        await pool.query(createManagersTable);
        await pool.query(createTeamsTable);
        console.log('Tablas managers y teams creadas o ya existen.');
    } catch (err) {
        console.error('Error en la migración:', err);
    } finally {
        await pool.end();
    }
}

migrate();
