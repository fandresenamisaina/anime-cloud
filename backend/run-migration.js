const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2];
const sqlFile = process.argv[3];

if (!connectionString || !sqlFile) {
  console.error('Usage: node run-migration.js "postgresql://..." fichier.sql');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8');
  await client.query(sql);
  console.log('OK:', sqlFile);
  await client.end();
}

run().catch(err => {
  console.error('ERREUR:', err.message);
  process.exit(1);
});
