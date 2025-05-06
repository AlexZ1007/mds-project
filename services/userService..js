const User = require('../server/user');
const bcrypt = require('bcrypt');
const connection = require('../server/database');

class authService {
  constructor() { };

  async register(userId) {
    // Get the user ID of the newly created user
    const result = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT user_id FROM User WHERE user_id = ?',
        [nickname],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });


    const user = result[0];
    return user;
  }


}

module.exports = authService;