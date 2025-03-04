==================================================

本プロジェクトは、Github Copilot Agentのデモで作成したものです。
本番では使い物にならないのでご注意下さい。

==================================================

# 複式簿記帳簿管理システム

このプロジェクトは、複式簿記の原理に基づいた帳簿管理システムです。仕訳の登録、総勘定元帳の参照、試算表の生成などの機能を提供します。

## 必要なソフトウェア

このシステムを動かすには、以下のソフトウェアをインストールする必要があります。

1. **Node.js** - JavaScriptランタイム環境
2. **MongoDB** - データベース
3. **ウェブブラウザ** - Google Chrome, Firefox, Edge など

## インストール手順

### 1. Node.jsのインストール

1. [Node.jsの公式サイト](https://nodejs.org/)にアクセスします
2. 「LTS」バージョンをダウンロードします（安定版）
3. ダウンロードしたインストーラーを実行し、指示に従ってインストールを完了します
4. インストールを確認するため、コマンドプロンプトまたはターミナルを開き、以下のコマンドを実行します：
   ```
   node -v
   npm -v
   ```
   両方のコマンドがバージョン番号を表示すれば成功です

### 2. MongoDBのインストール

1. [MongoDBの公式サイト](https://www.mongodb.com/try/download/community)にアクセスします
2. Community Editionをダウンロードします
3. ダウンロードしたインストーラーを実行し、指示に従ってインストールします
   - 「Install MongoDB as a Service」のオプションを選択することをお勧めします
   - 「Install MongoDB Compass」のオプションも選択すると、GUIでデータベースを確認できます
4. インストール完了後、MongoDBサービスが自動的に起動します

### 3. プロジェクトのセットアップ

1. このプロジェクトをお好みの場所に展開します
2. コマンドプロンプトまたはターミナルを開き、プロジェクトのフォルダに移動します：
   ```
   cd path\to\project
   ```
3. 必要なパッケージをインストールします：
   ```
   npm install
   ```
   このコマンドは、package.jsonに記載された依存関係をすべてインストールします

## 起動方法

### ローカル環境での簡易実行方法

簡易に動作確認だけ行いたい場合は、以下の手順でHTMLファイルを直接ブラウザで開くことができます：

1. `index.html`ファイルをお好みのウェブブラウザで開きます
2. この方法では、APIサーバーは動作せず、ブラウザ上でデモデータを用いたシミュレーション動作となります
3. 入力したデータはブラウザのメモリ上にのみ保存され、ページを更新するとリセットされます

### サーバーモードでの実行方法（推奨）

本格的に使用する場合は、サーバーモードで動作させることをお勧めします：

1. コマンドプロンプトまたはターミナルでプロジェクトのフォルダに移動します
2. 以下のコマンドでサーバーを起動します：
   ```
   npm start
   ```
   このコマンドが動作しない場合は、以下のコマンドを試してください：
   ```
   node server.js
   ```
3. ターミナルに「Server running on port 5000」と表示されたら成功です
4. ウェブブラウザで `http://localhost:5000` にアクセスします

## パッケージが不足している場合

必要なパッケージがインストールされていない場合は、以下のコマンドを実行してください：

```
npm install express mongoose body-parser react react-dom react-bootstrap bootstrap axios
```

## 使い方

システムは次の4つの主要な機能を提供しています：

1. **仕訳帳** - 日々の取引を借方・貸方の形式で記録します
2. **総勘定元帳** - 特定の勘定科目に関連するすべての取引を確認できます
3. **試算表** - すべての勘定科目の残高をまとめて表示します
4. **勘定科目管理** - システムで使用する勘定科目の追加・編集ができます

### 新規仕訳の登録

1. 「仕訳帳」タブで「新規仕訳の登録」セクションを使用します
2. 日付、取引内容、伝票番号/参照を入力します
3. 借方と貸方の両方の科目と金額を入力します
   - 「行を追加」ボタンで必要に応じて行を増やせます
   - 借方と貸方の合計が一致する必要があります
4. 「仕訳を登録」ボタンをクリックして保存します

### トラブルシューティング

1. **MongoDBが接続できない場合**
   - MongoDBサービスが実行中か確認してください
   - コマンドプロンプトで `services.msc` を実行し、「MongoDB」サービスが実行中か確認します

2. **ブラウザでアプリが表示されない場合**
   - `http://localhost:5000` で正しくアクセスしているか確認してください
   - サーバーが実行中かターミナルで確認してください

3. **パッケージのインストールでエラーが発生する場合**
   - 管理者権限でコマンドプロンプトを実行してみてください
   - Nodeのバージョンが最新か確認してください

## 注意事項

- このシステムはローカルでの使用を前提としています
- 実運用には、セキュリティ対策やバックアップ機能の追加を検討してください
- 財務・税務の専門的なアドバイスは会計士や税理士にご相談ください

## ライセンス

このプロジェクトはMITライセンスのもとで公開されています。