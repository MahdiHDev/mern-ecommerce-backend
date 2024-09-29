const createError = require('http-errors');
const slugify = require('slugify');
const { successResponse } = require('./responseController');

const { findWithId } = require('../services/findItem');

const cloudinary = require('../config/cloudinary');

const { createJSONWebToken } = require('../Helper/jsonwebtoken');
const Product = require('../models/productModel');
const {
    createProduct,
    getProducts,
    getProductBySlug,
    deleteProductBySlug,
    updateProductById,
    updateProductBySlug,
} = require('../services/productService');

const handleCreateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, shipping, category } =
            req.body;

        const productData = {
            name,
            description,
            price,
            category,
            quantity,
            shipping,
        };

        const image = req.file.path;
        if (image) {
            const response = await cloudinary.uploader.upload(image, {
                folder: 'ecommerceMern/products',
            });

            productData.image = response.secure_url;
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
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const searchRegExp = new RegExp('.*' + search + '.*', 'i');
        const filter = {
            isAdmin: { $ne: true },
            $or: [
                { name: { $regex: searchRegExp } },
                { email: { $regex: searchRegExp } },
                { phone: { $regex: searchRegExp } },
            ],
        };

        const productsData = await getProducts(page, limit, filter);

        return successResponse(res, {
            statusCode: 200,
            message: 'returned all the products',
            payload: {
                products: productsData.products,
                pagination: {
                    totalPages: productsData.totalPages,
                    currentPage: page,
                    previousPage: page - 1,
                    nextPage: page + 1,
                    totalNumberOfProducts: productsData.count,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const handleGetProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await getProductBySlug(slug);
        return successResponse(res, {
            statusCode: 200,
            message: 'returned single product',
            payload: { product },
        });
    } catch (error) {
        next(error);
    }
};

const handleDeleteProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        await deleteProductBySlug(slug);
        return successResponse(res, {
            statusCode: 200,
            message: 'deleted single product',
        });
    } catch (error) {
        next(error);
    }
};

const handleUpdateProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const updatedProduct = await updateProductBySlug(slug, req);

        return successResponse(res, {
            statusCode: 200,
            message: 'product was is updated successfully',
            payload: updatedProduct,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleCreateProduct,
    handleGetProducts,
    handleGetProduct,
    handleDeleteProduct,
    handleUpdateProduct,
};
