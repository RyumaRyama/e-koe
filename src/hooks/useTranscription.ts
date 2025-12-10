import { useState, useEffect, useRef } from 'react';

/**
 * 音声認識（Transcription）を管理するカスタムフック
 *
 * 機能：
 * - Web Workerを使って音声をテキストに変換
 * - Whisperモデルの読み込み状況を表示
 * - 認識結果を返す
 */
export function useTranscription() {
  // 認識されたテキスト
  const [transcribedText, setTranscribedText] = useState<string>('');
  // 処理中かどうか
  const [isProcessing, setIsProcessing] = useState(false);
  // モデル読み込み状況のメッセージ
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  // モデルが準備完了しているか
  const [isModelReady, setIsModelReady] = useState(false);

  // Web Workerのインスタンス（重い処理を別スレッドで実行）
  const workerRef = useRef<Worker | null>(null);

  // Workerを初期化
  useEffect(() => {
    // Workerを起動
    workerRef.current = new Worker(new URL('../worker.ts', import.meta.url), {
      type: 'module',
    });

    // Workerからのメッセージを受信
    workerRef.current.onmessage = (e) => {
      const { status, result, data } = e.data;

      if (status === 'loading') {
        // モデル読み込み中（シンプルなメッセージ）
        setLoadingStatus('モデル読み込み中');
      } else if (status === 'ready') {
        // モデル読み込み完了
        setIsModelReady(true);
        setLoadingStatus('');
      } else if (status === 'complete') {
        // 音声認識完了
        setTranscribedText(result.text);
        setLoadingStatus('');
        setIsProcessing(false);
      } else if (status === 'error') {
        // エラー発生
        console.error('Worker error:', data);
        alert(`音声認識に失敗しました: ${data}`);
        setLoadingStatus('');
        setIsProcessing(false);
      }
    };

    // モデルの事前読み込みを開始
    workerRef.current.postMessage({ type: 'preload' });

    // クリーンアップ：コンポーネントが削除される時にWorkerを終了
    return () => workerRef.current?.terminate();
  }, []);

  /**
   * 音声データを文字に変換する
   * @param audioBlob - 録音した音声データ
   */
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setLoadingStatus('音声を処理中...');

    try {
      // WebM形式を16kHz WAV形式に変換（Whisperモデルが要求する形式）
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // モノラル音声データを取得
      const audioData = audioBuffer.getChannelData(0);

      // Workerに音声データを送信して認識開始
      workerRef.current?.postMessage({ type: 'transcribe', audio: audioData });
    } catch (err) {
      console.error('Transcription error:', err);
      alert('音声認識に失敗しました');
      setIsProcessing(false);
      setLoadingStatus('');
    }
  };

  /**
   * 認識結果をリセット
   */
  const resetTranscription = () => {
    setTranscribedText('');
  };

  return {
    transcribedText,
    isProcessing,
    loadingStatus,
    isModelReady,
    transcribeAudio,
    resetTranscription,
  };
}
