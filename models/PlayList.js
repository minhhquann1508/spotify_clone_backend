const mongoose = require('mongoose');

const songItem = mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    thumbnail: { type: String, required: true },
    song: {
        type: mongoose.Types.ObjectId,
        ref: 'Song',
        required: true
    }
});

const PlayListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created user is required']
    },
    list: [songItem],
});

PlayListSchema.path('list').default([]);

module.exports = mongoose.model('Playlist', PlayListSchema);