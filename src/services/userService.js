const createError = require('http-errors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const { deleteImage } = require('../Helper/deleteImage');
const { findWithId } = require('./findItem');
const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const { jwtResetPasswordKey, clientURL } = require('../secret');
const emailWithNodeMailer = require('../Helper/email');
const jwt = require('jsonwebtoken');
const sendEmail = require('../Helper/sendEmail');
const publicIdWithoutExtensionFromUrl = require('../Helper/cloudinaryHelper');

const findUsers = async (search, limit, page) => {
    try {
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

        if (!users || users.length === 0)
            throw createError(404, 'no users found!');

        return {
            users,
            pagination: {
                totlaPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page - 1 > 0 ? page - 1 : null,
                nextPage:
                    page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
            },
        };
    } catch (error) {
        throw error;
    }
};

const findUserById = async (id, option = {}) => {
    try {
        const user = await User.findById(id, option);
        if (!user) throw createError(404, 'User not found');
        return user;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(404, 'Invalid Id');
        }
        throw error;
    }
};

const deleteUserById = async (id, option = {}) => {
    try {
        // const user = await User.findByIdAndDelete({
        //     _id: id,
        //     isAdmin: false,
        // });

        // if (user && user.image) {
        //     deleteImage(user.image);
        // }

        const existingUser = await User.findOne({
            _id: id,
        });

        if (existingUser && existingUser.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(
                existingUser.image
            );

            const { result } = await cloudinary.uploader.destroy(
                `ecommerceMern/${publicId}`
            );
            if (result !== 'ok') {
                throw new Error(
                    'User image was not deleted successfully from cloudinary. Please try again.'
                );
            }
        }
        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(404, 'Invalid Id');
        }
        throw error;
    }
};

const updateUserById = async (userId, req) => {
    try {
        const options = { password: 0 };
        const user = await findWithId(User, userId, options);

        if (!user) {
            throw createError(404, 'User not found');
        }

        const updateOptions = {
            new: true,
            runValidation: true,
            context: 'query',
        };
        let updates = {};
        const allowedFields = ['name', 'password', 'phone', 'address'];

        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            } else if (key === 'email') {
                throw createError(400, 'Email can not be updated');
            }
        }

        const image = req.file.path;
        if (image) {
            if (image.size > 1024 * 1024 * 2) {
                throw createError(
                    400,
                    'File to large. it might be less then 2 MB'
                );
            }
            const response = await cloudinary.uploader.upload(image, {
                folder: 'ecommerceMern/users',
            });
            updates.image = response.secure_url;
        }

        // delete updates.email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            updateOptions
        );

        if (!updatedUser) {
            throw createError(404, 'User with this id does not exist');
        }

        if (user.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(user.image);

            const { result } = await cloudinary.uploader.destroy(
                `ecommerceMern/products/${publicId}`
            );
            if (result !== 'ok') {
                throw new Error(
                    'User image was not deleted successfully from cloudinary. Please try again.'
                );
            }
        }

        return updatedUser;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(404, 'Invalid Id');
        }
        throw error;
    }
};

const updateUserPasswordById = async (
    userId,
    email,
    oldPassword,
    newPassword,
    confirmedPassword
) => {
    try {
        const user = await User.findOne({ email });

        if (newPassword !== confirmedPassword) {
            throw createError(
                400,
                'new password and confirmed password did not match'
            );
        }

        if (!user) {
            throw createError(404, 'user is not found with this email');
        }

        // compare the password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );
        if (!isPasswordMatch) {
            throw createError(400, 'old password is not correct');
        }

        // const filter = {userId};
        // const updates = {$set: {password: newPassword}}
        // const updateOptions = {new: true}
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        );

        if (!updatedUser) {
            throw createError(400, 'User was not updated successfully');
        }
        return updatedUser;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(404, 'Invalid Id');
        }
        throw error;
    }
};

const forgetPasswordByEmail = async (email) => {
    try {
        const userData = await User.findOne({ email });
        if (!userData) {
            throw createError(
                404,
                'Email is incorrect or you have not verified your email address. please register yourself first'
            );
        }

        // create jwt

        const tokenPayload = { email };

        const token = createJSONWebToken(
            tokenPayload,
            jwtResetPasswordKey,
            '10m'
        );

        // prepare email
        const emailData = {
            email,
            subject: 'Reset password Email',
            html: `
                <h2> Hello ${userData.name} ! </h2>
                <p> Please click here to link <a href="${clientURL}/api/users/reset-password/${token}">Reset your password</a> </p>
            `,
        };

        // send email with nodemailer
        sendEmail(emailData);
        return token;
    } catch (error) {
        throw error;
    }
};

const resetPassword = async (token, password) => {
    try {
        const decoded = jwt.verify(token, jwtResetPasswordKey);

        if (!decoded) {
            throw createError(400, 'Inavlid or expired token');
        }

        const filter = { email: decoded.email };
        const update = { password };
        const options = { new: true };
        const updatedUser = await User.findOneAndUpdate(
            filter,
            update,
            options
        ).select('-password');

        if (!updatedUser) {
            throw createError(400, 'Password reset failed');
        }
    } catch (error) {
        throw error;
    }
};

const handleUserAction = async (userId, action) => {
    try {
        let update;
        let successMessage;
        if (action === 'ban') {
            update = { isBanned: true };
            successMessage = 'User was banned successfully';
        } else if (action === 'unban') {
            update = { isBanned: false };
            successMessage = 'User was unbanned successfully';
        } else {
            throw createError(400, 'Invalid action. Use "ban" or "unban" ');
        }

        const updateOptions = {
            new: true,
            runValidation: true,
            context: 'query',
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            updateOptions
        ).select('-password');

        if (!updatedUser) {
            throw createError(400, 'User was not banned successfully');
        }
        return successMessage;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    handleUserAction,
    findUsers,
    findUserById,
    deleteUserById,
    updateUserById,
    updateUserPasswordById,
    forgetPasswordByEmail,
    resetPassword,
};
