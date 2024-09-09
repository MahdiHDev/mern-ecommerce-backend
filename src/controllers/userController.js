const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const mongoose = require('mongoose');
const { findWithId } = require('../services/findItem');
const { deleteImage } = require('../Helper/deleteImage');
const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const { jwtActivationKey, clientURL } = require('../secret');
const emailWithNodeMailer = require('../Helper/email');
const runValidation = require('../validators');

const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const searchRegExp = new RegExp('.*' + search + '.*', 'i');
        const filter = {
            isAdmin: { $ne: true },
            $or: [
                { name: { $regex: searchRegExp } },
                { email: { $regex: searchRegExp } },
                { phone: { $regex: searchRegExp } },
            ],
        };
        const options = { password: 0 };

        const users = await User.find(filter, options)
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await User.find(filter).countDocuments();

        if (!users) throw createError(404, 'no users found!');

        return successResponse(res, {
            statusCode: 200,
            message: 'users were is returned successfully',
            payload: {
                users,
                pagination: {
                    totlaPages: Math.ceil(count / limit),
                    currentPage: page,
                    previousPage: page - 1 > 0 ? page - 1 : null,
                    nextPage:
                        page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        const user = await findWithId(User, id, options);
        return successResponse(res, {
            statusCode: 200,
            message: 'user were is returned successfully',
            payload: { user },
        });
    } catch (error) {
        next(error);
    }
};

const deleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        const user = await findWithId(User, id, options);

        const userImagePath = user.image;

        deleteImage(userImagePath);

        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'user was is deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

const processRegister = async (req, res) => {
    console.log('hi');
    try {
        const { name, email, password, phone, address } = req.body;

        const image = req.file.path;
        if (image && image.size > 1024 * 1024 * 2) {
            throw createError(400, 'File too large, it must be less than 2 MB');
        }

        // const imageBufferString = image.buffer.toString('base64');

        const userExist = await User.exists({ email });
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
            tokenPayload.image = image;
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
        // try {
        //     emailWithNodeMailer(emailData);
        // } catch (emailError) {
        //     next(createError(500, 'Failed to send verification email'));
        //     return;
        // }

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for completing your registration process`,
            payload: { token },
        });
    } catch (error) {
        next(error);
    }
};

const activateUserAccount = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) throw createError(404, 'Token not found!');

        try {
            const decoded = jwt.verify(token, jwtActivationKey);
            if (!decoded) throw createError(401, 'unable to verify user');

            const userExist = await User.exists({ email: decoded.email });
            if (userExist) {
                throw createError(409, 'User already exist please login');
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

const updateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const options = { password: 0 };
        const user = await findWithId(User, userId, options);

        console.log(user);

        const updateOptions = {
            new: true,
            runValidation: true,
            context: 'query',
        };
        let updates = {};
        // name, email, password, phone, image, address

        for (let key in req.body) {
            if (['name', 'password', 'phone', 'address'].includes(key)) {
                updates[key] = req.body[key];
            } else if (['email'].includes(key)) {
                throw new Error('Email can not be updated');
            }
        }

        const image = req.file;
        if (image) {
            if (image.size > 1024 * 1024 * 2) {
                throw createError(
                    400,
                    'File to large. it might be less then 2 MB'
                );
            }
            updates.image = image;
            // user.image !== 'default.jpg' &&
        }

        // delete updates.email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            updateOptions
        ).select('-password');

        if (!updatedUser) {
            throw createError(404, 'User with this id does not exist');
        }
        return successResponse(res, {
            statusCode: 200,
            message: 'user was is updated successfully',
            payload: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    deleteUserById,
    processRegister,
    activateUserAccount,
    updateUserById,
};
