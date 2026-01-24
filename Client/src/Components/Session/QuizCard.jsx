// client/src/components/QuizCard.jsx
import { getDifficultyColor } from "../../utils/quizHelpers";
import {
  HelpCircle,
  ListChecks,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const QuizCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  isAnswered,
}) => {
  const handleOptionClick = (option) => {
    if (!isAnswered) {
      onAnswerSelect(option);
    }
  };

  // For True/False questions
  const isTrueFalse = question.type === "TRUE/FALSE";
  const options = isTrueFalse ? ["True", "False"] : question.options;

  return (
    <div
      className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-8
               bg-[var(--bg-ter)] text-[var(--txt)]
               shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold
                     bg-[var(--bg-sec)] text-[var(--txt)]"
          >
            Question {questionNumber} / {totalQuestions}
          </span>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border
            ${getDifficultyColor(question.difficulty)}`}
          >
            {question.difficulty}
          </span>
        </div>

        <span
          className={`px-3 py-1 rounded-md text-xs font-medium
          ${
            isTrueFalse
              ? "bg-purple-500/10 text-purple-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {question.type}
        </span>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswered}
            className={`w-full p-5 rounded-xl border transition-all duration-200
            text-left
            ${
              isAnswered
                ? "cursor-not-allowed bg-[var(--bg-sec)] border-black/10"
                : "bg-[var(--bg-ter)] border-black/10 hover:border-[var(--btn)] hover:bg-[var(--bg-sec)] hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              {!isTrueFalse && (
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full
                           bg-[var(--bg-primary)]
                           flex items-center justify-center
                           font-bold text-sm"
                >
                  {String.fromCharCode(65 + index)}
                </span>
              )}

              <span className="text-lg font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Instruction */}
      {!isAnswered && (
        <div
          className="mt-6 p-4 rounded-lg border
                   bg-blue-500/10 border-blue-500/30"
        >
          <p className="text-sm flex items-center gap-2 text-blue-400">
            <AlertCircle size={18} />
            Click an option to submit your answer. The timer will stop
            automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
