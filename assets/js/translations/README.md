# 🌐 Multi-Language Translation System

このディレクトリには多言語対応システムの翻訳データが含まれています。

## 📁 ファイル構造

```
translations/
├── common.json          # 共通翻訳データ（ナビ、フッター等）
├── page-example.html    # ページ固有翻訳の使用例
└── README.md           # このファイル
```

## 🔧 使用方法

### 1️⃣ 共通翻訳データ (common.json)

サイト全体で共通して使用される翻訳データ：
- ナビゲーションメニュー
- フッター
- 日付表示
- 共通ボタンテキスト

**編集例:**
```json
{
  "ja": {
    "nav": {
      "home": "ホーム",
      "career": "キャリア詳細"
    }
  },
  "en": {
    "nav": {
      "home": "Home", 
      "career": "Career Details"
    }
  }
}
```

### 2️⃣ ページ固有翻訳データ

大量のコンテンツがあるページでは、個別に翻訳データを設定：

**HTML内で定義:**
```html
<script>
window.pageTranslations = {
  ja: {
    // ページ固有の日本語翻訳
  },
  en: {
    // ページ固有の英語翻訳  
  }
};
</script>
```

### 3️⃣ HTML要素での使用

翻訳対象の要素に `data-i18n` 属性を追加：

```html
<h1 data-i18n="career.title">キャリア詳細</h1>
<p data-i18n="nav.home">ホーム</p>
```

## 🎯 実装戦略

### ✅ **現在の実装** (段階1)
- 共通部分: `common.json` で管理
- ページ固有: 各ページでインライン定義
- フォールバック機能: JSON読み込み失敗時の対応

### 🚀 **将来の拡張** (段階2以降)  
- ページ別JSONファイル: `career.json`, `projects.json`
- 動的翻訳読み込み: 必要時にfetch
- 翻訳キャッシュ: localStorage活用
- CSV/Excel連携: 非エンジニア向けの翻訳管理

## 📝 翻訳データ追加手順

1. **共通要素の場合:**
   - `common.json` を編集
   - HTMLに `data-i18n="key.subkey"` 追加

2. **ページ固有の場合:**
   - ページに `window.pageTranslations` 定義
   - HTMLに `data-i18n` 追加

3. **動作確認:**
   - ブラウザで言語切り替えをテスト
   - 開発者コンソールでエラー確認

## ⚠️ 注意点

- **JSONファイル**: 構文エラーに注意（コンマ、引用符）
- **キー名**: ドット記法 (`nav.home`) でネスト構造を表現  
- **フォールバック**: 必須翻訳はJS内にも重複保持
- **パフォーマンス**: 大きなページでは分割を検討

## 🔍 デバッグ

ブラウザの開発者コンソールで確認：
- `✅ Translations loaded from external file` → JSON読み込み成功
- `⚠️ External translations not found` → フォールバック使用
- `📄 Page-specific translations merged` → ページ翻訳マージ成功