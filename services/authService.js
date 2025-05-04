const User = require('../server/user');
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
    

    await connection.query('INSERT INTO User (nickname, balance, matches_played, matches_won, password, email) VALUES (?, 100, 0,0, ?, ?)',
      [nickname, hashed, email],
    );
    return 'User registered';
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
        'SELECT u.card_ID, u.card_count, c.level, c.card_name, c.description, c.mana_points, c.HP_points, c.ability, c.card_image, c.damage FROM User_Cards u  JOIN Card c ON u.card_ID = c.card_ID WHERE user_ID = ?',
        [user.user_ID],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    user.cards =  cardStats.map(row => ({
      card: {
        card_id: row.card_ID,
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
    console.log(user);
    return user;
  }
}

module.exports = authService;