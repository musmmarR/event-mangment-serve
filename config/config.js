require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    CRYPTO_SECRET_KEY: process.env.CRYPTO_SECRET_KEY || 'your-secret-key',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200'
}; 