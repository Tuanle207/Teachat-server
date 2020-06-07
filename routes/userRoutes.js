const userRouter = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Authentification
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post('/signup', authController.signup);
userRouter.patch(
    '/changePassword',
    authController.protect,
    authController.changePassword
);
userRouter.post('/checkLoggedIn', authController.checkLoggedIn);

// Get user info...
userRouter.get('/', authController.protect, userController.getAllUsers);
userRouter.post('/addFriend', authController.protect, userController.addFriend);
userRouter.get('/friends', authController.protect, userController.getFriendsList);
userRouter.get('/searchFriends', authController.protect, userController.searchFriends);
userRouter.patch('/unfriend', authController.protect, userController.unfriend);
userRouter.post('/friendRequest', authController.protect, userController.sendFriendRequest);
userRouter.get('/friendRequest', authController.protect, userController.getFriendRequests);
userRouter.patch('/friendRequest', authController.protect, userController.acceptFriendRequest);
userRouter.delete('/friendRequest', authController.protect, userController.removeFriendRequest);
// userRouter.get('/:nickName', userController.getUser);
userRouter.post('/', userController.createUser);
// Not implemented yet
userRouter.get('/resetPassword', authController.login);
userRouter.delete('/delete/:nickName', authController.deleleUser);
userRouter.get('/forgotPassword', authController.login);

module.exports = userRouter;
