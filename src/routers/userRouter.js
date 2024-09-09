const express = require('express');
const {
    getUsers,
    deleteUserById,
    getUserById,
    processRegister,
    activateUserAccount,
    updateUserById,
} = require('../controllers/userController');
const uploadUserImage = require('../middleware/uploadFile');
const { validateUserRegistration } = require('../validators/auth');
const runValidation = require('../validators');
const userRouter = express.Router();

// GET: api/users
userRouter.post(
    '/process-register',
    // uploadUserImage.single('image'),
    // validateUserRegistration,
    // runValidation,
    // processRegister
    (req, res) => console.log('this is a process register route')
);
userRouter.post('/activate', activateUserAccount);
userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.delete('/:id', deleteUserById);
userRouter.put('/:id', uploadUserImage.single('image'), updateUserById);
module.exports = userRouter;
