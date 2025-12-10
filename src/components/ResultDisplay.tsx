interface ResultDisplayProps {
  transcribedText: string;     // 認識されたテキスト
  isCorrect: boolean | null;    // 正解かどうか（null: 未判定）
}

/**
 * 発音の結果を表示するコンポーネント
 *
 * 表示内容：
 * - 認識されたテキスト（文字数に応じてサイズ調整）
 * - 背景色で正解/不正解を表現
 */
export function ResultDisplay({ transcribedText, isCorrect }: ResultDisplayProps) {
  // テキストが無い場合は何も表示しない
  if (!transcribedText) return null;

  // 正解/不正解に応じた背景色とボーダー色
  const bgColor = isCorrect === true
    ? 'bg-green-50 border-green-200'
    : isCorrect === false
    ? 'bg-red-100 border-red-300'
    : 'bg-gray-50 border-gray-100';

  // 文字数に応じたフォントサイズを決定
  const textLength = transcribedText.length;
  const fontSize =
    textLength > 100 ? 'text-base sm:text-lg' :   // 100文字以上
    textLength > 60 ? 'text-lg sm:text-xl' :      // 60-100文字
    'text-xl sm:text-2xl';                        // 60文字以下

  return (
    <div className={`w-full max-w-lg mx-auto min-h-[100px] flex flex-col items-center justify-center text-center transition-all duration-300 rounded-2xl p-5 border ${bgColor}`}>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
        Your Speech
      </p>
      <p className={`${fontSize} font-bold text-gray-800 mb-2`}>
        "{transcribedText}"
      </p>
    </div>
  );
}
