import { useState, useEffect } from 'react';
import type { Question, QuestionsData, Level } from '../types';

/**
 * 問題データの管理を行うカスタムフック
 *
 * 機能：
 * - questions.jsonから問題データを読み込む
 * - ランダムに問題を出題する
 * - 現在の問題と難易度を管理する
 */
export function useQuestions() {
  // 全レベルの問題データ
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  // 選択中の難易度
  const [level, setLevel] = useState<Level>('beginner');
  // 現在表示中の問題
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // アプリ起動時に問題データを読み込む
  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data) => setQuestionsData(data))
      .catch((err) => console.error('Failed to load questions:', err));
  }, []);

  /**
   * ランダムに新しい問題を出題する
   */
  const generateQuestion = () => {
    if (!questionsData) return;

    // 選択中の難易度の問題リストを取得
    const questions = questionsData[level];
    // ランダムに1つ選ぶ
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
  };

  // 問題データ読み込み完了後、自動で1問目を出題
  useEffect(() => {
    if (questionsData && !currentQuestion) {
      generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsData]);

  return {
    questionsData,
    level,
    setLevel,
    currentQuestion,
    generateQuestion,
  };
}
