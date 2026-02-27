import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'PIPO68';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pipocanarias@hotmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_COUNTRY_ID = parseInt(process.env.ADMIN_COUNTRY_ID || '2', 10);
const ADMIN_TEAM_NAME = process.env.ADMIN_TEAM_NAME || 'Admin FC';

const run = async () => {
    if (!ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD is required');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existingManager = await client.query(
            'SELECT user_id FROM managers WHERE username = $1 OR email = $2',
            [ADMIN_USERNAME, ADMIN_EMAIL]
        );

        if (existingManager.rowCount > 0) {
            await client.query(
                'UPDATE managers SET is_admin = 10, status = $1 WHERE user_id = $2',
                ['active', existingManager.rows[0].user_id]
            );
            const adminId = existingManager.rows[0].user_id;
            const existingTeam = await client.query(
                'SELECT team_id FROM teams WHERE manager_id = $1',
                [adminId]
            );
            if (existingTeam.rowCount === 0) {
                const teamResult = await client.query(
                    'INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id',
                    [ADMIN_TEAM_NAME, adminId, ADMIN_COUNTRY_ID]
                );
                const teamId = teamResult.rows[0].team_id;
                await client.query('INSERT INTO team_finances (team_id) VALUES ($1)', [teamId]);
                await client.query('INSERT INTO stadiums (name, team_id) VALUES ($1, $2)', [`${ADMIN_TEAM_NAME} Stadium`, teamId]);
            }
            await client.query('COMMIT');
            console.log('Admin already exists. Elevated permissions.');
            return;
        }

        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [ADMIN_EMAIL, ADMIN_USERNAME]
        );

        let userId = existingUser.rows[0]?.id;
        if (!userId) {
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            const userResult = await client.query(
                'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id',
                [ADMIN_EMAIL, passwordHash, ADMIN_USERNAME]
            );
            userId = userResult.rows[0].id;
        }

        await client.query(
            `INSERT INTO managers (
        user_id, username, email, country_id, is_admin, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_COUNTRY_ID, 10, 'active']
        );

        const existingTeam = await client.query(
            'SELECT team_id FROM teams WHERE manager_id = $1',
            [userId]
        );

        if (existingTeam.rowCount === 0) {
            const teamResult = await client.query(
                'INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id',
                [ADMIN_TEAM_NAME, userId, ADMIN_COUNTRY_ID]
            );
            const teamId = teamResult.rows[0].team_id;
            await client.query('INSERT INTO team_finances (team_id) VALUES ($1)', [teamId]);
            await client.query('INSERT INTO stadiums (name, team_id) VALUES ($1, $2)', [`${ADMIN_TEAM_NAME} Stadium`, teamId]);
        }

        await client.query('COMMIT');
        console.log('Admin seeded successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Admin seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

run();
