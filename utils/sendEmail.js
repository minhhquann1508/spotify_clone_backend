const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    return transporter.sendMail({
        from: '"Spotify" <spotifyvietnam@gmail.com>',
        to,
        subject,
        html
    });
};

module.exports = sendEmail;