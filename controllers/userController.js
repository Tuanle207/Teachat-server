const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequestModel');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        message: 'success',
        data: { users }
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const { nickName } = req.params;
    if (!nickName) {
        return next(new AppError('No nickname provided!', 400)); //bad request
    }
    const user = await User.findOne({ nickName });
    if (!user) {
        return next(new AppError('No user found with the nickname!', 404));
    }
    res.status(200).json({
        message: 'success',
        data: {
            user
        }
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const { email, name, nickName, password, passwordConfirm } = req.body;
    if (!email || !name || !nickName || !password || !passwordConfirm) {
        return next(
            new AppError('You have to provide all required infomation!', 400)
        );
    }
    const newUser = new User({
        email,
        name,
        nickName,
        password,
        passwordConfirm
    });
    const user = await User.create(newUser);

    res.status(201).json({
        message: 'success',
        data: {
            user
        }
    });
});

exports.getFriendsList = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findAndPopulate(User.findById(id));
    const {friends} = user;
    // friends.map(friend => {

    // })
    
    res.status(200).json({
        status: 'success',
        data: friends
    })
});

exports.searchFriends = catchAsync(async (req, res, next) => {
    // Get username
    const {username} = req.query;
    const currentUsername = req.user.nickName;
    if (!username) return next(new AppError('No username provided for searching!', 400));
    
    // Find users from DB
    const users = await User.find({nickName: {$regex: `^${username}`, $options: 'i'}}).where('nickName').ne(currentUsername);

    // Find relationship
    const friendRequests = await Promise.all(
        users.map(user => FriendRequest.findOne({from: req.user._id, to: user._id})
    ));
    const usersResponse= users.map(el => {
        return {
            _id: el._id, 
            name: el.name,
            email: el.email,
            nickName: el.nickName
        };
    });
    for (let i = 0; i < users.length; i++) {
        usersResponse[i].friendRequested = friendRequests[i] !== null ? true : false;
    }

    // Send response
    res.status(200).json({
        status: 'success',
        data: usersResponse
    });
});

exports.addFriend = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const {friendId} = req.body;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    console.log(user.friends);

    if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await user.save();
    }
    if (!friend.friends.includes(id)) {
        friend.friends.push(id);
        await friend.save();
    }   
    console.log(user);
    console.log(friend);

    res.status(200).json({
        status: 'success',
        data: user
    })
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
    if (!req.body.friendId) {
        return next(new AppError('No friend id provided!', 400));
    }
    const friendRequest = new FriendRequest({from: req.user._id, to: req.body.friendId});
    await FriendRequest.create(friendRequest);

    res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.getFriendRequests = catchAsync(async (req, res, next) => {
    const friendRequests = await FriendRequest.find({to: req.user._id}).populate({path: 'from', model: 'User'});

    res.status(200).json({
        status: 'success',
        data: friendRequests
    });
});