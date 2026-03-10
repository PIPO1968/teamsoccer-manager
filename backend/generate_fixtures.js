/**
 * generate_fixtures.js
 * Genera automáticamente las 14 jornadas de liga y los partidos de promoción/descenso para todas las divisiones, grupos y países.
 * - Inicio: 25 de julio de 2026, partidos los sábados.
 * - Playoffs: ida y vuelta, sábados tras la jornada 14.
 *
 * Reglas:
 * - 1º: Asciende directo (excepto 1.1, que es campeón)
 * - 2º: Promoción de ascenso (playoff)
 * - 5º y 6º: Promoción de descenso (playoff)
 * - 7º y 8º: Descienden directo
 *
 * Uso: node backend/generate_fixtures.js
 */


import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { COUNTRY_TIMEZONES } from './utils/countryTimezones.js';

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

const BASE_HOUR_CET = 19; // 19:00 hora central europea (España)
const BASE_HOUR_LONDON = 18; // 18:00 hora de Inglaterra (servidor/base)
const FIRST_MATCH_DATE = new Date(Date.UTC(2026, 6, 25, BASE_HOUR_LONDON, 0, 0)); // 25 julio 2026, 18:00 Londres
const MATCHES_PER_ROUND = 4; // 8 equipos por grupo
const TOTAL_ROUNDS = 14;


function addDays(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

// Devuelve la diferencia horaria (en horas) entre la zona base (Europe/London) y la zona local
function getTimezoneOffsetHours(timezone) {
    try {
        const base = new Date(Date.UTC(2026, 6, 25, BASE_HOUR_LONDON, 0, 0));
        const baseOffset = base.getTimezoneOffset() / -60;
        const local = new Date(base.toLocaleString('en-US', { timeZone: timezone }));
        const localOffset = local.getTimezoneOffset() / -60;
        return localOffset - baseOffset;
    } catch {
        return 0;
    }
}

// Devuelve la hora local sugerida para el país (por defecto 19:00 local, pero escalonado)
function getLocalMatchHour(countryName, groupIndex) {
    // Para escalonar: España 19:00, Francia 19:15, Alemania 19:30, Italia 19:45, etc.
    // O bien, usar 19:00 + (grupo % 4) * 15 min
    const baseHour = 19;
    const baseMinute = (groupIndex % 4) * 15;
    return { hour: baseHour, minute: baseMinute };
}

function getNextSaturday(date, weeks = 1) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 7 * weeks);
    return d;
}

// Genera el fixture round-robin para 8 equipos (14 jornadas)
function generateRoundRobin(teams) {
    // Algoritmo round-robin con alternancia estricta local/visitante para todos los equipos
    // Basado en Berger, pero ajustando la localía para que ningún equipo tenga dos partidos seguidos en casa o fuera
    const n = teams.length;
    let arr = [...teams];
    if (n % 2 !== 0) arr.push(null); // Si impar, añadir bye
    const rounds = [];
    // Primera vuelta
    for (let round = 0; round < n - 1; round++) {
        const matches = [];
        for (let i = 0; i < n / 2; i++) {
            let home = arr[i];
            let away = arr[n - 1 - i];
            // Alternancia estricta: para todos los equipos
            // El primer equipo alterna localía cada jornada
            if (i === 0) {
                if (round % 2 === 0) {
                    // Par: home, impar: away
                    // Nada que hacer, home ya es local
                } else {
                    [home, away] = [away, home];
                }
            } else {
                // Para el resto, alternar localía cada jornada
                if ((round + i) % 2 === 0) {
                    // Nada que hacer, home ya es local
                } else {
                    [home, away] = [away, home];
                }
            }
            if (home && away) matches.push([home, away]);
        }
        rounds.push(matches);
        // Rotación Berger
        arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
    }
    // Segunda vuelta: mismo orden pero invirtiendo localía respecto a la primera
    const secondLeg = rounds.map(matches => matches.map(([h, a]) => [a, h]));
    return [...rounds, ...secondLeg];
}

// Genera los emparejamientos de playoffs de ascenso y descenso
async function generatePlayoffs(client, seriesList, matchDate) {
    for (const series of seriesList) {
        // Obtener clasificación final (simulada: por team_id ASC)
        const teamsRes = await client.query('SELECT team_id FROM teams WHERE series_id = $1 ORDER BY team_id ASC', [series.series_id]);
        const teams = teamsRes.rows.map(r => r.team_id);
        if (teams.length !== 8) continue;
        // División 1, grupo 1: solo descenso
        if (series.division === 1 && series.group_number === 1) {
            // 5º vs 6º: playoff descenso (ida y vuelta)
            await createPlayoff(client, teams[4], teams[5], matchDate, series.series_id, 'descenso');
        } else {
            // 1º: asciende directo (no se crea partido)
            // 2º: promoción de ascenso (buscar rival de división superior)
            // 5º vs 6º: playoff descenso (ida y vuelta)
            await createPlayoff(client, teams[4], teams[5], matchDate, series.series_id, 'descenso');
            // 2º: promoción de ascenso (buscar rival de división superior)
            // Aquí solo se crea el partido entre 2º de este grupo y 7º del grupo superior (placeholder)
            // Se debe buscar el grupo superior correspondiente
            // Ejemplo: para división 2 grupo 1, buscar división 1 grupo 1
            if (series.division > 1) {
                const upperSeries = seriesList.find(s => s.division === series.division - 1 && s.group_number === Math.ceil(series.group_number / 2));
                if (upperSeries) {
                    const upperTeamsRes = await client.query('SELECT team_id FROM teams WHERE series_id = $1 ORDER BY team_id ASC', [upperSeries.series_id]);
                    const upperTeams = upperTeamsRes.rows.map(r => r.team_id);
                    if (upperTeams.length === 8) {
                        // 2º de este grupo vs 7º del grupo superior
                        await createPlayoff(client, teams[1], upperTeams[6], matchDate, series.series_id, 'ascenso');
                    }
                }
            }
        }
    }
}

