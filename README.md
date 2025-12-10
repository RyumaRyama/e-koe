# Eリピ (e-repe)

英語の発音練習アプリ。音声合成でお手本を聞き、自分の発音を録音して音声認識で確認できます。

## 機能

- 難易度別の英語問題（Beginner / Elementary / Intermediate / Advanced）
- 音声合成によるお手本音声の再生
- マイクを使った発音の録音
- ブラウザ内で動作する音声認識（Whisper tiny）
- 発音の正誤判定

## 技術スタック

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Hugging Face Transformers.js (Whisper)
- Web Speech API

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## リポジトリ

https://github.com/RyumaRyama/e-repe
