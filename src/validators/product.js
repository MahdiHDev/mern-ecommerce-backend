const { body } = require('express-validator');

const validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Products name should be atleast 3-150 charecters long'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description name is required')
        .isLength({ min: 3 })
        .withMessage('description name should be atleast 3 charecters long'),
    body('price')
        .trim()
        .notEmpty()
        .withMessage('Price is required')
        .isLength({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('quantity')
        .trim()
        .notEmpty()
        .withMessage('Quantity is required')
        .isLength({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('image')
        .optional()
        .isString()
        .withMessage('Product image is optional'),
];

module.exports = { validateProduct };
