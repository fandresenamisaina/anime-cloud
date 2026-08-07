const { Client } = require('pg');

const connectionString = process.argv[2];

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('Tables trouvées :');
  res.rows.forEach(r => console.log(' -', r.table_name));
  await client.end();
}

run().catch(err => {
  console.error('ERREUR:', err.message);
  process.exit(1);
});
