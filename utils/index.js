const {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
} = require('./jwt');
const createToken = require('./createToken');
const sendVerifyEmail = require('./sendVerfiyEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const checkPermission = require('./checkPermission');
const uploadImage = require('./uploadImage');
const uploadAudio = require('./uploadAudio');
module.exports = {
    createToken,
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    sendVerifyEmail,
    sendResetPasswordEmail,
    checkPermission,
    uploadAudio,
    uploadImage
}