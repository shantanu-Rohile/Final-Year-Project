import main from "../utils/gemini.js";
import { cleanGeminiResponse, cleanAsyncGeminiResponse } from "../utils/helper.js";

export const generateQuestions = async (req, res) => {
  try {
    const { title, description } = req.body;

    const difficultyArray = Array.isArray(req.body.difficulty)
      ? req.body.difficulty
      : req.body.difficulty
        ? [req.body.difficulty]
        : [];

    // Validation
    if (!title || difficultyArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    const difficultyText = difficultyArray.join(", ");

    // Create prompt for Gemini
    const prompt = `You are a quiz question generator.

Generate ONLY MCQ and TRUE/FALSE questions.

Topic: ${title}
Description: ${description || "N/A"}
Difficulty levels: ${difficultyText}

Rules:
- Generate at least 6-10 questions
- Difficulty must strictly match the requested levels: ${difficultyText}
- MCQ must have exactly 4 options
- TRUE/FALSE must have answer "True" or "False"
- Each question must include: type, difficulty, question, options (if MCQ), correctAnswer

Return ONLY a valid JSON array with no explanation or additional text.

Example format:
[
  {
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  },
  {
    "type": "TRUE/FALSE",
    "difficulty": "Medium",
    "question": "Your true/false question?",
    "correctAnswer": "True"
  }
]`;

    const rawResponse = await main(prompt);
    const questions = cleanGeminiResponse(rawResponse);

    console.log(
      `✅ Generated ${questions.length} questions for topic: ${title}`
    );

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("❌ Error generating questions:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const asyncgenerateQuestions = async (req, res) => {
  try {
    const { title, description } = req.body;

    const difficultyArray = Array.isArray(req.body.difficulty)
      ? req.body.difficulty
      : req.body.difficulty
        ? [req.body.difficulty]
        : [];

    // Validation
    if (!title || difficultyArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    const difficultyText = difficultyArray.join(", ");

    const prompt = `You are a quiz question generator.

Generate ONLY Multiple Choice Questions (MCQs). Do NOT generate standard 2-option True/False questions.

Topic: ${title}
Description: ${description || "N/A"}
Difficulty levels: ${difficultyText}

Rules:
- Generate at least 6-10 questions.
- Difficulty must match the requested levels: ${difficultyText}.
- EVERY question must have EXACTLY 4 options.
- Assign a reasonable 'marks' value (e.g., 1 for Easy, 2 for Medium, 3 for Hard).
- Assign a reasonable 'timeLimit' in seconds (between 5 and 300).
- 'correctOptionIndex' must be an integer from 0 to 3.

Return ONLY a valid JSON array with no explanation, markdown formatting, or additional text.

Example exact format:
[
  {
    "questionText": "What is the capital of France?",
    "options": [
      { "text": "London" },
      { "text": "Berlin" },
      { "text": "Paris" },
      { "text": "Madrid" }
    ],
    "correctOptionIndex": 2,
    "marks": 1,
    "timeLimit": 30
  }
]`;

    const rawResponse = await main(prompt);
    const questions = cleanAsyncGeminiResponse(rawResponse);

    console.log(
      `✅ Generated ${questions.length} schema-compliant questions for topic: ${title}`
    );

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("❌ Error generating async questions:", error);

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        error: "Gemini is currently overloaded. Please try again in a few seconds.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};