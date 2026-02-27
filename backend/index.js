
import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';

dotenv.config();



const app = express();
// Permitir CORS desde cualquier origen en desarrollo
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
                countryId || null,
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
        const managerResult = await client.query(
            `INSERT INTO managers (
                user_id, username, email, country_id, is_admin, status
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
            [userId, username, email, country, 0, 'waiting_list']
        );
        const managerId = managerResult.rows[0].user_id;

        // 3. Crear equipo
        const teamResult = await client.query(
            'INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id',
            [teamName, managerId, country]
        );
        const teamId = teamResult.rows[0].team_id;

        await client.query('INSERT INTO team_finances (team_id) VALUES ($1)', [teamId]);
        await client.query('INSERT INTO stadiums (name, team_id) VALUES ($1, $2)', [`${teamName} Stadium`, teamId]);
        await createInitialPlayers(client, teamId, country);

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
        res.json({ success: true, user, manager });
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
