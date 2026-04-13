const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err.message === 'Item not found') {
        statusCode = 404;
        message = err.message;
    } else if (err.message === 'Name is required') {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        error: {
            message: message,
        },
    });
};

module.exports = errorHandler;
