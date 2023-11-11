const sendEmail = require('./sendEmail');

const sendVerifyEmail = async ({
    name,
    email,
    verificationToken,
    origin
}) => {
    const verifyEmail = `${origin}/account/verify-email?token=${verificationToken}&email=${email}`;

    const message = `<p>Please confirm your email by click <a href="${verifyEmail}">this</a></p>`;

    return sendEmail({
        to: email,
        subject: 'Email Confirmation',
        html: `<h4>Hello ${name}</h4>
        ${message}`
    });
};

module.exports = sendVerifyEmail;