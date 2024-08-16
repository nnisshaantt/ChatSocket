const jwt = require('jsonwebtoken');
const { JWTKey } = require('../EnvironmentConstants');
const { DecryptString, EncryptString } = require('./EncryptDecrypt.js');
const crypto = require("crypto");

const generateToken = (payload, expiresIn = "1h") => {
    const secretKey = JWTKey;
    const options = {
        expiresIn: expiresIn, // Token expiration time
    };

    const token = jwt.sign(payload, secretKey, options);
    return token;
};

const generateATFromRT = (refreshToken) => {
    if (refreshToken) {
        return jwt.verify(refreshToken, JWTKey, (err, payload) => {
            if (err) {
                return {
                    success: false,
                    message: 'Invalid token',
                };
            } else {
                const info = JSON.parse(DecryptString(payload?.info).value);
                if (info.claim == "RT") {
                    const accTok = generateToken({ email: payload?.email, info: EncryptString(JSON.stringify({ claim: "AT", id: crypto.randomUUID() })).value });
                    return {
                        success: true,
                        data: accTok
                    }
                } else return {
                    success: false,
                    message: 'Invalid token',
                };
            }
        });
    } else
        return {
            success: false,
            message: 'Token is not provided',
        };
}

const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, JWTKey, (err, payload) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid token',
                });
            } else {
                req.user = payload;
                console.log("asdsdasdasdasdasd", payload);
                next();
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Token is not provided',
        });
    }
};

module.exports = {
    generateToken,
    validateToken, generateATFromRT
};