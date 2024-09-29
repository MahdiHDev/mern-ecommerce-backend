const fs = require('fs').promises;

const deleteImage = async (userImagePath) => {
    try {
        if (userImagePath !== 'public/images/users/default.jpg') {
            await fs.access(userImagePath);
            await fs.unlink(userImagePath);
        }
        console.log('image was deleted');
    } catch (error) {
        throw error;
    }
};
module.exports = { deleteImage };
