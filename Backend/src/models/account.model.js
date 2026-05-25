import mongoose from 'mongoose';
import ledgerModel from './ledger.model.js';

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Associated user is required for the account'],
        index: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        unique: true,
        match: [/^\d{11}$/, 'Account number must be exactly 11 digits!'],
        message: 'Account number must be exactly 11 digits!',
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'frozen', 'closed'],
            message: 'Account status must be either active, frozen, or closed!'
        },
        default: 'active'
    },
    currency: {
        type: String,
        required: [true, 'Currency type is required for the account'],
        uppercase: true,
        match: [/^[A-Z]{3}$/, 'Currency must be a valid 3-letter ISO code!'],
        default: 'PKR'
    }
}, { timestamps: true });

accountSchema.index({ user: 1, accountNumber: 1 });

accountSchema.methods.getBalance = async function() {
    const balanceAggregate = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        { $group: {
            _id: null,
            creditBal: {
                $sum: {
                    $cond: [
                        { $eq: ['$type', 'credit'] },
                        '$amount',
                        0
                    ]
                }
            },
            debitBal: {
                $sum: {
                    $cond: [
                        { $eq: ['$type', 'debit'] },
                        '$amount',
                        0
                    ]
                }
            }
        }},
        { $project: {
            _id: 0,
            balance: { $subtract: ['$creditBal', '$debitBal'] }
        }}
    ]);

    if (balanceAggregate.length === 0) {
        return 0;
    }

    return balanceAggregate[0].balance;
}

const accountModel = mongoose.model('Account', accountSchema);

export default accountModel;