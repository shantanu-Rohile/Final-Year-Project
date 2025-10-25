// components/QuestionCard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (answered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered]);

  const handleTimeOut = () => {
    if (!answered) {
      setAnswered(true);
      const timeSpent = 30;
      onAnswer(null, timeSpent, false);
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (answered) return;

    setSelectedOption(optionIndex);
    setAnswered(true);

    const timeSpent = 30 - timeLeft;
    const isCorrect = optionIndex === question.correctAnswer;

    setTimeout(() => {
      onAnswer(optionIndex, timeSpent, isCorrect);
    }, 500);
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return "text-green-400";
    if (timeLeft > 10) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Timer */}
      <motion.div
        className="flex justify-end mb-3"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTimerColor()} font-bold text-base`}
          style={{ backgroundColor: "var(--bg-sec)" }}
        >
          <Clock className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>
      </motion.div>

      {/* Question Card */}
      <div
        className="p-6 rounded-xl shadow-2xl"
        style={{
          backgroundColor: "var(--bg-sec)",
          boxShadow: `0 20px 60px rgba(var(--shadow-rgb), 0.3)`,
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Question Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "var(--bg-ter)", color: "var(--txt)" }}
            >
              Question {questionNumber} of {totalQuestions}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
              style={{
                backgroundColor:
                  question.difficulty === "easy"
                    ? "#10b981"
                    : question.difficulty === "medium"
                    ? "#f59e0b"
                    : "#ef4444",
                color: "white",
              }}
            >
              {question.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-bold" style={{ color: "var(--txt)" }}>
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={answered}
              className={`w-full p-3 rounded-lg text-left font-medium transition-all duration-300 ${
                answered && selectedOption === index
                  ? selectedOption === question.correctAnswer
                    ? "ring-2 ring-green-500"
                    : "ring-2 ring-red-500"
                  : ""
              }`}
              style={{
                backgroundColor:
                  answered && selectedOption === index
                    ? selectedOption === question.correctAnswer
                      ? "#10b98120"
                      : "#ef444420"
                    : "var(--bg-ter)",
                color: "var(--txt)",
                cursor: answered ? "not-allowed" : "pointer",
              }}
              whileHover={!answered ? { scale: 1.02, x: 10 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm"
                  style={{ backgroundColor: "var(--btn)", color: "white" }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Time Out Message */}
        <AnimatePresence>
          {timeLeft === 0 && !selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: "#ef444420", color: "#ef4444" }}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">
                Time's up! Moving to leaderboard...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
