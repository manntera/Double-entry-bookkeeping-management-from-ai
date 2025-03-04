import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Card, Button, Form, Table, Alert, Row, Col } from 'react-bootstrap';
import { formatDate, formatCurrency } from '../utils/formatters';
import axios from 'axios';

const AccountingPage = () => {
    const [activeTab, setActiveTab] = useState('journal');
    const [accounts, setAccounts] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [trialBalance, setTrialBalance] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [newJournalEntry, setNewJournalEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        entries: [{ account: '', description: '', debit: 0, credit: 0 }]
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 勘定科目と仕訳データの取得
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, journalRes] = await Promise.all([
                    axios.get('/api/accounting/accounts'),
                    axios.get('/api/accounting/journal-entries')
                ]);
                setAccounts(accountsRes.data);
                setJournalEntries(journalRes.data);
            } catch (error) {
                setError('データの取得に失敗しました');
                console.error(error);
            }
        };

        fetchData();
    }, []);

    // 試算表データの取得
    useEffect(() => {
        if (activeTab === 'trial-balance') {
            fetchTrialBalance();
        }
    }, [activeTab]);

    // 元帳データの取得
    useEffect(() => {
        if (selectedAccount && activeTab === 'ledger') {
            fetchLedger(selectedAccount);
        }
    }, [selectedAccount, activeTab]);

    const fetchTrialBalance = async () => {
        try {
            const response = await axios.get('/api/accounting/trial-balance');
            setTrialBalance(response.data);
        } catch (error) {
            setError('試算表の取得に失敗しました');
            console.error(error);
        }
    };

    const fetchLedger = async (accountId) => {
        try {
            const response = await axios.get(`/api/accounting/ledger/${accountId}`);
            setLedgerEntries(response.data);
        } catch (error) {
            setError('元帳データの取得に失敗しました');
            console.error(error);
        }
    };

    // 仕訳入力のハンドリング
    const handleJournalEntryChange = (e) => {
        setNewJournalEntry({
            ...newJournalEntry,
            [e.target.name]: e.target.value
        });
    };

    const handleEntryLineChange = (index, field, value) => {
        const updatedEntries = [...newJournalEntry.entries];
        updatedEntries[index][field] = value;
        setNewJournalEntry({ ...newJournalEntry, entries: updatedEntries });
    };

    const addEntryLine = () => {
        setNewJournalEntry({
            ...newJournalEntry,
            entries: [...newJournalEntry.entries, { account: '', description: '', debit: 0, credit: 0 }]
        });
    };

    const removeEntryLine = (index) => {
        const updatedEntries = newJournalEntry.entries.filter((_, i) => i !== index);
        setNewJournalEntry({ ...newJournalEntry, entries: updatedEntries });
    };

    const validateJournalEntry = () => {
        // 借方と貸方の合計が一致するかチェック
        const totalDebit = newJournalEntry.entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
        const totalCredit = newJournalEntry.entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

        if (totalDebit !== totalCredit) {
            setError('借方と貸方の合計が一致しません');
            return false;
        }

        // 必須項目の入力チェック
        if (!newJournalEntry.description) {
            setError('取引内容を入力してください');
            return false;
        }

        // 各行のバリデーション
        for (const entry of newJournalEntry.entries) {
            if (!entry.account) {
                setError('すべての行に勘定科目を選択してください');
                return false;
            }

            if ((Number(entry.debit) === 0 && Number(entry.credit) === 0) ||
                (Number(entry.debit) > 0 && Number(entry.credit) > 0)) {
                setError('各行は借方か貸方のどちらか一方のみ入力してください');
                return false;
            }
        }

        return true;
    };

    const submitJournalEntry = async () => {
        if (!validateJournalEntry()) return;

        try {
            setError('');
            await axios.post('/api/accounting/journal-entries', newJournalEntry);

            // 成功メッセージの表示
            setSuccess('仕訳を登録しました');
            setTimeout(() => setSuccess(''), 3000);

            // フォームのリセット
            setNewJournalEntry({
                date: new Date().toISOString().split('T')[0],
                description: '',
                reference: '',
                entries: [{ account: '', description: '', debit: 0, credit: 0 }]
            });

            // 仕訳リストの再取得
            const response = await axios.get('/api/accounting/journal-entries');
            setJournalEntries(response.data);
        } catch (error) {
            setError('仕訳の登録に失敗しました: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container className="my-4">
            <h1 className="mb-4">会計システム</h1>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
            >
                <Tab eventKey="journal" title="仕訳帳">
                    <Card className="mb-4">
                        <Card.Header>新規仕訳の登録</Card.Header>
                        <Card.Body>
                            <Form>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>日付</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date"
                                                value={newJournalEntry.date}
                                                onChange={handleJournalEntryChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>取引内容</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="description"
                                                value={newJournalEntry.description}
                                                onChange={handleJournalEntryChange}
                                                placeholder="取引の内容を入力"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>伝票番号/参照</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="reference"
                                        value={newJournalEntry.reference}
                                        onChange={handleJournalEntryChange}
                                        placeholder="伝票番号等（任意）"
                                    />
                                </Form.Group>

                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>勘定科目</th>
                                            <th>摘要</th>
                                            <th>借方</th>
                                            <th>貸方</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newJournalEntry.entries.map((entry, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Form.Select
                                                        value={entry.account}
                                                        onChange={(e) => handleEntryLineChange(index, 'account', e.target.value)}
                                                    >
                                                        <option value="">科目を選択</option>
                                                        {accounts.map(account => (
                                                            <option key={account._id} value={account._id}>
                                                                {account.code} - {account.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        value={entry.description}
                                                        onChange={(e) => handleEntryLineChange(index, 'description', e.target.value)}
                                                        placeholder="摘要"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={entry.debit || ''}
                                                        onChange={(e) => handleEntryLineChange(index, 'debit', Number(e.target.value))}
                                                        min="0"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={entry.credit || ''}
                                                        onChange={(e) => handleEntryLineChange(index, 'credit', Number(e.target.value))}
                                                        min="0"
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => removeEntryLine(index)}
                                                        disabled={newJournalEntry.entries.length <= 1}
                                                    >
                                                        削除
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2" className="text-end">合計</td>
                                            <td>
                                                {formatCurrency(newJournalEntry.entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0))}
                                            </td>
                                            <td>
                                                {formatCurrency(newJournalEntry.entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0))}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </Table>

                                <div className="d-flex justify-content-between">
                                    <Button variant="secondary" onClick={addEntryLine}>
                                        行を追加
                                    </Button>
                                    <Button variant="primary" onClick={submitJournalEntry}>
                                        仕訳を登録
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>仕訳一覧</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>日付</th>
                                        <th>取引内容</th>
                                        <th>参照</th>
                                        <th>勘定科目</th>
                                        <th>摘要</th>
                                        <th>借方</th>
                                        <th>貸方</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journalEntries.map(entry => (
                                        <React.Fragment key={entry._id}>
                                            {entry.entries.map((line, lineIndex) => (
                                                <tr key={`${entry._id}-${lineIndex}`}>
                                                    {lineIndex === 0 ? (
                                                        <>
                                                            <td rowSpan={entry.entries.length}>{entry.entryNo}</td>
                                                            <td rowSpan={entry.entries.length}>{formatDate(entry.date)}</td>
                                                            <td rowSpan={entry.entries.length}>{entry.description}</td>
                                                            <td rowSpan={entry.entries.length}>{entry.reference}</td>
                                                        </>
                                                    ) : null}
                                                    <td>{line.account?.name}</td>
                                                    <td>{line.description}</td>
                                                    <td className="text-end">{line.debit > 0 ? formatCurrency(line.debit) : ''}</td>
                                                    <td className="text-end">{line.credit > 0 ? formatCurrency(line.credit) : ''}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="ledger" title="総勘定元帳">
                    <Card>
                        <Card.Header>総勘定元帳</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>勘定科目</Form.Label>
                                <Form.Select
                                    value={selectedAccount}
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                >
                                    <option value="">勘定科目を選択してください</option>
                                    {accounts.map(account => (
                                        <option key={account._id} value={account._id}>
                                            {account.code} - {account.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {selectedAccount && (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>日付</th>
                                            <th>取引内容</th>
                                            <th>伝票No.</th>
                                            <th>借方</th>
                                            <th>貸方</th>
                                            <th>残高</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerEntries.map(entry => {
                                            // 該当する勘定科目の行を見つける
                                            const line = entry.entries.find(line =>
                                                line.account._id === selectedAccount
                                            );

                                            if (!line) return null;

                                            return (
                                                <tr key={entry._id}>
                                                    <td>{formatDate(entry.date)}</td>
                                                    <td>{entry.description}</td>
                                                    <td>{entry.entryNo}</td>
                                                    <td className="text-end">{line.debit > 0 ? formatCurrency(line.debit) : ''}</td>
                                                    <td className="text-end">{line.credit > 0 ? formatCurrency(line.credit) : ''}</td>
                                                    <td className="text-end">
                                                        {/* 残高計算は本来累積で行うべきですが、簡略化のため省略しています */}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="trial-balance" title="試算表">
                    <Card>
                        <Card.Header>試算表</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>コード</th>
                                        <th>勘定科目</th>
                                        <th>借方合計</th>
                                        <th>貸方合計</th>
                                        <th>残高</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trialBalance.map(item => (
                                        <tr key={item.account._id}>
                                            <td>{item.account.code}</td>
                                            <td>{item.account.name}</td>
                                            <td className="text-end">{formatCurrency(item.debit)}</td>
                                            <td className="text-end">{formatCurrency(item.credit)}</td>
                                            <td className="text-end">{formatCurrency(Math.abs(item.balance))} {item.balance > 0 ? '借' : '貸'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold">合計</td>
                                        <td className="text-end fw-bold">
                                            {formatCurrency(trialBalance.reduce((sum, item) => sum + item.debit, 0))}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {formatCurrency(trialBalance.reduce((sum, item) => sum + item.credit, 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default AccountingPage;
