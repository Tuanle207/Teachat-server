const Message = require('../models/messageModel');
const FriendRequest = require('../models/friendRequestModel');

module.exports = io => socket => {
    socket.on('join', (data, callback) => {
        socket.join(data.idChat);
        // Broadcast message to the other participan.
        //io.to(data.idChat).emit(, {msg: 'Joined!'});
    });
    socket.on('sendMessage', (message, callback) => {
        socket.to(message.chat).emit('message', message);
        Message.create(message)
        .then(() => console.log('The message is successfully stored in DB!'))
        .catch(err => console.log(`ERROR: ${err}`));
    });

    socket.on('sendFriendRequest', (friendRequest, callback) => {
        socket.to(friendRequest.to).emit('friendRequest', friendRequest);
        FriendRequest.create(friendRequest)
        .then(() => console.log('The friend request is successfully stored in DB!'))
        .catch(err => console.log(`ERROR: ${err}`));
    });

    socket.on('disconnect', () => {
        //io.to().emit('message', {msg: 'left!'});
        console.log('User had left!!!');
    });
}