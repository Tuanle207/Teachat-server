const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

const compareDate = (chatA, chatB) => {
    if (!chatA.latestMessage && !chatB.latestMessage) {
        return 0;
    }
    if (!chatA.latestMessage) {
        return 1;
    }
    if (!chatB.latestMessage) {
        return -1;
    }
    const date1 = new Date(chatA.latestMessage.sentAt);
    const date2 = new Date(chatB.latestMessage.sentAt);
    if (date1 > date2) {
        return -1;
    }
    if (date1 < date2) {
        return 1;
    }
    return 0;
};

const findLastestMessages = async (res, chats) =>  {
    const messages = await Promise.all(
        chats.map(chat => {
            return Message.findOne({chat: chat._id}).sort('-sentAt')
        })
    )

    for (let i = 0; i < chats.length; i++) {
        chats[i].latestMessage = messages[i] !== null ? messages[i] : undefined;
    }



    res.status(200).json({
        status: 'success',
        chats: chats.sort(compareDate)
    });
};
exports.createChat = catchAsync(async (req, res, next) => {
    const { friendId } = req.body;
    if (!friendId) {
        return next(
            new AppError(
                "To create a new chat, it's required to have a friend id!",
                400
            )
        );
    }
    const userId = req.user._id;

    // Check if the friend user still exists
    const friendUser = User.findById(friendId);
    if (!friendUser) {
        return next(new AppError('No user found with the id!', 404));
    }
    // Create a new chat
    const newChat = new Chat({ participants: [userId, friendId] });
    const chat = await Chat.create(newChat);

    res.status(201).json({
        status: 'success',
        chat
    });
});

exports.findChats = catchAsync(async (req, res, next) => {

    const userId = req.user._id;
    // Find all friend ids with the keyword that user provided
    const {name} = req.query;
    if (!name) return next(new AppError('No name provided for searching!', 400));
    const friends = await User.find().where('name').regex(new RegExp(`^${name}$`, 'i')).select('-name -email -nickName');

    // Find all conresponding chat ids
    const chats = await Promise.all(
        friends.map((friend) => {
            return Chat.findAndPopulate(Chat.findOne().where('participants').all([
                friend._id,
                userId
            ]));
        } )
    )

    findLastestMessages(res, chats);

});

exports.getChats = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    if (req.query.name) {
        // Find all friend ids with the keyword that user provided
        const {name} = req.query;
        const keyword = name.split('-').join(' ');

        const populatedUser = await User.findAndPopulate(User.findOne(userId));
        const friends = populatedUser.friends;
        const friendsResult =  friends.filter(f => f.name.toLowerCase().startsWith(keyword.toLowerCase()));
        // Pagination here

        // Find all conresponding chat ids
        const chats = await Promise.all(
            friendsResult.map((friend) => {
                return Chat.findAndPopulate(Chat.findOne().where('participants').all([
                    friend._id,
                    userId
                ]));
            } )
        )
        console.log(chats);
        findLastestMessages(res, chats);
    } else {
        const chats = await Chat.findAndPopulate(Chat.find().where('participants').in([userId]));
        findLastestMessages(res, chats);
    }
    
});
