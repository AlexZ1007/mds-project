const connection = require('../server/database');

class FriendService {
    async searchFriends(userId, nickname) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT u.user_id, u.nickname,
                    (SELECT status FROM Friends_Requests fr 
                     WHERE (fr.user_id = ? AND fr.friend_id = u.user_id) 
                        OR (fr.user_id = u.user_id AND fr.friend_id = ?) 
                     LIMIT 1) AS request_status
                FROM User u
                WHERE u.nickname LIKE ? AND u.user_id != ?
            `;
            connection.query(query, [userId, userId, `%${nickname}%`, userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    async sendFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Friends_Requests (user_id, friend_id, status) VALUES (?, ?, 0)`;
            connection.query(query, [userId, friendId], (err, results) => {
                if (err) return reject(err);
                resolve({ message: 'Friend request sent' });
            });
        });
    }


    async respondToFriendRequest(requestId, status, userId) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE Friends_Requests SET status = ? WHERE friend_request_id = ? AND friend_id = ?`;
            connection.query(query, [status, requestId, userId], (err, results) => {
                if (err) return reject(err);
                resolve({ message: status === 1 ? 'Friend request accepted' : 'Friend request denied' });
            });
        });
    }


    async getFriendsAndPending(userId) {
        return new Promise((resolve, reject) => {
            const friendsQuery = `
                SELECT u.user_id, u.nickname 
                FROM Friends_Requests fr
                JOIN User u ON (u.user_id = fr.friend_id OR u.user_id = fr.user_id)
                WHERE (fr.user_id = ? OR fr.friend_id = ?) AND fr.status = 1 AND u.user_id != ?
            `;
            const pendingQuery = `
                SELECT fr.friend_request_id, u.user_id, u.nickname 
                FROM Friends_Requests fr
                JOIN User u ON u.user_id = fr.user_id
                WHERE fr.friend_id = ? AND fr.status = 0
            `;
            connection.query(friendsQuery, [userId, userId, userId], (err, friends) => {
                if (err) return reject(err);
                connection.query(pendingQuery, [userId], (err, pending) => {
                    if (err) return reject(err);
                    resolve({ friends, pending });
                });
            });
        });
    }

}

module.exports = FriendService;