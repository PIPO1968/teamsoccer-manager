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

const run = async () => {
    try {
        const result = await pool.query(
            "SELECT team_id, name, manager_id FROM teams WHERE manager_id = 1"
        );
        console.log(result.rows);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

run();
