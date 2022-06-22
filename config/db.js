const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    db_url: process.env.DB_URL
}