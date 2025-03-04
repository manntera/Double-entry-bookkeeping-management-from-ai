/**
 * 日付をフォーマットする
 * @param {string|Date} date - フォーマットする日付
 * @returns {string} フォーマットされた日付文字列
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * 通貨をフォーマットする
 * @param {number} amount - フォーマットする金額
 * @returns {string} カンマ区切りの金額文字列
 */
export const formatCurrency = (amount) => {
    if (amount === 0) return '0';
    if (!amount) return '';

    return new Intl.NumberFormat('ja-JP').format(amount);
};
