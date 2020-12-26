const Message = require('../models/messageModel');
const FriendRequest = require('../models/friendRequestModel');
const mongoose = require('mongoose');

module.exports = io => socket => {
    // join chat between 2 user
    socket.on('join', (data, callback) => {
        socket.join(data.idChat);
        console.log('waiting for message');
        // Broadcast message to the other participan.
        //io.to(data.idChat).emit(, {msg: 'Joined!'});
    });
    // listen for sending message from a user to another
    socket.on('sendMessage', (message, callback) => {
        Message.create(message)
        .then((message) => {
            console.log('The message is successfully stored in DB!');
            socket.to(message.chat).emit('message', message);
        })
        .catch(err => console.log(`ERROR: ${err}`));
    });
    // join a room that contains a single user waiting for incomming friend request to hiself/herself
    socket.on('joinFriendRequest', (data, callback) => {
        socket.join(data.userId);
        console.log('waiting for request...');
    });
    // listen for sending friend request from a user to another
    socket.on('sendFriendRequest', (request, callback) => {
        FriendRequest.create(request)
        .then((request) => {
            console.log('The friend request is successfully stored in DB!');
            socket.to(request.to).emit('friendRequest', request);
        })
        .catch((err) => console.log(`ERROR: ${err}`));
    });
    // socket.on('sendFriendRequest', (friendRequest, callback) => {
    //     socket.to(friendRequest.to).emit('friendRequest', friendRequest);
    //     FriendRequest.create(friendRequest)
    //     .then(() => console.log('The friend request is successfully stored in DB!'))
    //     .catch(err => console.log(`ERROR: ${err}`));
    // });

    socket.on('disconnect', () => {
        //io.to().emit('message', {msg: 'left!'});
        console.log('User had left!!!');
    });
}