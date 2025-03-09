const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    maxParticipants: { type: Number, required: true },
    pendingParticipants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 