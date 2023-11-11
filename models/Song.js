const mongoose = require('mongoose');
const Comment = require('./Comment');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song name is required']
    },
    artist: {
        type: String,
        required: [true, 'Artist name is required'],
    },
    composer: {
        type: String,
        required: [true, 'Composer name is required'],
    },
    songUrl: {
        type: {
            id: String,
            url: String
        },
        required: [true, 'Song URL is required']
    },
    thumbnail: {
        type: {
            id: String,
            url: String
        },
        required: [true, 'Song image is required']
    },
    category: {
        type: String,
        default: 'all'
    },
    listen: {
        type: Number,
        default: 0
    },
    lyrics: {
        type: String,
        default: ''
    },
    createBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created user is required']
    },
    album: {
        type: mongoose.Types.ObjectId,
        ref: 'Album',
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

SongSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'song',
    justOne: false
});

SongSchema.post('deleteOne', async function () {
    await Comment.deleteMany({ song: this._conditions._id });
})

module.exports = mongoose.model('Song', SongSchema);