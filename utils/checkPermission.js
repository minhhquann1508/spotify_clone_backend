const CustomError = require('../errors');

const checkPermission = (user, userId) => {
    if (user.role === 'admin') return;
    if (userId === user._id.toSting()) return;
    throw new CustomError.UnauthorizedError('You are not allowed to access this');
};

module.exports = checkPermission;