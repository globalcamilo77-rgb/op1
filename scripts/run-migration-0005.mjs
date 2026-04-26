import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '0005_client_fingerprints.sql')
const sql = readFileSync(sqlPath, 'utf8')

const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_URL

if (!url) {
  console.error('[run-migration] sem POSTGRES_URL_NON_POOLING/POSTGRES_URL na env')
  process.exit(1)
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await client.connect()
console.log('[run-migration] conectado, aplicando 0005...')
await client.query(sql)
const tables = await client.query(
  "select count(*)::int as c from information_schema.tables where table_schema = 'public' and table_name = 'client_fingerprints'",
)
console.log('[run-migration] client_fingerprints existe?', tables.rows[0].c === 1)
await client.end()
console.log('[run-migration] OK')
