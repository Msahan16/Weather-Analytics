const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./src/config');

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 Running MySQL Migration from schema.sql');
  console.log(`📡 Host: ${config.db.host}:${config.db.port}`);
  console.log(`👤 User: ${config.db.user}`);
  console.log(`🗄️  Target DB: ${config.db.database}`);
  console.log('====================================================');

  let connection;
  try {
    // 1. Connect to MySQL Server (with multipleStatements enabled)
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });

    console.log('[Migration] Connected to MySQL server.');

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // 3. Execute schema.sql
    console.log('[Migration] Executing schema.sql statements...');
    await connection.query(sqlContent);
    console.log('[Migration] ✅ schema.sql executed successfully!');

    // 4. Verify created tables and counts
    await connection.query(`USE \`${config.db.database}\``);
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`[Migration] 📋 Tables in '${config.db.database}':`, tableNames);

    if (tableNames.includes('cities')) {
      const [cityRows] = await connection.query('SELECT COUNT(*) as count FROM cities');
      const [citiesList] = await connection.query('SELECT city_code, city_name, temp, status FROM cities');
      console.log(`[Migration] 🏙️  Total Cities in 'cities' table: ${cityRows[0].count}`);
      console.table(citiesList);
    }

    if (tableNames.includes('weather_records')) {
      const [recordRows] = await connection.query('SELECT COUNT(*) as count FROM weather_records');
      console.log(`[Migration] 📊 Total Weather Records: ${recordRows[0].count}`);
    }

    console.log('====================================================');
    console.log('🎉 Migration & Data Seeding Completed Successfully!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ [Migration Error]:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
