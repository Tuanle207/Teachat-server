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

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const {requestId} = req.body;
    // Check if there is a friend request id in request.
    if (!requestId) {
        return next(new AppError('No friend request id provided!', 400));
    }
    const friendRequest = await FriendRequest.findById(requestId);
    
    // Check if there is friend request with that id available in DB?
    if (!friendRequest) {
        return next(new AppError(`Friend request with the id ${requestId} is not found!`), 404);
    }

    // Check if the user and the friend have already been friend?
    const user = await User.findById(userId);
    if (user.friends.includes(friendRequest.from._id)) {
        return next(new AppError('You both have already been friend before!', 400));
    }
    const friend = await User.findById(friendRequest.from._id);

    // Check if friend is still existing
    if (!friend) {
        await FriendRequest.findByIdAndDelete(requestId);
        return next(new AppError('User has sent friend request is no longer existing!', 404));
    }

    // Finally add each other to friend list.
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    await user.save();
    await friend.save();

    // Delete friend request from DB
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({
        status: 'success',
        data: friend._id
    });
});

exports.removeFriendRequest = catchAsync(async (req, res, next) => {
    const {requestId} = req.body;
    // Check if there is a friend request id in request.
    if (!requestId) {
        return next(new AppError('No friend request id provided!', 400));
    }
    const friendRequest = await FriendRequest.findById(requestId);
    
    // Check if there is friend request with that id available in DB?
    if (!friendRequest) {
        return next(new AppError(`Friend request with the id ${requestId} is not found!`), 404);
    }

    // Delete friend request from DB
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.unfriend = catchAsync(async (req, res, next) => {
    if (!req.body.friendId) {
        return next(new AppError('No friend id provided!', 400));
    }
    const {friendId} = req.body;
    // Delete friend id from user's friends and the same in reverse
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);
    if (!friend) {
        return next(new AppError('The person is no longer existing!', 404));
    }
    const userIndex = friend.friends.indexOf(req.user._id);
    const friendIndex = user.friends.indexOf(friendId);
    if (friendIndex <= -1 || userIndex <= -1) {
        return next(new AppError('You and this person are not friends!', 400));
    }
    await user.friends.splice(friendIndex, 1);
    await friend.friends.splice(userIndex, 1);

    res.status(200).json({
        status: 'success',
        data: null
    });
});