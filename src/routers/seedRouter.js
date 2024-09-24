const express = require('express');
const { seedUser, seedProducts } = require('../controllers/seedController');
const {
    uploadUserImage,
    uploadProductImage,
} = require('../middleware/uploadFile');
const seedRouter = express.Router();

seedRouter.get('/users', uploadUserImage.single('image'), seedUser);
seedRouter.get('/products', uploadProductImage.single('image'), seedProducts);

module.exports = seedRouter;
