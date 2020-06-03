const messageRouter = require('express').Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');


messageRouter.get(
    '/get-unique-id',
    authController.protect,
    messageController.createMessageId
);

messageRouter.get(
    '/:chatId',
    authController.protect,
    messageController.getMessages
);

messageRouter.post(
    '/',
    authController.protect,
    messageController.createMessage
);
module.exports = messageRouter;
