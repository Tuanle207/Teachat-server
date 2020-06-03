const sendErrorDev = (err, req, res) => {
    console.log('development error showing mode');
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
};

const sendErrorPro = (err, req, res) => {
    console.log('production error showing mode');
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            return res.status(500).json({
                status: 'Error',
                message: 'Something went wrong. Try again later!',
            });
        }
    } else {
        return res.status(500).json({
            status: 'Error',
            message: 'Something went wrong. Try again later!',
        });
    }
};

module.exports = (err, req, res, next) => {
    console.log(err);
    err.statusCode = err.statusCode || 500; //internal server error
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        sendErrorPro(err, req, res);
    }
};
