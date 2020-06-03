const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
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



messageSchema.statics.createMongodbId = function(id) {
    if (id) {
        return new mongoose.Types.ObjectId(id);
    }
    return new mongoose.Types.ObjectId();
}

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
