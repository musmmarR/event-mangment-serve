const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const HttpError = require('../config/httpError');
const { JWT_SECRET } = require('../config/config');
const { sendVerificationEmail } = require('../services/emailService');

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
         // Check if user already exists
         const existingUser = await User.findOne({ email });
         if (existingUser) {
            throw new HttpError(400, 'Email already registered');
         }
        const verificationToken = jwt.sign({ email }, JWT_SECRET);
        
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            verificationToken
        });

        await user.save();
        await sendVerificationEmail(email, verificationToken);
        res.appData = {
            data: true,
            code: 200
          }
          next();
 } catch (error) {
        throw new HttpError(400, error.message);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });
        
        if (!user) {
            throw new HttpError(400, 'Invalid verification token');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.appData = {
            data: { message: 'Email verified successfully' },
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400,  error.message);
    }
};

exports.login = async (req, res, next) => {
    try {
console.log(req.body)
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            console.log(user)
            throw new HttpError(401,'Invalid credentials');
        }

        if (!user.isVerified) {
            throw new HttpError(401, 'Please verify your email first');
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.appData = {
            data: { token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } },
            code: 200
          }
          next();
    } catch (error) {
        throw new HttpError(400, error.message);
    }
}; 