import { useState } from 'react';

// 型定義
import type { Level } from './types';

// カスタムフック
import { useQuestions } from './hooks/useQuestions';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useTranscription } from './hooks/useTranscription';

// コンポーネント
import { QuestionCard } from './components/QuestionCard';
import { ResultDisplay } from './components/ResultDisplay';
import { ControlPanel } from './components/ControlPanel';

// ユーティリティ
import { compareTexts } from './utils/textComparison';

/**
 * メインのアプリコンポーネント
 *
 * このアプリの流れ：
 * 1. 難易度を選択して「出題」ボタンを押す
 * 2. 問題が表示される → お手本を聞く
 * 3. 「録音」ボタンで発音を録音
 * 4. 自動で音声認識が行われ、結果が表示される
 */
function App() {
  // 正解/不正解の状態
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 1. 問題管理
  const { questionsData, level, setLevel, currentQuestion, generateQuestion } = useQuestions();

  // 2. 音声録音
  const { isRecording, userAudioUrl, startRecording, stopRecording, resetAudio } =
    useAudioRecording();

  // 3. お手本音声再生
  const { speak, isSpeaking } = useSpeechSynthesis();

  // 4. 音声認識
  const { transcribedText, isProcessing, loadingStatus, isModelReady, transcribeAudio, resetTranscription } =
    useTranscription();

  /**
   * 新しい問題を出題する
   */
  const handleGenerateQuestion = () => {
    generateQuestion();
    resetTranscription();  // 前回の認識結果をクリア
    resetAudio();          // 前回の録音音声をクリア
    setIsCorrect(null);    // 前回の判定結果をクリア
  };

  /**
   * お手本音声を再生
   */
  const handlePlayAudio = () => {
    if (currentQuestion) {
      speak(currentQuestion.english, 1.0);
    }
  };

  /**
   * 録音開始/停止
   */
  const handleRecord = () => {
    if (isRecording) {
      // 録音停止
      stopRecording();
    } else {
      // 録音開始前に前回の判定結果をクリア
      setIsCorrect(null);
      resetTranscription();

      // 録音開始（録音完了後に音声認識を実行）
      startRecording(async (audioBlob) => {
        await transcribeAudio(audioBlob);

        // 音声認識結果を取得後、正解判定は useTranscription 内で transcribedText が更新された後に行う
      });
    }
  };

  /**
   * 音声認識結果が更新されたら、正解判定を行う
   */
  if (transcribedText && currentQuestion && isCorrect === null) {
    const correct = compareTexts(currentQuestion.english, transcribedText);
    setIsCorrect(correct);
  }

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col h-[750px] max-h-[90vh] relative">

        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h1 className="font-bold text-gray-700 flex items-center gap-2">
            <span className="material-icons-round text-blue-500">graphic_eq</span>
            Pronunciation
          </h1>
          <div className="relative">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="appearance-none bg-slate-100 border border-slate-200 text-gray-700 py-1.5 px-4 pr-8 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <span className="material-icons-round text-sm">expand_more</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto">
          {!currentQuestion ? (
            // 問題が無い時
            <div className="text-center space-y-4">
              <p className="text-gray-500 font-medium">難易度を選択して出題ボタンを押してください</p>
              {/* モデル読み込み状態を表示 */}
              {!isModelReady && loadingStatus && (
                <div className="text-sm text-blue-600 font-medium animate-pulse">
                  {loadingStatus}
                </div>
              )}
            </div>
          ) : (
            // 問題が出題されている時
            <>
              {/* 問題表示 */}
              <QuestionCard
                question={currentQuestion}
                onPlayAudio={handlePlayAudio}
                isSpeaking={isSpeaking}
              />

              {/* 結果表示 */}
              <ResultDisplay
                transcribedText={transcribedText}
                userAudioUrl={userAudioUrl}
                isCorrect={isCorrect}
              />

              {/* 処理中メッセージ */}
              {(isProcessing || isRecording || (!isModelReady && loadingStatus)) && (
                <div className="text-center text-sm text-gray-500 font-medium">
                  {isRecording ? '録音中...' : loadingStatus || '処理中...'}
                </div>
              )}
            </>
          )}
        </div>

        {/* 操作パネル */}
        <ControlPanel
          onGenerateQuestion={handleGenerateQuestion}
          onRecord={handleRecord}
          isRecording={isRecording}
          hasQuestion={!!currentQuestion}
          isProcessing={isProcessing}
          questionsLoaded={!!questionsData}
          userAudioUrl={userAudioUrl}
          isModelReady={isModelReady}
        />
      </div>
    </div>
  );
}

export default App;
