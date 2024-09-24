const createError = require('http-errors');
const slugify = require('slugify');
const { successResponse } = require('./responseController');

const { findWithId } = require('../services/findItem');

const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const Product = require('../models/productModel');
const { createProduct } = require('../services/productService');

const handleCreateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, shipping, category } =
            req.body;

        const image = req.file;
        if (image && image.size > 1024 * 1024 * 5) {
            throw createError(400, 'File too large, it must be less than 5 MB');
        }

        const productData = {
            name,
            description,
            price,
            category,
            quantity,
            shipping,
            image,
        };

        if (image) {
            productData.image = image.path;
        }

        const product = await createProduct(productData);

        return successResponse(res, {
            statusCode: 200,
            message: 'product was created successfully',
            payload: product,
        });
    } catch (error) {
        next(error);
    }
};

const handleGetProducts = async (req, res, next) => {
    try {
        const products = await Product.find({});

        return successResponse(res, {
            statusCode: 200,
            message: 'product was fetched successfully',
            payload: { products },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { handleCreateProduct, handleGetProducts };
