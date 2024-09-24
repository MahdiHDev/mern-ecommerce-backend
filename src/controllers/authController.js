const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const { jwtAccessKey, jwtRefreshKey } = require('../secret');
const {
    setAccessTokenCookie,
    setRefreshTokenCookie,
} = require('../Helper/cookie');

const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw createError(
                404,
                'User does not exist with this email please register first'
            );
        }
        // compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw createError(401, 'Email/password did not match');
        }
        // isBanned
        if (user.isBanned) {
            throw createError(403, 'You are banned, please contact authority');
        }
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        // token, cookie
        const accessToken = createJSONWebToken({ user }, jwtAccessKey, '5m');
        setAccessTokenCookie(res, accessToken);

        const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, '7d');
        setRefreshTokenCookie(res, refreshToken);

        return successResponse(res, {
            statusCode: 200,
            message: 'User logged in Successfully',
            payload: { userWithoutPassword },
        });
    } catch (error) {
        next(error);
    }
};
const handleLogout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // success response
        return successResponse(res, {
            statusCode: 200,
            message: 'User logged out Successfully',
            payload: {},
        });
    } catch (error) {
        next(error);
    }
};

const handleRefreshToken = async (req, res, next) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        // verify the old refresh token
        const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);
        console.log(decodedToken);

        if (!decodedToken) {
            throw createError(401, 'Invalid Refresh Token, plase login again');
        }

        const accessToken = createJSONWebToken(
            decodedToken.user,
            jwtAccessKey,
            '5m'
        );
        setAccessTokenCookie(res, accessToken);

        return successResponse(res, {
            statusCode: 200,
            message: 'new access token is generated',
            payload: {},
        });
    } catch (error) {
        next(error);
    }
};

const handleProtectedRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        // verify the old refresh token
        const decodedToken = jwt.verify(accessToken, jwtAccessKey);
        console.log(decodedToken);

        if (!decodedToken) {
            throw createError(401, 'Invalid access Token, plase login again');
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'Protected resources accessed successfully',
            payload: {},
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleLogin,
    handleLogout,
    handleRefreshToken,
    handleProtectedRoute,
};
