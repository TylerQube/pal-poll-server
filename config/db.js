const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    db_url: process.env.DB_URL,
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    jwt_secret: process.env.JWT_SECRET
}