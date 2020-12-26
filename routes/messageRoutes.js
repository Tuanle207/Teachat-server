const messageRouter = require('express').Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');



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
