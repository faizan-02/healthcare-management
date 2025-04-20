const sql = require("mssql")

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourPassword",
  server: process.env.DB_SERVER || "localhost",
  database: "healthcare_management",
  options: {
    trustServerCertificate: true, // For local dev only
    enableArithAbort: true,
  },
}

// Create a connection pool
const pool = new sql.ConnectionPool(dbConfig)
const poolConnect = pool.connect()

// Handle connection errors
poolConnect.catch((err) => {
  console.error("Database connection failed!", err)
})

// Export the pool for use in other files
module.exports = {
  sql,
  pool,
  poolConnect,
}
