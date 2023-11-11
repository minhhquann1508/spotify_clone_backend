const cloudinary = require('cloudinary').v2;

const uploadAudio = async (file) => {
    return cloudinary.uploader
        .upload(file.tempFilePath, {
            folder: 'spotify_mp3',
            use_filename: true,
            resource_type: 'video'
        });
};

module.exports = uploadAudio;