const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'User',
        required: [true, 'Created user is required']
    },
    song: {
        type: String,
        ref: 'Song',
        required: [true, 'Song is required']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [200, 'Max content length is lower than 200 characters']
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);