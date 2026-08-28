const mysql = require('mysql2/promise');
const fs = require('fs');
const config = require('./index');

let pool = null;
let isConnected = false;
let lastError = null;

/**
 * Initialize MySQL Connection Pool
 */
function createPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: config.db.waitForConnections,
      connectionLimit: config.db.connectionLimit,
      queueLimit: config.db.queueLimit,
      connectTimeout: 3000,
      charset: 'utf8mb4'
    });
    return pool;
  } catch (err) {
    console.error('[DB] Failed to create connection pool:', err.message);
    lastError = err.message;
    return null;
  }
}

/**
 * Close pool (used during graceful shutdown and testing)
 */
async function closePool() {
  if (pool) {
    try {
      await pool.end();
    } catch (err) {
      // ignore
    }
    pool = null;
    isConnected = false;
  }
}

/**
 * Ensure database exists on MySQL server
 */
async function ensureDatabaseExists() {
  try {
    const adminConn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      connectTimeout: 3000
    });

    const dbNameEscaped = `\`${config.db.database.replace(/`/g, '``')}\``;
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS ${dbNameEscaped} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await adminConn.end();
  } catch (err) {
    console.warn(`[DB] Notice during database check/creation: ${err.message}`);
  }
}

/**
 * Initialize Tables and Seed Default Cities
 */
async function initDatabase() {
  try {
    // 1. Ensure database exists
    await ensureDatabaseExists();

    // 2. Connect pool
    const dbPool = createPool();
    if (!dbPool) return false;

    // Test connection
    const connection = await dbPool.getConnection();
    isConnected = true;
    lastError = null;

    console.log(`[DB] ✅ Connected to MySQL Database: '${config.db.database}' on ${config.db.host}:${config.db.port}`);

    // 3. Create cities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_code VARCHAR(50) NOT NULL UNIQUE,
        city_name VARCHAR(100) NOT NULL,
        country VARCHAR(50) DEFAULT 'GLOBAL',
        temp DECIMAL(5,2) DEFAULT 20.0,
        status VARCHAR(50) DEFAULT 'Clear',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create weather_records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS weather_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_code VARCHAR(50) NOT NULL,
        city_name VARCHAR(100) NOT NULL,
        country VARCHAR(50) DEFAULT 'GLOBAL',
        temp_c DECIMAL(5,2) NOT NULL,
        temp_f DECIMAL(5,2) NOT NULL,
        feels_like_c DECIMAL(5,2),
        feels_like_f DECIMAL(5,2),
        temp_min_c DECIMAL(5,2),
        temp_max_c DECIMAL(5,2),
        weather_main VARCHAR(50),
        weather_description VARCHAR(100),
        weather_icon VARCHAR(50),
        humidity INT NOT NULL,
        pressure INT NOT NULL,
        wind_speed DECIMAL(5,2) NOT NULL,
        wind_deg INT DEFAULT 0,
        cloudiness INT NOT NULL,
        visibility INT DEFAULT 10000,
        comfort_score DECIMAL(5,2) NOT NULL,
        comfort_category VARCHAR(50) NOT NULL,
        comfort_breakdown LONGTEXT NULL,
        source VARCHAR(50) DEFAULT 'live',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_city_code (city_code),
        INDEX idx_recorded_at (recorded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create cache_telemetry table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cache_telemetry (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(100) NOT NULL,
        action VARCHAR(20) NOT NULL,
        tier VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Seed default cities from cities.json if cities table is empty
    const [cityRows] = await connection.query('SELECT COUNT(*) as count FROM cities');
    if (cityRows[0].count === 0) {
      console.log('[DB] Seeding initial 12 cities into MySQL database...');
      try {
        const rawJson = fs.readFileSync(config.citiesFilePath, 'utf8');
        const parsed = JSON.parse(rawJson);
        const list = parsed.List || [];

        for (const c of list) {
          await connection.query(
            `INSERT INTO cities (city_code, city_name, temp, status)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE city_name = VALUES(city_name), temp = VALUES(temp), status = VALUES(status)`,
            [c.CityCode, c.CityName, parseFloat(c.Temp || '20'), c.Status || 'Clear']
          );
        }
        console.log(`[DB] ✅ Successfully seeded ${list.length} cities into 'cities' table.`);
      } catch (seedErr) {
        console.error('[DB] Error seeding cities:', seedErr.message);
      }
    } else {
      console.log(`[DB] Database already initialized with ${cityRows[0].count} cities.`);
    }

    connection.release();
    return true;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[DB] MySQL notice during startup: ${err.message}`);
    return false;
  }
}

/**
 * Execute a SQL query
 */
async function query(sql, params = []) {
  const dbPool = createPool();
  if (!dbPool) {
    throw new Error('Database connection pool is not initialized');
  }
  return dbPool.query(sql, params);
}

/**
 * Check DB Health & Stats
 */
async function checkDbHealth() {
  try {
    const dbPool = createPool();
    if (!dbPool) {
      return {
        connected: false,
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        error: lastError || 'Pool not created'
      };
    }

    const connection = await dbPool.getConnection();
    const [cityCount] = await connection.query('SELECT COUNT(*) as count FROM cities');
    const [recordCount] = await connection.query('SELECT COUNT(*) as count FROM weather_records');
    const [latestRecord] = await connection.query('SELECT recorded_at FROM weather_records ORDER BY recorded_at DESC LIMIT 1');
    connection.release();

    isConnected = true;
    lastError = null;

    return {
      connected: true,
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      totalCities: cityCount[0].count,
      totalWeatherRecords: recordCount[0].count,
      lastRecordAt: latestRecord.length > 0 ? latestRecord[0].recorded_at : null,
      error: null
    };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return {
      connected: false,
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      error: err.message
    };
  }
}

module.exports = {
  createPool,
  closePool,
  initDatabase,
  query,
  checkDbHealth,
  get isConnected() { return isConnected; },
  get lastError() { return lastError; }
};
