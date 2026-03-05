import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';

// Forzar redeploy Railway - 2026-03-05

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

console.log('Intentando conectar a Postgres en:', process.env.PGHOST, process.env.PGPORT, process.env.PGDATABASE);

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

pool.connect()
    .then(() => console.log('✅ Conexión a Postgres exitosa'))
    .catch((err) => console.error('❌ Error conectando a Postgres:', err));


const ADMIN_USERNAME = 'PIPO68';

const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createInitialPlayers = async (client, teamId, countryId) => {
    const positions = ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'RW', 'CAM', 'CDM', 'LW', 'ST', 'ST', 'CF', 'CB', 'RB'];
    const firstNames = ['Alex', 'Brian', 'Carlos', 'David', 'Eric', 'Frank', 'George', 'Henry', 'Ivan', 'Jack', 'Kevin', 'Luis', 'Mario', 'Nico', 'Oscar', 'Paul', 'Quinn', 'Rafa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Martin'];

    const numericCountryId = countryId !== null && countryId !== undefined ? Number(countryId) : null;
    for (let i = 0; i < positions.length; i += 1) {
        await client.query(
            `INSERT INTO players (
                first_name, last_name, position, age, nationality_id, team_id,
                value, wage, fitness, form, contract_until,
                finishing, pace, passing, defense, dribbling, heading, stamina,
                goals, assists, matches_played, minutes_played, rating,
                personality, experience, leadership, loyalty, owned_since
            ) VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,$8,$9,$10,$11,
                $12,$13,$14,$15,$16,$17,$18,
                $19,$20,$21,$22,$23,
                $24,$25,$26,$27,$28
            )`,
            [
                firstNames[i],
                lastNames[i],
                positions[i],
                randBetween(18, 28),
                numericCountryId,
                teamId,
                randBetween(800000, 4500000),
                randBetween(1500, 12000),
                randBetween(75, 100),
                'Good',
                '2027',
                randBetween(40, 85),
                randBetween(40, 85),
                randBetween(40, 85),
                randBetween(40, 85),
                randBetween(40, 85),
                randBetween(40, 85),
                randBetween(40, 85),
                0,
                0,
                0,
                0,
                randBetween(58, 82),
                randBetween(40, 80),
                randBetween(40, 80),
                randBetween(40, 80),
                randBetween(40, 80),
                new Date()
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
        const adminEmails = ['PIPO68', 'pipo68@example.com', 'pipocanarias@hotmail.com'];
        const isAdmin = adminEmails.includes(username) || adminEmails.includes(email);
        const managerStatus = isAdmin ? 'active' : 'waiting_list';
        const isAdminLevel = isAdmin ? 10 : 0;

        const managerResult = await client.query(
            `INSERT INTO managers (
                user_id, username, email, country_id, is_admin, status
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
            [userId, username, email, countryId, isAdminLevel, managerStatus]
        );
        const managerId = managerResult.rows[0].user_id;

        // 3. Crear equipo
        const teamResult = await client.query(
            'INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id',
            [teamName, managerId, countryId]
        );
        const teamId = teamResult.rows[0].team_id;

        await client.query('INSERT INTO team_finances (team_id) VALUES ($1)', [teamId]);
        await client.query('INSERT INTO stadiums (name, team_id) VALUES ($1, $2)', [`${teamName} Stadium`, teamId]);
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
            'SELECT * FROM managers WHERE user_id = $1',
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

// Obtener manager por id
app.get('/managers/:id', async (req, res) => {
    const managerId = parseInt(req.params.id, 10);
    if (!managerId) {
        return res.status(400).json({ error: 'managerId invalido' });
    }

    try {
        const managerResult = await pool.query(
            'SELECT user_id, username, email, country_id, is_admin, status, is_premium, premium_expires_at FROM managers WHERE user_id = $1',
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
    try {
        const result = await pool.query(
            'SELECT * FROM team_finances WHERE team_id = $1',
            [teamId]
        );
        const finances = result.rows[0] || null;
        res.json({ success: true, finances });
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
        const onlineResult = await pool.query(
            "SELECT COUNT(*)::int AS total FROM managers WHERE is_online = true"
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
                onlineManagers: onlineResult.rows[0]?.total || 0,
                totalTeams: teamsResult.rows[0]?.total || 0,
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

    try {
        const result = await pool.query(
            `UPDATE managers SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING user_id`,
            values
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Manager no encontrado' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
                m.username AS manager_username,
                r.name AS country_name
             FROM teams t
             LEFT JOIN managers m ON m.user_id = t.manager_id
             LEFT JOIN leagues_regions r ON r.region_id = t.country_id
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

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(teamId);

    try {
        const result = await pool.query(
            `UPDATE teams SET ${updates.join(', ')} WHERE team_id = $${values.length} RETURNING team_id`,
            values
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
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
                m.country_id,
                m.is_admin,
                m.is_premium,
                m.created_at,
                r.name AS country_name,
                t.name AS team_name
             FROM managers m
             LEFT JOIN leagues_regions r ON r.region_id = m.country_id
             LEFT JOIN teams t ON t.manager_id = m.user_id
             WHERE m.status = 'waiting_list'
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

    try {
        const adminResult = await pool.query(
            'SELECT is_admin FROM managers WHERE username = $1',
            [adminUsername]
        );

        if (adminResult.rows.length === 0 || adminResult.rows[0].is_admin < 4) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const updateResult = await pool.query(
            'UPDATE managers SET status = $1 WHERE user_id = $2 RETURNING user_id, status',
            ['active', managerId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Manager no encontrado' });
        }

        res.json({ success: true, manager: updateResult.rows[0] });
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


