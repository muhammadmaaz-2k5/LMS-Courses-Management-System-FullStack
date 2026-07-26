import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const SQL_FILE = join(__dirname, '..', 'configs', 'supabase.sql')

async function migrate() {
  console.log('='.repeat(60))
  console.log('  Maaz LMS - Supabase Migration')
  console.log('='.repeat(60))

  // Read the SQL file
  const sql = readFileSync(SQL_FILE, 'utf-8')
  console.log(`\nRead migration SQL (${sql.length} bytes)`)

  // Try approach 1: Use the Supabase SQL endpoint via REST
  console.log('\nAttempting migration via Supabase SQL endpoint...')

  try {
    const projectRef = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        'apikey': process.env.SUPABASE_SECRET_KEY
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Migration executed successfully via Management API!')
      console.log('Result:', JSON.stringify(result, null, 2))
      return true
    } else {
      const text = await response.text()
      console.log(`Management API returned ${response.status}: ${text.slice(0, 200)}`)
    }
  } catch (e) {
    console.log(`Management API approach failed: ${e.message}`)
  }

  // Try approach 2: Execute SQL statements one by one via RPC
  console.log('\nTrying individual table creation via Supabase client...')

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let successCount = 0
  let failCount = 0

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' })
      if (error) {
        // Table might already exist, that's OK
        if (error.message?.includes('already exists')) {
          successCount++
        } else {
          failCount++
        }
      } else {
        successCount++
      }
    } catch {
      failCount++
    }
  }

  if (failCount === 0 && successCount > 0) {
    console.log(`Migration completed via RPC (${successCount} statements)`)
    return true
  }

  // If all approaches fail, print instructions
  console.log('\n' + '='.repeat(60))
  console.log('  MIGRATION REQUIRED - Manual Step Needed')
  console.log('='.repeat(60))
  console.log(`
The migration SQL could not be executed automatically.
Please run the SQL manually:

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/tattcckjgkiugwjhwodp/sql/new

2. Copy the contents of: server/configs/supabase.sql

3. Paste into the SQL Editor and click "Run"

4. Then run: node scripts/seed.js
`)
  return false
}

// Verify tables exist after migration
async function verify() {
  console.log('\nVerifying tables...')

  const tables = ['users', 'courses', 'purchases', 'course_progress']
  let allGood = true

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`  ✗ ${table}: ${error.message}`)
        allGood = false
      } else {
        console.log(`  ✓ ${table}: exists`)
      }
    } catch {
      console.log(`  ✗ ${table}: not found`)
      allGood = false
    }
  }

  return allGood
}

async function main() {
  const migrated = await migrate()

  if (migrated) {
    const verified = await verify()
    if (verified) {
      console.log('\nAll tables verified! Ready to seed.')
    } else {
      console.log('\nSome tables are missing. Please run the SQL migration first.')
    }
  }
}

main().catch(console.error)
