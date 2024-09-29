const multer = require('multer');

const {
    ALLOWED_FILE_TYPE,
    MAX_FILE_SIZE,
    UPLOAD_USER_IMG_DIRECTORY,
    UPLOAD_PRODUCT_IMG_DIRECTORY,
} = require('../config');

const userStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, 'uploads/');
    // },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const productStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, UPLOAD_PRODUCT_IMG_DIRECTORY);
    // },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPE.includes(file.mimetype)) {
        return cb(new Error('File type is not allowed'), false);
    }
    cb(null, true);
};

const uploadUserImage = multer({
    storage: userStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
});
const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
});

module.exports = { uploadUserImage, uploadProductImage };

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//         return cb(new Error('Only image files are allowed'), false);
//     }
//     if (file.size > MAX_FILE_SIZE) {
//         return cb(new Error('File size exceeds the maximum limit'), false);
//     }
//     if (!ALLOWED_FILE_TYPE.includes(file.mimetype)) {
//         return cb(new Error('File type is not allowed'), false);
//     }
//     cb(null, true);
// };

// const upload = multer({
//     storage: storage,
//     fileFilter,
// });
