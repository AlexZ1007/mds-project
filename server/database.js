require('dotenv').config();
const mysql = require('mysql');

class Database {
  constructor() {
    if (!Database.instance) {
      this.connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 3306
      });

      this.connection.connect((err) => {
        if (err) {
          console.error('MySQL connection error:', err.stack);
        } else {
          console.log('Connected to MySQL as ID', this.connection.threadId);
        }
      });

      this.connection.on('error', (err) => {
        console.error('MySQL error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          Database.instance = null; // allow re-init
        }
      });

      Database.instance = this;
    }

    return Database.instance;
  }

  getConnection() {
    return this.connection;
  }
}

const instance = new Database();
Object.freeze(instance);  // Ensure singleton immutability

// This function can be used to get the connection in other modules
module.exports = instance.getConnection();
