import { Pool } from 'pg';
import dotenv from 'dotenv';
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

async function fixCapacity() {
    try {
        // Consultar estadios actuales
        const before = await pool.query('SELECT id, stadium_name, capacity FROM stadiums ORDER BY id');
        console.log('Estadios ANTES de la actualización:');
        before.rows.forEach(r => console.log(`  ID ${r.id}: ${r.stadium_name} → capacity=${r.capacity}`));

        // Actualizar todos los estadios con capacity = 15000 (valor antiguo por defecto) a 2500
        const result = await pool.query(
            'UPDATE stadiums SET capacity = 2500 WHERE capacity = 15000 RETURNING id, stadium_name, capacity'
        );
        console.log(`\nEstadios actualizados: ${result.rowCount}`);
        result.rows.forEach(r => console.log(`  ID ${r.id}: ${r.stadium_name} → capacity=${r.capacity}`));

        const after = await pool.query('SELECT id, stadium_name, capacity FROM stadiums ORDER BY id');
        console.log('\nEstadios DESPUÉS de la actualización:');
        after.rows.forEach(r => console.log(`  ID ${r.id}: ${r.stadium_name} → capacity=${r.capacity}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

fixCapacity();
