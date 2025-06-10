import { pool } from './database.js';

const resolvers = {
  Query: {
    // User Queries - used to get logged in user's profile data
    me: (_, __, { session }) => {
      if (!session.user.id) return null;
      return pool.query('SELECT * FROM users WHERE id = $1', [session.user.id])
        .then(result => result.rows[0]);
    },

    user: (_, { id }) => {
      return pool.query('SELECT * FROM users WHERE id = $1', [id])
        .then(result => result.rows[0]);
    }
  }
};


export default resolvers;
