const cloudinary = require('cloudinary').v2;

const uploadImage = async (file) => {
    return cloudinary.uploader
        .upload(file.tempFilePath, {
            folder: 'spotify_thumbnail',
            use_filename: true
        });
};

module.exports = uploadImage;