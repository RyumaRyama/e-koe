import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;  // 表示する問題
}

/**
 * 問題を表示するコンポーネント
 *
 * 表示内容：
 * - 英語の文章（文字数に応じてサイズ調整）
 * - 日本語訳
 */
export function QuestionCard({ question }: QuestionCardProps) {
  // 文字数に応じたフォントサイズを決定（より小さめに調整）
  const textLength = question.english.length;
  const fontSize =
    textLength > 100 ? 'text-base sm:text-lg' :   // 100文字以上
    textLength > 60 ? 'text-xl sm:text-2xl' :     // 60-100文字
    'text-2xl sm:text-3xl';                       // 60文字以下

  return (
    <div className="text-center w-full max-w-lg mx-auto">
      <h2 className={`${fontSize} font-black text-gray-800 mb-3 leading-tight select-none`}>
        {question.english}
      </h2>
      <p className="text-gray-400 font-bold text-xs sm:text-sm">
        {question.japanese}
      </p>
    </div>
  );
}
