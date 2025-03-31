const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: String,
    messages: [{
        author: String,
        text: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Thread', threadSchema);