// Crea partidos de playoff ida y vuelta
async function createPlayoff(client, teamA, teamB, matchDate, seriesId, tipo) {
    // Ida
    await client.query(
        'INSERT INTO matches (home_team_id, away_team_id, match_date, series_id, status, is_friendly) VALUES ($1, $2, $3, $4, $5, $6)',
        [teamA, teamB, matchDate.toISOString(), seriesId, 'scheduled', false]
    );
    // Vuelta (siguiente sábado)
    const vueltaDate = getNextSaturday(matchDate, 1);
    await client.query(
        'INSERT INTO matches (home_team_id, away_team_id, match_date, series_id, status, is_friendly) VALUES ($1, $2, $3, $4, $5, $6)',
        [teamB, teamA, vueltaDate.toISOString(), seriesId, 'scheduled', false]
    );
}

async function main() {
    const client = await pool.connect();
    try {
        // BORRAR partidos de la temporada 1 antes de generar nuevos (evita duplicados)
        await client.query('DELETE FROM matches WHERE series_id IN (SELECT series_id FROM series WHERE season = 1)');

        // 1. Obtener todas las series activas de la temporada 1
        const seriesRes = await client.query('SELECT series_id, division, group_number, region_id FROM series WHERE season = 1');
        const seriesList = seriesRes.rows;
        for (const series of seriesList) {
            // 2. Obtener equipos de la serie
            const teamsRes = await client.query('SELECT team_id FROM teams WHERE series_id = $1 ORDER BY team_id ASC', [series.series_id]);
            const teams = teamsRes.rows.map(r => r.team_id);
            if (teams.length !== 8) {
                console.warn(`Serie ${series.series_id} no tiene 8 equipos, se omite.`);
                continue;
            }
            // 3. Generar fixture round-robin (14 jornadas)
            const rounds = generateRoundRobin(teams);
            // Obtener país local (de la serie)
            const countryRes = await client.query('SELECT region_id FROM series WHERE series_id = $1', [series.series_id]);
            const countryId = countryRes.rows[0]?.region_id;
            let countryName = null;
            if (countryId) {
                const regRes = await client.query('SELECT name FROM leagues_regions WHERE region_id = $1', [countryId]);
                countryName = regRes.rows[0]?.name;
            }
            const timezone = countryName ? COUNTRY_TIMEZONES[countryName] || 'Europe/London' : 'Europe/London';
            // Escalonar hora local según grupo
            const { hour: localHour, minute: localMinute } = getLocalMatchHour(countryName, series.group_number || 0);
            let matchDate = new Date(Date.UTC(2026, 6, 25, BASE_HOUR_LONDON, 0, 0));
            for (let j = 0; j < TOTAL_ROUNDS; j++) {
                for (const [home, away] of rounds[j]) {
                    // Calcular fecha local para este país y grupo
                    const localDate = new Date(matchDate.getTime());
                    localDate.setUTCHours(localHour, localMinute, 0, 0);
                    // Validar que la fecha es válida
                    if (isNaN(localDate.getTime())) {
                        console.error('Fecha inválida generada para el partido:', home, 'vs', away, 'en serie', series.series_id);
                        continue;
                    }
                    // Guardar como UTC en formato ISO
                    await client.query(
                        'INSERT INTO matches (home_team_id, away_team_id, match_date, series_id, status) VALUES ($1, $2, $3, $4, $5)',
                        [home, away, localDate.toISOString(), series.series_id, 'scheduled']
                    );
                }
                matchDate = getNextSaturday(matchDate, 1);
            }
            // 4. Guardar fechas de playoffs (2 rondas extra)
            // Aquí solo se crean los placeholders, la lógica de emparejamientos se puede ajustar según resultados reales
            // Ejemplo: partidos de promoción de ascenso y descenso
            // (En la práctica, estos se generan tras la liga regular, aquí solo se reserva la fecha)
            for (let playoff = 1; playoff <= 2; playoff++) {
                matchDate = getNextSaturday(matchDate, 1);
                // Puedes guardar los partidos de playoff aquí si tienes los emparejamientos definidos
            }
        }
        // Generar playoffs tras la liga regular
        let playoffDate = getNextSaturday(FIRST_MATCH_DATE, TOTAL_ROUNDS + 1);
        await generatePlayoffs(client, seriesList, playoffDate);
        console.log('✅ Partidos de liga y playoffs generados.');
    } catch (err) {
        console.error('❌ Error generando fixtures:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

main();
