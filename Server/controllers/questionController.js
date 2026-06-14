import main from "../utils/gemini.js";
import { cleanGeminiResponse, cleanAsyncGeminiResponse } from "../utils/helper.js";

export const generateQuestions = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    // Validation
    if (!title || !difficulty || difficulty.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    // Create prompt for Gemini
    const prompt = `You are a quiz question generator.

Generate ONLY MCQ and TRUE/FALSE questions.

Topic: ${title}
Description: ${description || "N/A"}
Difficulty levels: ${difficulty.join(", ")}

Rules:
- Generate at least 6-10 questions
- Difficulty must strictly match the requested levels: ${difficulty.join(", ")}
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

    // Call Gemini API
    const rawResponse = await main(prompt);
    // console.log('Raw Gemini Response:', rawResponse);

    // Clean and parse response
    const questions = cleanGeminiResponse(rawResponse);

    console.log(
      `✅ Generated ${questions.length} questions for topic: ${title}`,
    );

    res.json({ success: true, questions });
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
    const { title, description, difficulty } = req.body;

    // Validation
    if (!title || !difficulty || difficulty.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    // Create prompt for Gemini tailored to the new Mongoose Schema
    const prompt = `You are a quiz question generator.

Generate ONLY Multiple Choice Questions (MCQs). Do NOT generate standard 2-option True/False questions.

Topic: ${title}
Description: ${description || "N/A"}
Difficulty levels: ${difficulty.join(", ")}

Rules:
- Generate at least 6-10 questions.
- Difficulty must match the requested levels: ${difficulty.join(", ")}.
- EVERY question must have EXACTLY 4 options. 
- Assign a reasonable 'marks' value (e.g., 1 for Easy, 2 for Medium, 3 for Hard).
- Assign a reasonable 'timeLimit' in seconds (between 5 and 300, e.g., 30 for Easy, 45 for Hard).
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

    // Call Gemini API (Assuming `main` is your Gemini fetching function)
    const rawResponse = await main(prompt);

    const questions = cleanAsyncGeminiResponse(rawResponse);

    console.log(
      `✅ Generated ${questions.length} schema-compliant questions for topic: ${title}`,
    );

    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Error generating async questions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
