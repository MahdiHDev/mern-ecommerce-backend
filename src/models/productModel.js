const { Schema, model } = require('mongoose');
const { defaultImagePath } = require('../secret');

// name, slug, description, price, quantity, sold, shipping, image
const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            minLength: [
                3,
                'The length of the Product name can be minimum 3 charecter',
            ],
            maxLength: [
                150,
                'The length of the Product name can be minimum 150 charecter',
            ],
        },
        slug: {
            type: String,
            required: [true, 'Product slug is required'],
            lowercase: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
            minLength: [
                3,
                'The length of the Product description can be minimum 3 charecter',
            ],
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            trim: true,
            validate: {
                validator: (v) => v > 0,
                message: (props) =>
                    `${props.value} is not a valid price! price must be greater then 0`,
            },
        },
        quantity: {
            type: Number,
            required: [true, 'Product quantity is required'],
            trim: true,
            validate: {
                validator: (v) => v > 0,
                message: (props) =>
                    `${props.value} is not a valid quantity! quantity must be greater then 0`,
            },
        },
        sold: {
            type: Number,
            required: [true, 'sold quantity is required'],
            trim: true,
            default: 0,
        },
        shipping: {
            type: Number,
            default: 0, // shipping free = 0 or paid something amount
        },
        image: {
            type: String,
            default: defaultImagePath,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
    },
    { timestamps: true }
);

const Product = model('Product', productSchema);
module.exports = Product;
