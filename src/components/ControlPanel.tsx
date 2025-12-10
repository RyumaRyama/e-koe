import { useState } from 'react';

interface ControlPanelProps {
  onGenerateQuestion: () => void;  // 問題を出題する処理
  onRecord: () => void;            // 録音開始/停止の処理
  onPlayAudio: () => void;         // お手本音声を再生する処理
  isRecording: boolean;            // 録音中かどうか
  hasQuestion: boolean;            // 問題が出題されているか
  isProcessing: boolean;           // 音声認識処理中かどうか
  questionsLoaded: boolean;        // 問題データが読み込まれているか
  userAudioUrl?: string;           // ユーザーの録音音声URL
  isModelReady: boolean;           // 音声認識モデルが準備完了か
  isSpeaking: boolean;             // お手本音声再生中かどうか
}

/**
 * 操作パネルのコンポーネント
 *
 * 機能：
 * - 問題の出題
 * - 録音の開始/停止
 * - お手本音声の再生
 */
export function ControlPanel({
  onGenerateQuestion,
  onRecord,
  onPlayAudio,
  isRecording,
  hasQuestion,
  isProcessing,
  questionsLoaded,
  userAudioUrl,
  isModelReady,
  isSpeaking,
}: ControlPanelProps) {
  const [isPlayingUserVoice, setIsPlayingUserVoice] = useState(false);

  // ユーザーの声を再生
  const handlePlayUserVoice = () => {
    if (!userAudioUrl) return;

    const audio = new Audio(userAudioUrl);
    setIsPlayingUserVoice(true);

    audio.onended = () => {
      setIsPlayingUserVoice(false);
    };

    audio.play();
  };

  return (
    <div className="px-4 py-4 bg-white border-t border-gray-50 pb-4 sm:pb-6 relative z-20">
      <div className="flex items-end justify-between max-w-sm mx-auto">

        {/* 左側: 自分の声を聞くボタン（上）とお手本を聞くボタン（下）を縦に配置 */}
        <div className="relative flex flex-col items-center justify-end gap-2 w-20">
          {/* 自分の声を聞くボタン（上） */}
          <button
            onClick={handlePlayUserVoice}
            disabled={!userAudioUrl}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200 ${
              isPlayingUserVoice
                ? 'bg-green-600 playing-pulse-green scale-105'
                : 'bg-green-500 shadow-green-200 hover:bg-green-600 active:scale-95'
            } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-green-500 disabled:active:scale-100`}
          >
            <span className="material-icons-round text-2xl">
              {isPlayingUserVoice ? 'graphic_eq' : 'person'}
            </span>
            <span className="text-[9px] font-bold mt-0.5">自分の声</span>
          </button>

          {/* お手本を聞くボタン（下） */}
          <button
            onClick={onPlayAudio}
            disabled={!hasQuestion}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200 ${
              isSpeaking
                ? 'bg-blue-600 playing-pulse-blue scale-105'
                : 'bg-blue-500 shadow-blue-200 hover:bg-blue-600 active:scale-95'
            } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-blue-500 disabled:active:scale-100`}
          >
            <span className="material-icons-round text-2xl">
              {isSpeaking ? 'volume_up' : 'hearing'}
            </span>
            <span className="text-[9px] font-bold mt-0.5">お手本</span>
          </button>
        </div>

        {/* 中央: 録音ボタン */}
        <div className="flex flex-col items-center w-24">
          <button
            onClick={onRecord}
            disabled={!hasQuestion || isProcessing || !isModelReady}
            className={`relative w-20 h-20 flex items-center justify-center rounded-full text-white shadow-xl transition-all z-10 mb-1 ${
              isRecording
                ? 'bg-red-500 shadow-red-200 recording-pulse'
                : 'bg-blue-500 shadow-blue-200 hover:shadow-blue-300 hover:bg-blue-600 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="material-icons-round text-4xl">
              {isRecording ? 'stop' : 'mic'}
            </span>
          </button>
          <span className={`text-[10px] font-bold ${isRecording ? 'text-red-500' : 'text-gray-500'}`}>
            {isRecording ? '録音停止' : !isModelReady ? 'モデル準備中...' : 'タップで録音'}
          </span>
        </div>

        {/* 右側: 次へ進むボタン */}
        <div className="flex flex-col items-center justify-end w-20">
          <button
            onClick={onGenerateQuestion}
            disabled={!questionsLoaded}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-gray-600 active:scale-95 transition-all group mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons-round text-3xl group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          <span className="text-[10px] font-bold text-gray-500">次へ進む</span>
        </div>

      </div>
    </div>
  );
}
