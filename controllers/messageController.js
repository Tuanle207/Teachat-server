const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const Message = require('../models/messageModel');

exports.getMessages = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;

    if (!chatId) {
        return next(new AppError('A chat id must be provided!', 400));
    }

    const messages = await Message.find({ chat: chatId });
    // console.log(messages);

    res.status(200).json({
        status: 'success',
        messages
    });
});

exports.getLastestMessage = catchAsync(async (req, res, next) =>  {

    const { chatId } = req.params;

    if (!chatId) {
        return next(new AppError('A chat id must be provided!', 400));
    }

    const messages = await Message.find({ chat: chatId });
    // console.log(messages);

    res.status(200).json({
        status: 'success',
        messages
    });
})

exports.createMessage = catchAsync(async (req, res, next) => {
    const { chat, text } = req.body;
    const sender = req.user._id;
    console.log(chat, text, sender);
    if (!chat || !sender || !text) {
        return next(
            new AppError(
                'A message must include a chat id, a sender id, a message!',
                400
            )
        );
    }
    const message = await Message.create({ chat, sender, text });

    res.status(200).json({
        status: 'success',
        message
    });
});

exports.createMessageId = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        messageIdCreated: Message.createMongodbId()
    })
});