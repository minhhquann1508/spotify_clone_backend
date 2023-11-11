const mongoose = require('mongoose');
const Song = require('./Song');

const songItem = mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    song: {
        type: mongoose.Types.ObjectId,
        ref: 'Song',
        required: true
    }
})

const AlbumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Album title is required']
    },
    thumbnail: {
        type: {
            id: String,
            url: String
        },
        required: [true, 'Album thumbnail is required']
    },
    desc: {
        type: String,
        maxlength: [200, 'Album description must be lower than 200 characters'],
        default: ''
    },
    list: [songItem],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created user is required']
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

AlbumSchema.path('list').default([]);

AlbumSchema.post('deleteOne', async function () {
    await Song.updateMany(
        { album: this._conditions._id },
        { album: null },
    )
});

module.exports = mongoose.model('Album', AlbumSchema);