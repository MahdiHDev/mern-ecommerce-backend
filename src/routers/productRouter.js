const express = require('express');

const { uploadProductImage } = require('../middleware/uploadFile');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middleware/auth');
const {
    handleCreateProduct,
    handleGetProducts,
} = require('../controllers/productController');
const { validateProduct } = require('../validators/product');
const productRouter = express.Router();

// POST: api/products -> Create a produt
productRouter.post(
    '/',
    uploadProductImage.single('image'),
    validateProduct,
    runValidation,
    isLoggedIn,
    isAdmin,
    handleCreateProduct
);

productRouter.get('/', handleGetProducts);

module.exports = productRouter;
