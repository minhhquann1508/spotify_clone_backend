const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    isValid: { type: Boolean, default: true },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: { type: String, required: true }
}, { timestamps: true });


module.exports = mongoose.model('Token', TokenSchema);