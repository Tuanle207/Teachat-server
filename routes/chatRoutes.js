const chatRouter = require('express').Router();
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

// //chatRouter.get('/', authController.protect, chatController.getChat);
// chatRouter.get('/', authController.protect, chatController.findChats);
chatRouter.get('/', authController.protect, chatController.getChats);
chatRouter.post('/', authController.protect, chatController.createChat);


module.exports = chatRouter;
