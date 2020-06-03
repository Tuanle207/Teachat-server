const mongoose = require('mongoose');
const messageSchema = require('./messageModel').schema;

const chatSchema = new mongoose.Schema({
    participants: {
        type: [mongoose.Types.ObjectId],
        validate: {
            validator: function(value) {
                return value.length === 2;
            },
            message: 'A chat can only have 2 participants!'
        },
        ref: 'user'
    },
    latestMessage: messageSchema
});

// Add additional static methods for Schema
chatSchema.statics.findAndPopulate = function(query) {
    return query.populate({
        path: 'participants',
        model: 'User'
    });
}

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
