const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({
    name,
    email,
    token,
    origin
}) => {
    const resetUrl = `${origin}/account/reset-password?email=${email}&token=${token}`;

    const message = `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`;

    return sendEmail({
        to: email,
        subject: `Reset password`,
        html: `<h4>Hello ${name}</h4>
        ${message}
        `
    });
};

module.exports = sendResetPasswordEmail;