const express = require('express');
const {
    handleGetUsers,
    handleDeleteUserById,
    handleGetUserId,
    handleProcessRegister,
    handleActivateUserAccount,
    handleManageUserStatusById,
    handleUpdateUserById,
    handleUpdatePassword,
    handleForgetPassword,
    handleResetPassword,
} = require('../controllers/userController');
const { uploadUserImage } = require('../middleware/uploadFile');
const {
    validateUserRegistration,
    validateUserPasswordUpdate,
    validateUserForgetPassword,
    validateUserResetPassword,
} = require('../validators/auth');
const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middleware/auth');
const userRouter = express.Router();

// GET: api/users
userRouter.post(
    '/process-register',
    uploadUserImage.single('image'),
    isLoggedOut,
    validateUserRegistration,
    runValidation,
    handleProcessRegister
);
userRouter.post('/activate', isLoggedOut, handleActivateUserAccount);
userRouter.get('/', isLoggedIn, isAdmin, handleGetUsers);
userRouter.get('/:id([0-9a-fA-F]{24})', isLoggedIn, handleGetUserId);
userRouter.delete('/:id', isLoggedIn, handleDeleteUserById);
userRouter.put(
    '/reset-password',
    validateUserResetPassword,
    runValidation,
    handleResetPassword
);
userRouter.put(
    '/:id([0-9a-fA-F]{24})',
    uploadUserImage.single('image'),
    isLoggedIn,
    handleUpdateUserById
);

userRouter.put(
    '/manage-user/:id([0-9a-fA-F]{24})',
    isLoggedIn,
    isAdmin,
    handleManageUserStatusById
);

userRouter.put(
    '/update-password/:id',
    validateUserPasswordUpdate,
    runValidation,
    isLoggedIn,
    handleUpdatePassword
);

userRouter.post(
    '/forget-password',
    validateUserForgetPassword,
    runValidation,
    handleForgetPassword
);

module.exports = userRouter;
