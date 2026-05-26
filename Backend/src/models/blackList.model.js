import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema({
    token : {
        type: String,
        required: [true, 'Token is required'],
        unique: true,
        immutable: true
    },
    expiresAt: {
        type: Date,
        required: [true, 'Token expiration date is required'],
        expires: 0,
        immutable: true
    }
}, { timestamps: true });

const blackListModel = mongoose.model('BlackList', blackListSchema);

export default blackListModel;