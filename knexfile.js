// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import dotenv  from "dotenv";
dotenv.config()

const config  = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: 5432,
      ssl: { rejectUnauthorized: false } // Adjust SSL settings as per your environment's requirements
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};

export default config;