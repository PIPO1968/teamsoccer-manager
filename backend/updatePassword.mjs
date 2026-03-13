import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { Pool } from 'pg';

console.log('PGHOST:', process.env.PGHOST);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD:', process.env.PGPASSWORD);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGPORT:', process.env.PGPORT);

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

const email = 'pipocanarias@hotmail.com'; // Email actualizado
const newHash = '$2b$10$4FbBj1CY.4zKlCObzDs3UezNbHtTdem1kPwoMWNfHUsux99/qubBe';

async function updatePassword() {
    try {
        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [newHash, email]
        );
        console.log('Resultado:', res.rows);
    } catch (err) {
        console.error('Error en la consulta:', err);
    } finally {
        await pool.end();
    }
}

updatePassword();
