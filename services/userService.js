const connection = require('../server/database');

class userService {
  constructor() {}

  async updateUserAfterGame(userId, gameReward) {
    if (!userId) {
      throw new Error("Invalid userId");
    }
    console.log('here', userId, gameReward);
    try {
      // Update elo, balance, matches_played, matches_won
      await this._query(
        `UPDATE User 
         SET elo = GREATEST(0, elo + ?), 
             balance = balance + ?, 
             matches_played = matches_played + 1, 
             matches_won = matches_won + ?
         WHERE user_id = ?`,
        [
          gameReward.trophies,
          gameReward.coins,
          gameReward.status === 'win' ? 1 : 0,
          userId
        ]
      );

      // Get the new elo
      const eloResults = await this._query(
        `SELECT elo FROM User WHERE user_id = ?`,
        [userId]
      );

      const elo = eloResults[0].elo;

      // Update division based on new elo
      await this._query(
        `UPDATE User
         SET division_id = (
           SELECT division_id FROM Division
           WHERE min_elo <= ? AND ? <= max_elo
         )
         WHERE user_id = ?`,
        [elo, elo, userId]
      );

      return { success: true };
    } catch (err) {
      throw err;
    }
  }


  


  // Utility wrapper to convert callback-based MySQL to Promises
  _query(sql, params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = userService;
