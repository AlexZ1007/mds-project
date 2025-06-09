const bcrypt = require('bcrypt');
const connection = require('../server/database');

class authService {
  constructor() { };

  async register(nickname, password, email) {
    const [existingUser] = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM User WHERE nickname = ?',
        [nickname],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (existingUser) {
      if (existingUser.nickname === nickname) {
        throw new Error('Username already exists');
      }
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
    }

    const hashed = bcrypt.hashSync(password, 10);


    await connection.query('INSERT INTO User (nickname, balance, matches_played, matches_won, password, email, division_id) VALUES (?, 100, 0,0, ?, ?, 1)',
      [nickname, hashed, email],
    );

    const result = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT user_id FROM User WHERE nickname = ?',
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

  async login(nickname, password) {

    const result = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM User WHERE nickname = ? or email = ?',
        [nickname, nickname],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (!result || result.length === 0) {
      throw new Error('User not found');
    }
    const user = result[0];
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('Password is incorrect');
    }

    const cardStats = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT u.card_id, u.card_count, c.level, c.card_name, c.description, c.mana_points, c.HP_points, c.ability, c.card_image, c.damage FROM User_Cards u  JOIN Card c ON u.card_id = c.card_id WHERE user_id = ?',
        [user.user_id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    user.cards = cardStats.map(row => ({
      card: {
        card_id: row.card_id,
        name: row.card_name,
        description: row.description,
        ability: row.ability,
        mana_points: row.mana_points,
        HP_points: row.HP_points,
        damage: row.damage,
        card_image: row.card_image,
        level: row.level
      },
      card_count: row.card_count,

    }));

    return user;
  }

  async getUserData(userId) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT u.nickname, u.email, u.balance, u.elo, u.matches_played,
        u.matches_won, d.division_name
        FROM User u 
        left JOIN Division d ON u.division_id = d.division_id
        WHERE u.user_id = ?`,
        [userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]); // Return the first result (user data)
        }
      );
    });
  }
  

}


module.exports = authService;