const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const { successResponse } = require('./responseController');
// const mongoose = require('mongoose');
// const { findWithId } = require('../services/findItem');
// const { deleteImage } = require('../Helper/deleteImage');
const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const {
    jwtActivationKey,
    clientURL,
    jwtResetPasswordKey,
} = require('../secret');
const emailWithNodeMailer = require('../Helper/email');
const runValidation = require('../validators');
const {
    handleUserAction,
    findUsers,
    findUserById,
    deleteUserById,
    updateUserById,
    updateUserPasswordById,
    forgetPasswordByEmail,
    resetPassword,
} = require('../services/userService');
const checkUserExists = require('../Helper/checkUserExist');
const sendEmail = require('../Helper/sendEmail');
const cloudinary = require('../config/cloudinary');

const handleGetUsers = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const { users, pagination } = await findUsers(search, limit, page);

        return successResponse(res, {
            statusCode: 200,
            message: 'users were is returned successfully',
            payload: {
                users,
                pagination,
            },
        });
    } catch (error) {
        next(error);
    }
};

const handleGetUserId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        const user = await findUserById(id, options);
        return successResponse(res, {
            statusCode: 200,
            message: 'user were is returned successfully',
            payload: { user },
        });
    } catch (error) {
        next(error);
    }
};

const handleDeleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        await deleteUserById(id, options);
        return successResponse(res, {
            statusCode: 200,
            message: 'user was is deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

const handleProcessRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const image = req.file;

        if (image && image.size > 1024 * 1024 * 2) {
            throw createError(400, 'File too large, it must be less than 2 MB');
        }

        // const imageBufferString = image.buffer.toString('base64');

        const userExist = await checkUserExists(email);
        if (userExist) {
            throw createError(
                409,
                'User with this email already exist please sign in'
            );
        }

        // create jwt

        const tokenPayload = {
            name,
            email,
            password,
            phone,
            address,
        };

        if (image) {
            tokenPayload.image = image.path;
        }
        const token = createJSONWebToken(tokenPayload, jwtActivationKey, '10m');

        // prepare email
        const emailData = {
            email,
            subject: 'Account Activation Email',
            html: `
                <h2> Hello ${name} ! </h2>
                <p> Please click here to link <a href="${clientURL}/api/users/activate/${token}">activate your account</a> </p>
            `,
        };

        // send email with nodemailer
        sendEmail(emailData);

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for completing your registration process`,
            payload: token,
        });
    } catch (error) {
        next(error);
    }
};

const handleActivateUserAccount = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) throw createError(404, 'Token not found!');

        try {
            const decoded = jwt.verify(token, jwtActivationKey);
            if (!decoded) throw createError(401, 'unable to verify user');

            const userExist = await User.exists({ email: decoded.email });
            if (userExist) {
                throw createError(409, 'User already exist please sign in');
            }

            const image = decoded.image;
            if (image) {
                const response = await cloudinary.uploader.upload(image, {
                    folder: 'ecommerceMern/users',
                });

                decoded.image = response.secure_url;
            }
            await User.create(decoded);

            return successResponse(res, {
                statusCode: 201,
                message: 'user was registered successfully',
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw createError(401, 'Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw createError(401, 'Invalid Token');
            } else {
                throw error;
            }
        }
    } catch (error) {
        next(error);
    }
};

const handleUpdateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updatedUser = await updateUserById(userId, req);

        return successResponse(res, {
            statusCode: 200,
            message: 'user was is updated successfully',
            payload: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

const handleManageUserStatusById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const action = req.body.action;

        const successMessage = await handleUserAction(userId, action);

        return successResponse(res, {
            statusCode: 200,
            message: successMessage,
        });
    } catch (error) {
        next(error);
    }
};

const handleUpdatePassword = async (req, res, next) => {
    try {
        // email, oldPassword, newPassword, confirmedPassword
        const { email, oldPassword, newPassword, confirmedPassword } = req.body;
        const userId = req.params.id;

        const updatedUser = await updateUserPasswordById(
            userId,
            email,
            oldPassword,
            newPassword,
            confirmedPassword
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'user was updated successfully',
            payload: { updatedUser },
        });
    } catch (error) {
        next(error);
    }
};

const handleForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const token = await forgetPasswordByEmail(email);

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for reseting your password`,
            payload: token,
        });
    } catch (error) {
        next(error);
    }
};

const handleResetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await resetPassword(token, password);

        return successResponse(res, {
            statusCode: 200,
            message: 'Password reset successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleGetUsers,
    handleGetUserId,
    handleDeleteUserById,
    handleProcessRegister,
    handleActivateUserAccount,
    handleUpdateUserById,
    handleManageUserStatusById,
    handleUpdatePassword,
    handleForgetPassword,
    handleResetPassword,
};
