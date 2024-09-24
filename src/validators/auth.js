const { body } = require('express-validator');
// registration validation
const validateUserRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 31 })
        .withMessage('Name should be atleast 3 to 31 charecters long'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should be atleast 6 charecters long'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 3 })
        .withMessage('Address should be atleast 3 charecters long'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('image').optional().isString().withMessage('Phone is required'),
    body('image').optional().isString().withMessage('User image is optional'),
];

const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should contain at least 6 charecter'),
];
const validateUserPasswordUpdate = [
    body('oldPassword')
        .trim()
        .notEmpty()
        .withMessage('Old Password is required, Enter your old password')
        .isLength({ min: 6 })
        .withMessage('Old Password should contain at least 6 charecter'),
    body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('New Password is required, Enter your New password')
        .isLength({ min: 6 })
        .withMessage('New Password should contain at least 6 charecter'),
    body('confirmedPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password did not match');
        }
        return true;
    }),
];

const validateUserForgetPassword = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
];

const validateUserResetPassword = [
    body('token').trim().notEmpty().withMessage('Token is missing.'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should contain at least 6 charecter'),
];

// sign in validation

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUserPasswordUpdate,
    validateUserForgetPassword,
    validateUserResetPassword,
};
