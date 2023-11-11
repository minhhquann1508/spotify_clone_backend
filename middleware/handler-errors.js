const errorHandlerMiddleware = async (err, req, res, next) => {
    const customError = {
        msg: err.message || 'Something was wrong ! Please try again later',
        statusCode: err.statusCode || 500
    };
    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors).map((item) => item.message).join(',');
        customError.statusCode = 400;
    }
    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value`;
        customError.statusCode = 400;
    }
    if (err.name === 'CastError') {
        customError.msg = `No item found with id : ${err.value}`;
        customError.statusCode = 404;
    }
    res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;