/**
 * seed_series.js
 * Crea 4 divisiones (Div1×1, Div2×2, Div3×4, Div4×8 grupos) con 8 equipos BOT
 * por serie para cada región de leagues_regions que aún no tenga series.
 *
 * Uso:
 *   node backend/seed_series.js
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const pgHostRaw = process.env.PGHOST || 'localhost';
const [pgHostname, pgHostPort] = pgHostRaw.includes(':')
    ? pgHostRaw.split(':')
    : [pgHostRaw, null];
const pgPort = pgHostPort ? parseInt(pgHostPort) : (parseInt(process.env.PGPORT) || 5432);

const pool = new Pool({
    host: pgHostname,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: pgPort,
});

const BOT_NAMES = ['Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Rangers', 'Dynamo', 'Sporting'];

const run = async () => {
    const client = await pool.connect();
    try {
        const regionsResult = await client.query(
            'SELECT region_id, name FROM leagues_regions ORDER BY region_id ASC'
        );
        const regions = regionsResult.rows;
        console.log(`🌍 ${regions.length} regiones encontradas`);

        let createdSeries = 0;
        let createdTeams = 0;
        let skipped = 0;

        for (const region of regions) {
            const regionId = region.region_id;

            const existing = await client.query(
                'SELECT COUNT(*)::int AS total FROM series WHERE region_id = $1', [regionId]
            );
            if (existing.rows[0].total > 0) {
                skipped++;
                continue;
            }

            await client.query('BEGIN');
            try {
                // División 1 — 1 grupo
                const d1 = await client.query(
                    'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (1, 1, $1, 1, NULL) RETURNING series_id',
                    [regionId]
                );
                const d1g1 = d1.rows[0].series_id;

                // División 2 — 2 grupos
                const d2ids = [];
                for (let g = 1; g <= 2; g++) {
                    const r = await client.query(
                        'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (2, $1, $2, 1, $3) RETURNING series_id',
                        [g, regionId, d1g1]
                    );
                    d2ids.push(r.rows[0].series_id);
                }

                // División 3 — 4 grupos
                const d3ids = [];
                for (let g = 1; g <= 4; g++) {
                    const parent = d2ids[Math.floor((g - 1) / 2)];
                    const r = await client.query(
                        'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (3, $1, $2, 1, $3) RETURNING series_id',
                        [g, regionId, parent]
                    );
                    d3ids.push(r.rows[0].series_id);
                }

                // División 4 — 8 grupos
                const d4ids = [];
                for (let g = 1; g <= 8; g++) {
                    const parent = d3ids[Math.floor((g - 1) / 2)];
                    const r = await client.query(
                        'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (4, $1, $2, 1, $3) RETURNING series_id',
                        [g, regionId, parent]
                    );
                    d4ids.push(r.rows[0].series_id);
                }

                // 8 equipos BOT por serie
                const allSeriesIds = [d1g1, ...d2ids, ...d3ids, ...d4ids];
                for (const sid of allSeriesIds) {
                    for (let t = 0; t < 8; t++) {
                        await client.query(
                            `INSERT INTO teams (name, manager_id, country_id, is_bot, series_id) VALUES ($1, NULL, $2, 1, $3)`,
                            [`${BOT_NAMES[t]} FC`, regionId, sid]
                        );
                        createdTeams++;
                    }
                }

                createdSeries += 15; // 1+2+4+8
                await client.query('COMMIT');
                console.log(`  ✅ ${region.name} (region_id=${regionId}): 15 series + 120 BOT teams`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`  ❌ Error en región ${region.name}:`, err.message);
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   Series creadas: ${createdSeries}`);
        console.log(`   Equipos BOT creados: ${createdTeams}`);
        console.log(`   Regiones ya pobladas (saltadas): ${skipped}`);
    } catch (err) {
        console.error('❌ Error fatal:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
};

run();
