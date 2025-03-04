const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 勘定科目スキーマ
const AccountSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['資産', '負債', '純資産', '収益', '費用'],
        required: true
    },
    description: String,
    isActive: { type: Boolean, default: true }
});

// 仕訳スキーマ
const JournalEntrySchema = new Schema({
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    reference: String,
    entryNo: { type: Number, required: true },
    entries: [{
        account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
        description: String,
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

// バリデーション: 借方と貸方の合計が一致することを確認
JournalEntrySchema.pre('save', function (next) {
    let totalDebit = 0;
    let totalCredit = 0;

    this.entries.forEach(entry => {
        totalDebit += entry.debit;
        totalCredit += entry.credit;
    });

    if (totalDebit !== totalCredit) {
        return next(new Error('仕訳の借方と貸方の合計が一致しません'));
    }

    this.updatedAt = Date.now();
    next();
});

const Account = mongoose.model('Account', AccountSchema);
const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

module.exports = {
    Account,
    JournalEntry
};
