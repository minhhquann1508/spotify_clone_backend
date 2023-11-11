const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name is required']
    },
    email: {
        type: String,
        required: [true, 'User email is required'],
        unique: [true, 'User email is unique']
    },
    avatar: {
        type: {
            url: String,
            id: String
        },
        default: {}
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['admin', 'artist', 'user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    artistRequest: {
        type: Boolean,
        default: false
    },
    verified: Date,
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpiresIn: Date
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);