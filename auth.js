const jwtSecret = 'your_jwt_secret'; // has to be the same as JWTStrategy

const { Router } = require('express');
const jwt = require('jsonwebtoken'),
    passport = require('passport');
const { User } = require('./models');

require('./passport'); // local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //username encoded in the jwt
        expiresIn: '7d', // token will expire in 7 days
        algorithim: 'HS256', // algorithim used to sign or encose the values of the jwt
    });
};

// POST Login

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate(
            'local',
            { session: false },
            (error, user, info) => {
                if (error || !user) {
                    return res.status(400).json({
                        message: 'Something is not right',
                        user: user,
                    });
                }
                req.login(user, { session: false }, (error) => {
                    if (error) {
                        res.send(error);
                    }
                    let token = generateJWTToken(user.toJSON());
                    return res.json({ user, token });
                });
            }
        )(req, res);
    });
};
