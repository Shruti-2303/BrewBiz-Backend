import knex from 'knex';
import knexConfig from './knexfile.js';

export const pool = knex(knexConfig.development);

//   async function getPgVersion() {
//   const client = await pool.connect();
//   try {
//     const result = await client.query('SELECT version()');
//     console.log(result.rows[0]);
//   } finally {
//     client.release();
//   }
// }
// getPgVersion();


// import pg from 'pg';
// import dotenv  from "dotenv";

// const {Pool} = pg;
// dotenv.config();

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// export const pool = new Pool({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: {
//     require: true,
//   },
// });

