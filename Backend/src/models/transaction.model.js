import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The sender account is required for the transaction!'],
        index: true
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The reciever account is required for the transaction!'],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required for the transaction'],
        min: [0, 'Amount cannot be negative!']
    },
    currency: {
        type: String,
        required: [true, 'Currency type is required for the transaction'],
        uppercase: true,
        match: [/^[A-Z]{3}$/, 'Currency must be a valid 3-letter ISO code!'],
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed', 'reversed'],
            message: 'Transaction status must be either pending, completed, failed, or reversed!',
        },
        default: 'pending'
    }
});