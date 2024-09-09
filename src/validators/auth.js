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

// sign in validation

module.exports = { validateUserRegistration };
