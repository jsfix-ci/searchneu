import knex from 'knex';

export default knex({
  client: 'pg',
  connection: process.env.DATABASE_URL // FIXME how do we make DATABASE_URL available to the whole app?
});
