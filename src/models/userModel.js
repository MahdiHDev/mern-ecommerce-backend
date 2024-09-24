const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { defaultImagePath } = require('../secret');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
            minLength: [
                3,
                'The length of the username can be minimum 3 charecter',
            ],
            maxLength: [
                31,
                'The length of the username can be maximum 31 charecter',
            ],
        },
        email: {
            type: String,
            required: [true, 'User email is required'],
            trim: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(
                        v
                    );
                },
                message: 'Please enter a valid email',
            },
        },
        password: {
            type: String,
            required: [true, 'User password is required'],
            minLength: [
                6,
                'The length of the password can be minimum 6 charecter',
            ],
            set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
        },
        image: {
            type: String,
            required: [true, 'Product image is Required'],
        },
        address: {
            type: String,
            required: [true, 'User address is required'],
            minLength: [
                3,
                'The length of user address can be minimum 3 charecter',
            ],
        },
        phone: {
            type: String,
            required: [true, 'User phone is required'],
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const User = model('Users', userSchema);
module.exports = User;
