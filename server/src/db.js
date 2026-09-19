import 'dotenv/config';
import mysql from 'mysql2/promise';

// Prefer discrete DB_* variables so passwords with special characters (@, :, /, #, %)
// never have to survive being embedded in and parsed back out of a URL string.
function buildPoolConfig() {
  if (process.env.DB_HOST || process.env.DB_USER || process.env.DB_NAME) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('DB_HOST, DB_USER, and DB_NAME must all be set together.');
    }
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME
    };
  }
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error('Set either DB_HOST/DB_USER/DB_PASSWORD/DB_NAME or DATABASE_URL. Copy .env.example to .env and configure it.');
}

export const pool = mysql.createPool(buildPoolConfig());

// Accepts Postgres-style $1, $2... placeholders and adapts them to mysql2's positional "?".
export async function query(sql, params = []) {
  const mysqlSql = sql.replace(/\$\d+/g, '?');
  const [rows] = await pool.execute(mysqlSql, params);
  return { rows, rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows || 0 };
}
