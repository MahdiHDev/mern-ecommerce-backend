const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            unique: true,
            minLength: [
                3,
                'The length of the Category name can be minimum 3 charecter',
            ],
        },
        slug: {
            type: String,
            required: [true, 'Category slug is required'],
            lowercase: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const Category = model('Category', categorySchema);
module.exports = Category;
