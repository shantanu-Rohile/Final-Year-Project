// // pages/QuizTest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import QuestionCard from "../../Components/QuestionCard";
import Leaderboard from "../../Components/Leaderboard";
import Lobby from "./CreateSession";
import {
  mockQuizData,
  mockPreviousUsers,
  currentUser,
  calculateCumulativeLeaderboard,
} from "../../utils/quizUtils";

const QuizTest = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const currentQuestion = mockQuizData.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === mockQuizData.questions.length - 1;

  const handleAnswer = (selectedOption, timeSpent, isCorrect) => {
    const answer = {
      questionId: currentQuestion.id,
      selectedOption,
      timeSpent,
      isCorrect,
    };

    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);

    // Show leaderboard after answering
    setTimeout(() => {
      setShowLeaderboard(true);
    }, 1000);
  };

  const handleNextQuestion = () => {
    setShowLeaderboard(false);

    if (isLastQuestion) {
      // Navigate to final leaderboard
      navigate("/final-leaderboard", {
        state: {
          userAnswers,
          quizData: mockQuizData,
          previousUsers: mockPreviousUsers,
        },
      });
    } else {
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleEndTest = () => {
    setShowEndConfirm(true);
  };

  const confirmEndTest = () => {
    navigate("/final-leaderboard", {
      state: {
        userAnswers,
        quizData: mockQuizData,
        previousUsers: mockPreviousUsers,
        incomplete: true,
      },
    });
  };

  const leaderboardData = calculateCumulativeLeaderboard(
    currentQuestion.id,
    mockPreviousUsers,
    userAnswers
  );

  return (
    <div
      className="min-h-screen p-4 relative"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header with End Test Button */}
      <motion.div
        className="fixed top-4 left-4 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={handleEndTest}
          className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: "#ef4444", color: "white" }}
        >
          <X className="w-5 h-5" />
          End Test
        </button>
      </motion.div>

      {/* Quiz Title */}
      <motion.div
        className="text-center mb-4 pt-7"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--txt)" }}>
          {mockQuizData.roomName}
        </h1>
        <p className="text-sm" style={{ color: "var(--txt-dim)" }}>
          Room ID: {mockQuizData.roomId}
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!showLeaderboard ? (
            <QuestionCard
              key={currentQuestionIndex}
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={mockQuizData.questions.length}
              onAnswer={handleAnswer}
            />
          ) : (
            <Leaderboard
              key={`leaderboard-${currentQuestionIndex}`}
              data={leaderboardData}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={mockQuizData.questions.length}
              onNext={handleNextQuestion}
            />
          )}
        </AnimatePresence>
      </div>

      {/* End Test Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
              style={{ backgroundColor: "var(--bg-sec)" }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--txt)" }}
                >
                  End Test Early?
                </h3>
              </div>

              <p className="mb-6 text-lg" style={{ color: "var(--txt-dim)" }}>
                You're on question {currentQuestionIndex + 1} of{" "}
                {mockQuizData.questions.length}. Are you sure you want to end
                the test now? Your progress will be saved.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "var(--bg-ter)",
                    color: "var(--txt)",
                  }}
                >
                  Continue Test
                </button>
                <button
                  onClick={confirmEndTest}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: "#ef4444", color: "white" }}
                >
                  End Test
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizTest;
