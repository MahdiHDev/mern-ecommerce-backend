const express = require('express');

const { uploadProductImage } = require('../middleware/uploadFile');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middleware/auth');
const {
    handleCreateProduct,
    handleGetProducts,
    handleGetProduct,
    handleDeleteProduct,
    handleUpdateProduct,
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

// GET -> /api/products -> get all products
productRouter.get('/', handleGetProducts);

// GET -> /api/products/:slug -> get single products
productRouter.get('/:slug', handleGetProduct);

// DELETE -> /api/products/:slug -> delete single products
productRouter.delete('/:slug', isLoggedIn, isAdmin, handleDeleteProduct);

// PUT -> /api/products/:slug -> update a single products
productRouter.put(
    '/:slug',
    uploadProductImage.single('image'),
    isLoggedIn,
    isAdmin,
    handleUpdateProduct
);

module.exports = productRouter;
