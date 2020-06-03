const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    to: mongoose.Types.ObjectId
});

const FriendRequest = mongoose.model('friendRequest', friendRequestSchema);

module.exports = FriendRequest;