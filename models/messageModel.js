const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Types.ObjectId,
        required: [true, 'A message must be included in a chat']
    },
    sender: {
        type: mongoose.Types.ObjectId,
        required: [true, 'A message must have a sender']
    },
    text: {
        type: String,
        required: [true, 'A message must have its own content']
    },
    sentAt: {
        type: Date,
        default: Date.now()
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
