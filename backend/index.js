
import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import https from 'https';
import http from 'http';

// Forzar redeploy Railway - 2026-03-07

dotenv.config({ path: './.env' });


const app = express();

// CORS global usando paquete cors y función para origin
const allowedOrigins = [
    'https://teamsoccer-manager-production-f836.up.railway.app',
    'http://localhost:8080',
    'http://localhost:5173'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// ...existing code...
// Endpoint temporal: obtener todos los region_id de leagues_regions
app.get('/leagues-regions', async (req, res) => {
    try {
        const result = await pool.query('SELECT region_id FROM leagues_regions ORDER BY region_id ASC');
        res.json({ success: true, regions: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log('Intentando conectar a Postgres en:', process.env.PGHOST, process.env.PGPORT, process.env.PGDATABASE);

// PGHOST puede incluir el puerto (ej: "host:15941"), lo separamos manualmente
const pgHostRaw = process.env.PGHOST || 'localhost';
const [pgHostname, pgHostPort] = pgHostRaw.includes(':') ? pgHostRaw.split(':') : [pgHostRaw, null];
const pgPort = pgHostPort ? parseInt(pgHostPort) : (parseInt(process.env.PGPORT) || 5432);

const pool = new Pool({
    host: pgHostname,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: pgPort,
});

pool.connect()
    .then(() => console.log('✅ Conexión a Postgres exitosa'))
    .catch((err) => console.error('❌ Error conectando a Postgres:', err));

const initDb = async () => {
    const client = await pool.connect();
    try {
        // Tablas del carnet
        await client.query(`
            CREATE TABLE IF NOT EXISTS manager_license_tests (
                id SERIAL PRIMARY KEY,
                test_key TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                reward_amount INTEGER NOT NULL DEFAULT 50000,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS manager_license_progress (
                id SERIAL PRIMARY KEY,
                manager_id INTEGER NOT NULL REFERENCES managers(user_id) ON DELETE CASCADE,
                test_key TEXT NOT NULL,
                completed_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (manager_id, test_key)
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS avatar_configs (
                id SERIAL PRIMARY KEY,
                manager_id INTEGER NOT NULL UNIQUE REFERENCES managers(user_id) ON DELETE CASCADE,
                gender TEXT,
                face_type INTEGER,
                body_type INTEGER,
                body_variation INTEGER,
                face_tone INTEGER,
                eye_type INTEGER,
                eye_color INTEGER,
                eye_mood INTEGER,
                eyebrows INTEGER,
                mouth_type INTEGER,
                mouth_mood INTEGER,
                nose_type INTEGER,
                facial_hair INTEGER,
                hair_type INTEGER,
                hair_color INTEGER,
                shirt_color INTEGER,
                background_color INTEGER,
                show_anniversary_badge BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS goalkeeper INTEGER DEFAULT 30`);
        await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS crosses INTEGER DEFAULT 30`);
        await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS image_url TEXT`);
        await client.query(`ALTER TABLE manager_license_tests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
        // Tabla series (liga competitiva)
        await client.query(`
            CREATE TABLE IF NOT EXISTS series (
                series_id SERIAL PRIMARY KEY,
                division INTEGER NOT NULL DEFAULT 1,
                group_number INTEGER NOT NULL DEFAULT 1,
                region_id INTEGER REFERENCES leagues_regions(region_id) ON DELETE SET NULL,
                season INTEGER NOT NULL DEFAULT 1,
                parent_series_id INTEGER REFERENCES series(series_id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        // Añadir coach_level a equipos si no existe
        await client.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS coach_level TEXT DEFAULT 'poor'`);
        await client.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS series_id INTEGER REFERENCES series(series_id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE managers ADD COLUMN IF NOT EXISTS current_url TEXT`);
        await client.query(`ALTER TABLE managers ADD COLUMN IF NOT EXISTS last_ip TEXT`);
        await client.query(`ALTER TABLE managers ADD COLUMN IF NOT EXISTS connection_country TEXT`);
        // Corrección de capacidad: estadios con el valor antiguo por defecto (15000) → 2500
        await client.query(`UPDATE stadiums SET capacity = 2500 WHERE capacity = 15000`);
        // Tabla de mensajes privados entre managers
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES managers(user_id) ON DELETE CASCADE,
                recipient_id INTEGER NOT NULL REFERENCES managers(user_id) ON DELETE CASCADE,
                subject TEXT NOT NULL,
                content TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        // Columnas de desglose de asientos en estadios
        await client.query(`ALTER TABLE stadiums ADD COLUMN IF NOT EXISTS seats_standing INTEGER DEFAULT 0`);
        await client.query(`ALTER TABLE stadiums ADD COLUMN IF NOT EXISTS seats_basic INTEGER DEFAULT 0`);
        await client.query(`ALTER TABLE stadiums ADD COLUMN IF NOT EXISTS seats_covered INTEGER DEFAULT 0`);
        await client.query(`ALTER TABLE stadiums ADD COLUMN IF NOT EXISTS seats_vip INTEGER DEFAULT 0`);
        await client.query(`ALTER TABLE team_finances ADD COLUMN IF NOT EXISTS last_weekly_process TIMESTAMPTZ DEFAULT NULL`);
        console.log('✅ Tablas verificadas/creadas correctamente');
    } catch (err) {
        console.error('❌ Error creando tablas:', err.message);
    }

    // Seed series: crear 4 divisiones + 8 equipos BOT por serie por cada región que no las tenga
    try {
        const regionsResult = await client.query('SELECT region_id FROM leagues_regions ORDER BY region_id ASC');
        for (const row of regionsResult.rows) {
            const regionId = row.region_id;
            const existing = await client.query(
                'SELECT COUNT(*)::int AS total FROM series WHERE region_id = $1', [regionId]
            );
            if (existing.rows[0].total > 0) continue;

            // División 1 — 1 grupo
            const d1 = await client.query(
                'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (1, 1, $1, 1, NULL) RETURNING series_id',
                [regionId]
            );
            const d1g1 = d1.rows[0].series_id;

            // División 2 — 2 grupos (parent: d1g1)
            const d2ids = [];
            for (let g = 1; g <= 2; g++) {
                const r = await client.query(
                    'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (2, $1, $2, 1, $3) RETURNING series_id',
                    [g, regionId, d1g1]
                );
                d2ids.push(r.rows[0].series_id);
            }

            // División 3 — 4 grupos (parent: d2ids[Math.floor((g-1)/2)])
            const d3ids = [];
            for (let g = 1; g <= 4; g++) {
                const parent = d2ids[Math.floor((g - 1) / 2)];
                const r = await client.query(
                    'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (3, $1, $2, 1, $3) RETURNING series_id',
                    [g, regionId, parent]
                );
                d3ids.push(r.rows[0].series_id);
            }

            // División 4 — 8 grupos (parent: d3ids[Math.floor((g-1)/2)])
            const d4ids = [];
            for (let g = 1; g <= 8; g++) {
                const parent = d3ids[Math.floor((g - 1) / 2)];
                const r = await client.query(
                    'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES (4, $1, $2, 1, $3) RETURNING series_id',
                    [g, regionId, parent]
                );
                d4ids.push(r.rows[0].series_id);
            }

            // Crear 8 equipos BOT por cada serie (120 equipos por región)
            const botNames = ['Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Rangers', 'Dynamo', 'Sporting'];
            const allSeriesIds = [d1g1, ...d2ids, ...d3ids, ...d4ids];
            for (const sid of allSeriesIds) {
                for (let t = 0; t < 8; t++) {
                    await client.query(
                        `INSERT INTO teams (name, manager_id, country_id, is_bot, series_id) VALUES ($1, NULL, $2, 1, $3)`,
                        [`${botNames[t]} FC`, regionId, sid]
                    );
                }
            }
        }
        console.log('✅ Series (4 divisiones) y equipos BOT verificados/creados');
    } catch (seriesErr) {
        console.warn('⚠️ No se pudieron crear series automáticamente:', seriesErr.message);
    }

    // Asignar serie Div1 a equipos reales (is_bot=0) que no tengan serie asignada
    try {
        const unassigned = await client.query(
            'SELECT team_id, country_id FROM teams WHERE is_bot = 0 AND series_id IS NULL AND country_id IS NOT NULL'
        );
        for (const team of unassigned.rows) {
            const s = await client.query(
                'SELECT series_id FROM series WHERE region_id = $1 AND division = 1 AND group_number = 1 ORDER BY season DESC LIMIT 1',
                [team.country_id]
            );
            if (s.rows[0]) {
                await client.query('UPDATE teams SET series_id = $1 WHERE team_id = $2', [s.rows[0].series_id, team.team_id]);
            }
        }
        if (unassigned.rows.length > 0) console.log(`✅ ${unassigned.rows.length} equipos reales asignados a Div1`);
    } catch (err) {
        console.warn('⚠️ Error asignando series a equipos reales:', err.message);
    }

    // Rellenar cada serie con equipos BOT hasta alcanzar 8 equipos en total
    try {
        const botNames = ['Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Rangers', 'Dynamo', 'Sporting'];
        const allSeries = await client.query('SELECT series_id, region_id FROM series ORDER BY series_id ASC');
        for (const s of allSeries.rows) {
            const countRes = await client.query(
                'SELECT COUNT(*)::int AS total FROM teams WHERE series_id = $1', [s.series_id]
            );
            const needed = 8 - countRes.rows[0].total;
            if (needed <= 0) continue;
            const usedRes = await client.query(
                'SELECT name FROM teams WHERE series_id = $1 AND is_bot = 1', [s.series_id]
            );
            const usedNames = new Set(usedRes.rows.map(r => r.name));
            let added = 0;
            for (const n of botNames) {
                if (added >= needed) break;
                const fullName = `${n} FC`;
                if (!usedNames.has(fullName)) {
                    const newBot = await client.query(
                        'INSERT INTO teams (name, manager_id, country_id, is_bot, series_id) VALUES ($1, NULL, $2, 1, $3) RETURNING team_id',
                        [fullName, s.region_id, s.series_id]
                    );
                    await setupBotTeam(client, newBot.rows[0].team_id, fullName, s.region_id);
                    added++;
                }
            }
        }
        console.log('✅ Series rellenadas con equipos BOT (8 por serie)');
    } catch (err) {
        console.warn('⚠️ Error rellenando BOT teams:', err.message);
    }

    // Seed pruebas del Carnet (bloque separado — siempre se intenta)
    try {
        await client.query(`
            INSERT INTO manager_license_tests (test_key, title, description, reward_amount, sort_order) VALUES
            ('visit_premium',         'Premium Gratis',          'Visita la tienda y activa tus 30 días Premium gratis', 0,     1),
            ('visit_team',            'Conoce tu Equipo',        'Visita la página de tu equipo',               50000, 2),
            ('visit_players',         'Gestiona tus Jugadores',  'Visita la lista de jugadores',                50000, 3),
            ('visit_transfer_market', 'Mercado de Fichajes',     'Visita el Mercado de Transferencias',         75000, 4),
            ('visit_matches',         'Los Partidos',            'Visita la sección de Partidos',               50000, 5),
            ('visit_finances',        'Las Finanzas',            'Revisa las finanzas de tu equipo',            50000, 6),
            ('visit_stadium',         'Tu Estadio',              'Visita tu estadio',                           50000, 7),
            ('visit_training',        'Entrenamiento',           'Visita la sección de Entrenamiento',          50000, 8),
            ('visit_forums',          'Los Foros',               'Visita los Foros de la comunidad',            50000, 9),
            ('visit_community',       'La Comunidad',            'Visita la página de Comunidad',               50000, 10)
            ON CONFLICT (test_key) DO NOTHING
        `);
        console.log('✅ Pruebas del Carnet verificadas');
    } catch (err) {
        console.error('❌ Error seeding carnet tests:', err.message);
    }

    // Expandir países (bloque separado — ON CONFLICT requiere UNIQUE en leagues_regions.name)
    try {
        await client.query(`
            INSERT INTO leagues_regions (name) VALUES
            ('Germany'), ('Italy'), ('Portugal'), ('Netherlands'), ('Belgium'),
            ('Argentina'), ('Brazil'), ('Colombia'), ('Uruguay'), ('Chile'), ('Ecuador'),
            ('Mexico'), ('United States'), ('Canada'), ('Japan'), ('South Korea'),
            ('Australia'), ('China'), ('India'), ('Saudi Arabia'), ('Iran'),
            ('Qatar'), ('United Arab Emirates'), ('Iraq'), ('Kuwait'), ('Oman'),
            ('Jordan'), ('Bahrain'), ('Egypt'), ('Morocco'), ('Tunisia'),
            ('Algeria'), ('Senegal'), ('Nigeria'), ('Ghana'), ('Cameroon'),
            ('Ivory Coast'), ('South Africa'), ('Kenya'), ('Tanzania'), ('Ethiopia'),
            ('Sweden'), ('Norway'), ('Denmark'), ('Finland'), ('Switzerland'),
            ('Austria'), ('Czech Republic'), ('Hungary'), ('Romania'), ('Croatia'),
            ('Serbia'), ('Greece'), ('Turkey'), ('Ukraine'), ('Russia'),
            ('Poland'), ('Slovakia'), ('Bulgaria'), ('Belarus'), ('Lithuania'),
            ('Latvia'), ('Estonia'), ('Slovenia'), ('Montenegro'), ('Albania'),
            ('Bosnia and Herzegovina'), ('North Macedonia'), ('Georgia'), ('Armenia'), ('Azerbaijan'),
            ('Cyprus'), ('Malta'), ('Iceland'), ('Luxembourg'), ('Ireland'),
            ('Scotland'), ('Wales'), ('Northern Ireland'), ('Costa Rica'), ('Honduras'),
            ('El Salvador'), ('Guatemala'), ('Panama'), ('Jamaica'), ('Peru'),
            ('Paraguay'), ('Bolivia'), ('Venezuela'), ('New Zealand'), ('Indonesia'),
            ('Vietnam'), ('Thailand'), ('Malaysia'), ('Singapore'), ('Philippines'),
            ('Pakistan'), ('Bangladesh'), ('Kazakhstan'), ('Uzbekistan'), ('Tajikistan'),
            ('Dominican Republic'), ('Trinidad and Tobago'), ('Haiti'), ('Cuba'), ('Zambia'),
            ('Zimbabwe'), ('Uganda'), ('DR Congo'), ('Burkina Faso'), ('Mali'),
            ('Sudan'), ('Libya'), ('Rwanda'), ('Mozambique'), ('Angola'),
            ('Namibia'), ('Botswana'), ('Gabon'), ('Benin'), ('Togo'),
            ('Niger'), ('Sierra Leone'), ('Liberia'), ('Mauritania'), ('Somalia')
            ON CONFLICT (name) DO NOTHING
        `);
        console.log('✅ Países verificados');
    } catch (err) {
        console.error('❌ Error expandiendo países (puede que leagues_regions.name no tenga UNIQUE):', err.message);
    }

    // Garantizar que el super admin siempre tiene is_admin = 10
    try {
        await client.query(`
            UPDATE managers SET is_admin = 10
            WHERE username = 'PIPO68' OR email = 'pipocanarias@hotmail.com'
        `);
        console.log('✅ Super admin restaurado a is_admin=10');
    } catch (err) {
        console.error('❌ Error restaurando super admin:', err.message);
    }

    // Auto-reparar managers activos cuyo equipo no tiene liga asignada
    try {
        const unassigned = await client.query(`
            SELECT m.user_id FROM managers m
            JOIN teams t ON t.manager_id = m.user_id
            WHERE m.status = 'active' AND t.series_id IS NULL
        `);
        for (const row of unassigned.rows) {
            const repairClient = await pool.connect();
            try {
                await repairClient.query('BEGIN');
                await fullyActivateManager(repairClient, row.user_id);
                await repairClient.query('COMMIT');
                console.log(`✅ Liga reparada para manager ${row.user_id}`);
            } catch (repairErr) {
                await repairClient.query('ROLLBACK');
                console.error(`❌ Error reparando manager ${row.user_id}:`, repairErr.message);
            } finally {
                repairClient.release();
            }
        }
        if (unassigned.rows.length > 0) console.log(`✅ ${unassigned.rows.length} manager(s) reparados`);
    } catch (err) {
        console.error('❌ Error en auto-reparación de managers:', err.message);
    }

    client.release();
};
initDb();

const ADMIN_USERNAME = 'PIPO68';

// Configurar equipo BOT: garantiza jugadores, estadio y finanzas básicas
const setupBotTeam = async (client, teamId, teamName, countryId) => {
    const finRes = await client.query('SELECT 1 FROM team_finances WHERE team_id = $1', [teamId]);
    if (finRes.rowCount === 0) {
        await client.query('INSERT INTO team_finances (team_id, cash_balance) VALUES ($1, 1000000)', [teamId]);
    }
    const stadRes = await client.query('SELECT 1 FROM stadiums WHERE team_id = $1', [teamId]);
    if (stadRes.rowCount === 0) {
        await client.query('INSERT INTO stadiums (name, team_id, capacity) VALUES ($1, $2, 2500)', [`${teamName} Stadium`, teamId]);
    }
    const plRes = await client.query('SELECT COUNT(*)::int AS total FROM players WHERE team_id = $1', [teamId]);
    if (plRes.rows[0].total < 18) {
        await createInitialPlayers(client, teamId, countryId);
    }
};

// Expande divisiones cuando se agotan los BOTs de la región (Div 5, 6, 7...)
const expandLeaguesIfNeeded = async (client, countryId) => {
    const botCount = await client.query(
        `SELECT COUNT(*)::int AS total FROM teams t
         JOIN series s ON s.series_id = t.series_id
         WHERE t.is_bot = 1 AND s.region_id = $1`,
        [countryId]
    );
    if (botCount.rows[0].total > 0) return; // Aún quedan BOTs, no hace falta expandir

    const maxDiv = await client.query(
        'SELECT MAX(division)::int AS max_div FROM series WHERE region_id = $1',
        [countryId]
    );
    const currentMax = maxDiv.rows[0].max_div || 4;
    const nextDiv = currentMax + 1;
    const numGroups = Math.pow(2, nextDiv - 1); // Div5=16, Div6=32, Div7=64...

    const parentSeries = await client.query(
        'SELECT series_id, group_number FROM series WHERE region_id = $1 AND division = $2 ORDER BY group_number ASC',
        [countryId, currentMax]
    );

    console.log(`🏆 Región ${countryId}: creando División ${nextDiv} con ${numGroups} grupos`);
    const botNames = ['Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Rangers', 'Dynamo', 'Sporting'];

    for (let g = 1; g <= numGroups; g++) {
        const parent = parentSeries.rows[Math.floor((g - 1) / 2)];
        const r = await client.query(
            'INSERT INTO series (division, group_number, region_id, season, parent_series_id) VALUES ($1, $2, $3, 1, $4) RETURNING series_id',
            [nextDiv, g, countryId, parent?.series_id || null]
        );
        const sid = r.rows[0].series_id;
        for (let t = 0; t < 8; t++) {
            const newBot = await client.query(
                'INSERT INTO teams (name, manager_id, country_id, is_bot, series_id) VALUES ($1, NULL, $2, 1, $3) RETURNING team_id',
                [`${botNames[t]} FC`, countryId, sid]
            );
            await setupBotTeam(client, newBot.rows[0].team_id, `${botNames[t]} FC`, countryId);
        }
    }
    console.log(`✅ División ${nextDiv} creada: ${numGroups} grupos × 8 BOTs = ${numGroups * 8} equipos nuevos`);
};

// Convierte el equipo de un manager en BOT cuando es expulsado o desactivado
const deactivateManagerTeam = async (client, managerId) => {
    const botNames = ['Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Rangers', 'Dynamo', 'Sporting'];
    const newName = `${botNames[Math.floor(Math.random() * botNames.length)]} FC`;
    const res = await client.query(
        `UPDATE teams SET is_bot = 1, manager_id = NULL, name = $1, updated_at = NOW()
         WHERE manager_id = $2 RETURNING team_id`,
        [newName, managerId]
    );
    if (res.rowCount > 0) {
        console.log(`♻️ Equipo del manager ${managerId} convertido a BOT (${newName})`);
    }
};

// Activación completa: garantiza que el manager tiene jugadores, estadio, finanzas y liga
const fullyActivateManager = async (client, managerId) => {
    // Obtener equipo provisional (creado en el registro)
    const teamRes = await client.query(
        'SELECT team_id, name, country_id, series_id FROM teams WHERE manager_id = $1 LIMIT 1',
        [managerId]
    );
    if (teamRes.rows.length === 0) return;
    let { team_id, name: team_name, country_id, series_id } = teamRes.rows[0];

    // Si el equipo no tiene country_id, usar el del manager como fallback y actualizarlo
    if (!country_id) {
        const mgrRes = await client.query(
            'SELECT country_id FROM managers WHERE user_id = $1', [managerId]
        );
        if (mgrRes.rows[0]?.country_id) {
            country_id = mgrRes.rows[0].country_id;
            await client.query('UPDATE teams SET country_id = $1 WHERE team_id = $2', [country_id, team_id]);
            console.log(`ℹ️ Team ${team_id} country_id actualizado a ${country_id} desde el manager`);
        }
    }

    // Verificar si ya tiene serie correctamente asignada
    let needsSeries = !series_id;
    if (series_id && country_id) {
        const checkSeries = await client.query(
            'SELECT 1 FROM series WHERE series_id = $1 AND region_id = $2', [series_id, country_id]
        );
        if (checkSeries.rowCount === 0) {
            needsSeries = true;
            console.log(`ℹ️ Team ${team_id} tiene series_id ${series_id} de otra región. Reasignando...`);
        }
    }

    if (!needsSeries) {
        // Ya tiene liga correcta: solo garantizar finanzas, estadio y jugadores
        const finRes = await client.query('SELECT 1 FROM team_finances WHERE team_id = $1', [team_id]);
        if (finRes.rowCount === 0) {
            await client.query('INSERT INTO team_finances (team_id, cash_balance) VALUES ($1, 1000000)', [team_id]);
        }
        const stadRes = await client.query('SELECT 1 FROM stadiums WHERE team_id = $1', [team_id]);
        if (stadRes.rowCount === 0) {
            await client.query('INSERT INTO stadiums (name, team_id, capacity) VALUES ($1, $2, 2500)', [`${team_name} Stadium`, team_id]);
        }
        const plRes = await client.query('SELECT COUNT(*)::int AS total FROM players WHERE team_id = $1', [team_id]);
        if (plRes.rows[0].total < 18) {
            await createInitialPlayers(client, team_id, country_id);
        }
        return;
    }

    if (!country_id) return;

    // Necesita serie: buscar un equipo BOT en el mismo país para heredar
    const botRes = await client.query(
        `SELECT t.team_id AS bot_team_id, t.series_id AS bot_series_id FROM teams t
         JOIN series s ON s.series_id = t.series_id
         WHERE t.is_bot = 1 AND s.region_id = $1
         ORDER BY s.division ASC, s.group_number ASC, t.team_id ASC LIMIT 1`,
        [country_id]
    );

    if (botRes.rows.length > 0) {
        const { bot_team_id, bot_series_id } = botRes.rows[0];

        // Asegurar que el BOT tiene jugadores, estadio y finanzas antes de heredar
        await setupBotTeam(client, bot_team_id, team_name, country_id);

        // Convertir el equipo BOT en el equipo del manager (hereda jugadores y setup)
        await client.query(
            'UPDATE teams SET name = $1, manager_id = $2, is_bot = 0, country_id = $3, updated_at = NOW() WHERE team_id = $4',
            [team_name, managerId, country_id, bot_team_id]
        );

        // Renombrar el estadio del BOT con el nombre del club del manager
        await client.query(
            'UPDATE stadiums SET name = $1 WHERE team_id = $2',
            [`${team_name} Stadium`, bot_team_id]
        );

        // Desvincular el equipo provisional del manager antes de eliminarlo
        await client.query('UPDATE teams SET manager_id = NULL WHERE team_id = $1', [team_id]);

        // Eliminar el equipo provisional de registro y todo lo asociado
        await client.query('DELETE FROM players WHERE team_id = $1', [team_id]);
        await client.query('DELETE FROM team_finances WHERE team_id = $1', [team_id]);
        await client.query('DELETE FROM stadiums WHERE team_id = $1', [team_id]);
        await client.query('DELETE FROM teams WHERE team_id = $1', [team_id]);

        console.log(`✅ Manager ${managerId} heredó el equipo BOT ${bot_team_id} en serie ${bot_series_id} como "${team_name}"`);
        // Si agotamos los BOTs de la región, expandir con una nueva división
        await expandLeaguesIfNeeded(client, country_id);
    } else {
        // Fallback sin BOTs disponibles: asignar serie Div1 directamente al equipo existente
        const div1 = await client.query(
            'SELECT series_id FROM series WHERE region_id = $1 AND division = 1 AND group_number = 1 LIMIT 1',
            [country_id]
        );
        if (div1.rows[0]) {
            await client.query(
                'UPDATE teams SET series_id = $1, updated_at = NOW() WHERE team_id = $2',
                [div1.rows[0].series_id, team_id]
            );
            console.log(`✅ Team ${team_id} asignado a Div1 serie ${div1.rows[0].series_id} (sin BOT disponible)`);
        } else {
            console.warn(`⚠️ No se encontró serie Div1 para region_id ${country_id}`);
        }
        // Garantizar finanzas, estadio y jugadores en el equipo existente
        const finRes = await client.query('SELECT 1 FROM team_finances WHERE team_id = $1', [team_id]);
        if (finRes.rowCount === 0) {
            await client.query('INSERT INTO team_finances (team_id, cash_balance) VALUES ($1, 1000000)', [team_id]);
        }
        const stadRes = await client.query('SELECT 1 FROM stadiums WHERE team_id = $1', [team_id]);
        if (stadRes.rowCount === 0) {
            await client.query('INSERT INTO stadiums (name, team_id, capacity) VALUES ($1, $2, 2500)', [`${team_name} Stadium`, team_id]);
        }
        const plRes = await client.query('SELECT COUNT(*)::int AS total FROM players WHERE team_id = $1', [team_id]);
        if (plRes.rows[0].total < 18) {
            await createInitialPlayers(client, team_id, country_id);
        }
    }
};

const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Valor de mercado basado en rating y edad
const calcPlayerValue = (rating, age) => {
    const base = Math.pow(rating / 60, 3.5) * 2000000;
    let ageFactor;
    if (age <= 21) ageFactor = 1.25;
    else if (age <= 25) ageFactor = 1.05;
    else if (age <= 28) ageFactor = 1.00;
    else if (age <= 31) ageFactor = 0.75;
    else if (age <= 34) ageFactor = 0.50;
    else ageFactor = 0.30;
    return Math.round(base * ageFactor / 50000) * 50000;
};

// Imagen DiceBear única por jugador (seed = nombre completo)
const playerImage = (firstName, lastName, countryId) => {
    const seed = encodeURIComponent(`${firstName}${lastName}`);
    if (countryId === 1) { // España
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&skinColor=tanned,cream&hairColor=black,brown,brown2`;
    }
    if (countryId === 2) { // England
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&skinColor=pale,light,cream&hairColor=blonde,brown,auburn`;
    }
    if (countryId === 3) { // France
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&skinColor=tanned,brown,cream&hairColor=black,brown,brown2`;
    }
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
};

// Nombres por país
const namesByCountry = {
    1: { // España
        first: ['Alejandro', 'Carlos', 'David', 'Diego', 'Fernando', 'Francisco', 'Gonzalo', 'Hugo', 'Javier', 'Jorge', 'José', 'Juan', 'Luis', 'Marcos', 'Miguel', 'Pablo', 'Pedro', 'Rafael', 'Roberto', 'Sergio', 'Álvaro', 'Adrián', 'Armando', 'Bruno', 'Cristian', 'Daniel', 'Emilio', 'Enrique', 'Iván', 'Jesús', 'Nicolás', 'Óscar', 'Raúl', 'Rubén', 'Víctor'],
        last: ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Pérez', 'Rodríguez', 'Fernández', 'Torres', 'Romero', 'Flores', 'Álvarez', 'Díaz', 'Reyes', 'Cruz', 'Morales', 'Ortega', 'Castro', 'Ramos', 'Herrera', 'Jiménez', 'Ruiz', 'Navarro', 'Vázquez', 'Serrano', 'Blanco', 'Molina', 'Moreno', 'Delgado', 'Ortiz']
    },
    2: { // England
        first: ['James', 'Oliver', 'Harry', 'George', 'Jack', 'Charlie', 'Thomas', 'Edward', 'William', 'Henry', 'Alfie', 'Joshua', 'Samuel', 'Ethan', 'Matthew', 'Daniel', 'Liam', 'Noah', 'Jake', 'Ryan'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin', 'Lewis', 'White', 'Harris', 'Clark', 'Robinson', 'Walker', 'Hall']
    },
    3: { // France
        first: ['Antoine', 'Baptiste', 'Clément', 'Damien', 'Etienne', 'François', 'Guillaume', 'Hugo', 'Julien', 'Kevin', 'Laurent', 'Mathieu', 'Nicolas', 'Olivier', 'Pierre', 'Quentin', 'Romain', 'Sébastien', 'Thomas', 'Vincent'],
        last: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Girard', 'Bonnet']
    }
};
const defaultNames = {
    first: ['Alex', 'Brian', 'Carlos', 'David', 'Eric', 'Frank', 'George', 'Henry', 'Ivan', 'Jack', 'Kevin', 'Luis', 'Mario', 'Nico', 'Oscar', 'Paul', 'Rafa', 'Stefan', 'Thomas', 'Victor'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Martin', 'Clark', 'Lewis']
};

const createInitialPlayers = async (client, teamId, countryId) => {
    const positions = ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'RW', 'CAM', 'CDM', 'LW', 'ST', 'ST', 'CF', 'CB', 'RB'];
    const numericCountryId = countryId !== null && countryId !== undefined ? Number(countryId) : null;
    const names = namesByCountry[numericCountryId] || defaultNames;

    for (let i = 0; i < positions.length; i += 1) {
        const firstName = randFrom(names.first);
        const lastName = randFrom(names.last);
        const age = randBetween(17, 34);
        const rating = randBetween(58, 82);
        const value = calcPlayerValue(rating, age);
        const wage = Math.round(value / 400 / 500) * 500;
        const imageUrl = playerImage(firstName, lastName, numericCountryId);
        const isGK = positions[i] === 'GK';
        const gkStat = isGK ? randBetween(55, 85) : randBetween(5, 25);

        await client.query(
            `INSERT INTO players (
                first_name, last_name, position, age, nationality_id, team_id,
                value, wage, fitness, form, contract_until,
                finishing, pace, passing, defense, dribbling, heading, stamina, goalkeeper, crosses,
                goals, assists, matches_played, minutes_played, rating,
                personality, experience, leadership, loyalty, owned_since, image_url
            ) VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,$8,$9,$10,$11,
                $12,$13,$14,$15,$16,$17,$18,$19,$20,
                $21,$22,$23,$24,$25,
                $26,$27,$28,$29,$30,$31
            )`,
            [
                firstName, lastName, positions[i], age, numericCountryId, teamId,
                value, wage,
                randBetween(75, 100), 'Good', '2027',
                randBetween(40, 85), randBetween(40, 85), randBetween(40, 85),
                randBetween(40, 85), randBetween(40, 85), randBetween(40, 85), randBetween(40, 85), gkStat,
                randBetween(20, 80),
                0, 0, 0, 0, rating,
                randBetween(40, 80), randBetween(40, 80), randBetween(40, 80), randBetween(40, 80),
                new Date(), imageUrl
            ]
        );
    }
};

// Registro completo: usuario, manager y equipo
app.post('/register', async (req, res) => {
    const { email, password, username, country, teamName } = req.body;
    if (!email || !password || !username || !country || !teamName) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    // Obtener el ID del país: acepta tanto nombre (string) como region_id (número)
    // Si el país no existe en leagues_regions, se guarda como null
    let countryId = null;
    try {
        const numericCountry = Number(country);
        if (!isNaN(numericCountry) && numericCountry > 0) {
            // El frontend envió un region_id numérico directamente
            countryId = numericCountry;
        } else {
            // El frontend envió el nombre del país como string
            const countryRes = await pool.query('SELECT region_id FROM leagues_regions WHERE name = $1', [country]);
            if (countryRes.rows.length > 0) {
                countryId = countryRes.rows[0].region_id;
            }
            // Si no se encuentra, countryId queda como null (válido)
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error buscando el país: ' + err.message });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existingUser = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (existingUser.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Email ya registrado' });
        }

        const existingManager = await client.query('SELECT 1 FROM managers WHERE username = $1', [username]);
        if (existingManager.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Usuario ya existe' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // 1. Crear usuario
        const userResult = await client.query(
            'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
            [email, passwordHash, username]
        );
        const userId = userResult.rows[0].id;

        // 2. Crear manager
        const ADMIN_EMAIL = 'pipocanarias@hotmail.com';
        const isAdmin = username === ADMIN_USERNAME || email === ADMIN_EMAIL;
        const managerStatus = isAdmin ? 'active' : 'waiting_list';
        const isAdminLevel = isAdmin ? 10 : 0;

        const managerResult = await client.query(
            `INSERT INTO managers (
                user_id, username, email, country_id, is_admin, status
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
            [userId, username, email, countryId, isAdminLevel, managerStatus]
        );
        const managerId = managerResult.rows[0].user_id;

        // 3. Crear equipo provisional (sin serie, sin BOT — se asignará al obtener el carnet)
        const teamResult = await client.query(
            'INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id',
            [teamName, managerId, countryId]
        );
        const teamId = teamResult.rows[0].team_id;

        await client.query(
            'INSERT INTO team_finances (team_id, cash_balance) VALUES ($1, 1000000)',
            [teamId]
        );
        await client.query(
            'INSERT INTO stadiums (name, team_id, capacity) VALUES ($1, $2, 2500)',
            [`${teamName} Stadium`, teamId]
        );
        await createInitialPlayers(client, teamId, countryId);

        await client.query('COMMIT');
        res.json({
            success: true,
            userId,
            managerId,
            teamId,
            status: 'waiting_list'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Endpoint para login básico
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = userResult.rows[0];
        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const managerResult = await pool.query(
            `SELECT m.*, t.team_id
             FROM managers m
             LEFT JOIN teams t ON t.manager_id = m.user_id
             WHERE m.user_id = $1`,
            [user.id]
        );

        const manager = managerResult.rows[0] || null;

        // Marcar como online y actualizar last_login
        if (manager) {
            await pool.query(
                'UPDATE managers SET is_online = true, last_login = now(), last_seen = now() WHERE user_id = $1',
                [user.id]
            );
        }

        res.json({ success: true, user, manager });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Geolocalización de IP usando ip-api.com (gratuito, sin clave)
const geolocateIp = (ip) => new Promise((resolve) => {
    // Ignorar IPs locales/privadas
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') ||
        ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) {
        return resolve(null);
    }
    const url = `http://ip-api.com/json/${ip}?fields=status,country,countryCode`;
    http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                resolve(json.status === 'success' ? `${json.country} (${json.countryCode})` : null);
            } catch { resolve(null); }
        });
    }).on('error', () => resolve(null));
});

// Endpoint para logout
app.post('/logout', async (req, res) => {
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    try {
        await pool.query(
            'UPDATE managers SET is_online = false, last_seen = now() WHERE user_id = $1',
            [managerId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Heartbeat: mantiene al manager marcado como online
app.post('/heartbeat', async (req, res) => {
    const { managerId, currentUrl } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    // Capturar IP real (Railway pasa la IP real en x-forwarded-for)
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
    try {
        await pool.query(
            'UPDATE managers SET is_online = true, last_seen = now(), current_url = $2, last_ip = $3 WHERE user_id = $1',
            [managerId, currentUrl || null, rawIp]
        );
        // Auto-marcar offline managers sin heartbeat reciente
        await pool.query(
            "UPDATE managers SET is_online = false WHERE is_online = true AND last_seen < NOW() - INTERVAL '6 minutes'"
        );
        res.json({ success: true });
        // Geo-lookup asíncrono (no bloquea la respuesta)
        geolocateIp(rawIp).then(country => {
            if (country) {
                pool.query('UPDATE managers SET connection_country = $1 WHERE user_id = $2', [country, managerId]).catch(() => { });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener manager por id
app.get('/managers/:id', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) {
        return res.status(400).json({ error: 'managerId invalido' });
    }

    try {
        const managerResult = await pool.query(
            `SELECT m.user_id, m.username, m.email, m.country_id, r.name AS country_name,
                    m.is_admin, m.status, m.is_premium, m.premium_expires_at, t.team_id
             FROM managers m
             LEFT JOIN teams t ON t.manager_id = m.user_id
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             WHERE m.user_id = $1`,
            [managerId]
        );

        if (managerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Manager no encontrado' });
        }

        res.json({ success: true, manager: managerResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Perfil completo de un manager (con país y equipo)
app.get('/managers/:id/profile', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const mResult = await pool.query(
            `SELECT m.user_id, m.username, m.email, m.country_id, m.is_admin,
                    m.is_premium, m.premium_expires_at, m.status, m.created_at,
                    r.name AS country_name
             FROM managers m
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             WHERE m.user_id = $1`,
            [managerId]
        );
        if (!mResult.rows[0]) return res.status(404).json({ error: 'Manager no encontrado' });
        const tResult = await pool.query(
            'SELECT name, team_id, created_at, is_bot, club_logo FROM teams WHERE manager_id = $1',
            [managerId]
        );
        res.json({ success: true, manager: { ...mResult.rows[0], teams: tResult.rows } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Estado online de un manager
app.get('/managers/:id/status', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const result = await pool.query(
            'SELECT is_online, last_seen FROM managers WHERE user_id = $1',
            [managerId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Manager no encontrado' });
        res.json({ success: true, ...result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener mensajes de un manager
app.get('/messages', async (req, res) => {
    const managerId = parseInt(req.query.managerId, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId requerido' });
    try {
        const result = await pool.query(
            `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.content, m.created_at, m.read,
                    s.username AS sender_name, r.username AS recipient_name
             FROM messages m
             JOIN managers s ON s.user_id = m.sender_id
             JOIN managers r ON r.user_id = m.recipient_id
             WHERE m.recipient_id = $1 OR m.sender_id = $1
             ORDER BY m.created_at DESC`,
            [managerId]
        );
        const unread = result.rows.filter(m => !m.read && m.recipient_id === managerId).length;
        res.json({ success: true, messages: result.rows, unreadCount: unread });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enviar mensaje
app.post('/messages', async (req, res) => {
    const { senderId, recipientId, subject, content } = req.body;
    if (!senderId || !recipientId || !subject || !content) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    try {
        await pool.query(
            'INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES ($1, $2, $3, $4)',
            [senderId, recipientId, subject, content]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Marcar mensaje como leído
app.put('/messages/:id/read', async (req, res) => {
    const messageId = parseInt(req.params.id, 10);
    const { managerId } = req.body;
    if (!messageId || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        await pool.query(
            'UPDATE messages SET read = true WHERE id = $1 AND recipient_id = $2',
            [messageId, managerId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar mensaje
app.delete('/messages/:id', async (req, res) => {
    const messageId = parseInt(req.params.id, 10);
    const managerId = parseInt(req.query.managerId, 10);
    if (!messageId || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        await pool.query(
            'DELETE FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)',
            [messageId, managerId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar logo del equipo (solo el manager propietario)
app.put('/teams/:id/logo', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const { managerId, clubLogo } = req.body;
    if (!teamId || !managerId || !clubLogo) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    try {
        const result = await pool.query(
            `UPDATE teams SET club_logo = $1, updated_at = NOW()
             WHERE team_id = $2 AND manager_id = $3
             RETURNING team_id`,
            [clubLogo, teamId, managerId]
        );
        if (result.rowCount === 0) {
            return res.status(403).json({ error: 'No autorizado o equipo no encontrado' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener jugadores de un equipo
app.get('/teams/:id/players', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }
    try {
        const result = await pool.query(
            `SELECT p.*, r.name AS nationality
             FROM players p
             LEFT JOIN leagues_regions r ON r.region_id = p.nationality_id
             WHERE p.team_id = $1
             ORDER BY p.position`,
            [teamId]
        );
        res.json({ success: true, players: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener finanzas de un equipo
app.get('/teams/:id/finances', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }
    const client = await pool.connect();
    try {
        const [finResult, wagesResult, stadResult] = await Promise.all([
            client.query('SELECT * FROM team_finances WHERE team_id = $1', [teamId]),
            client.query('SELECT COALESCE(SUM(wage), 0) AS total_wages FROM players WHERE team_id = $1', [teamId]),
            client.query('SELECT capacity FROM stadiums WHERE team_id = $1 LIMIT 1', [teamId]),
        ]);

        const finances = finResult.rows[0] || null;
        if (finances) {
            const totalWages = parseInt(wagesResult.rows[0]?.total_wages || 0);
            const capacity = parseInt(stadResult.rows[0]?.capacity || 0);
            const maintenanceCost = Math.floor(capacity * 1.8);
            const weeklyExpenses = totalWages + maintenanceCost;

            // Procesar deducción semanal si han pasado 7 días desde la última vez
            const lastProcess = finances.last_weekly_process ? new Date(finances.last_weekly_process) : null;
            const now = new Date();
            const daysSinceLast = lastProcess ? (now - lastProcess) / (1000 * 60 * 60 * 24) : 999;

            if (daysSinceLast >= 7 && weeklyExpenses > 0) {
                await client.query(
                    `UPDATE team_finances
                     SET cash_balance = GREATEST(cash_balance - $1, 0),
                         wages_expenses = wages_expenses + $2,
                         stadium_maintenance_expenses = stadium_maintenance_expenses + $3,
                         last_weekly_process = NOW()
                     WHERE team_id = $4`,
                    [weeklyExpenses, totalWages, maintenanceCost, teamId]
                );
                finances.cash_balance = Math.max((finances.cash_balance || 0) - weeklyExpenses, 0);
                finances.wages_expenses = (finances.wages_expenses || 0) + totalWages;
                finances.stadium_maintenance_expenses = (finances.stadium_maintenance_expenses || 0) + maintenanceCost;
            } else {
                // Solo actualizar campos mostrados sin deducir
                finances.wages_expenses = totalWages;
                finances.stadium_maintenance_expenses = maintenanceCost;
            }

            finances.weekly_expenses = weeklyExpenses;
            finances.weekly_income = (finances.match_income || 0) + (finances.sponsor_income || 0) + (finances.other_income || 0);
        }

        res.json({ success: true, finances });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Obtener partidos de un equipo
app.get('/teams/:id/matches', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT
                m.match_id_int AS match_id,
                m.home_team_id,
                m.away_team_id,
                ht.name AS home_team_name,
                at.name AS away_team_name,
                m.home_score,
                m.away_score,
                m.match_date,
                m.status,
                m.is_friendly,
                CASE WHEN m.home_team_id = $1 THEN true ELSE false END AS is_home
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            JOIN teams at ON at.team_id = m.away_team_id
            WHERE m.home_team_id = $1 OR m.away_team_id = $1
            ORDER BY m.match_date DESC`,
            [teamId]
        );
        const matches = result.rows.map(row => ({
            ...row,
            competition: row.is_friendly ? 'Friendly Match' : 'League Match',
            result: row.status === 'completed'
                ? (row.is_home
                    ? (row.home_score > row.away_score ? 'Win' : row.home_score < row.away_score ? 'Loss' : 'Draw')
                    : (row.away_score > row.home_score ? 'Win' : row.away_score < row.home_score ? 'Loss' : 'Draw'))
                : null
        }));
        res.json({ success: true, matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener stadium_id por team_id  (debe ir ANTES de /stadiums/:id)
app.get('/stadiums/by-team/:id', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            'SELECT stadium_id FROM stadiums WHERE team_id = $1 LIMIT 1',
            [teamId]
        );
        const stadiumId = result.rows[0]?.stadium_id || null;
        res.json({ success: true, stadiumId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadio por ID
app.get('/stadiums/:id', async (req, res) => {
    const stadiumId = parseInt(req.params.id, 10);
    if (!stadiumId) return res.status(400).json({ error: 'stadiumId invalido' });
    try {
        const result = await pool.query(
            `SELECT
                s.stadium_id,
                s.name AS stadium_name,
                s.capacity AS stadium_capacity,
                s.build_date,
                s.team_id,
                s.seats_standing,
                s.seats_basic,
                s.seats_covered,
                s.seats_vip,
                t.name AS team_name,
                t.club_logo AS team_logo,
                r.name AS country
            FROM stadiums s
            JOIN teams t ON t.team_id = s.team_id
            LEFT JOIN leagues_regions r ON r.region_id = t.country_id
            WHERE s.stadium_id = $1`,
            [stadiumId]
        );
        res.json({ success: true, stadium: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ampliar estadio: añadir asientos y descontar del presupuesto
app.post('/stadiums/:id/expand', async (req, res) => {
    const stadiumId = parseInt(req.params.id, 10);
    const { managerId, standingSeats = 0, basicSeats = 0, coveredSeats = 0, vipSeats = 0 } = req.body;
    if (!stadiumId || !managerId) return res.status(400).json({ error: 'Faltan datos' });

    const PRICE_STANDING = 80;
    const PRICE_BASIC = 150;
    const PRICE_COVERED = 300;
    const PRICE_VIP = 1500;
    const MAX_CAPACITY = 80000;
    const MAX_STANDING = 50000;
    const MAX_BASIC = 20000;
    const MAX_COVERED = 9500;
    const MAX_VIP = 500;

    const totalSeats = parseInt(standingSeats) + parseInt(basicSeats) + parseInt(coveredSeats) + parseInt(vipSeats);
    if (totalSeats <= 0) return res.status(400).json({ error: 'Debes añadir al menos un asiento' });

    const totalCost =
        parseInt(standingSeats) * PRICE_STANDING +
        parseInt(basicSeats) * PRICE_BASIC +
        parseInt(coveredSeats) * PRICE_COVERED +
        parseInt(vipSeats) * PRICE_VIP;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar que el manager es dueño del equipo del estadio
        const stadRes = await client.query(
            `SELECT s.stadium_id, s.capacity, s.seats_standing, s.seats_basic, s.seats_covered, s.seats_vip, s.team_id
             FROM stadiums s
             JOIN teams t ON t.team_id = s.team_id
             WHERE s.stadium_id = $1 AND t.manager_id = $2`,
            [stadiumId, managerId]
        );
        if (stadRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'No eres el propietario de este estadio' });
        }
        const stad = stadRes.rows[0];

        // Verificar topes por tipo de asiento
        if ((stad.seats_standing || 0) + parseInt(standingSeats) > MAX_STANDING)
            return res.status(400).json({ error: `Máximo de gradas: ${MAX_STANDING.toLocaleString()}` });
        if ((stad.seats_basic || 0) + parseInt(basicSeats) > MAX_BASIC)
            return res.status(400).json({ error: `Máximo de asientos básicos: ${MAX_BASIC.toLocaleString()}` });
        if ((stad.seats_covered || 0) + parseInt(coveredSeats) > MAX_COVERED)
            return res.status(400).json({ error: `Máximo de asientos cubiertos: ${MAX_COVERED.toLocaleString()}` });
        if ((stad.seats_vip || 0) + parseInt(vipSeats) > MAX_VIP)
            return res.status(400).json({ error: `Máximo de palcos VIP: ${MAX_VIP.toLocaleString()}` });

        // Verificar capacidad máxima total
        const newCapacity = stad.capacity + totalSeats;
        if (newCapacity > MAX_CAPACITY) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `La capacidad máxima es ${MAX_CAPACITY.toLocaleString()} asientos` });
        }

        // Verificar saldo suficiente
        const finRes = await client.query(
            'SELECT cash_balance FROM team_finances WHERE team_id = $1',
            [stad.team_id]
        );
        if (finRes.rows.length === 0 || finRes.rows[0].cash_balance < totalCost) {
            await client.query('ROLLBACK');
            const balance = finRes.rows[0]?.cash_balance || 0;
            return res.status(400).json({
                error: `Saldo insuficiente. Tienes €${balance.toLocaleString()} y necesitas €${totalCost.toLocaleString()}`
            });
        }

        // Actualizar estadio
        await client.query(
            `UPDATE stadiums SET
                capacity = capacity + $1,
                seats_standing = seats_standing + $2,
                seats_basic = seats_basic + $3,
                seats_covered = seats_covered + $4,
                seats_vip = seats_vip + $5
             WHERE stadium_id = $6`,
            [totalSeats, standingSeats, basicSeats, coveredSeats, vipSeats, stadiumId]
        );

        // Descontar del presupuesto
        await client.query(
            `UPDATE team_finances
             SET cash_balance = cash_balance - $1,
                 stadium_building_expenses = COALESCE(stadium_building_expenses, 0) + $1
             WHERE team_id = $2`,
            [totalCost, stad.team_id]
        );

        await client.query('COMMIT');
        res.json({ success: true, newCapacity, totalCost });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Obtener partidos de un estadio (partidos del equipo local)
app.get('/stadiums/:id/matches', async (req, res) => {
    const stadiumId = parseInt(req.params.id, 10);
    if (!stadiumId) return res.status(400).json({ error: 'stadiumId invalido' });
    try {
        const stadRes = await pool.query(
            'SELECT team_id FROM stadiums WHERE stadium_id = $1 LIMIT 1',
            [stadiumId]
        );
        if (!stadRes.rows[0]) return res.json({ success: true, matches: [] });
        const homeTeamId = stadRes.rows[0].team_id;
        const result = await pool.query(
            `SELECT
                m.match_id_int AS match_id,
                m.home_team_id,
                m.away_team_id,
                ht.name AS home_team_name,
                at.name AS away_team_name,
                m.home_score,
                m.away_score,
                m.match_date,
                m.status,
                m.is_friendly
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            JOIN teams at ON at.team_id = m.away_team_id
            WHERE m.home_team_id = $1
            ORDER BY m.match_date DESC`,
            [homeTeamId]
        );
        const matches = result.rows.map(row => ({
            ...row,
            competition: row.is_friendly ? 'Friendly Match' : 'League Match',
            result: row.status === 'completed'
                ? (row.home_score > row.away_score ? 'Win' : row.home_score < row.away_score ? 'Loss' : 'Draw')
                : null
        }));
        res.json({ success: true, matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener equipo por manager
app.get('/teams/by-manager/:id', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) {
        return res.status(400).json({ error: 'managerId invalido' });
    }

    try {
        const teamResult = await pool.query(
            `SELECT 
                t.team_id,
                t.name,
                t.club_logo,
                t.fan_count,
                t.team_spirit,
                t.manager_id,
                m.username AS manager_username,
                m.is_admin AS manager_is_admin,
                m.is_premium AS manager_is_premium,
                t.team_rating,
                t.team_morale,
                t.country_id,
                t.is_bot,
                s.name AS stadium_name,
                s.capacity AS stadium_capacity,
                r.name AS country_name
            FROM teams t
            LEFT JOIN managers m ON m.user_id = t.manager_id
            LEFT JOIN stadiums s ON s.team_id = t.team_id
            LEFT JOIN leagues_regions r ON r.region_id = t.country_id
            WHERE t.manager_id = $1
            LIMIT 1`,
            [managerId]
        );

        if (teamResult.rows.length === 0) {
            return res.json({ success: true, team: null });
        }

        res.json({ success: true, team: teamResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener equipo por id
app.get('/teams/:id', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }

    try {
        const teamResult = await pool.query(
            `SELECT 
                t.team_id,
                t.name,
                t.club_logo,
                t.fan_count,
                t.team_spirit,
                t.manager_id,
                m.username AS manager_username,
                m.is_admin AS manager_is_admin,
                m.is_premium AS manager_is_premium,
                t.team_rating,
                t.team_morale,
                t.country_id,
                t.is_bot,
                s.name AS stadium_name,
                s.capacity AS stadium_capacity,
                r.name AS country_name
            FROM teams t
            LEFT JOIN managers m ON m.user_id = t.manager_id
            LEFT JOIN stadiums s ON s.team_id = t.team_id
            LEFT JOIN leagues_regions r ON r.region_id = t.country_id
            WHERE t.team_id = $1
            LIMIT 1`,
            [teamId]
        );

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json({ success: true, team: teamResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/matches/recent', async (req, res) => {
    const teamId = parseInt(req.query.teamId, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }

    try {
        const matchesResult = await pool.query(
            `SELECT 
                m.match_id_int,
                m.match_date,
                m.home_team_id,
                m.away_team_id,
                m.home_score,
                m.away_score,
                ht.name AS home_name,
                at.name AS away_name
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            JOIN teams at ON at.team_id = m.away_team_id
            WHERE (m.home_team_id = $1 OR m.away_team_id = $1)
              AND m.status = 'completed'
            ORDER BY m.match_date DESC
            LIMIT 5`,
            [teamId]
        );

        res.json({ success: true, matches: matchesResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proximo partido
app.get('/matches/next', async (req, res) => {
    const teamId = parseInt(req.query.teamId, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }

    try {
        const matchResult = await pool.query(
            `SELECT 
                m.match_id_int,
                m.match_date,
                m.home_team_id,
                m.away_team_id,
                ht.name AS home_name,
                at.name AS away_name
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            JOIN teams at ON at.team_id = m.away_team_id
            WHERE (m.home_team_id = $1 OR m.away_team_id = $1)
              AND m.status = 'scheduled'
            ORDER BY m.match_date ASC
            LIMIT 1`,
            [teamId]
        );

        const match = matchResult.rows[0] || null;
        res.json({ success: true, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener detalles de un partido por ID
app.get('/matches/:id', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    if (!matchId) return res.status(400).json({ error: 'matchId invalido' });
    try {
        const result = await pool.query(
            `SELECT
                m.match_id_int AS match_id,
                m.home_team_id,
                m.away_team_id,
                ht.name AS home_team_name,
                at.name AS away_team_name,
                ht.club_logo AS home_team_logo,
                at.club_logo AS away_team_logo,
                m.home_score,
                m.away_score,
                m.match_date,
                m.status,
                m.is_friendly,
                m.series_id,
                s.division,
                s.group_number,
                r.name AS region_name,
                st.stadium_id,
                st.name AS stadium_name
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            JOIN teams at ON at.team_id = m.away_team_id
            LEFT JOIN series s ON s.series_id = m.series_id
            LEFT JOIN leagues_regions r ON r.region_id = s.region_id
            LEFT JOIN stadiums st ON st.team_id = m.home_team_id
            WHERE m.match_id_int = $1`,
            [matchId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Partido no encontrado' });
        const row = result.rows[0];
        const match = {
            ...row,
            competition: row.is_friendly ? 'Friendly Match' : 'League Match',
            stadium_name: row.stadium_name || `${row.home_team_name} Stadium`
        };
        res.json({ success: true, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener eventos/highlights de un partido
app.get('/matches/:id/highlights', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    if (!matchId) return res.status(400).json({ error: 'matchId invalido' });
    try {
        // Intentar usar stored procedure si existe, si no devolver vacío
        let highlights = [];
        try {
            const result = await pool.query(
                'SELECT * FROM get_match_highlights($1)',
                [matchId]
            );
            highlights = result.rows;
        } catch {
            // La función get_match_highlights puede no existir aún
            highlights = [];
        }
        res.json({ success: true, highlights });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener jugador por ID
app.get('/players/:id', async (req, res) => {
    const playerId = parseInt(req.params.id, 10);
    if (!playerId) return res.status(400).json({ error: 'playerId invalido' });
    try {
        const result = await pool.query(
            `SELECT
                p.*,
                r.name AS nationality,
                t.name AS team_name
            FROM players p
            LEFT JOIN leagues_regions r ON r.region_id = p.nationality_id
            LEFT JOIN teams t ON t.team_id = p.team_id
            WHERE p.player_id = $1`,
            [playerId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Jugador no encontrado' });
        const row = result.rows[0];
        const player = {
            ...row,
            team: row.team_name ? { name: row.team_name } : undefined
        };
        res.json({ success: true, player });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener asignaciones de entrenamiento de un equipo
app.get('/teams/:id/training', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT pta.*
             FROM player_training_assignments pta
             JOIN players p ON p.player_id = pta.player_id
             WHERE p.team_id = $1`,
            [teamId]
        );
        res.json({ success: true, assignments: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar asignación de entrenamiento de un jugador (upsert)
app.put('/players/:id/training', async (req, res) => {
    const playerId = parseInt(req.params.id, 10);
    if (!playerId) return res.status(400).json({ error: 'playerId invalido' });
    const { trainingType, intensity } = req.body;
    try {
        await pool.query(
            `INSERT INTO player_training_assignments (player_id, training_type, training_intensity, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (player_id)
             DO UPDATE SET training_type = $2, training_intensity = $3, updated_at = NOW()`,
            [playerId, trainingType, intensity]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener alineación de un partido y equipo
app.get('/matches/:id/lineup/:teamId', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    const teamId = parseInt(req.params.teamId, 10);
    if (!matchId || !teamId) return res.status(400).json({ error: 'IDs invalidos' });
    try {
        const result = await pool.query(
            'SELECT * FROM match_lineups WHERE match_id = $1 AND team_id = $2 LIMIT 1',
            [matchId, teamId]
        );
        res.json({ success: true, lineup: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar alineación (upsert)
app.post('/matches/:id/lineup', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    if (!matchId) return res.status(400).json({ error: 'matchId invalido' });
    const { teamId, formation, playerPositions, substitutes } = req.body;
    try {
        const existing = await pool.query(
            'SELECT id FROM match_lineups WHERE match_id = $1 AND team_id = $2 LIMIT 1',
            [matchId, teamId]
        );
        if (existing.rows[0]) {
            await pool.query(
                `UPDATE match_lineups SET formation=$3, player_positions=$4, substitutes=$5
                 WHERE match_id=$1 AND team_id=$2`,
                [matchId, teamId, formation, JSON.stringify(playerPositions), JSON.stringify(substitutes)]
            );
        } else {
            await pool.query(
                `INSERT INTO match_lineups (match_id, team_id, formation, player_positions, substitutes)
                 VALUES ($1, $2, $3, $4, $5)`,
                [matchId, teamId, formation, JSON.stringify(playerPositions), JSON.stringify(substitutes)]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eventos recientes de un manager
app.get('/managers/:id/events', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        // Devolvemos historial básico de acciones del manager (últimos logins, etc.)
        const result = await pool.query(
            `SELECT 'login' AS event_type, 'Manager logged in' AS event_description, last_login AS created_at
             FROM managers WHERE user_id = $1 AND last_login IS NOT NULL`,
            [managerId]
        );
        res.json({ success: true, events: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Equipos seguidos por un manager
app.get('/managers/:id/followed-teams', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const result = await pool.query(
            `SELECT tf.team_id, t.name AS team_name
             FROM team_followers tf
             JOIN teams t ON t.team_id = tf.team_id
             WHERE tf.follower_id = $1`,
            [managerId]
        );
        res.json({ success: true, followedTeams: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Noticias de la comunidad
app.get('/community/news', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cn.*, m.username AS author_username
             FROM community_news cn
             LEFT JOIN managers m ON m.user_id = cn.author_id
             WHERE cn.is_published = true
             ORDER BY cn.created_at DESC
             LIMIT 10`
        );
        res.json({ success: true, news: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seguidores de un equipo
app.get('/teams/:id/followers', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT tf.follower_id, m.username AS follower_name, tf.created_at AS followed_at
             FROM team_followers tf
             JOIN managers m ON m.user_id = tf.follower_id
             WHERE tf.team_id = $1
             ORDER BY tf.created_at DESC`,
            [teamId]
        );
        res.json({ success: true, followers: result.rows, count: result.rows.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Si un manager sigue a un equipo
app.get('/teams/:id/follow-status', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const managerId = parseInt(req.query.managerId, 10);
    if (!teamId || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'SELECT 1 FROM team_followers WHERE team_id = $1 AND follower_id = $2 LIMIT 1',
            [teamId, managerId]
        );
        res.json({ success: true, isFollowing: result.rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle seguir/dejar de seguir equipo
app.post('/teams/:id/toggle-follow', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const { managerId } = req.body;
    if (!teamId || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const existing = await pool.query(
            'SELECT 1 FROM team_followers WHERE team_id = $1 AND follower_id = $2 LIMIT 1',
            [teamId, managerId]
        );
        if (existing.rows.length > 0) {
            await pool.query(
                'DELETE FROM team_followers WHERE team_id = $1 AND follower_id = $2',
                [teamId, managerId]
            );
            res.json({ success: true, isFollowing: false });
        } else {
            await pool.query(
                'INSERT INTO team_followers (team_id, follower_id) VALUES ($1, $2)',
                [teamId, managerId]
            );
            res.json({ success: true, isFollowing: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Libro de visitas de un equipo
app.get('/teams/:id/guestbook', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit || '50', 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT tg.id, tg.author_id, m.username AS author_name, tg.message, tg.created_at
             FROM team_guestbook tg
             JOIN managers m ON m.user_id = tg.author_id
             WHERE tg.team_id = $1
             ORDER BY tg.created_at DESC
             LIMIT $2`,
            [teamId, limit]
        );
        res.json({ success: true, entries: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Añadir entrada al libro de visitas
app.post('/teams/:id/guestbook', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const { authorId, message } = req.body;
    if (!teamId || !authorId || !message) return res.status(400).json({ error: 'Faltan datos' });
    try {
        // Un manager solo puede dejar una entrada por equipo
        const existing = await pool.query(
            'SELECT 1 FROM team_guestbook WHERE team_id = $1 AND author_id = $2 LIMIT 1',
            [teamId, authorId]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Ya has dejado un mensaje en este guestbook' });
        }
        await pool.query(
            'INSERT INTO team_guestbook (team_id, author_id, message) VALUES ($1, $2, $3)',
            [teamId, authorId, message]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Visitas recientes a un equipo
app.get('/teams/:id/visitors', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT tv.visitor_id, m.username AS visitor_username, tv.visited_at
             FROM team_visits tv
             JOIN managers m ON m.user_id = tv.visitor_id
             WHERE tv.team_id = $1
             ORDER BY tv.visited_at DESC
             LIMIT 20`,
            [teamId]
        );
        res.json({ success: true, visitors: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Registrar visita a un equipo
app.post('/teams/:id/visit', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const { visitorId } = req.body;
    if (!teamId || !visitorId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        await pool.query(
            `INSERT INTO team_visits (team_id, visitor_id, visited_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (team_id, visitor_id) DO UPDATE SET visited_at = NOW()`,
            [teamId, visitorId]
        );
        res.json({ success: true });
    } catch (err) {
        // Ignorar errores (la tabla puede no existir)
        res.json({ success: true });
    }
});

// Desafíos de un equipo
app.get('/teams/:id/challenges', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        const result = await pool.query(
            `SELECT
                tc.id, tc.challenger_team_id, tc.challenged_team_id,
                ct.name AS challenger_team_name, ct.club_logo AS challenger_team_logo,
                dt.name AS challenged_team_name, dt.club_logo AS challenged_team_logo,
                tc.status, tc.created_at, tc.scheduled_date
             FROM team_challenges tc
             JOIN teams ct ON ct.team_id = tc.challenger_team_id
             JOIN teams dt ON dt.team_id = tc.challenged_team_id
             WHERE tc.challenger_team_id = $1 OR tc.challenged_team_id = $1
             ORDER BY tc.created_at DESC`,
            [teamId]
        );
        const challenges = result.rows.map(row => ({
            ...row,
            is_sender: row.challenger_team_id === teamId
        }));
        res.json({ success: true, challenges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enviar desafío
app.post('/teams/:id/challenges', async (req, res) => {
    const challengerTeamId = parseInt(req.params.id, 10);
    const { challengedTeamId } = req.body;
    if (!challengerTeamId || !challengedTeamId) return res.status(400).json({ error: 'Faltan datos' });
    if (challengerTeamId === challengedTeamId) return res.status(400).json({ error: 'No puedes desafiarte a ti mismo' });
    try {
        // Comprobar desafío ya existente
        const existing = await pool.query(
            `SELECT 1 FROM team_challenges
             WHERE status = 'pending' AND (
               (challenger_team_id = $1 AND challenged_team_id = $2) OR
               (challenger_team_id = $2 AND challenged_team_id = $1)
             ) LIMIT 1`,
            [challengerTeamId, challengedTeamId]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Ya existe un desafío pendiente entre estos equipos' });
        }
        // Próximo miércoles a las 19:00
        const today = new Date();
        const daysUntilWed = (3 - today.getDay() + 7) % 7 || 7;
        const nextWed = new Date(today);
        nextWed.setDate(today.getDate() + daysUntilWed);
        nextWed.setHours(19, 0, 0, 0);

        await pool.query(
            `INSERT INTO team_challenges (challenger_team_id, challenged_team_id, status, scheduled_date)
             VALUES ($1, $2, 'pending', $3)`,
            [challengerTeamId, challengedTeamId, nextWed.toISOString()]
        );

        // Notificar al manager del equipo desafiado
        const challengerRes = await pool.query(
            'SELECT name, manager_id FROM teams WHERE team_id = $1', [challengerTeamId]
        );
        const challengedRes = await pool.query(
            'SELECT manager_id FROM teams WHERE team_id = $1', [challengedTeamId]
        );
        if (challengerRes.rows[0] && challengedRes.rows[0]) {
            const { name, manager_id: senderId } = challengerRes.rows[0];
            const { manager_id: recipientId } = challengedRes.rows[0];
            await pool.query(
                `INSERT INTO messages (sender_id, recipient_id, subject, content)
                 VALUES ($1, $2, 'New Team Challenge', $3)`,
                [senderId, recipientId, `${name} ha desafiado a tu equipo a un amistoso el ${nextWed.toLocaleDateString()}. Responde en la sección Desafíos.`]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Responder a desafío (aceptar/rechazar)
app.put('/challenges/:id/respond', async (req, res) => {
    const challengeId = parseInt(req.params.id, 10);
    const { teamId, accept } = req.body;
    if (!challengeId || !teamId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const chRes = await pool.query(
            'SELECT * FROM team_challenges WHERE id = $1 AND challenged_team_id = $2 LIMIT 1',
            [challengeId, teamId]
        );
        if (!chRes.rows[0]) return res.status(404).json({ error: 'Desafío no encontrado' });
        const challenge = chRes.rows[0];

        await pool.query(
            'UPDATE team_challenges SET status = $1 WHERE id = $2',
            [accept ? 'accepted' : 'rejected', challengeId]
        );

        if (accept && challenge.scheduled_date) {
            // Crear partido amistoso
            await pool.query(
                `INSERT INTO matches (home_team_id, away_team_id, match_date, status, is_friendly)
                 VALUES ($1, $2, $3, 'scheduled', true)`,
                [challenge.challenged_team_id, challenge.challenger_team_id, challenge.scheduled_date]
            );
            // Notificar al challenger
            const challengedRes = await pool.query(
                'SELECT name, manager_id FROM teams WHERE team_id = $1', [challenge.challenged_team_id]
            );
            const challengerRes = await pool.query(
                'SELECT manager_id FROM teams WHERE team_id = $1', [challenge.challenger_team_id]
            );
            if (challengedRes.rows[0] && challengerRes.rows[0]) {
                const { name, manager_id: senderId } = challengedRes.rows[0];
                const { manager_id: recipientId } = challengerRes.rows[0];
                await pool.query(
                    `INSERT INTO messages (sender_id, recipient_id, subject, content)
                     VALUES ($1, $2, 'Challenge Accepted', $3)`,
                    [senderId, recipientId, `${name} ha aceptado tu desafío. El partido está programado.`]
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar entrenamientos en batch
app.post('/players/training/batch', async (req, res) => {
    const { assignments } = req.body;
    if (!assignments || !Array.isArray(assignments)) return res.status(400).json({ error: 'assignments requeridos' });
    try {
        for (const a of assignments) {
            await pool.query(
                `INSERT INTO player_training_assignments (player_id, training_type, training_intensity, updated_at)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (player_id)
                 DO UPDATE SET training_type = $2, training_intensity = $3, updated_at = NOW()`,
                [a.player_id, a.training_type, a.training_intensity]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener config de avatar de un manager
app.get('/managers/:id/avatar', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const result = await pool.query(
            'SELECT * FROM avatar_configs WHERE manager_id = $1 LIMIT 1',
            [managerId]
        );
        res.json({ success: true, avatar: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Guardar config de avatar (upsert)
app.put('/managers/:id/avatar', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    const d = req.body;
    try {
        await pool.query(
            `INSERT INTO avatar_configs (
                manager_id, gender, face_type, body_type, body_variation, face_tone,
                eye_type, eye_color, eye_mood, eyebrows, mouth_type, mouth_mood,
                nose_type, facial_hair, hair_type, hair_color, shirt_color,
                background_color, show_anniversary_badge, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())
            ON CONFLICT (manager_id) DO UPDATE SET
                gender=$2, face_type=$3, body_type=$4, body_variation=$5, face_tone=$6,
                eye_type=$7, eye_color=$8, eye_mood=$9, eyebrows=$10, mouth_type=$11,
                mouth_mood=$12, nose_type=$13, facial_hair=$14, hair_type=$15,
                hair_color=$16, shirt_color=$17, background_color=$18,
                show_anniversary_badge=$19, updated_at=NOW()`,
            [
                managerId, d.gender, d.face_type, d.body_type, d.body_variation, d.face_tone,
                d.eye_type, d.eye_color, d.eye_mood, d.eyebrows, d.mouth_type, d.mouth_mood,
                d.nose_type, d.facial_hair, d.hair_type, d.hair_color, d.shirt_color,
                d.background_color, d.show_anniversary_badge
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset avatar de un manager
app.delete('/managers/:id/avatar', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        await pool.query('DELETE FROM avatar_configs WHERE manager_id = $1', [managerId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Colección de banderas de un equipo (oponentes + seguidores)
app.get('/teams/:id/flag-collection', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId invalido' });
    try {
        // Países de equipos rivales (partidos jugados)
        const opponentResult = await pool.query(
            `SELECT DISTINCT r.region_id, r.name
             FROM matches m
             JOIN teams t ON (t.team_id = CASE WHEN m.home_team_id = $1 THEN m.away_team_id ELSE m.home_team_id END)
             JOIN leagues_regions r ON r.region_id = t.country_id
             WHERE (m.home_team_id = $1 OR m.away_team_id = $1) AND m.status != 'scheduled'`,
            [teamId]
        );
        // Países de seguidores
        const followerResult = await pool.query(
            `SELECT DISTINCT r.region_id, r.name
             FROM team_followers tf
             JOIN managers m ON m.user_id = tf.follower_id
             JOIN leagues_regions r ON r.region_id = m.country_id
             WHERE tf.team_id = $1`,
            [teamId]
        );
        res.json({
            success: true,
            opponentCountries: opponentResult.rows,
            followerCountries: followerResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chat de un partido
app.get('/matches/:id/chat', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    if (!matchId) return res.status(400).json({ error: 'matchId invalido' });
    try {
        const result = await pool.query(
            `SELECT mc.id, mc.match_id, mc.user_id, m.username, mc.message, mc.created_at
             FROM match_chat_messages mc
             JOIN managers m ON m.user_id = mc.user_id
             WHERE mc.match_id = $1
             ORDER BY mc.created_at ASC`,
            [matchId]
        );
        res.json({ success: true, messages: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enviar mensaje de chat de partido
app.post('/matches/:id/chat', async (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    const { userId, message } = req.body;
    if (!matchId || !userId || !message) return res.status(400).json({ error: 'Faltan datos' });
    try {
        await pool.query(
            'INSERT INTO match_chat_messages (match_id, user_id, message) VALUES ($1, $2, $3)',
            [matchId, userId, message.trim()]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Grupos de un manager
app.get('/managers/:id/groups', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const ownedResult = await pool.query(
            `SELECT g.*, COALESCE(cm.cnt, 0)::int AS member_count
             FROM groups g
             LEFT JOIN (SELECT group_id, COUNT(*)::int AS cnt FROM group_members WHERE is_active=true GROUP BY group_id) cm ON cm.group_id = g.id
             WHERE g.owner_id = $1`,
            [managerId]
        );
        const memberResult = await pool.query(
            `SELECT g.*, COALESCE(cm.cnt, 0)::int AS member_count
             FROM group_members gm
             JOIN groups g ON g.id = gm.group_id
             LEFT JOIN (SELECT group_id, COUNT(*)::int AS cnt FROM group_members WHERE is_active=true GROUP BY group_id) cm ON cm.group_id = g.id
             WHERE gm.manager_id = $1 AND gm.is_active = true AND gm.role != 'owner'`,
            [managerId]
        );
        res.json({ success: true, owned: ownedResult.rows, member: memberResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Todos los grupos con conteo de miembros
app.get('/groups', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.*, COALESCE(cm.cnt, 0)::int AS member_count
             FROM groups g
             LEFT JOIN (SELECT group_id, COUNT(*)::int AS cnt FROM group_members WHERE is_active=true GROUP BY group_id) cm ON cm.group_id = g.id
             ORDER BY g.created_at DESC`
        );
        res.json({ success: true, groups: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear grupo
app.post('/groups', async (req, res) => {
    const { ownerId, name, description } = req.body;
    if (!ownerId || !name) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'INSERT INTO groups (owner_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [ownerId, name, description || null]
        );
        res.json({ success: true, group: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar grupo (con cascada)
app.delete('/groups/:id', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    const { managerId } = req.body;
    if (!groupId) return res.status(400).json({ error: 'groupId invalido' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupRes = await client.query('SELECT * FROM groups WHERE id=$1 AND owner_id=$2', [groupId, managerId]);
        if (!groupRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Group not found or insufficient permissions' });
        }
        const forumId = groupRes.rows[0].forum_id;
        await client.query('DELETE FROM group_applications WHERE group_id=$1', [groupId]);
        await client.query('DELETE FROM group_members WHERE group_id=$1', [groupId]);
        await client.query('DELETE FROM groups WHERE id=$1', [groupId]);
        if (forumId) {
            const threadsRes = await client.query('SELECT id FROM forum_threads WHERE forum_id=$1', [forumId]);
            const threadIds = threadsRes.rows.map(r => r.id);
            if (threadIds.length > 0) {
                await client.query('DELETE FROM forum_posts WHERE thread_id = ANY($1)', [threadIds]);
                await client.query('DELETE FROM forum_threads WHERE forum_id=$1', [forumId]);
            }
            await client.query('DELETE FROM forums WHERE id=$1', [forumId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Miembros del grupo
app.get('/groups/:id/members', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    if (!groupId) return res.status(400).json({ error: 'groupId invalido' });
    try {
        const result = await pool.query(
            `SELECT gm.*, m.username AS manager_username
             FROM group_members gm JOIN managers m ON m.user_id = gm.manager_id
             WHERE gm.group_id=$1 AND gm.is_active=true`,
            [groupId]
        );
        const members = result.rows.map(r => ({ ...r, manager: { username: r.manager_username } }));
        res.json({ success: true, members });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Solicitudes pendientes del grupo
app.get('/groups/:id/applications', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    if (!groupId) return res.status(400).json({ error: 'groupId invalido' });
    try {
        const result = await pool.query(
            `SELECT ga.*, m.username AS applicant_username
             FROM group_applications ga JOIN managers m ON m.user_id = ga.applicant_id
             WHERE ga.group_id=$1 AND ga.status='pending'`,
            [groupId]
        );
        const applications = result.rows.map(r => ({ ...r, applicant: { username: r.applicant_username } }));
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Solicitud del usuario para un grupo
app.get('/groups/:id/applications/user/:managerId', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    const managerId = parseInt(req.params.managerId, 10);
    if (!groupId || !managerId) return res.status(400).json({ error: 'Datos invalidos' });
    try {
        const result = await pool.query(
            `SELECT * FROM group_applications WHERE group_id=$1 AND applicant_id=$2 AND status='pending' LIMIT 1`,
            [groupId, managerId]
        );
        res.json({ success: true, application: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Solicitar unirse a un grupo
app.post('/groups/:id/apply', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    const { managerId, message } = req.body;
    if (!groupId || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const existing = await pool.query(
            `SELECT id FROM group_applications WHERE group_id=$1 AND applicant_id=$2 AND status='pending'`,
            [groupId, managerId]
        );
        if (existing.rows.length > 0) return res.status(400).json({ error: 'You have already applied to this group' });
        const result = await pool.query(
            'INSERT INTO group_applications (group_id, applicant_id, message) VALUES ($1, $2, $3) RETURNING *',
            [groupId, managerId, message || null]
        );
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Responder a una solicitud (aprobar/rechazar)
app.put('/groups/:id/applications/:appId/respond', async (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    const appId = parseInt(req.params.appId, 10);
    const { status } = req.body; // 'approved' or 'rejected'
    if (!groupId || !appId || !status) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (status === 'approved') {
            const appRes = await client.query('SELECT applicant_id FROM group_applications WHERE id=$1', [appId]);
            if (appRes.rows[0]) {
                await client.query(
                    'INSERT INTO group_members (group_id, manager_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [groupId, appRes.rows[0].applicant_id, 'member']
                );
            }
        }
        const result = await client.query(
            `UPDATE group_applications SET status=$1, responded_at=NOW() WHERE id=$2 RETURNING *`,
            [status, appId]
        );
        await client.query('COMMIT');
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});
app.get('/community/top-posters', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT fp.author_id AS user_id, m.username, COUNT(*)::int AS post_count,
                    m.country_id, r.name AS country_name
             FROM forum_posts fp
             JOIN managers m ON m.user_id = fp.author_id
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             GROUP BY fp.author_id, m.username, m.country_id, r.name
             ORDER BY post_count DESC
             LIMIT 10`
        );
        const posters = result.rows.map(row => ({
            user_id: row.user_id,
            username: row.username,
            post_count: row.post_count,
            manager: row.country_id ? { country_id: row.country_id, country: { name: row.country_name } } : undefined
        }));
        res.json({ success: true, posters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hilos recientes del foro
app.get('/forums/recent-threads', async (req, res) => {
    const limit = parseInt(req.query.limit || '5', 10);
    try {
        const result = await pool.query(
            `SELECT ft.*, f.name AS forum_name, f.category_id
             FROM forum_threads ft
             JOIN forums f ON f.id = ft.forum_id
             WHERE f.category_id IN (2, 5)
             ORDER BY ft.last_post_at DESC NULLS LAST
             LIMIT $1`,
            [limit]
        );
        res.json({ success: true, threads: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Categorías y foros con conteo de hilos/posts
app.get('/forums', async (req, res) => {
    const isAdmin = parseInt(req.query.isAdmin || '0', 10) > 0;
    try {
        const catResult = await pool.query('SELECT * FROM forum_categories ORDER BY order_number');
        let categories = catResult.rows;
        if (!isAdmin) categories = categories.filter(c => c.id !== 4);
        const forumsResult = await pool.query(
            `SELECT f.*,
                (SELECT COUNT(*)::int FROM forum_threads ft WHERE ft.forum_id = f.id) AS thread_count,
                (SELECT COUNT(*)::int FROM forum_posts fp JOIN forum_threads ft2 ON ft2.id = fp.thread_id WHERE ft2.forum_id = f.id) AS post_count
             FROM forums f ORDER BY f.category_id, f.id`
        );
        let forums = forumsResult.rows;
        if (!isAdmin) forums = forums.filter(f => f.category_id !== 4);
        res.json({ success: true, categories, forums });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hilos de un foro con conteo paginado
app.get('/forums/:id/threads', async (req, res) => {
    const forumId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;
    if (!forumId) return res.status(400).json({ error: 'forumId invalido' });
    try {
        const result = await pool.query(
            `SELECT ft.*,
                (SELECT COUNT(*)::int FROM forum_posts fp WHERE fp.thread_id = ft.id) AS reply_count,
                (SELECT m.username FROM managers m WHERE m.user_id = ft.last_post_user_id) AS last_post_manager_username
             FROM forum_threads ft WHERE ft.forum_id = $1
             ORDER BY ft.is_sticky DESC, ft.last_post_at DESC NULLS LAST`,
            [forumId]
        );
        const sticky = result.rows.filter(t => t.is_sticky);
        const normal = result.rows.filter(t => !t.is_sticky);
        res.json({
            success: true, stickyThreads: sticky,
            normalThreads: normal.slice(offset, offset + limit),
            totalCount: normal.length,
            totalPages: Math.ceil(normal.length / limit), currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear hilo en un foro
app.post('/forums/:id/threads', async (req, res) => {
    const forumId = parseInt(req.params.id, 10);
    const { userId, title, content } = req.body;
    if (!forumId || !userId || !title || !content) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const threadRes = await client.query(
            `INSERT INTO forum_threads (forum_id, user_id, title, last_post_at, last_post_user_id)
             VALUES ($1, $2, $3, NOW(), $2) RETURNING *`,
            [forumId, userId, title]
        );
        const thread = threadRes.rows[0];
        await client.query(
            'INSERT INTO forum_posts (thread_id, user_id, content) VALUES ($1, $2, $3)',
            [thread.id, userId, content]
        );
        await client.query('COMMIT');
        res.json({ success: true, thread });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

// Obtener hilo con posts paginados
app.get('/threads/:id', async (req, res) => {
    const threadId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page || '1', 10);
    const perPage = parseInt(req.query.perPage || '10', 10);
    const offset = (page - 1) * perPage;
    if (!threadId) return res.status(400).json({ error: 'threadId invalido' });
    try {
        const threadResult = await pool.query(
            `SELECT ft.*, f.category_id AS forum_category_id
             FROM forum_threads ft LEFT JOIN forums f ON f.id = ft.forum_id
             WHERE ft.id = $1`, [threadId]
        );
        if (!threadResult.rows[0]) return res.status(404).json({ error: 'Hilo no encontrado' });
        const countResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM forum_posts WHERE thread_id = $1', [threadId]
        );
        const postsResult = await pool.query(
            `SELECT fp.*, m.username AS author_username
             FROM forum_posts fp LEFT JOIN managers m ON m.user_id = fp.user_id
             WHERE fp.thread_id = $1 ORDER BY fp.created_at LIMIT $2 OFFSET $3`,
            [threadId, perPage, offset]
        );
        pool.query('UPDATE forum_threads SET view_count = COALESCE(view_count,0)+1 WHERE id=$1', [threadId]).catch(() => { });
        const total = countResult.rows[0].total;
        res.json({
            success: true, thread: threadResult.rows[0], posts: postsResult.rows,
            totalPosts: total, totalPages: Math.ceil(total / perPage), currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear post en un hilo
app.post('/threads/:id/posts', async (req, res) => {
    const threadId = parseInt(req.params.id, 10);
    const { userId, content } = req.body;
    if (!threadId || !userId || !content) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const postResult = await pool.query(
            'INSERT INTO forum_posts (thread_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [threadId, userId, content]
        );
        await pool.query(
            'UPDATE forum_threads SET last_post_at = NOW(), last_post_user_id = $1 WHERE id = $2',
            [userId, threadId]
        );
        res.json({ success: true, post: postResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Editar post
app.put('/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!postId || !content) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            `UPDATE forum_posts SET content=$1, is_edited=true, edited_at=NOW() WHERE id=$2 RETURNING *`,
            [content, postId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Post no encontrado' });
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar post
app.delete('/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    if (!postId) return res.status(400).json({ error: 'postId invalido' });
    try {
        await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bloquear/desbloquear hilo (solo admin)
app.put('/threads/:id/lock', async (req, res) => {
    const threadId = parseInt(req.params.id, 10);
    const { isLocked } = req.body;
    if (!threadId || isLocked === undefined) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'UPDATE forum_threads SET is_locked=$1 WHERE id=$2 RETURNING *',
            [isLocked, threadId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Hilo no encontrado' });
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fijar/desfijar hilo (solo admin)
app.put('/threads/:id/sticky', async (req, res) => {
    const threadId = parseInt(req.params.id, 10);
    const { isSticky } = req.body;
    if (!threadId || isSticky === undefined) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'UPDATE forum_threads SET is_sticky=$1 WHERE id=$2 RETURNING *',
            [isSticky, threadId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Hilo no encontrado' });
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transferencias activas
app.get('/transfer-listings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tl.id, tl.player_id, tl.seller_team_id, tl.asking_price, tl.is_active, tl.created_at,
                    p.first_name, p.last_name, p.position, p.age,
                    p.finishing, p.pace, p.passing, p.defense, p.dribbling, p.heading, p.stamina,
                    p.value, p.wage, p.fitness, p.rating,
                    t.name AS team_name, t.club_logo AS team_logo,
                    r.name AS nationality
             FROM transfer_listings tl
             JOIN players p ON p.player_id = tl.player_id
             LEFT JOIN teams t ON t.team_id = tl.seller_team_id
             LEFT JOIN leagues_regions r ON r.region_id = p.nationality_id
             WHERE tl.is_active = true ORDER BY tl.created_at DESC`
        );
        res.json({ success: true, listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear ficha de transferencia
app.post('/transfer-listings', async (req, res) => {
    const { playerId, teamId, askingPrice } = req.body;
    if (!playerId || !askingPrice) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            `INSERT INTO transfer_listings (player_id, team_id, asking_price, is_active) VALUES ($1, $2, $3, true) RETURNING *`,
            [playerId, teamId, askingPrice]
        );
        res.json({ success: true, listing: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Desactivar ficha
app.put('/transfer-listings/:id/deactivate', async (req, res) => {
    const listingId = parseInt(req.params.id, 10);
    if (!listingId) return res.status(400).json({ error: 'listingId invalido' });
    try {
        await pool.query('UPDATE transfer_listings SET is_active = false WHERE id = $1', [listingId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pujas de una ficha
app.get('/transfer-listings/:id/bids', async (req, res) => {
    const listingId = parseInt(req.params.id, 10);
    if (!listingId) return res.status(400).json({ error: 'listingId invalido' });
    try {
        const result = await pool.query(
            `SELECT tb.*, t.name AS team_name FROM transfer_bids tb
             JOIN teams t ON t.team_id = tb.team_id WHERE tb.listing_id = $1 ORDER BY tb.amount DESC`,
            [listingId]
        );
        res.json({ success: true, bids: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Puja más alta de una ficha
app.get('/transfer-listings/:id/highest-bid', async (req, res) => {
    const listingId = parseInt(req.params.id, 10);
    if (!listingId) return res.status(400).json({ error: 'listingId invalido' });
    try {
        const result = await pool.query(
            `SELECT tb.*, t.name AS team_name FROM transfer_bids tb
             JOIN teams t ON t.team_id = tb.team_id WHERE tb.listing_id = $1 ORDER BY tb.amount DESC LIMIT 1`,
            [listingId]
        );
        res.json({ success: true, bid: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Realizar puja
app.post('/transfer-listings/:id/bids', async (req, res) => {
    const listingId = parseInt(req.params.id, 10);
    const { teamId, amount } = req.body;
    if (!listingId || !teamId || !amount) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            `INSERT INTO transfer_bids (listing_id, team_id, amount)
             VALUES ($1, $2, $3)
             ON CONFLICT (listing_id, team_id) DO UPDATE SET amount = $3, updated_at = NOW()
             RETURNING *`,
            [listingId, teamId, amount]
        );
        res.json({ success: true, bid: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pujas de un manager
app.get('/managers/:id/bids', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) return res.status(400).json({ error: 'managerId invalido' });
    try {
        const result = await pool.query(
            `SELECT tb.*, tl.asking_price, tl.player_id, tl.is_active,
                    p.first_name, p.last_name, t2.name AS seller_team_name
             FROM transfer_bids tb
             JOIN transfer_listings tl ON tl.id = tb.listing_id
             JOIN players p ON p.player_id = tl.player_id
             LEFT JOIN teams t2 ON t2.team_id = tl.seller_team_id
             WHERE tb.team_id = (SELECT team_id FROM teams WHERE manager_id = $1 LIMIT 1)
             ORDER BY tb.created_at DESC`,
            [managerId]
        );
        res.json({ success: true, bids: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comprar jugador (transacción completa)
app.post('/transfers/buy', async (req, res) => {
    const { listingId, playerId, buyerTeamId, sellerTeamId, price } = req.body;
    if (!playerId || !buyerTeamId || !price) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE transfer_listings SET is_active = false WHERE player_id = $1', [playerId]);
        await client.query('UPDATE players SET team_id = $1 WHERE player_id = $2', [buyerTeamId, playerId]);
        await client.query('UPDATE team_finances SET cash_balance = cash_balance - $1 WHERE team_id = $2', [price, buyerTeamId]);
        if (sellerTeamId) {
            await client.query('UPDATE team_finances SET cash_balance = cash_balance + $1 WHERE team_id = $2', [price, sellerTeamId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

// Meta: temporada actual
app.get('/meta/current-season', (req, res) => {
    res.json({
        success: true,
        season: {
            current_season: 1,
            current_week: 1
        }
    });
});

// Mundo: estadisticas globales
app.get('/world/stats', async (req, res) => {
    try {
        const regionsResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM leagues_regions'
        );
        const teamsResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM teams WHERE is_bot = 0'
        );
        const managersResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM managers'
        );
        const waitingManagersResult = await pool.query(
            "SELECT COUNT(*)::int AS total FROM managers WHERE status IN ('waiting_list', 'carnet_pending')"
        );
        // Online = last_seen en los últimos 5 minutos (cubre cierres de pestaña sin logout)
        const onlineResult = await pool.query(
            "SELECT COUNT(*)::int AS total FROM managers WHERE is_online = true AND last_seen > NOW() - INTERVAL '5 minutes'"
        );

        const totalLeaguesResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM series'
        );

        const leaguesResult = await pool.query(
            `SELECT
                r.region_id,
                r.name AS region_name,
                COUNT(t.team_id)::int AS team_count
             FROM leagues_regions r
             LEFT JOIN teams t ON t.country_id = r.region_id AND t.is_bot = 0
             GROUP BY r.region_id, r.name
             ORDER BY r.name`
        );

        const leagues = leaguesResult.rows.map((row) => ({
            league_id: row.region_id,
            region_id: row.region_id,
            region_name: row.region_name,
            team_count: row.team_count
        }));

        res.json({
            success: true,
            stats: {
                totalRegions: regionsResult.rows[0]?.total || 0,
                totalManagers: managersResult.rows[0]?.total || 0,
                totalWaitingManagers: waitingManagersResult.rows[0]?.total || 0,
                onlineManagers: onlineResult.rows[0]?.total || 0,
                totalTeams: teamsResult.rows[0]?.total || 0,
                totalLeagues: totalLeaguesResult.rows[0]?.total || 0,
                leagues
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: listar managers
app.get('/admin/managers', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                user_id,
                username,
                email,
                country_id,
                is_admin,
                is_premium,
                premium_expires_at,
                status,
                created_at,
                last_login
             FROM managers
             ORDER BY user_id`
        );
        res.json({ success: true, managers: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: managers online ahora (last_seen en los últimos 5 minutos)
app.get('/admin/online-managers', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                m.user_id,
                m.username,
                m.is_admin,
                m.is_premium,
                m.last_login,
                m.last_seen,
                m.current_url,
                m.last_ip,
                m.connection_country,
                r.name AS country_name
             FROM managers m
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             WHERE m.is_online = true AND m.last_seen > NOW() - INTERVAL '5 minutes'
             ORDER BY m.last_seen DESC`
        );
        res.json({ success: true, managers: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: actualizar manager
app.put('/admin/managers/:id', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) {
        return res.status(400).json({ error: 'managerId invalido' });
    }

    const allowedFields = new Set([
        'username',
        'email',
        'country_id',
        'is_admin',
        'is_premium',
        'premium_expires_at',
        'status'
    ]);

    const updates = [];
    const values = [];

    Object.entries(req.body || {}).forEach(([key, value]) => {
        if (!allowedFields.has(key)) return;
        values.push(value);
        updates.push(`${key} = $${values.length}`);
    });

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(managerId);

    const newStatus = req.body.status;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Leer status actual antes de actualizar
        const currentMgr = await client.query('SELECT status FROM managers WHERE user_id = $1', [managerId]);
        const previousStatus = currentMgr.rows[0]?.status;
        const result = await client.query(
            `UPDATE managers SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING user_id`,
            values
        );
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: 'Manager no encontrado' });
        }
        // Si se activa el manager, asegurar que tiene todo: liga, jugadores, estadio, finanzas
        if (newStatus === 'active') {
            await fullyActivateManager(client, managerId);
        }
        // Si era activo y ahora se desactiva/expulsa, convertir su equipo en BOT
        if (previousStatus === 'active' && newStatus && newStatus !== 'active') {
            await deactivateManagerTeam(client, managerId);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Admin: listar equipos
app.get('/admin/teams', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                t.team_id,
                t.name,
                t.manager_id,
                t.country_id,
                t.is_bot,
                t.team_rating,
                t.team_morale,
                t.team_spirit,
                t.fan_count,
                t.club_logo,
                t.created_at,
                COALESCE(tf.cash_balance, 0) AS cash_balance,
                m.username AS manager_username,
                r.name AS country_name
             FROM teams t
             LEFT JOIN managers m ON m.user_id = t.manager_id
             LEFT JOIN leagues_regions r ON r.region_id = t.country_id
             LEFT JOIN team_finances tf ON tf.team_id = t.team_id
             ORDER BY t.team_id`
        );
        res.json({ success: true, teams: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: actualizar equipo
app.put('/admin/teams/:id', async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    if (!teamId) {
        return res.status(400).json({ error: 'teamId invalido' });
    }

    const allowedFields = new Set([
        'name',
        'manager_id',
        'country_id',
        'is_bot',
        'team_rating',
        'team_morale',
        'team_spirit',
        'fan_count',
        'club_logo'
    ]);

    const updates = [];
    const values = [];

    Object.entries(req.body || {}).forEach(([key, value]) => {
        if (!allowedFields.has(key)) return;
        values.push(value);
        updates.push(`${key} = $${values.length}`);
    });

    if (updates.length === 0 && req.body?.cash_balance === undefined) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(teamId);

    try {
        if (updates.length > 0) {
            const result = await pool.query(
                `UPDATE teams SET ${updates.join(', ')} WHERE team_id = $${values.length} RETURNING team_id`,
                values
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
        }
        if (req.body?.cash_balance !== undefined) {
            await pool.query(
                `UPDATE team_finances SET cash_balance = $1 WHERE team_id = $2`,
                [Number(req.body.cash_balance), teamId]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: waitlist
app.get('/admin/waitlist-managers', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                m.user_id,
                m.username,
                m.email,
                m.status,
                m.country_id,
                m.is_admin,
                m.is_premium,
                m.created_at,
                r.name AS country_name,
                t.name AS team_name
             FROM managers m
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             LEFT JOIN teams t ON t.manager_id = m.user_id
             WHERE m.status IN ('waiting_list', 'carnet_pending')
             ORDER BY m.created_at DESC`
        );

        const managers = result.rows.map((row) => ({
            ...row,
            has_league_structure: false
        }));

        res.json({ success: true, managers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: countries
app.get('/admin/countries', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT region_id, name FROM leagues_regions ORDER BY name'
        );
        res.json({ success: true, countries: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: activar manager (cambiar status a active)
app.post('/admin/activate-manager', async (req, res) => {
    const { adminUsername, managerId } = req.body;
    if (!adminUsername || !managerId) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    const client = await pool.connect();
    try {
        const adminResult = await client.query(
            'SELECT is_admin FROM managers WHERE username = $1',
            [adminUsername]
        );
        if (adminResult.rows.length === 0 || adminResult.rows[0].is_admin < 4) {
            client.release();
            return res.status(403).json({ error: 'No autorizado' });
        }
        await client.query('BEGIN');
        const updateResult = await client.query(
            'UPDATE managers SET status = $1 WHERE user_id = $2 RETURNING user_id, status',
            ['active', managerId]
        );
        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: 'Manager no encontrado' });
        }
        // Asegurar que el manager tiene todo: liga, jugadores, estadio, finanzas
        await fullyActivateManager(client, managerId);
        await client.query('COMMIT');
        res.json({ success: true, manager: updateResult.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Admin: forzar setup completo de cualquier manager ya activo
app.post('/admin/fix-manager-setup', async (req, res) => {
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await fullyActivateManager(client, managerId);
        await client.query('COMMIT');
        res.json({ success: true, message: `Setup completado para manager ${managerId}` });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Admin: reparar liga de TODOS los managers activos sin liga asignada
app.post('/admin/repair-all-leagues', async (req, res) => {
    try {
        const unassigned = await pool.query(`
            SELECT m.user_id FROM managers m
            JOIN teams t ON t.manager_id = m.user_id
            WHERE m.status = 'active' AND t.series_id IS NULL
        `);
        const results = [];
        for (const row of unassigned.rows) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await fullyActivateManager(client, row.user_id);
                await client.query('COMMIT');
                results.push({ managerId: row.user_id, status: 'ok' });
            } catch (err) {
                await client.query('ROLLBACK');
                results.push({ managerId: row.user_id, status: 'error', error: err.message });
            } finally {
                client.release();
            }
        }
        res.json({ success: true, total: unassigned.rows.length, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: diagnóstico de estado de managers y sus equipos
app.get('/admin/debug-leagues', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                m.user_id, m.username, m.status, m.country_id AS manager_country,
                t.team_id, t.name AS team_name, t.series_id, t.is_bot,
                t.country_id AS team_country,
                s.division, s.group_number, s.region_id AS series_region,
                lr.name AS country_name
            FROM managers m
            LEFT JOIN teams t ON t.manager_id = m.user_id
            LEFT JOIN series s ON s.series_id = t.series_id
            LEFT JOIN leagues_regions lr ON lr.region_id = COALESCE(t.country_id, m.country_id)
            WHERE m.status = 'active'
            ORDER BY m.user_id ASC
        `);
        const issues = result.rows.filter(r => !r.series_id);
        res.json({
            success: true,
            total: result.rows.length,
            issues: issues.length,
            managers: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: aprobar manager (waiting_list → carnet_pending)
app.post('/admin/approve-manager', async (req, res) => {
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    try {
        const result = await pool.query(
            `UPDATE managers SET status = 'carnet_pending'
             WHERE user_id = $1 AND status = 'waiting_list'
             RETURNING user_id, status`,
            [managerId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Manager no encontrado o ya aprobado' });
        }
        res.json({ success: true, manager: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /forums?managerId=X&isAdmin=Y — categories + forums accessible to manager
app.get('/forums', async (req, res) => {
    const { managerId, isAdmin } = req.query;
    const admin = isAdmin === 'true' || isAdmin === '1';
    try {
        // Categories
        const catResult = await pool.query(
            'SELECT * FROM forum_categories ORDER BY order_number'
        );
        const categories = admin
            ? catResult.rows
            : catResult.rows.filter(c => c.id !== 4);

        // Forums with thread/post counts, filtered by access
        const forumsResult = await pool.query(`
            SELECT DISTINCT f.*,
                g.id AS group_id,
                (SELECT COUNT(*) FROM forum_threads ft WHERE ft.forum_id = f.id)::int AS thread_count,
                (SELECT COUNT(*) FROM forum_posts fp
                 JOIN forum_threads ft ON ft.id = fp.thread_id
                 WHERE ft.forum_id = f.id)::int AS post_count
            FROM forums f
            LEFT JOIN groups g ON g.forum_id = f.id
            WHERE (
                g.id IS NULL
                OR EXISTS (
                    SELECT 1 FROM group_members gm
                    WHERE gm.group_id = g.id AND gm.manager_id = $1 AND gm.is_active = true
                )
            )
            AND ($2::boolean OR f.category_id != 4)
            ORDER BY f.category_id, f.id
        `, [managerId || null, admin]);
        res.json({ success: true, categories, forums: forumsResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /forums/:id/threads?page=X&limit=Y
app.get('/forums/:id/threads', async (req, res) => {
    const forumId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const result = await pool.query(`
            SELECT ft.*,
                (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id)::int AS reply_count,
                (SELECT m.username FROM managers m WHERE m.user_id = ft.last_post_user_id) AS last_post_manager_username
            FROM forum_threads ft
            WHERE ft.forum_id = $1
            ORDER BY ft.is_sticky DESC, ft.last_post_at DESC NULLS LAST, ft.created_at DESC
        `, [forumId]);

        const stickyThreads = result.rows.filter(t => t.is_sticky);
        const normalThreads = result.rows.filter(t => !t.is_sticky);
        const offset = (page - 1) * limit;
        const paginatedNormal = normalThreads.slice(offset, offset + limit);

        res.json({
            success: true,
            stickyThreads,
            normalThreads: paginatedNormal,
            totalCount: normalThreads.length,
            totalPages: Math.ceil(normalThreads.length / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /forums/:forumId/threads — create new thread + first post
app.post('/forums/:forumId/threads', async (req, res) => {
    const forumId = parseInt(req.params.forumId);
    const { title, content, author_id } = req.body;
    if (!title || !content || !author_id) return res.status(400).json({ error: 'Faltan datos' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const threadResult = await client.query(
            `INSERT INTO forum_threads (forum_id, title, user_id, is_locked, is_sticky, view_count, created_at, last_post_at, last_post_user_id)
             VALUES ($1, $2, $3, false, false, 0, NOW(), NOW(), $3) RETURNING *`,
            [forumId, title, author_id]
        );
        const thread = threadResult.rows[0];
        await client.query(
            `INSERT INTO forum_posts (thread_id, content, user_id, created_at) VALUES ($1, $2, $3, NOW())`,
            [thread.id, content, author_id]
        );
        await client.query('COMMIT');
        res.json({ success: true, thread });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /threads/:id?page=X&perPage=Y — thread data with paginated posts + forum_category_id
app.get('/threads/:id', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = parseInt(req.query.perPage) || parseInt(req.query.postsPerPage) || 10;
    const offset = (page - 1) * postsPerPage;
    try {
        const threadResult = await pool.query(`
            SELECT ft.*, f.category_id AS forum_category_id
            FROM forum_threads ft
            LEFT JOIN forums f ON f.id = ft.forum_id
            WHERE ft.id = $1
        `, [threadId]);
        if (!threadResult.rows.length) return res.status(404).json({ error: 'Thread no encontrado' });

        const countResult = await pool.query(
            'SELECT COUNT(*)::int AS total FROM forum_posts WHERE thread_id = $1', [threadId]
        );
        const totalPosts = countResult.rows[0].total;

        const postsResult = await pool.query(`
            SELECT fp.*, m.username AS author_username
            FROM forum_posts fp
            LEFT JOIN managers m ON m.user_id = fp.user_id
            WHERE fp.thread_id = $1
            ORDER BY fp.created_at ASC
            LIMIT $2 OFFSET $3
        `, [threadId, postsPerPage, offset]);

        res.json({
            success: true,
            thread: threadResult.rows[0],
            posts: postsResult.rows,
            totalPosts,
            totalPages: Math.ceil(totalPosts / postsPerPage),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /threads/:id/access?managerId=X
app.get('/threads/:id/access', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const { managerId } = req.query;
    try {
        const result = await pool.query(`
            SELECT f.category_id FROM forum_threads ft
            JOIN forums f ON f.id = ft.forum_id
            WHERE ft.id = $1
        `, [threadId]);
        if (!result.rows.length) return res.json({ success: true, hasAccess: false });

        const { category_id } = result.rows[0];
        if (category_id === 4) {
            if (!managerId) return res.json({ success: true, hasAccess: false });
            const adminResult = await pool.query(
                'SELECT is_admin FROM managers WHERE user_id = $1', [managerId]
            );
            const isAdmin = adminResult.rows[0]?.is_admin > 0;
            return res.json({ success: true, hasAccess: isAdmin });
        }
        res.json({ success: true, hasAccess: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /threads/:id/view — increment view count
app.post('/threads/:id/view', async (req, res) => {
    const threadId = parseInt(req.params.id);
    try {
        await pool.query(
            'UPDATE forum_threads SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
            [threadId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /threads/:id/lock — toggle is_locked
app.put('/threads/:id/lock', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const { isLocked } = req.body;
    try {
        const result = await pool.query(
            'UPDATE forum_threads SET is_locked = $1 WHERE id = $2 RETURNING *',
            [isLocked, threadId]
        );
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /threads/:id/sticky — toggle is_sticky (also handles /stick for compat)
app.put('/threads/:id/sticky', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const { isSticky } = req.body;
    try {
        const result = await pool.query(
            'UPDATE forum_threads SET is_sticky = $1 WHERE id = $2 RETURNING *',
            [isSticky, threadId]
        );
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /threads/:id/posts — create post
app.post('/threads/:id/posts', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const { content, userId } = req.body;
    if (!content || !userId) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const postResult = await client.query(
            `INSERT INTO forum_posts (thread_id, content, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [threadId, content, userId]
        );
        await client.query(
            `UPDATE forum_threads SET last_post_user_id = $1, last_post_at = NOW() WHERE id = $2`,
            [userId, threadId]
        );
        await client.query('COMMIT');
        res.json({ success: true, post: postResult.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /forum-posts/:id — edit post
app.put('/forum-posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Falta content' });
    try {
        const result = await pool.query(
            `UPDATE forum_posts SET content = $1, is_edited = true, edited_at = NOW() WHERE id = $2 RETURNING *`,
            [content, postId]
        );
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /forum-posts/:id — delete post
app.delete('/forum-posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    try {
        await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aliases used by frontend: /posts/:id
app.put('/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Falta content' });
    try {
        const result = await pool.query(
            `UPDATE forum_posts SET content = $1, is_edited = true, edited_at = NOW() WHERE id = $2 RETURNING *`,
            [content, postId]
        );
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    try {
        await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== GROUPS =====================

// GET /groups — all groups with member count
app.get('/groups', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT g.*,
                (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.is_active = true)::int AS accurate_member_count
            FROM groups g
            ORDER BY g.created_at DESC
        `);
        res.json({ success: true, groups: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /groups — create group
app.post('/groups', async (req, res) => {
    const { name, description, ownerId } = req.body;
    if (!name || !ownerId) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            `INSERT INTO groups (name, description, owner_id, is_active) VALUES ($1, $2, $3, true) RETURNING *`,
            [name, description || null, ownerId]
        );
        const group = groupResult.rows[0];
        await client.query(
            `INSERT INTO group_members (group_id, manager_id, role, is_active) VALUES ($1, $2, 'owner', true)`,
            [group.id, ownerId]
        );
        await client.query('COMMIT');
        res.json({ success: true, group });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /groups/:id/apply — apply to group
app.post('/groups/:id/apply', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { applicantId, message } = req.body;
    if (!applicantId) return res.status(400).json({ error: 'Falta applicantId' });
    try {
        const existing = await pool.query(
            `SELECT id FROM group_applications WHERE group_id = $1 AND applicant_id = $2 AND status = 'pending'`,
            [groupId, applicantId]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Ya tienes una solicitud pendiente para este grupo' });
        }
        const result = await pool.query(
            `INSERT INTO group_applications (group_id, applicant_id, message, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [groupId, applicantId, message || null]
        );
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /groups/:id — delete group (owner only, cascade)
app.delete('/groups/:id', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { managerId } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            'SELECT * FROM groups WHERE id = $1 AND owner_id = $2', [groupId, managerId]
        );
        if (!groupResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Grupo no encontrado o sin permiso' });
        }
        const forumId = groupResult.rows[0].forum_id;

        await client.query('DELETE FROM group_applications WHERE group_id = $1', [groupId]);
        await client.query('DELETE FROM group_members WHERE group_id = $1', [groupId]);
        await client.query('DELETE FROM groups WHERE id = $1', [groupId]);

        if (forumId) {
            const threads = await client.query('SELECT id FROM forum_threads WHERE forum_id = $1', [forumId]);
            if (threads.rows.length > 0) {
                const threadIds = threads.rows.map(t => t.id);
                await client.query('DELETE FROM forum_posts WHERE thread_id = ANY($1)', [threadIds]);
                await client.query('DELETE FROM forum_threads WHERE forum_id = $1', [forumId]);
            }
            await client.query('DELETE FROM forums WHERE id = $1', [forumId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /groups/:id/members
app.get('/groups/:id/members', async (req, res) => {
    const groupId = parseInt(req.params.id);
    try {
        const result = await pool.query(`
            SELECT gm.*, m.username AS manager_username
            FROM group_members gm
            JOIN managers m ON m.user_id = gm.manager_id
            WHERE gm.group_id = $1 AND gm.is_active = true
        `, [groupId]);
        res.json({ success: true, members: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /groups/:id/applications — pending applications
app.get('/groups/:id/applications', async (req, res) => {
    const groupId = parseInt(req.params.id);
    try {
        const result = await pool.query(`
            SELECT ga.*, m.username AS applicant_username
            FROM group_applications ga
            JOIN managers m ON m.user_id = ga.applicant_id
            WHERE ga.group_id = $1 AND ga.status = 'pending'
        `, [groupId]);
        res.json({ success: true, applications: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /groups/:id/user-application?managerId=X
app.get('/groups/:id/user-application', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { managerId } = req.query;
    if (!managerId) return res.json({ success: true, application: null });
    try {
        const result = await pool.query(
            `SELECT * FROM group_applications WHERE group_id = $1 AND applicant_id = $2 AND status = 'pending'`,
            [groupId, managerId]
        );
        res.json({ success: true, application: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /group-applications/:id — handle application
app.put('/group-applications/:id', async (req, res) => {
    const applicationId = parseInt(req.params.id);
    const { status } = req.body; // 'approved' | 'rejected'
    if (!status) return res.status(400).json({ error: 'Falta status' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (status === 'approved') {
            const appResult = await client.query(
                'SELECT applicant_id, group_id FROM group_applications WHERE id = $1', [applicationId]
            );
            if (appResult.rows.length) {
                const { applicant_id, group_id } = appResult.rows[0];
                await client.query(
                    `INSERT INTO group_members (group_id, manager_id, role, is_active) VALUES ($1, $2, 'member', true)`,
                    [group_id, applicant_id]
                );
            }
        }
        const result = await client.query(
            `UPDATE group_applications SET status = $1, responded_at = NOW() WHERE id = $2 RETURNING *`,
            [status, applicationId]
        );
        await client.query('COMMIT');
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /groups/:id/logo — update group logo (base64)
app.put('/groups/:id/logo', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { clubLogo, managerId } = req.body;
    if (!clubLogo || !managerId) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            `UPDATE groups SET club_logo = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING id`,
            [clubLogo, groupId, managerId]
        );
        if (!result.rows.length) return res.status(403).json({ error: 'Sin permiso o grupo no encontrado' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== END FORUMS/GROUPS =====================

// ===================== TRANSFER MARKET =====================

// GET /transfer-listings — active listings with player + team data
app.get('/transfer-listings', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                tl.id, tl.player_id, tl.asking_price, tl.seller_team_id,
                tl.is_active, tl.views, tl.bids, tl.hotlists, tl.deadline, tl.created_at,
                p.first_name, p.last_name, p.age, p.position, p.nationality,
                p.pace, p.finishing, p.passing, p.dribbling, p.defense,
                p.heading, p.stamina,
                t.name AS seller_team_name
            FROM transfer_listings tl
            JOIN players p ON p.player_id = tl.player_id
            LEFT JOIN teams t ON t.team_id = tl.seller_team_id
            WHERE tl.is_active = true
            ORDER BY tl.created_at DESC
        `);
        res.json({ success: true, listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /transfer-listings — create new listing
app.post('/transfer-listings', async (req, res) => {
    const { player_id, asking_price, seller_team_id } = req.body;
    if (!player_id || !asking_price) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO transfer_listings (player_id, asking_price, seller_team_id, is_active, views, bids, hotlists)
             VALUES ($1, $2, $3, true, 0, 0, 0) RETURNING *`,
            [player_id, asking_price, seller_team_id ?? null]
        );
        res.json({ success: true, listing: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /transfer-listings/:id — single listing
app.get('/transfer-listings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM transfer_listings WHERE id = $1',
            [id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Listing no encontrado' });
        res.json({ success: true, listing: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /transfer-listings/:id/buy — complete purchase (atomic transaction)
app.post('/transfer-listings/:id/buy', async (req, res) => {
    const listingId = parseInt(req.params.id);
    const { buyerTeamId } = req.body;
    if (!buyerTeamId) return res.status(400).json({ error: 'Falta buyerTeamId' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get listing
        const listingResult = await client.query(
            'SELECT * FROM transfer_listings WHERE id = $1 AND is_active = true',
            [listingId]
        );
        if (!listingResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Listing no encontrado o inactivo' });
        }
        const listing = listingResult.rows[0];
        const { player_id, asking_price, seller_team_id } = listing;

        // Deactivate all listings for this player
        await client.query(
            'UPDATE transfer_listings SET is_active = false WHERE player_id = $1',
            [player_id]
        );

        // Update player's team
        await client.query(
            "UPDATE players SET team_id = $1, owned_since = NOW() WHERE player_id = $2",
            [buyerTeamId, player_id]
        );

        // Deduct from buyer finances
        await client.query(
            `UPDATE team_finances
             SET cash_balance = cash_balance - $1, new_signings_expenses = new_signings_expenses + $1
             WHERE team_id = $2`,
            [asking_price, buyerTeamId]
        );

        // Add to seller finances (if not free agent)
        if (seller_team_id) {
            await client.query(
                `UPDATE team_finances
                 SET cash_balance = cash_balance + $1, player_sales_income = player_sales_income + $1
                 WHERE team_id = $2`,
                [asking_price, seller_team_id]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /transfer-listings/:id/bids — all bids for a listing (ordered by amount desc)
app.get('/transfer-listings/:id/bids', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT tb.id, tb.transfer_listing_id, tb.bidder_team_id,
                   tb.bid_amount, tb.status, tb.created_at,
                   t.name AS bidder_name
            FROM transfer_bids tb
            LEFT JOIN teams t ON t.team_id = tb.bidder_team_id
            WHERE tb.transfer_listing_id = $1
            ORDER BY tb.bid_amount DESC
        `, [id]);
        res.json({ success: true, bids: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /transfer-listings/:id/highest-bid
app.get('/transfer-listings/:id/highest-bid', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT id, bid_amount, bidder_team_id
            FROM transfer_bids
            WHERE transfer_listing_id = $1 AND status = 'pending'
            ORDER BY bid_amount DESC
            LIMIT 1
        `, [id]);
        if (!result.rows.length) {
            return res.json({ success: true, bid: null });
        }
        res.json({ success: true, bid: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /transfer-listings/:id/bids — place or update a bid
app.post('/transfer-listings/:id/bids', async (req, res) => {
    const listingId = parseInt(req.params.id);
    const { bidderTeamId, bidAmount } = req.body;
    if (!bidderTeamId || !bidAmount) return res.status(400).json({ error: 'Faltan datos' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check for existing pending bid
        const existingResult = await client.query(
            `SELECT id, bid_amount FROM transfer_bids
             WHERE transfer_listing_id = $1 AND bidder_team_id = $2 AND status = 'pending'`,
            [listingId, bidderTeamId]
        );

        if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];
            if (existing.bid_amount >= bidAmount) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'La nueva oferta debe ser mayor que la actual' });
            }
            // Update existing bid
            await client.query(
                `UPDATE transfer_bids SET bid_amount = $1, updated_at = NOW() WHERE id = $2`,
                [bidAmount, existing.id]
            );
        } else {
            // Create new bid
            await client.query(
                `INSERT INTO transfer_bids (transfer_listing_id, bidder_team_id, bid_amount, status)
                 VALUES ($1, $2, $3, 'pending')`,
                [listingId, bidderTeamId, bidAmount]
            );
        }

        // Update bid count on listing
        const countResult = await client.query(
            `SELECT COUNT(*) FROM transfer_bids WHERE transfer_listing_id = $1`,
            [listingId]
        );
        await client.query(
            `UPDATE transfer_listings SET bids = $1 WHERE id = $2`,
            [parseInt(countResult.rows[0].count), listingId]
        );

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /transfer-bids?teamId=X — enriched user bids
app.get('/transfer-bids', async (req, res) => {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'Falta teamId' });
    try {
        const result = await pool.query(`
            SELECT
                tb.id, tb.transfer_listing_id, tb.bidder_team_id,
                tb.bid_amount, tb.status, tb.created_at,
                bt.name AS bidder_name,
                p.player_id, p.first_name || ' ' || p.last_name AS player_name,
                tl.is_active, tl.deadline, tl.seller_team_id,
                st.name AS seller_team_name
            FROM transfer_bids tb
            LEFT JOIN teams bt ON bt.team_id = tb.bidder_team_id
            LEFT JOIN transfer_listings tl ON tl.id = tb.transfer_listing_id
            LEFT JOIN players p ON p.player_id = tl.player_id
            LEFT JOIN teams st ON st.team_id = tl.seller_team_id
            WHERE tb.bidder_team_id = $1
            ORDER BY tb.created_at DESC
        `, [teamId]);
        res.json({ success: true, bids: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== END TRANSFER MARKET =====================

// ===================== FORUMS =====================

// GET /forums?managerId=X&isAdmin=true
app.get('/forums', async (req, res) => {
    const { managerId, isAdmin } = req.query;
    const admin = isAdmin === 'true';
    try {
        const categoriesResult = await pool.query('SELECT * FROM forum_categories ORDER BY order_number');
        const allCategories = categoriesResult.rows;
        const filteredCategories = admin ? allCategories : allCategories.filter(c => c.id !== 4);
        let userGroupIds = [];
        if (managerId) {
            const groupsRes = await pool.query(
                `SELECT group_id FROM group_members WHERE manager_id = $1 AND is_active = true`,
                [managerId]
            );
            userGroupIds = groupsRes.rows.map(r => r.group_id);
        }
        let forumsResult;
        if (userGroupIds.length === 0) {
            const q = `SELECT f.* FROM forums f LEFT JOIN groups g ON g.forum_id = f.id WHERE g.id IS NULL ${admin ? '' : 'AND f.category_id != 4'}`;
            forumsResult = await pool.query(q);
        } else {
            const q = `SELECT f.* FROM forums f LEFT JOIN groups g ON g.forum_id = f.id WHERE (g.id IS NULL OR g.id = ANY($1::int[])) ${admin ? '' : 'AND f.category_id != 4'}`;
            forumsResult = await pool.query(q, [userGroupIds]);
        }
        const forums = await Promise.all(forumsResult.rows.map(async (forum) => {
            const tcRes = await pool.query(`SELECT COUNT(*) FROM forum_threads WHERE forum_id = $1`, [forum.id]);
            const threadCount = parseInt(tcRes.rows[0].count) || 0;
            if (threadCount === 0) return { ...forum, thread_count: 0, post_count: 0 };
            const pcRes = await pool.query(
                `SELECT COUNT(*) FROM forum_posts fp JOIN forum_threads ft ON ft.id = fp.thread_id WHERE ft.forum_id = $1`, [forum.id]
            );
            return { ...forum, thread_count: threadCount, post_count: parseInt(pcRes.rows[0].count) || 0 };
        }));
        res.json({ success: true, categories: filteredCategories, forums });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /forums/:id/threads?page=1&limit=10
app.get('/forums/:id/threads', async (req, res) => {
    const forumId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const threadsResult = await pool.query(
            `SELECT * FROM forum_threads WHERE forum_id = $1 ORDER BY is_sticky DESC, last_post_at DESC`,
            [forumId]
        );
        const allThreads = threadsResult.rows;
        const stickyThreads = allThreads.filter(t => t.is_sticky);
        const normalThreads = allThreads.filter(t => !t.is_sticky);
        const paginatedNormal = normalThreads.slice(offset, offset + limit);
        const toProcess = [...stickyThreads, ...paginatedNormal];
        const enriched = await Promise.all(toProcess.map(async (thread) => {
            const pcRes = await pool.query(`SELECT COUNT(*) FROM forum_posts WHERE thread_id = $1`, [thread.id]);
            let lastPostManagerUsername = null;
            if (thread.last_post_user_id) {
                const mRes = await pool.query(`SELECT username FROM managers WHERE user_id = $1`, [thread.last_post_user_id]);
                lastPostManagerUsername = mRes.rows[0]?.username || null;
            }
            return { ...thread, reply_count: parseInt(pcRes.rows[0].count) || 0, last_post_manager_username: lastPostManagerUsername };
        }));
        res.json({
            success: true,
            stickyThreads: enriched.filter(t => t.is_sticky),
            normalThreads: enriched.filter(t => !t.is_sticky),
            totalCount: normalThreads.length,
            totalPages: Math.ceil(normalThreads.length / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /forum-threads/:id?page=1&postsPerPage=10
app.get('/forum-threads/:id', async (req, res) => {
    const threadId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = parseInt(req.query.postsPerPage) || 10;
    const offset = (page - 1) * postsPerPage;
    try {
        const threadResult = await pool.query(`SELECT * FROM forum_threads WHERE id = $1`, [threadId]);
        if (!threadResult.rows.length) return res.status(404).json({ error: 'Thread no encontrado' });
        const thread = threadResult.rows[0];
        const countResult = await pool.query(`SELECT COUNT(*) FROM forum_posts WHERE thread_id = $1`, [threadId]);
        const totalPosts = parseInt(countResult.rows[0].count) || 0;
        const postsResult = await pool.query(
            `SELECT * FROM forum_posts WHERE thread_id = $1 ORDER BY created_at LIMIT $2 OFFSET $3`,
            [threadId, postsPerPage, offset]
        );
        const posts = postsResult.rows;
        if (!posts.length) {
            return res.json({ success: true, thread, posts: [], totalPosts, totalPages: Math.ceil(totalPosts / postsPerPage), currentPage: page });
        }
        const userIds = [...new Set(posts.map(p => p.user_id))];
        const managersResult = await pool.query(`SELECT user_id, username FROM managers WHERE user_id = ANY($1::int[])`, [userIds]);
        const usernameMap = {};
        managersResult.rows.forEach(m => { usernameMap[m.user_id] = m.username; });
        const enrichedPosts = posts.map(p => ({ ...p, author_username: usernameMap[p.user_id] || 'Unknown' }));
        res.json({ success: true, thread, posts: enrichedPosts, totalPosts, totalPages: Math.ceil(totalPosts / postsPerPage), currentPage: page });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /forums/threads
app.post('/forums/threads', async (req, res) => {
    const { title, content, forum_id, author_id } = req.body;
    if (!title || !content || !forum_id || !author_id) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const now = new Date().toISOString();
        const threadResult = await client.query(
            `INSERT INTO forum_threads (title, forum_id, user_id, last_post_at, last_post_user_id, view_count, is_locked, is_sticky, created_at) VALUES ($1, $2, $3, $4, $3, 0, false, false, $4) RETURNING *`,
            [title, forum_id, author_id, now]
        );
        const thread = threadResult.rows[0];
        await client.query(`INSERT INTO forum_posts (thread_id, content, user_id, created_at) VALUES ($1, $2, $3, $4)`, [thread.id, content, author_id, now]);
        await client.query('COMMIT');
        res.json({ success: true, thread });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /forum-posts
app.post('/forum-posts', async (req, res) => {
    const { thread_id, content, user_id } = req.body;
    if (!thread_id || !content || !user_id) return res.status(400).json({ error: 'Faltan datos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const now = new Date().toISOString();
        const result = await client.query(`INSERT INTO forum_posts (thread_id, content, user_id, created_at) VALUES ($1, $2, $3, $4) RETURNING *`, [thread_id, content, user_id, now]);
        await client.query(`UPDATE forum_threads SET last_post_at = $1, last_post_user_id = $2 WHERE id = $3`, [now, user_id, thread_id]);
        await client.query('COMMIT');
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /forum-posts/:id
app.put('/forum-posts/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Falta contenido' });
    try {
        const result = await pool.query(`UPDATE forum_posts SET content = $1, is_edited = true, edited_at = NOW() WHERE id = $2 RETURNING *`, [content, id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Post no encontrado' });
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /forum-posts/:id
app.delete('/forum-posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM forum_posts WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /forum-threads/:id/lock
app.put('/forum-threads/:id/lock', async (req, res) => {
    const { id } = req.params;
    const { is_locked } = req.body;
    try {
        const result = await pool.query(`UPDATE forum_threads SET is_locked = $1 WHERE id = $2 RETURNING *`, [is_locked, id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Thread no encontrado' });
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /forum-threads/:id/stick
app.put('/forum-threads/:id/stick', async (req, res) => {
    const { id } = req.params;
    const { is_sticky } = req.body;
    try {
        const result = await pool.query(`UPDATE forum_threads SET is_sticky = $1 WHERE id = $2 RETURNING *`, [is_sticky, id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Thread no encontrado' });
        res.json({ success: true, thread: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /forum-threads/:id/view
app.put('/forum-threads/:id/view', async (req, res) => {
    const { id } = req.params;
    const { view_count } = req.body;
    try {
        await pool.query(`UPDATE forum_threads SET view_count = $1 WHERE id = $2`, [view_count, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /forum-threads/:id/access?managerId=X
app.get('/forum-threads/:id/access', async (req, res) => {
    const { id } = req.params;
    const { managerId } = req.query;
    try {
        const threadResult = await pool.query(
            `SELECT f.category_id FROM forum_threads ft JOIN forums f ON f.id = ft.forum_id WHERE ft.id = $1`, [id]
        );
        if (!threadResult.rows.length) return res.status(404).json({ error: 'Thread no encontrado' });
        const { category_id } = threadResult.rows[0];
        if (category_id !== 4) return res.json({ success: true, hasAccess: true });
        if (!managerId) return res.json({ success: true, hasAccess: false });
        const mResult = await pool.query(`SELECT is_admin FROM managers WHERE user_id = $1`, [managerId]);
        res.json({ success: true, hasAccess: (mResult.rows[0]?.is_admin || 0) > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== END FORUMS =====================

// ===================== GROUPS =====================

// GET /groups
app.get('/groups', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT g.*, COUNT(gm.id) FILTER (WHERE gm.is_active = true) AS member_count
            FROM groups g LEFT JOIN group_members gm ON gm.group_id = g.id
            GROUP BY g.id ORDER BY g.created_at DESC
        `);
        res.json({ success: true, groups: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /groups
app.post('/groups', async (req, res) => {
    const { name, description, owner_id } = req.body;
    if (!name || !owner_id) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            `INSERT INTO groups (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, description || null, owner_id]
        );
        res.json({ success: true, group: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /groups/:id
app.delete('/groups/:id', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { managerId } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(`SELECT * FROM groups WHERE id = $1 AND owner_id = $2`, [groupId, managerId]);
        if (!groupResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'No tienes permiso para borrar este grupo' });
        }
        const forumId = groupResult.rows[0].forum_id;
        await client.query(`DELETE FROM group_applications WHERE group_id = $1`, [groupId]);
        await client.query(`DELETE FROM group_members WHERE group_id = $1`, [groupId]);
        await client.query(`DELETE FROM groups WHERE id = $1`, [groupId]);
        if (forumId) {
            const threadIds = await client.query(`SELECT id FROM forum_threads WHERE forum_id = $1`, [forumId]);
            if (threadIds.rows.length) {
                const ids = threadIds.rows.map(r => r.id);
                await client.query(`DELETE FROM forum_posts WHERE thread_id = ANY($1::int[])`, [ids]);
                await client.query(`DELETE FROM forum_threads WHERE forum_id = $1`, [forumId]);
            }
            await client.query(`DELETE FROM forums WHERE id = $1`, [forumId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /groups/:id/members
app.get('/groups/:id/members', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT gm.*, m.username AS manager_username
            FROM group_members gm JOIN managers m ON m.user_id = gm.manager_id
            WHERE gm.group_id = $1 AND gm.is_active = true
        `, [id]);
        const members = result.rows.map(r => ({ ...r, manager: { username: r.manager_username } }));
        res.json({ success: true, members });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /groups/:id/applications
app.get('/groups/:id/applications', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT ga.*, m.username AS applicant_username
            FROM group_applications ga JOIN managers m ON m.user_id = ga.applicant_id
            WHERE ga.group_id = $1 AND ga.status = 'pending'
        `, [id]);
        const applications = result.rows.map(r => ({ ...r, applicant: { username: r.applicant_username } }));
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /groups/:id/user-application?managerId=X
app.get('/groups/:id/user-application', async (req, res) => {
    const { id } = req.params;
    const { managerId } = req.query;
    if (!managerId) return res.json({ success: true, application: null });
    try {
        const result = await pool.query(
            `SELECT * FROM group_applications WHERE group_id = $1 AND applicant_id = $2 AND status = 'pending' LIMIT 1`,
            [id, managerId]
        );
        res.json({ success: true, application: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /groups/:id/apply
app.post('/groups/:id/apply', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const { managerId, message } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    try {
        const existing = await pool.query(
            `SELECT id FROM group_applications WHERE group_id = $1 AND applicant_id = $2 AND status = 'pending'`,
            [groupId, managerId]
        );
        if (existing.rows.length) return res.status(400).json({ error: 'Ya tienes una solicitud pendiente' });
        const result = await pool.query(
            `INSERT INTO group_applications (group_id, applicant_id, message, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [groupId, managerId, message || null]
        );
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /group-applications/:id/respond
app.put('/group-applications/:id/respond', async (req, res) => {
    const appId = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Falta status' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const appResult = await client.query(`SELECT * FROM group_applications WHERE id = $1`, [appId]);
        if (!appResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        const application = appResult.rows[0];
        if (status === 'approved') {
            await client.query(
                `INSERT INTO group_members (group_id, manager_id, role, is_active) VALUES ($1, $2, 'member', true) ON CONFLICT DO NOTHING`,
                [application.group_id, application.applicant_id]
            );
        }
        const result = await client.query(
            `UPDATE group_applications SET status = $1, responded_at = NOW() WHERE id = $2 RETURNING *`,
            [status, appId]
        );
        await client.query('COMMIT');
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /groups/:id/logo
app.put('/groups/:id/logo', async (req, res) => {
    const { id } = req.params;
    const { club_logo, managerId } = req.body;
    if (!club_logo) return res.status(400).json({ error: 'Falta club_logo' });
    try {
        const result = await pool.query(
            `UPDATE groups SET club_logo = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING id`,
            [club_logo, id, managerId]
        );
        if (!result.rows.length) return res.status(403).json({ error: 'No autorizado' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /managers/:id/info
app.get('/managers/:id/info', async (req, res) => {
    const { id } = req.params;
    try {
        const mResult = await pool.query(
            `SELECT m.username, m.is_admin, m.is_premium, m.premium_expires_at, r.name AS country_name
             FROM managers m
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             WHERE m.user_id = $1`,
            [id]
        );
        if (!mResult.rows.length) return res.status(404).json({ error: 'Manager no encontrado' });
        const manager = mResult.rows[0];
        const tResult = await pool.query(`SELECT name, team_id FROM teams WHERE manager_id = $1`, [id]);
        const team = tResult.rows[0] || null;
        res.json({
            success: true,
            manager_name: manager.username,
            team_name: team?.name || null,
            team_id: team?.team_id || null,
            is_admin: manager.is_admin || 0,
            is_premium: manager.is_premium || 0,
            premium_expires_at: manager.premium_expires_at || null,
            country_name: manager.country_name || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== END GROUPS =====================


// GET /teams - list all teams
app.get('/teams', async (req, res) => {
    try {
        const result = await pool.query('SELECT team_id, name FROM teams ORDER BY name');
        res.json({ success: true, teams: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === ADMIN NEWS ===
app.get('/admin/news', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT cn.*, m.username AS author_username FROM community_news cn LEFT JOIN managers m ON m.user_id = cn.author_id ORDER BY cn.created_at DESC'
        );
        const articles = result.rows.map(r => ({ ...r, author: { username: r.author_username } }));
        res.json({ success: true, articles });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/news', async (req, res) => {
    const { title, content, author_id, is_published } = req.body;
    if (!title || !content || !author_id) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'INSERT INTO community_news (title, content, author_id, is_published) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, author_id, is_published !== undefined ? is_published : true]
        );
        res.json({ success: true, article: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/news/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const result = await pool.query(
            'UPDATE community_news SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, article: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/admin/news/:id/publish', async (req, res) => {
    const { id } = req.params;
    const { is_published } = req.body;
    try {
        const result = await pool.query(
            'UPDATE community_news SET is_published = $1 WHERE id = $2 RETURNING *',
            [is_published, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, article: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/admin/news/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM community_news WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// === ADMIN PLAYERS ===
app.get('/admin/players', async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    try {
        const result = await pool.query(
            'SELECT p.*, t.name AS team_name FROM players p LEFT JOIN teams t ON t.team_id = p.team_id ORDER BY p.player_id LIMIT $1',
            [limit]
        );
        const players = result.rows.map(r => ({ ...r, teams: r.team_name ? { name: r.team_name } : null }));
        res.json({ success: true, players });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/players', async (req, res) => {
    const p = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO players (
                first_name,last_name,position,age,nationality_id,team_id,
                value,wage,rating,pace,finishing,passing,defense,dribbling,heading,stamina,goalkeeper,crosses,
                fitness,form,personality,experience,leadership,loyalty,image_url,
                contract_until,goals,assists,matches_played,minutes_played,owned_since
            ) VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
                $19,$20,$21,$22,$23,$24,$25,
                $26,$27,$28,$29,$30,$31
            ) RETURNING *`,
            [
                p.first_name, p.last_name, p.position || 'MID', p.age || 20, p.nationality_id || 1, p.team_id || null,
                p.value || 100000, p.wage || 5000, p.rating || 65, p.pace || 10, p.finishing || 10, p.passing || 10,
                p.defense || 10, p.dribbling || 10, p.heading || 10, p.stamina || 10,
                p.position === 'GK' ? (p.goalkeeper || 60) : (p.goalkeeper || 10),
                p.crosses || 30,
                p.fitness || 100, p.form || 'Average', p.personality || 5, p.experience || 5, p.leadership || 5, p.loyalty || 5, p.image_url || null,
                p.contract_until || '2027', 0, 0, 0, 0, new Date().toISOString().split('T')[0]
            ]
        );
        res.json({ success: true, player: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/players/batch', async (req, res) => {
    const { players } = req.body;
    if (!players || !Array.isArray(players)) return res.status(400).json({ error: 'Falta players array' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const inserted = [];
        for (const p of players) {
            const r = await client.query(
                'INSERT INTO players (first_name,last_name,position,age,nationality_id,value,team_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
                [p.first_name, p.last_name, p.position, p.age, p.nationality_id, p.value, p.team_id || null]
            );
            inserted.push(r.rows[0]);
        }
        await client.query('COMMIT');
        res.json({ success: true, players: inserted });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

app.put('/admin/players/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const allowed = ['first_name', 'last_name', 'position', 'age', 'nationality_id', 'team_id', 'value', 'wage', 'rating', 'pace', 'finishing', 'passing', 'defense', 'dribbling', 'heading', 'stamina', 'goalkeeper', 'crosses', 'fitness', 'form', 'personality', 'experience', 'leadership', 'loyalty', 'image_url'];
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!updates.length) return res.status(400).json({ error: 'Sin campos validos' });
    const setClauses = updates.map(([k], i) => k + ' = $' + (i + 1)).join(', ');
    const values = [...updates.map(([, v]) => v), id];
    try {
        const result = await pool.query(
            'UPDATE players SET ' + setClauses + ' WHERE player_id = $' + values.length + ' RETURNING *',
            values
        );
        if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
        res.json({ success: true, player: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});



// ===================== CARNET DE MANAGER =====================

// GET /manager-license?managerId=X — active tests, user progress, routing ids
app.get('/manager-license', async (req, res) => {
    const { managerId } = req.query;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    try {
        const tests = await pool.query('SELECT * FROM manager_license_tests WHERE is_active = TRUE ORDER BY sort_order');
        const progress = await pool.query('SELECT test_key FROM manager_license_progress WHERE manager_id = $1', [managerId]);
        const teamRow = await pool.query(
            'SELECT t.team_id, s.stadium_id FROM teams t LEFT JOIN stadiums s ON s.team_id = t.team_id WHERE t.manager_id = $1',
            [managerId]
        );
        const completedKeys = progress.rows.map(r => r.test_key);
        const { team_id, stadium_id } = teamRow.rows[0] || {};
        res.json({ success: true, tests: tests.rows, completedKeys, teamId: team_id, stadiumId: stadium_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Recompensas hardcodeadas — independiente del estado de la tabla manager_license_tests
// visit_premium = null → activa 30 días Premium en lugar de dar dinero
const CARNET_REWARDS = {
    visit_premium: null,   // 30 días Premium
    visit_team: 25000,
    visit_players: 25000,
    visit_transfer_market: 25000,
    visit_matches: 25000,
    visit_finances: 25000,
    visit_stadium: 25000,
    visit_training: 25000,
    visit_forums: 25000,
    visit_community: 25000,
};
const TOTAL_CARNET_TESTS = Object.keys(CARNET_REWARDS).length; // 10

// POST /manager-license/complete/:testKey — mark test done + award reward (idempotent)
app.post('/manager-license/complete/:testKey', async (req, res) => {
    const { testKey } = req.params;
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    if (!(testKey in CARNET_REWARDS)) return res.status(404).json({ error: 'Prueba no encontrada' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const exists = await client.query(
            'SELECT id FROM manager_license_progress WHERE manager_id = $1 AND test_key = $2',
            [managerId, testKey]
        );
        if (exists.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.json({ success: true, alreadyCompleted: true });
        }
        await client.query(
            'INSERT INTO manager_license_progress (manager_id, test_key) VALUES ($1, $2)',
            [managerId, testKey]
        );
        if (CARNET_REWARDS[testKey] === null) {
            // Primera prueba: activar Premium 30 días
            await client.query(
                `UPDATE managers SET is_premium = 1, premium_expires_at = NOW() + INTERVAL '30 days' WHERE user_id = $1`,
                [managerId]
            );
            await client.query('COMMIT');
            return res.json({ success: true, premiumActivated: true, alreadyCompleted: false });
        }
        // Resto de pruebas: recompensa en efectivo
        const reward = CARNET_REWARDS[testKey];
        const team = await client.query('SELECT team_id FROM teams WHERE manager_id = $1', [managerId]);
        if (team.rows.length > 0) {
            await client.query(
                'UPDATE team_finances SET cash_balance = cash_balance + $1 WHERE team_id = $2',
                [reward, team.rows[0].team_id]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true, reward, alreadyCompleted: false });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /manager-license/claim — claim carnet after all tests done → status='active' + asigna BOT team
app.post('/manager-license/claim', async (req, res) => {
    const { managerId } = req.body;
    if (!managerId) return res.status(400).json({ error: 'Falta managerId' });
    const client = await pool.connect();
    try {
        const completed = await client.query('SELECT COUNT(*) FROM manager_license_progress WHERE manager_id = $1', [managerId]);
        if (parseInt(completed.rows[0].count) < TOTAL_CARNET_TESTS) {
            client.release();
            return res.status(400).json({ error: 'No has completado todas las pruebas' });
        }

        await client.query('BEGIN');
        await client.query('UPDATE managers SET status = $1 WHERE user_id = $2', ['active', managerId]);
        // Garantizar que el manager tiene todo: liga, jugadores, estadio, finanzas
        await fullyActivateManager(client, managerId);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Liga stats por region
app.get('/leagues/:regionId', async (req, res) => {
    const regionId = parseInt(req.params.regionId, 10);
    if (!regionId) return res.status(400).json({ error: 'regionId inválido' });
    try {
        const regionResult = await pool.query(
            'SELECT region_id, name FROM leagues_regions WHERE region_id = $1',
            [regionId]
        );
        if (!regionResult.rows[0]) return res.status(404).json({ error: 'Liga no encontrada' });

        const teamsResult = await pool.query(
            'SELECT COUNT(DISTINCT team_id)::int AS total FROM teams WHERE country_id = $1',
            [regionId]
        );
        const managersResult = await pool.query(
            'SELECT COUNT(DISTINCT manager_id)::int AS total FROM teams WHERE country_id = $1 AND manager_id IS NOT NULL AND series_id IS NOT NULL',
            [regionId]
        );

        let seriesList = [];
        try {
            const seriesResult = await pool.query(
                `SELECT s.series_id, s.division, s.group_number,
                        (SELECT COUNT(*)::int FROM teams t2 WHERE t2.series_id = s.series_id) AS team_count
                 FROM series s
                 WHERE s.region_id = $1
                 ORDER BY s.division ASC, s.group_number ASC`,
                [regionId]
            );
            seriesList = seriesResult.rows;
        } catch (seriesErr) {
            console.warn('series table not available:', seriesErr.message);
        }

        res.json({
            success: true,
            stats: {
                regionId: regionResult.rows[0].region_id,
                regionName: regionResult.rows[0].name,
                totalTeams: teamsResult.rows[0]?.total || 0,
                totalManagers: managersResult.rows[0]?.total || 0,
                totalSeries: seriesList.length,
                seriesList
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serie (standings) por serie_id
app.get('/series/:id', async (req, res) => {
    const seriesId = parseInt(req.params.id, 10);
    if (!seriesId) return res.status(400).json({ error: 'seriesId inválido' });
    try {
        const seriesResult = await pool.query(
            `SELECT s.series_id, s.division, s.group_number, s.region_id, s.season,
                    r.name AS region_name
             FROM series s
             LEFT JOIN leagues_regions r ON r.region_id = s.region_id
             WHERE s.series_id = $1`,
            [seriesId]
        );
        if (!seriesResult.rows[0]) return res.status(404).json({ error: 'Serie no encontrada' });
        const seriesInfo = seriesResult.rows[0];

        // Cargar todos los equipos asignados a esta serie (con o sin partidos)
        const allTeamsResult = await pool.query(
            `SELECT t.team_id, t.name AS team_name, t.club_logo AS team_logo, t.is_bot
             FROM teams t
             WHERE t.series_id = $1
             ORDER BY t.is_bot ASC, t.team_id ASC`,
            [seriesId]
        );
        const teamsMap = {};
        for (const t of allTeamsResult.rows) {
            teamsMap[t.team_id] = { team_id: t.team_id, team_name: t.team_name, team_logo: t.team_logo, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_bot: t.is_bot, form: [] };
        }

        // Sobreescribir stats con partidos completados
        const matchesResult = await pool.query(
            `SELECT m.home_team_id, m.away_team_id, m.home_score, m.away_score,
                    ht.name AS home_team_name, at.name AS away_team_name,
                    ht.club_logo AS home_team_logo, at.club_logo AS away_team_logo,
                    ht.is_bot AS home_is_bot, at.is_bot AS away_is_bot
             FROM matches m
             JOIN teams ht ON ht.team_id = m.home_team_id
             JOIN teams at ON at.team_id = m.away_team_id
             WHERE m.series_id = $1 AND m.status = 'completed'`,
            [seriesId]
        );
        for (const m of matchesResult.rows) {
            // Añadir equipos de partidos que no están en series_id (compatibilidad)
            if (!teamsMap[m.home_team_id]) {
                teamsMap[m.home_team_id] = { team_id: m.home_team_id, team_name: m.home_team_name, team_logo: m.home_team_logo, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_bot: m.home_is_bot, form: [] };
            }
            if (!teamsMap[m.away_team_id]) {
                teamsMap[m.away_team_id] = { team_id: m.away_team_id, team_name: m.away_team_name, team_logo: m.away_team_logo, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_bot: m.away_is_bot, form: [] };
            }
            const home = teamsMap[m.home_team_id];
            const away = teamsMap[m.away_team_id];
            home.played++; away.played++;
            home.goals_for += m.home_score || 0; home.goals_against += m.away_score || 0;
            away.goals_for += m.away_score || 0; away.goals_against += m.home_score || 0;
            if (m.home_score > m.away_score) {
                home.won++; home.points += 3; home.form.push('W');
                away.lost++; away.form.push('L');
            } else if (m.home_score === m.away_score) {
                home.drawn++; home.points += 1; home.form.push('D');
                away.drawn++; away.points += 1; away.form.push('D');
            } else {
                away.won++; away.points += 3; away.form.push('W');
                home.lost++; home.form.push('L');
            }
        }

        const teams = Object.values(teamsMap).map(t => ({
            ...t,
            goal_difference: t.goals_for - t.goals_against,
            form: t.form.slice(-5)
        })).sort((a, b) => b.points - a.points || (b.goal_difference - a.goal_difference) || (b.goals_for - a.goals_for));

        res.json({
            success: true,
            league: {
                series_id: seriesInfo.series_id,
                league_id: seriesInfo.series_id,
                league_name: `Division ${seriesInfo.division} Group ${seriesInfo.group_number}`,
                division: seriesInfo.division,
                group_number: seriesInfo.group_number,
                region_id: seriesInfo.region_id,
                region_name: seriesInfo.region_name,
                season: seriesInfo.season || 1,
                teams
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Estadísticas de la temporada activa de una serie
app.get('/series/:id/stats', async (req, res) => {
    const seriesId = parseInt(req.params.id, 10);
    if (!seriesId) return res.status(400).json({ error: 'seriesId inválido' });
    try {
        // Top goleadores (jugadores de equipos en esta serie)
        const scorersResult = await pool.query(
            `SELECT p.player_id, p.first_name, p.last_name, p.position, p.goals,
                    t.team_id, t.name AS team_name, t.club_logo AS team_logo
             FROM players p
             JOIN teams t ON t.team_id = p.team_id
             WHERE t.series_id = $1 AND p.goals > 0
             ORDER BY p.goals DESC, p.assists DESC
             LIMIT 10`,
            [seriesId]
        );

        // Top asistidores
        const assistsResult = await pool.query(
            `SELECT p.player_id, p.first_name, p.last_name, p.position, p.assists,
                    t.team_id, t.name AS team_name, t.club_logo AS team_logo
             FROM players p
             JOIN teams t ON t.team_id = p.team_id
             WHERE t.series_id = $1 AND p.assists > 0
             ORDER BY p.assists DESC, p.goals DESC
             LIMIT 10`,
            [seriesId]
        );

        // Equipos con menos goles encajados (a partir de partidos completados)
        const concededResult = await pool.query(
            `SELECT t.team_id, t.name AS team_name, t.club_logo AS team_logo,
                    COALESCE(SUM(CASE WHEN m.home_team_id = t.team_id THEN m.away_score
                                     WHEN m.away_team_id = t.team_id THEN m.home_score
                                     ELSE 0 END), 0)::int AS goals_against,
                    COUNT(m.match_id_int)::int AS played
             FROM teams t
             LEFT JOIN matches m ON (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
               AND m.series_id = $1 AND m.status = 'completed'
             WHERE t.series_id = $1
             GROUP BY t.team_id, t.name, t.club_logo
             ORDER BY goals_against ASC, played DESC
             LIMIT 8`,
            [seriesId]
        );

        // Partidos jugados (completados), más recientes primero
        const playedResult = await pool.query(
            `SELECT m.match_id_int AS match_id, m.home_team_id, m.away_team_id,
                    ht.name AS home_team_name, at.name AS away_team_name,
                    ht.club_logo AS home_team_logo, at.club_logo AS away_team_logo,
                    m.home_score, m.away_score, m.match_date
             FROM matches m
             JOIN teams ht ON ht.team_id = m.home_team_id
             JOIN teams at ON at.team_id = m.away_team_id
             WHERE m.series_id = $1 AND m.status = 'completed'
             ORDER BY m.match_date DESC, m.match_id_int DESC
             LIMIT 20`,
            [seriesId]
        );

        // Próximos partidos (pendientes), más cercanos primero
        const upcomingResult = await pool.query(
            `SELECT m.match_id_int AS match_id, m.home_team_id, m.away_team_id,
                    ht.name AS home_team_name, at.name AS away_team_name,
                    ht.club_logo AS home_team_logo, at.club_logo AS away_team_logo,
                    m.match_date
             FROM matches m
             JOIN teams ht ON ht.team_id = m.home_team_id
             JOIN teams at ON at.team_id = m.away_team_id
             WHERE m.series_id = $1 AND m.status != 'completed'
             ORDER BY m.match_date ASC, m.match_id_int ASC
             LIMIT 20`,
            [seriesId]
        );

        res.json({
            success: true,
            topScorers: scorersResult.rows,
            topAssists: assistsResult.rows,
            fewestConceded: concededResult.rows,
            playedMatches: playedResult.rows,
            upcomingMatches: upcomingResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Temporadas disponibles para una serie (misma div/grupo/región)
app.get('/series/:id/seasons', async (req, res) => {
    const seriesId = parseInt(req.params.id, 10);
    if (!seriesId) return res.status(400).json({ error: 'seriesId inválido' });
    try {
        const base = await pool.query(
            'SELECT division, group_number, region_id FROM series WHERE series_id = $1',
            [seriesId]
        );
        if (!base.rows[0]) return res.status(404).json({ error: 'Serie no encontrada' });
        const { division, group_number, region_id } = base.rows[0];
        const result = await pool.query(
            `SELECT series_id, season FROM series
             WHERE region_id = $1 AND division = $2 AND group_number = $3
             ORDER BY season ASC`,
            [region_id, division, group_number]
        );
        res.json({ success: true, seasons: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jerarquía de series (superior / inferior)
app.get('/series/:id/hierarchy', async (req, res) => {
    const seriesId = parseInt(req.params.id, 10);
    if (!seriesId) return res.status(400).json({ error: 'seriesId inválido' });
    try {
        const currentResult = await pool.query(
            `SELECT series_id, division, group_number, region_id, season,
                    COALESCE(parent_series_id, NULL) AS parent_series_id
             FROM series WHERE series_id = $1`,
            [seriesId]
        );
        if (!currentResult.rows[0]) return res.status(404).json({ error: 'Serie no encontrada' });
        const current = currentResult.rows[0];

        // Navegación secuencial: II.1 → II.2 → III.1 → III.2 → ...
        // "Arriba" (previous): grupo anterior en misma división; si no existe, último grupo de división-1
        let higherSeries = null;
        if (current.group_number > 1) {
            const r = await pool.query(
                'SELECT series_id, division, group_number, region_id, season, parent_series_id FROM series WHERE region_id = $1 AND division = $2 AND group_number = $3',
                [current.region_id, current.division, current.group_number - 1]
            );
            higherSeries = r.rows[0] || null;
        }
        if (!higherSeries && current.division > 1) {
            // Saltar a la división superior: ir al último grupo de esa división
            const r = await pool.query(
                'SELECT series_id, division, group_number, region_id, season, parent_series_id FROM series WHERE region_id = $1 AND division = $2 ORDER BY group_number DESC LIMIT 1',
                [current.region_id, current.division - 1]
            );
            higherSeries = r.rows[0] || null;
        }

        // "Abajo" (next): grupo siguiente en misma división; si no existe, primer grupo de división+1
        let lowerSeries = null;
        const nextGroupResult = await pool.query(
            'SELECT series_id, division, group_number, region_id, season, parent_series_id FROM series WHERE region_id = $1 AND division = $2 AND group_number = $3',
            [current.region_id, current.division, current.group_number + 1]
        );
        if (nextGroupResult.rows[0]) {
            lowerSeries = nextGroupResult.rows[0];
        } else {
            const r = await pool.query(
                'SELECT series_id, division, group_number, region_id, season, parent_series_id FROM series WHERE region_id = $1 AND division = $2 ORDER BY group_number ASC LIMIT 1',
                [current.region_id, current.division + 1]
            );
            lowerSeries = r.rows[0] || null;
        }

        res.json({
            success: true,
            currentSeries: { ...current, division_level: current.division },
            higherSeries: higherSeries ? { ...higherSeries, division_level: higherSeries.division } : null,
            lowerSeries: lowerSeries ? { ...lowerSeries, division_level: lowerSeries.division } : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Backend TeamSoccer funcionando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

// Reparación automática cada 5 minutos: managers activos sin liga asignada
async function autoRepairLeagues() {
    try {
        const unassigned = await pool.query(`
            SELECT m.user_id FROM managers m
            JOIN teams t ON t.manager_id = m.user_id
            WHERE m.status = 'active' AND t.series_id IS NULL
        `);
        if (unassigned.rows.length === 0) return;
        console.log(`🔧 Auto-reparación: ${unassigned.rows.length} manager(s) sin liga detectados`);
        for (const row of unassigned.rows) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await fullyActivateManager(client, row.user_id);
                await client.query('COMMIT');
                console.log(`✅ Liga auto-reparada para manager ${row.user_id}`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Error auto-reparando manager ${row.user_id}:`, err.message);
            } finally {
                client.release();
            }
        }
    } catch (err) {
        console.error('❌ Error en autoRepairLeagues:', err.message);
    }
}
setInterval(autoRepairLeagues, 5 * 60 * 1000);

// Inicialización de fondo: configura equipos BOT existentes sin jugadores en lotes de 30
async function initBotsInBackground() {
    try {
        const bots = await pool.query(`
            SELECT t.team_id, t.name, t.country_id
            FROM teams t
            WHERE t.is_bot = 1
            AND (SELECT COUNT(*) FROM players p WHERE p.team_id = t.team_id) < 18
            LIMIT 30
        `);
        if (bots.rows.length === 0) {
            console.log('✅ Todos los equipos BOT están configurados con jugadores');
            return;
        }
        for (const bot of bots.rows) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await setupBotTeam(client, bot.team_id, bot.name, bot.country_id);
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Error iniciando BOT ${bot.team_id}:`, err.message);
            } finally {
                client.release();
            }
        }
        console.log(`🤖 ${bots.rows.length} BOTs configurados, procesando siguiente lote...`);
        setTimeout(initBotsInBackground, 5000);
    } catch (err) {
        console.error('❌ Error en initBotsInBackground:', err.message);
        setTimeout(initBotsInBackground, 60000);
    }
}
setTimeout(initBotsInBackground, 15000);



