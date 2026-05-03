// client/src/components/QuestionCard.jsx
import { useState } from "react";
import { Plus, X, Info } from "lucide-react";

const QuestionCard = ({
  question,
  onToggle,
  isSelected,
  showOrder = false,
  order,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) =>
    type === "MCQ"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";

  const truncateText = (text, maxLength = 70) =>
    text?.length > maxLength ? text.slice(0, maxLength) + "…" : text;

  return (
    <div
      className="relative bg-[var(--bg-ter)] border border-black/5 rounded-lg p-4
                 hover:shadow-sm transition"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Order number (Quiz Queue) */}
      {showOrder && (
        <div
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full
                        bg-blue-600 text-white text-xs font-bold
                        flex items-center justify-center shadow"
        >
          {order}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(
              question.difficulty,
            )}`}
          >
            {question.difficulty}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(
              question.type,
            )}`}
          >
            {question.type}
          </span>
        </div>

        {/* Add / Remove */}
        <button
          onClick={onToggle}
          title={isSelected ? "Remove from quiz" : "Add to quiz"}
          className={`p-1.5 rounded-full transition
            ${
              isSelected
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
        >
          {isSelected ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Question Preview */}
      <p className="text-sm font-medium text-[var(--txt)] leading-snug">
        {truncateText(question.question)}
      </p>

      {/* Hover Details (Elegant) */}
      {/* Hover Details (Dark + Light Safe) */}
      {showDetails && (
        <div
          className="absolute z-20 top-full left-0 mt-2 w-full max-w-md
               bg-[var(--bg-ter)]
               border border-black/10
               rounded-lg
               shadow-lg
               p-4"
        >
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--txt-dim)]">
            <Info size={12} />
            Question Details
          </div>

          <p className="text-sm text-[var(--txt)] mb-3">{question.question}</p>

          {/* MCQ Options */}
          {question.type === "MCQ" && question.options && (
            <div className="space-y-1">
              {question.options.map((opt, idx) => {
                const isCorrect = opt === question.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded text-sm
                ${
                  isCorrect
                    ? "bg-green-500/10 text-green-400 font-medium"
                    : "text-[var(--txt-dim)]"
                }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </div>
                );
              })}
            </div>
          )}

          {/* True / False */}
          {question.type === "TRUE/FALSE" && (
            <p className="text-sm text-[var(--txt-dim)]">
              Answer:{" "}
              <span className="font-semibold text-green-400">
                {question.correctAnswer}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
