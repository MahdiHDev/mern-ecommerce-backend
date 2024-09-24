const fs = require('fs').promises;

const deleteImage = async (userImagePath) => {
    try {
        if (userImagePath !== 'public/images/users/default.jpg') {
            await fs.access(userImagePath);
            await fs.unlink(userImagePath);
        }
        console.log('user image was deleted');
    } catch (error) {
        console.error('user image does not exist');
    }
};
module.exports = { deleteImage };
