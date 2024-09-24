const slugify = require('slugify');
const Product = require('../models/productModel');
const createHttpError = require('http-errors');

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

module.exports = { createProduct };
