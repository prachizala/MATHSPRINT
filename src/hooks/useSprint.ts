import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Answer, Score } from '../types';
import { config } from '../constants/config';
import { SprintApi } from '../services/api/sprintApi';

interface UseSprintProps {
  questions: Question[];
  studentId: string;
  studentName: string;
  lobbyId: string;
  durationSeconds?: number;
  onSprintComplete?: (finalScore: Score) => void;
}

export const useSprint = ({
  questions,
  studentId,
  studentName,
  lobbyId,
  durationSeconds = config.sprintDurationSeconds,
  onSprintComplete,
}: UseSprintProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start sprint countdown
  const startSprint = useCallback(() => {
    setIsActive(true);
    setRemainingTime(durationSeconds);
    questionStartTimeRef.current = Date.now();
  }, [durationSeconds]);

  // Handle finish
  const finishSprint = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalAnswered = answers.length;
    const correctCount = answers.filter((a) => a.correct).length;
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    const totalTimeMs = answers.reduce((acc, a) => acc + a.responseTime, 0);
    const avgResponseTime = totalAnswered > 0 ? totalTimeMs / totalAnswered : 0;

    const finalScore: Score = {
      studentId,
      lobbyId,
      studentName,
      score,
      accuracy,
      streak,
      highestStreak,
      totalAnswered,
      correctCount,
      averageResponseTimeMs: Math.round(avgResponseTime),
    };

    onSprintComplete?.(finalScore);
  }, [answers, highestStreak, lobbyId, onSprintComplete, score, streak, studentId, studentName]);

  // Tick timer
  useEffect(() => {
    if (isActive && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            finishSprint();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isActive, remainingTime, finishSprint]);

  // Submit Answer for Current Question
  const submitAnswer = useCallback(
    async (selectedOption: string) => {
      if (!isActive || isCompleted) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      const responseTime = Date.now() - questionStartTimeRef.current;
      let isCorrect = currentQ.answer ? selectedOption === currentQ.answer : true;
      let pointsAwarded = 0;
      let newStreak = streak;

      try {
        const serverResult = await SprintApi.submitAnswer(lobbyId, {
          questionId: currentQ.questionId,
          selectedAnswer: selectedOption,
          responseTimeMs: responseTime,
        });
        isCorrect = serverResult.correct;
        pointsAwarded = serverResult.pointsAwarded;
        newStreak = serverResult.streak;
        setScore(serverResult.totalScore);
        setStreak(newStreak);
        if (newStreak > highestStreak) setHighestStreak(newStreak);
      } catch (err) {
        // Fallback local scoring if offline
        if (isCorrect) {
          newStreak += 1;
          pointsAwarded = config.pointsPerCorrectAnswer + newStreak * config.streakBonusMultiplier;
          setScore((prev) => prev + pointsAwarded);
          setStreak(newStreak);
          if (newStreak > highestStreak) setHighestStreak(newStreak);
        } else {
          newStreak = 0;
          setStreak(0);
        }
      }

      const answerRecord: Answer = {
        studentId,
        questionId: currentQ.questionId,
        answer: selectedOption,
        correct: isCorrect,
        timestamp: Date.now(),
        responseTime,
        pointsAwarded,
      };

      setAnswers((prev) => [...prev, answerRecord]);

      // Move to next question or loop if time remains
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
      } else {
        // Complete sprint
        finishSprint();
      }
    },
    [currentIndex, finishSprint, highestStreak, isActive, isCompleted, lobbyId, questions, streak, studentId]
  );

  return {
    currentQuestion: questions[currentIndex] || null,
    currentIndex,
    totalQuestions: questions.length,
    remainingTime,
    score,
    streak,
    highestStreak,
    isActive,
    isCompleted,
    answers,
    startSprint,
    submitAnswer,
    finishSprint,
  };
};
