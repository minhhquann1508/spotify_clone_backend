const CustomError = require('./custom-error');
const BadRequestError = require('./bad-request');
const NotFoundError = require('./not-found');
const UnauthenticatedError = require('./unauthenticated');
const UnauthorizedError = require('./unauthorized');

module.exports = {
    CustomError,
    BadRequestError,
    NotFoundError,
    UnauthenticatedError,
    UnauthorizedError
};