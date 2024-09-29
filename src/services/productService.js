const slugify = require('slugify');
const Product = require('../models/productModel');
const createHttpError = require('http-errors');
const { deleteImage } = require('../Helper/deleteImage');
const publicIdWithoutExtensionFromUrl = require('../Helper/cloudinaryHelper');
const cloudinary = require('../config/cloudinary');

const createProduct = async (productData) => {
    const { name, description, price, quantity, shipping, category, image } =
        productData;

    const productExist = await Product.exists({ name });
    if (productExist) {
        throw createHttpError(409, 'Product with this email already exist.');
    }

    // create product
    const product = await Product.create({
        name,
        slug: slugify(name),
        description,
        price,
        quantity,
        shipping,
        category,
        image,
    });
    return product;
};

const getProducts = async (page = 1, limit = 4, filter = {}) => {
    const products = await Product.find(filter)
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (!products) throw createError(404, 'No products found');

    const count = await Product.find(filter).countDocuments();

    return { products, count, totalPages: Math.ceil(count / limit) };
};

const getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug }).populate('category');

    if (!product) throw createError(404, 'No products found');

    return product;
};

const deleteProductBySlug = async (slug) => {
    try {
        const existingProduct = await Product.findOne({ slug });

        if (!existingProduct) {
            throw Error('No products found');
        }
        if (existingProduct.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(
                existingProduct.image
            );

            const { result } = await cloudinary.uploader.destroy(
                `ecommerceMern/products/${publicId}`
            );
            if (result !== 'ok') {
                throw new Error(
                    'User image was not deleted successfully from cloudinary. Please try again.'
                );
            }
        }
        await Product.findOneAndDelete({ slug });
    } catch (error) {
        throw error;
    }
};

const updateProductBySlug = async (slug, req) => {
    try {
        const product = await Product.findOne({ slug });

        if (!product) {
            throw createError(404, 'Product not found!');
        }
        const updateOptions = {
            new: true,
            runValidation: true,
            context: 'query',
        };
        let updates = {};

        const allowedFields = [
            'name',
            'description',
            'price',
            'sold',
            'quantity',
            'shipping',
        ];

        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                if (key === 'name') {
                    updates.slug = slugify(req.body[key]);
                }
                updates[key] = req.body[key];
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
                folder: 'ecommerceMern/products',
            });
            updates.image = response.secure_url;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { slug },
            updates,
            updateOptions
        );

        if (!updatedProduct) {
            throw createError(404, 'updating product was not possible');
        }

        // delete the previous product image from cloudinary
        if (product.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(
                product.image
            );

            const { result } = await cloudinary.uploader.destroy(
                `ecommerceMern/products/${publicId}`
            );
            if (result !== 'ok') {
                throw new Error(
                    'User image was not deleted successfully from cloudinary. Please try again.'
                );
            }
        }
        return updatedProduct;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductBySlug,
    deleteProductBySlug,
    updateProductBySlug,
};
