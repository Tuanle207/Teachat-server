const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    nickName: {
        type: String,
        require: [true, 'A user must have a nickNama'],
        unique: true
    },
    photo: {
        type: String,
        default: '/img/user.jpg'
    },
    name: {
        type: String,
        required: [true, 'A user must have a name']
    },
    password: {
        type: String,
        minlength: 8,
        select: false,
        required: [true, 'A user must have a password']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User must have to confirm password'],
        validate: {
            validator: function(value) {
                // console.log(value);
                // console.log(this);
                // console.log(this.password);
                return value === this.password;
            },
            message: 'Fail confirm password'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    friends: {
        type: [mongoose.Types.ObjectId],
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    passwordChangedAt: {
        type: Number,
        default: Date.now().valueOf() - 1000
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// Middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre('save', function(next) {
    if (this.isModified('password') && !this.isNew) {
        this.passwordChangedAt = Date.now().valueOf() - 1000;
    }
    next();
});
userSchema.pre(/^find/, function(next) {
    this.select('email nickName name photo friends createAt');
    next();
});

// Add additional methods for documents
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.hasChangedPassword = function(tokenSignedTime) {
    // console.log(this);
    // console.log(this.passwordChangedAt);
    // console.log(tokenSignedTime);
    return this.passwordChangedAt > tokenSignedTime * 1000;
};

// Add additional static methods for Schema
userSchema.statics.findAndPopulate = function(query) {
    return query.populate('friends');
}

const User = mongoose.model('User', userSchema);
module.exports = User;
