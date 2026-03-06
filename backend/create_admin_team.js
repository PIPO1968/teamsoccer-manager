import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "PIPO68";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pipocanarias@hotmail.com";
const ADMIN_COUNTRY_ID = parseInt(process.env.ADMIN_COUNTRY_ID || "2", 10);
const ADMIN_TEAM_NAME = process.env.ADMIN_TEAM_NAME || "Admin FC";

const run = async () => {
    const client = await pool.connect();
    try {
        const managerResult = await client.query(
            "SELECT user_id FROM managers WHERE username = $1 OR email = $2 LIMIT 1",
            [ADMIN_USERNAME, ADMIN_EMAIL]
        );

        if (managerResult.rowCount === 0) {
            console.error("Admin manager not found. Run seed_admin.js first.");
            return;
        }

        const managerId = managerResult.rows[0].user_id;

        const teamResult = await client.query(
            "SELECT team_id, name FROM teams WHERE manager_id = $1",
            [managerId]
        );

        if (teamResult.rowCount > 0) {
            console.log("Admin team already exists:", teamResult.rows[0]);
            return;
        }

        const insertTeam = await client.query(
            "INSERT INTO teams (name, manager_id, country_id) VALUES ($1, $2, $3) RETURNING team_id",
            [ADMIN_TEAM_NAME, managerId, ADMIN_COUNTRY_ID]
        );

        const teamId = insertTeam.rows[0].team_id;
        await client.query("INSERT INTO team_finances (team_id) VALUES ($1)", [teamId]);
        await client.query("INSERT INTO stadiums (name, team_id, capacity) VALUES ($1, $2, 2500)", [
            `${ADMIN_TEAM_NAME} Stadium`,
            teamId,
        ]);

        console.log("Admin team created:", { team_id: teamId, name: ADMIN_TEAM_NAME });
    } catch (error) {
        console.error("Failed to create admin team:", error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

run();
