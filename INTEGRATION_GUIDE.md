# 英検4級アプリ 拡張機能 - 最終統合ガイド

## 実装完了した機能

✅ **復習モードの基本実装**
- `modules/review.js` - 間違えた問題の復習機能
- 全モジュールに間違い記録機能を追加済み
- LocalStorageに間違えた問題を保存

✅ **学習統計の実装**
- `modules/statistics.js` - 学習統計の表示
- カテゴリ別正答率
- 復習が必要な問題数の表示

✅ **UIの追加**
- 復習モードと統計画面のHTML追加済み
- クイックアクションボタン（ホーム画面）
- スタイルシート完全対応

## 残りの手動統合ステップ

### Step 1: スク リプトタグの追加

`index.html`の行213付近（`<script src="modules/mock-exam.js"></script>`の後）に以下を追加：

```html
<script src="modules/review.js"></script>
<script src="modules/statistics.js"></script>
```

### Step 2: app.jsのイベントリスナー追加

`app.js`のsetupEventListeners()メソッド内（行99の`});`の前）に以下を挿入：

```javascript
        // Review mode and statistics buttons
        document.getElementById('review-mode-btn').addEventListener('click', () => {
            this.showScreen('review-screen');
            ReviewModule.init('all');
        });

        document.getElementById('statistics-btn').addEventListener('click', () => {
            this.showScreen('statistics-screen');
            StatisticsModule.init();
        });

        document.getElementById('review-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
            this.renderHome();
        });

        document.getElementById('statistics-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });
```

### Step 3: 復習問題数の表示更新

`app.js`のrenderHome()メソッド内（day cardレンダリングの前）に以下を追加：

```javascript
        // Update review count
        const wrongAnswersStats = StorageManager.getWrongAnswersStats();
        const reviewCountEl = document.getElementById('review-count');
        if (reviewCountEl) {
            reviewCountEl.textContent = `${wrongAnswersStats.total}問`;
        }
```

## 動作確認

1. ブラウザで`http://localhost:8080`を開く
2. ホーム画面に「復習モード」と「学習統計」ボタンが表示されることを確認
3. いくつか問題を間違えて、復習モードに問題が表示されることを確認
4. 統計画面で進捗が表示されることを確認

## データ拡張について

### 単語データ (600語)の生成方法

`data/vocabulary.json`を拡張するには：

1. 英検4級公式頻出語彙リストを入手
2. `data/README_VOCABULARY.md`のPythonスクリプトを参考に生成
3. 各Day 60語 × 10日 = 600語を作成

### 文法・リスニング・読解の追加

同様に以下のファイルを拡張：
- `data/grammar.json` - 各Day 10問 × 10日 = 100問
- `data/listening.json` - Day 5-9で計50問
- `data/reading.json` - Day 7-9で計20パッセージ

## 完成した新機能

### 復習モード
- 間違えた問題のみを抽出
- カテゴリーフィルタリング可能
- 正解した問題は自動的にリストから削除

### 学習統計
- 全体進捗率
- カテゴリー別正答率
- 復習が必要な問題数
- 模擬試験履歴（最新3件）

## セキュリティ

すべての新機能は既存のセキュリティ基準を遵守：
- LocalStorage経由のデータ保存のみ
- 外部APIなし
- ユーザー入力のサニタイズ不要（選択肢のみ）

## 次のステップ

1. 上記の手動統合ステップを完了
2. ブラウザでテスト
3. データの拡張（別途実施）
4. 本番環境へのデプロイ
