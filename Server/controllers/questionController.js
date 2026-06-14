import main from "../utils/gemini.js";
import { cleanGeminiResponse, cleanAsyncGeminiResponse } from "../utils/helper.js";

export const generateQuestions = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!title || !difficulty || difficulty.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    const difficultyGuidelines = difficulty.map((d) => {
      switch (d.toLowerCase()) {
        case "easy":
          return "Easy: basic recall, simple vocabulary, obvious answers, suitable for beginners";
        case "medium":
          return "Medium: requires understanding and some inference, moderate complexity";
        case "hard":
          return "Hard: deep knowledge, nuanced distinctions, tricky distractors, expert-level";
        default:
          return `${d}: standard complexity`;
      }
    }).join("\n");

    const prompt = `You are a quiz question generator.

Generate ONLY MCQ and TRUE/FALSE questions.

Topic: ${title}
Description: ${description || "N/A"}
Requested difficulty levels: ${difficulty.join(", ")}

Difficulty guidelines (follow these strictly):
${difficultyGuidelines}

Rules:
- Generate at least 6-10 questions total, distributed across the requested difficulty levels.
- EVERY question MUST have a "difficulty" field set to exactly one of: ${difficulty.join(", ")}
- The question content and answer choices MUST match the difficulty level described above.
- MCQ must have exactly 4 options.
- TRUE/FALSE must have correctAnswer "True" or "False".
- Each question must include: type, difficulty, question, options (if MCQ), correctAnswer.

Return ONLY a valid JSON array with no explanation or additional text.

Example format:
[
  {
    "type": "MCQ",
    "difficulty": "${difficulty[0]}",
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  },
  {
    "type": "TRUE/FALSE",
    "difficulty": "${difficulty[difficulty.length - 1]}",
    "question": "Your true/false question?",
    "correctAnswer": "True"
  }
]`;

    const rawResponse = await main(prompt);
    const questions = cleanGeminiResponse(rawResponse);

    console.log(`✅ Generated ${questions.length} questions for topic: ${title}, difficulties: ${difficulty.join(", ")}`);

    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Error generating questions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const asyncgenerateQuestions = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!title || !difficulty || difficulty.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Title and at least one difficulty level are required",
      });
    }

    // Build per-difficulty guidelines for marks, timeLimit, and question style
    const difficultyGuidelines = difficulty.map((d) => {
      switch (d.toLowerCase()) {
        case "easy":
          return `Easy:
  - Question style: basic recall, simple vocabulary, obvious answers, suitable for beginners
  - marks: 1
  - timeLimit: 20 (seconds)`;
        case "medium":
          return `Medium:
  - Question style: requires understanding and some inference, moderate complexity
  - marks: 2
  - timeLimit: 35 (seconds)`;
        case "hard":
          return `Hard:
  - Question style: deep knowledge, nuanced distinctions, tricky distractors, expert-level
  - marks: 3
  - timeLimit: 50 (seconds)`;
        default:
          return `${d}:
  - Question style: standard complexity
  - marks: 2
  - timeLimit: 30 (seconds)`;
      }
    }).join("\n");

    const prompt = `You are a quiz question generator.

Generate ONLY Multiple Choice Questions (MCQs). Do NOT generate True/False questions.

Topic: ${title}
Description: ${description || "N/A"}
Requested difficulty levels: ${difficulty.join(", ")}

Difficulty guidelines (follow these STRICTLY for every question):
${difficultyGuidelines}

Rules:
- Generate at least 6-10 questions total, distributed evenly across the requested difficulty levels.
- EVERY question MUST have a "difficulty" field set to exactly one of: ${difficulty.join(", ")}
- The question content, distractors, and complexity MUST match the difficulty guidelines above.
- EVERY question must have EXACTLY 4 options.
- 'correctOptionIndex' must be an integer from 0 to 3 indicating the correct option.
- 'marks' and 'timeLimit' must follow the difficulty guidelines above.

Return ONLY a valid JSON array with no explanation, markdown formatting, or additional text.

Example exact format (if "easy" and "hard" were requested):
[
  {
    "questionText": "What is 2 + 2?",
    "difficulty": "easy",
    "options": [
      { "text": "3" },
      { "text": "4" },
      { "text": "5" },
      { "text": "6" }
    ],
    "correctOptionIndex": 1,
    "marks": 1,
    "timeLimit": 20
  },
  {
    "questionText": "Which sorting algorithm has the best average-case time complexity?",
    "difficulty": "hard",
    "options": [
      { "text": "Bubble Sort" },
      { "text": "Insertion Sort" },
      { "text": "Merge Sort" },
      { "text": "Selection Sort" }
    ],
    "correctOptionIndex": 2,
    "marks": 3,
    "timeLimit": 50
  }
]`;

    const rawResponse = await main(prompt);
    const questions = cleanAsyncGeminiResponse(rawResponse);

    console.log(`✅ Generated ${questions.length} schema-compliant questions for topic: ${title}, difficulties: ${difficulty.join(", ")}`);

    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Error generating async questions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};