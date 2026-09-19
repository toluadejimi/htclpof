import 'dotenv/config';
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
}

export const pool = mysql.createPool(process.env.DATABASE_URL);

// Accepts Postgres-style $1, $2... placeholders and adapts them to mysql2's positional "?".
export async function query(sql, params = []) {
  const mysqlSql = sql.replace(/\$\d+/g, '?');
  const [rows] = await pool.execute(mysqlSql, params);
  return { rows, rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows || 0 };
}
