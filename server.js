const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const accountingRoutes = require('./api/accounting');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェアの設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/accounting-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// APIルート
app.use('/api/accounting', accountingRoutes);

// 初期データ作成（デモ用）
const { Account } = require('./models/accounting');
const createInitialAccounts = async () => {
    const count = await Account.countDocuments();
    if (count === 0) {
        // 基本的な勘定科目の作成
        const defaultAccounts = [
            { code: '1001', name: '現金', type: '資産', description: '手持ちの現金' },
            { code: '1002', name: '普通預金', type: '資産', description: '銀行預金' },
            { code: '2001', name: '買掛金', type: '負債', description: '仕入先への債務' },
            { code: '3001', name: '資本金', type: '純資産', description: '事業主の出資金' },
            { code: '4001', name: '売上', type: '収益', description: '商品・サービスの売上' },
            { code: '5001', name: '仕入', type: '費用', description: '商品の仕入' },
            { code: '5101', name: '家賃', type: '費用', description: '事務所・店舗の家賃' },
            { code: '5102', name: '水道光熱費', type: '費用', description: '水道・電気・ガス代' }
        ];

        try {
            await Account.insertMany(defaultAccounts);
            console.log('初期勘定科目データを作成しました');
        } catch (error) {
            console.error('初期データ作成エラー:', error);
        }
    }
};

// サーバー起動時に初期データ作成
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await createInitialAccounts();
});
