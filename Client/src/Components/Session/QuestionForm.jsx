// client/src/components/QuestionForm.jsx
import { useState } from "react";
import axios from "axios";
import { Sparkles, SlidersHorizontal } from "lucide-react";

const QuestionForm = ({
  onQuestionsGenerated,
  isLoading,
  setIsLoading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
  });

  const [manualQuestion, setManualQuestion] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
  });

  const difficulties = ["Easy", "Medium", "Hard"];

  const handleDifficultyToggle = (level) => {
    setFormData((prev) => ({
      ...prev,
      difficulty: level,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.difficulty) {
      alert(
        "Please enter a title and select one difficulty level"
      );
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onQuestionsGenerated(response.data.questions);

        setFormData({
          title: "",
          description: "",
          difficulty: "",
        });
      } else {
        alert(
          response.data.error || "Failed to generate questions"
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert(
        error.response?.data?.error ||
          "Failed to generate questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (
      !manualQuestion.question ||
      !manualQuestion.optionA ||
      !manualQuestion.optionB ||
      !manualQuestion.optionC ||
      !manualQuestion.optionD ||
      !manualQuestion.correctAnswer
    ) {
      alert("Please fill all fields");
      return;
    }

    const options = [
      manualQuestion.optionA,
      manualQuestion.optionB,
      manualQuestion.optionC,
      manualQuestion.optionD,
    ];

    const answer =
      manualQuestion.correctAnswer === "A"
        ? manualQuestion.optionA
        : manualQuestion.correctAnswer === "B"
        ? manualQuestion.optionB
        : manualQuestion.correctAnswer === "C"
        ? manualQuestion.optionC
        : manualQuestion.optionD;

        const question = {
          question: manualQuestion.question,
          options: [
            manualQuestion.optionA,
            manualQuestion.optionB,
            manualQuestion.optionC,
            manualQuestion.optionD,
          ],
        
          correctAnswer:
            manualQuestion.correctAnswer === "A"
              ? manualQuestion.optionA
              : manualQuestion.correctAnswer === "B"
              ? manualQuestion.optionB
              : manualQuestion.correctAnswer === "C"
              ? manualQuestion.optionC
              : manualQuestion.optionD,
        
          difficulty: "Easy", // or allow user to choose
          type: "MCQ",         // use whatever your schema expects
        };

    onQuestionsGenerated([question]);

    setManualQuestion({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "",
    });
  };

  return (
    <div className="bg-[var(--bg-ter)] rounded-lg border border-black/5 p-5">
      {/* Header */}
      <div className="flex items-start gap-2 mb-5">
        <Sparkles
          size={18}
          className="mt-1 text-[var(--btn)]"
        />
        <div>
          <h3 className="text-sm font-semibold text-[var(--txt)]">
            Generate Questions
          </h3>
          <p className="text-xs text-[var(--txt-dim)]">
            AI will create questions based on your input
          </p>
        </div>
      </div>

      {/* AI Question Generator */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Topic */}
        <div>
          <label className="block text-xs font-medium text-[var(--txt-dim)] mb-1">
            Topic / Title{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            placeholder="e.g. JavaScript Array Methods"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[var(--txt-dim)] mb-1">
            Description{" "}
            <span className="text-[var(--txt-disabled)]">
              (optional)
            </span>
          </label>

          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Extra context, syllabus focus, etc."
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
          />
        </div>

        {/* Difficulty */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={14} />
            <span className="text-xs font-medium text-[var(--txt-dim)]">
              Difficulty Level{" "}
              <span className="text-red-500">*</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((level) => {
              const active =
                formData.difficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleDifficultyToggle(level)
                  }
                  className={`px-2 py-2 rounded-md text-xs font-medium transition border
                    ${
                      active
                        ? "bg-[var(--btn)] text-white border-[var(--btn)]"
                        : "bg-[var(--bg-sec)] text-[var(--txt-dim)] border-black/10 hover:bg-[var(--bg-primary)]"
                    }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 px-4 py-2.5 rounded-md bg-[var(--btn)] text-white text-sm font-medium hover:bg-[var(--btn-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
              Generating...
            </>
          ) : (
            "Generate Questions"
          )}
        </button>
      </form>

      {/* Manual Question Section */}
      <hr className="my-6" />

      <h3 className="text-sm font-semibold mb-4 text-[var(--txt)]">
        Add Manual Question
      </h3>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Question"
          value={manualQuestion.question}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              question: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        />

        <input
          type="text"
          placeholder="Option A"
          value={manualQuestion.optionA}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              optionA: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        />

        <input
          type="text"
          placeholder="Option B"
          value={manualQuestion.optionB}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              optionB: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        />

        <input
          type="text"
          placeholder="Option C"
          value={manualQuestion.optionC}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              optionC: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        />

        <input
          type="text"
          placeholder="Option D"
          value={manualQuestion.optionD}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              optionD: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        />

        <select
          value={manualQuestion.correctAnswer}
          onChange={(e) =>
            setManualQuestion({
              ...manualQuestion,
              correctAnswer: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-md border border-black/10 bg-[var(--bg-sec)]"
        >
          <option value="">Select Correct Answer</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>

        <button
          type="button"
          onClick={handleAddManualQuestion}
          className="w-full px-4 py-2.5 rounded-md bg-[var(--btn)] text-white text-sm font-medium hover:bg-[var(--btn-hover)] transition"
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;
