const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const User = require('../models/userModel');



const signToken = id =>
    jwt.sign(
        {
            id: id || 'logout-code'
        },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES }
    );

const createAndSendToken = (user, statusCode, res) => {
    user = user || {};
    const token = signToken(user.id);
    const cookieOptions = {
        domain: 'localhost:3000',
        expires: new Date(user.id ? Date.now() + 24 * 3600000 : 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

//EXPORTED FUNCTION
exports.login = catchAsync(async (req, res, next) => {
    const { password, email } = req.body;
    console.log(req.body)
    if (!password || !email) {
        return next(
            new AppError('This action required email and password!', 400)
        );
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
   
    createAndSendToken(user, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
    const { email, name, nickName, password, passwordConfirm } = req.body;
    if (!email || !name || !nickName || !password || !passwordConfirm) {
        return next(
            new AppError('You have to provide all required infomation!', 400)
        );
    }

    const user = await User.create({
        email,
        name,
        nickName,
        password,
        passwordConfirm
    });

    createAndSendToken(user, 201, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    createAndSendToken(undefined, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { password, newPassword, newPasswordConfirm } = req.body;
    console.log(password, newPassword, newPasswordConfirm);
    const user = await User.findById(req.user.id).select('password');
    if (!password || !newPassword || !newPasswordConfirm) {
        return next(
            new AppError('You have provide all required information', 400)
        );
    }
    if (!(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect password', 401));
    }
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.save();

    res.status(200).json({
        status: 'success'
    });
    //createAndSendToken(updatedUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
            new AppError('You have to log in first to get access!', 401)
        );
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
    });

    // Check if user is still existing
    const user = await User.findById(decodedToken.id).select(
        'passwordChangedAt'
    );
    if (!user) {
        return next(new AppError('The user with the id does not exist!', 404));
    }

    // Check if user has already changed password recently
    if (user.hasChangedPassword(decodedToken.iat)) {
        return next(
            new AppError('The user has recently changed password!', 401)
        );
    }
    req.user = user;

    console.log('successful protected!');
    next();
});

exports.checkLoggedIn = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
            new AppError('You have to log in first to get access!', 401)
        );
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
    });

    // Check if user is still existing
    const user = await User.findById(decodedToken.id).select(
        'passwordChangedAt'
    );
    if (!user) {
        return next(new AppError('The user with the id does not exist!', 404));
    }

    // Check if user has already changed password recently
    if (user.hasChangedPassword(decodedToken.iat)) {
        return next(
            new AppError('The user has recently changed password!', 401)
        );
    }

    user.passwordChangedAt = undefined;

    console.log('You have already logged in!');
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.authorization = catchAsync(async (req, res, next) => {});

exports.forgotPassword = catchAsync(async (req, res, next) => {});
exports.resetPassword = catchAsync(async (req, res, next) => {});

exports.deleleUser = catchAsync(async (req, res, next) => {
    const { nickName } = req.params;
    await User.findOneAndDelete({ nickName });
    res.status(204).json({});
});
