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
        pool.query('UPDATE forum_threads SET view_count = COALESCE(view_count,0)+1 WHERE id=$1', [threadId]).catch(()=>{});
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
            `SELECT tl.id, tl.player_id, tl.team_id, tl.asking_price, tl.is_active, tl.created_at,
                    p.first_name, p.last_name, p.position, p.age,
                    p.finishing, p.pace, p.passing, p.defense, p.dribbling, p.heading, p.stamina,
                    p.value, p.wage, p.fitness, p.rating,
                    t.name AS team_name, t.club_logo AS team_logo,
                    r.name AS nationality
             FROM transfer_listings tl
             JOIN players p ON p.player_id = tl.player_id
             LEFT JOIN teams t ON t.team_id = tl.team_id
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
             LEFT JOIN teams t2 ON t2.team_id = tl.team_id
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

// ===================== FORUMS =====================

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
            [player_id, asking_price, seller_team_id || null]
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
        const mResult = await pool.query(`SELECT username, is_admin, is_premium, premium_expires_at FROM managers WHERE user_id = $1`, [id]);
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
            premium_expires_at: manager.premium_expires_at || null
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
            'INSERT INTO players (first_name,last_name,position,age,nationality_id,team_id,value,wage,rating,pace,finishing,passing,defense,dribbling,heading,stamina,fitness,form,personality,experience,leadership,loyalty,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *',
            [p.first_name,p.last_name,p.position||'MID',p.age||20,p.nationality_id||1,p.team_id||null,p.value||100000,p.wage||5000,p.rating||65,p.pace||10,p.finishing||10,p.passing||10,p.defense||10,p.dribbling||10,p.heading||10,p.stamina||10,p.fitness||100,p.form||'Average',p.personality||5,p.experience||5,p.leadership||5,p.loyalty||5,p.image_url||null]
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
                'INSERT INTO players (first_name,last_name,position,age,nationality,value,team_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
                [p.first_name,p.last_name,p.position,p.age,p.nationality,p.value,p.team_id||null]
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
    const allowed = ['first_name','last_name','position','age','nationality_id','team_id','value','wage','rating','pace','finishing','passing','defense','dribbling','heading','stamina','fitness','form','personality','experience','leadership','loyalty','image_url'];
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


app.get('/', (req, res) => {
    res.send('Backend TeamSoccer funcionando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});


