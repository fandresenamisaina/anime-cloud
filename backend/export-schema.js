const { Client } = require('pg');
const fs = require('fs');

const connectionString = process.argv[2];
const outputFile = process.argv[3] || 'full_schema_export.sql';

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  const tablesRes = await client.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `);
  const tables = tablesRes.rows.map(r => r.tablename);
  console.log('Tables trouvées localement :', tables.join(', '));

  let output = '';

  for (const table of tables) {
    const colsRes = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default,
             udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);

    const pkRes = await client.query(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `, [table]);
    const pkCols = pkRes.rows.map(r => r.attname);

    const fkRes = await client.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = $1
    `, [table]);

    const uniqueRes = await client.query(`
      SELECT tc.constraint_name, string_agg(kcu.column_name, ',' ORDER BY kcu.ordinal_position) as cols
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public' AND tc.table_name = $1
      GROUP BY tc.constraint_name
    `, [table]);

    let lines = [];
    for (const col of colsRes.rows) {
      let type = col.udt_name;
      if (type === 'varchar' && col.character_maximum_length) {
        type = `VARCHAR(${col.character_maximum_length})`;
      } else if (type === 'int4') {
        type = 'INTEGER';
      } else if (type === 'int8') {
        type = 'BIGINT';
      } else if (type === 'bool') {
        type = 'BOOLEAN';
      } else if (type === 'timestamp') {
        type = 'TIMESTAMP';
      } else if (type === 'timestamptz') {
        type = 'TIMESTAMPTZ';
      } else if (type === 'text') {
        type = 'TEXT';
      } else if (type === 'numeric') {
        type = 'NUMERIC';
      }

      let isSerial = col.column_default && col.column_default.includes('nextval');
      let colDef = `    ${col.column_name} `;
      if (isSerial) {
        colDef += type === 'INTEGER' ? 'SERIAL' : 'BIGSERIAL';
      } else {
        colDef += type;
      }
      if (col.is_nullable === 'NO' && !isSerial) colDef += ' NOT NULL';
      if (col.column_default && !isSerial) {
        colDef += ` DEFAULT ${col.column_default}`;
      }
      lines.push(colDef);
    }

    if (pkCols.length > 0) {
      lines.push(`    PRIMARY KEY (${pkCols.join(', ')})`);
    }

    for (const uq of uniqueRes.rows) {
      const colsArr = uq.cols.split(',');
      lines.push(`    UNIQUE (${colsArr.join(', ')})`);
    }

    for (const fk of fkRes.rows) {
      lines.push(`    FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table}(${fk.foreign_column}) ON DELETE ${fk.delete_rule}`);
    }

    output += `CREATE TABLE IF NOT EXISTS ${table} (\n${lines.join(',\n')}\n);\n\n`;
  }

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log('Schéma exporté dans :', outputFile);

  await client.end();
}

run().catch(err => {
  console.error('ERREUR:', err.message);
  process.exit(1);
});
