const createHttpError = require('http-errors');
const emailWithNodeMailer = require('./email');

const sendEmail = (emailData) => {
    try {
        emailWithNodeMailer(emailData);
    } catch (emailError) {
        throw createHttpError(500, 'Failed to send verification email');
    }
};

module.exports = sendEmail;
