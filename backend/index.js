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
    const managerId = parseInt(req.query.managerId as string, 10);
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
    const managerId = parseInt(req.query.managerId as string, 10);
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
    const managerId = parseInt(req.query.managerId as string, 10);
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
    const limit = parseInt(req.query.limit as string || '50', 10);
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


