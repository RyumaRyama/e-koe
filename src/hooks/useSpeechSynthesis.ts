import { useState, useEffect } from 'react';

/**
 * 英語の音声合成を管理するカスタムフック
 *
 * 機能：
 * - 英語のテキストを音声で読み上げる（お手本音声）
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // コンポーネントマウント時に音声リストをロード
  useEffect(() => {
    // 初回実行時に音声リストを取得（空配列対策）
    speechSynthesis.getVoices();

    // 音声リスト更新時のハンドラ
    const handleVoicesChanged = () => {
      speechSynthesis.getVoices();
    };

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  /**
   * 利用可能な英語の音声を取得する（品質優先・クロスプラットフォーム対応）
   */
  const getEnglishVoice = (): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();

    // 1. 候補の絞り込み: 英語系ボイスを全て抽出
    const englishVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase();
      return lang === 'en-us' || lang === 'en-gb' || lang.startsWith('en');
    });

    if (englishVoices.length === 0) {
      // 英語ボイスが見つからない場合は最終手段
      return voices.find(v => v.name.toLowerCase().includes('english')) || null;
    }

    // 2. Rank 1: 超高品質・AIボイス (Edge/iOS/macOS向け)
    const premiumVoice = englishVoices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('premium') ||
             name.includes('enhanced') ||
             name.includes('natural') ||
             name.includes('high quality');
    });
    if (premiumVoice) return premiumVoice;

    // 3. Rank 2: Google系ボイス (Android/Chrome向け)
    const googleVoice = englishVoices.find(v =>
      v.name.toLowerCase().includes('google')
    );
    if (googleVoice) return googleVoice;

    // 4. Rank 3: 定番の良質ボイス (iOS/macOSフォールバック)
    const classicVoice = englishVoices.find(v =>
      v.name === 'Samantha' || v.name === 'Daniel'
    );
    if (classicVoice) return classicVoice;

    // 5. Rank 4: 標準の英語ボイス (フォールバック)
    // まずen-USを探す
    const enUSVoice = englishVoices.find(v => v.lang.toLowerCase() === 'en-us');
    if (enUSVoice) return enUSVoice;

    // 最後の手段: リストの最初の英語ボイス
    return englishVoices[0] || null;
  };

  /**
   * 英語のテキストを音声で読み上げる
   * @param text - 読み上げる英語のテキスト
   */
  const speak = (text: string, rate: number) => {
    if (!text) return;

    // 既存の音声を停止
    speechSynthesis.cancel();

    // 音声合成の設定
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;  // 再生速度

    // 英語音声を取得して設定
    const englishVoice = getEnglishVoice();

    if (englishVoice) {
      // 音声が見つかった場合：voiceとlangの両方を設定
      utterance.voice = englishVoice;
      utterance.lang = englishVoice.lang;
    } else {
      // 音声が見つからない場合：langのみ設定
      utterance.lang = 'en-US';
      console.warn('English voice not found, using lang fallback');
    }

    // イベントリスナー
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // 音声を再生
    speechSynthesis.speak(utterance);
  };

  return {
    speak,
    isSpeaking,
  };
}
