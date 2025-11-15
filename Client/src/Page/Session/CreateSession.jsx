import React, { useState } from "react";

export default function CreateSession() {
  const [questions, setQuestions] = useState([]);
  const [questionData, setQuestionData] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    timeLimit: 30,
    type: "MCQ",
    options: ["", "", ""],
    correctAnswer: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData({ ...questionData, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData({ ...questionData, options: newOptions });
  };

  const addOption = () => {
    setQuestionData({
      ...questionData,
      options: [...questionData.options, ""],
    });
  };

  const removeOption = (index) => {
    if (questionData.options.length <= 2) return;
    setQuestionData({
      ...questionData,
      options: questionData.options.filter((_, i) => i !== index),
    });
  };

  const addQuestion = () => {
    if (!questionData.title || !questionData.correctAnswer) return;
    setQuestions([...questions, questionData]);
    setQuestionData({
      title: "",
      description: "",
      difficulty: "Medium",
      timeLimit: 30,
      type: "MCQ",
      options: ["", "", ""],
      correctAnswer: "",
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const createRoom = () => {
    if (questions.length < 5) {
      alert("⚠️ You need at least 5 questions to create a room!");
      return;
    }
    alert(`✅ Room created successfully with ${questions.length} questions!`);
  };

  const difficultyBadge = (level) => {
    const colorMap = {
      Easy: "text-green-400",
      Medium: "text-yellow-400",
      Hard: "text-red-400",
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold ${colorMap[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--txt)] px-6 py-10 font-[Inter] ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 ml-[70px]">
        {/* LEFT PANEL */}
        <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-6 transition hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-6 text-[var(--txt)]">
            Question Settings
          </h2>

          {/* Title */}
          <div className="mb-4">
            <label className="text-sm text-[var(--txt-dim)] font-medium">
              Question Title
            </label>
            <input
              type="text"
              name="title"
              value={questionData.title}
              onChange={handleInputChange}
              placeholder="Enter question title..."
              className="w-full mt-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:ring-2 focus:ring-[var(--btn)] outline-none transition"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-sm text-[var(--txt-dim)] font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={questionData.description}
              onChange={handleInputChange}
              placeholder="Enter question description..."
              className="w-full mt-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:ring-2 focus:ring-[var(--btn)] outline-none resize-none transition"
              rows="3"
            />
          </div>

          {/* Difficulty & Type */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="flex-1">
              <label className="text-sm text-[var(--txt-dim)] font-medium">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={questionData.difficulty}
                onChange={handleInputChange}
                className="w-full mt-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] focus:ring-2 focus:ring-[var(--btn)] outline-none transition"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-[var(--txt-dim)] font-medium">
                Type
              </label>
              <select
                name="type"
                value={questionData.type}
                onChange={handleInputChange}
                className="w-full mt-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] focus:ring-2 focus:ring-[var(--btn)] outline-none transition"
              >
                <option value="MCQ">MCQ</option>
                <option value="True/False">True or False</option>
              </select>
            </div>
          </div>

          {/* Time Limit */}
          <div className="mb-5">
            <label className="text-sm text-[var(--txt-dim)] font-medium">
              Time Limit: {questionData.timeLimit}s
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={questionData.timeLimit}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  timeLimit: parseInt(e.target.value),
                })
              }
              className="w-full accent-[var(--btn)] mt-2"
            />
          </div>

          {/* Options */}
          {questionData.type === "MCQ" && (
            <div className="mb-5">
              <label className="text-sm text-[var(--txt-dim)] font-medium">
                Answer Options
              </label>
              {questionData.options.map((opt, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:ring-2 focus:ring-[var(--btn)] outline-none transition"
                  />
                  {questionData.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="ml-2 text-[var(--txt-dim)] hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                className="mt-2 text-sm text-[var(--btn)] font-medium hover:underline"
              >
                + Add Option
              </button>
            </div>
          )}

          {/* Correct Answer */}
          <div className="mb-5">
            <label className="text-sm text-[var(--txt-dim)] font-medium">
              Correct Answer
            </label>
            <input
              type="text"
              name="correctAnswer"
              value={questionData.correctAnswer}
              onChange={handleInputChange}
              placeholder="Enter correct answer..."
              className="w-full mt-1 p-2.5 rounded-[var(--radius)] bg-[var(--bg-ter)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:ring-2 focus:ring-[var(--btn)] outline-none transition"
            />
          </div>

          {/* Add Question */}
          <button
            onClick={addQuestion}
            className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white py-2.5 rounded-[var(--radius)] font-medium transition"
          >
            Add Question
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-6 transition hover:shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-6 text-[var(--txt)]">
              Questions Added in Queue
            </h2>

            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[var(--txt-dim)]">
                <div className="text-5xl mb-3">🕓</div>
                <p className="font-medium">No questions in queue yet.</p>
                <p className="text-sm text-[var(--txt-disabled)]">
                  Add questions using the form on the left.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--bg-ter)] hover:scrollbar-thumb-[var(--btn)]">
                {questions.map((q, index) => (
                  <li
                    key={index}
                    className="p-4 rounded-[var(--radius)] bg-[var(--bg-ter)] hover:bg-[color-mix(in srgb,var(--btn)_8%,transparent)] transition flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-[var(--txt)]">
                        {q.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {difficultyBadge(q.difficulty)}
                        <span className="text-xs text-[var(--txt-dim)]">
                          {q.timeLimit}s limit
                        </span>
                        <span className="text-xs text-[var(--btn)] font-medium">
                          {q.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Create Room Section */}
          <div className="mt-6 border-t border-[var(--bg-ter)] pt-5">
            <button
              onClick={createRoom}
              disabled={questions.length < 5}
              className={`w-full py-3 rounded-[var(--radius)] font-medium transition ${
                questions.length < 5
                  ? "bg-[var(--bg-ter)] text-[var(--txt-dim)] cursor-not-allowed"
                  : "bg-[var(--btn)] text-white hover:bg-[var(--btn-hover)] shadow-sm"
              }`}
            >
              {questions.length < 5
                ? `Add at least 5 Questions to Create Room`
                : `Create Room (${questions.length} Questions)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
