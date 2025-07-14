import mysql from 'mysql2/promise'

/**
 * Database Configuration - Infrastructure layer
 * This handles MySQL database connection configuration
 */

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  connectionLimit: number
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'esprit_db',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
}

// Create connection pool for better performance
export const createConnection = () => {
  return mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: dbConfig.connectionLimit,
    waitForConnections: true,
    queueLimit: 0,
  })
}

// Singleton pattern for connection pool
let connectionPool: mysql.Pool | null = null

export const getConnectionPool = (): mysql.Pool => {
  if (!connectionPool) {
    connectionPool = createConnection()
  }
  return connectionPool
}

// Close connection pool
export const closeConnection = async (): Promise<void> => {
  if (connectionPool) {
    await connectionPool.end()
    connectionPool = null
  }
}

 