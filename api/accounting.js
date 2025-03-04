const express = require('express');
const router = express.Router();
const { Account, JournalEntry } = require('../models/accounting');

// 勘定科目の取得
router.get('/accounts', async (req, res) => {
    try {
        const accounts = await Account.find().sort({ code: 1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 勘定科目の作成
router.post('/accounts', async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 仕訳の取得
router.get('/journal-entries', async (req, res) => {
    try {
        const journalEntries = await JournalEntry.find()
            .populate('entries.account')
            .sort({ date: -1, entryNo: -1 });
        res.json(journalEntries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 仕訳の作成
router.post('/journal-entries', async (req, res) => {
    try {
        // 最新のエントリ番号を取得
        const lastEntry = await JournalEntry.findOne().sort({ entryNo: -1 });
        const entryNo = lastEntry ? lastEntry.entryNo + 1 : 1;

        const journalEntry = new JournalEntry({
            ...req.body,
            entryNo,
            createdBy: req.user ? req.user._id : undefined
        });

        await journalEntry.save();
        res.status(201).json(journalEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 総勘定元帳の取得
router.get('/ledger/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const { startDate, endDate } = req.query;

        let query = { 'entries.account': accountId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const entries = await JournalEntry.find(query)
            .populate('entries.account')
            .sort({ date: 1, entryNo: 1 });

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 試算表の生成
router.get('/trial-balance', async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

        if (date) {
            query.date = { $lte: new Date(date) };
        }

        const journalEntries = await JournalEntry.find(query).populate('entries.account');
        const balances = {};

        journalEntries.forEach(entry => {
            entry.entries.forEach(line => {
                const accountId = line.account._id.toString();

                if (!balances[accountId]) {
                    balances[accountId] = {
                        account: line.account,
                        debit: 0,
                        credit: 0
                    };
                }

                balances[accountId].debit += line.debit;
                balances[accountId].credit += line.credit;
            });
        });

        const trialBalance = Object.values(balances).map(item => {
            // 勘定科目の種類に基づいて残高を計算
            const accountType = item.account.type;
            const balance = item.debit - item.credit;

            // 資産と費用は借方残高、負債、純資産、収益は貸方残高
            if ((accountType === '資産' || accountType === '費用')) {
                item.balance = balance;
            } else {
                item.balance = -balance;
            }

            return item;
        });

        res.json(trialBalance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
