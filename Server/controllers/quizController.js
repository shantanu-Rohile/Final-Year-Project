// server/controllers/quizController.js
import QuizAttempt from "../models/QuizAttempt.js";
import Room from "../models/Room.js";
import Question from "../models/Question.js";

// Calculate points based on difficulty and time
const calculatePoints = (difficulty, timeSpent, isCorrect) => {
  if (!isCorrect) return 0;

  const BASE_POINTS = {
    Easy: 100,
    Medium: 150,
    Hard: 200,
  };

  const basePoints = BASE_POINTS[difficulty] || 0;
  const timeBonus = Math.max(0, Math.floor((30 - timeSpent) * 3));

  return basePoints + timeBonus;
};

// Check if user has attempted quiz
export const checkAttempt = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({ userId, roomId });

    res.json({
      success: true,
      hasAttempted: !!attempt,
      attemptStatus: attempt?.status || null,
    });
  } catch (error) {
    console.error("Error checking attempt:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Start quiz
export const startQuiz = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if room exists
    const room = await Room.findOne({ roomId }).populate({
      path: "questions",
      options: { sort: { order: 1 } },
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    const existingAttempt = await QuizAttempt.findOne({ userId, roomId });

    if (existingAttempt) {
      // If quiz already completed or abandoned → redirect
      if (existingAttempt.status !== "in-progress") {
        return res.status(409).json({
          success: false,
          redirect: "final-leaderboard",
        });
      }

      // If quiz was started but not finished → RESUME
      return res.json({
        success: true,
        attempt: {
          attemptId: existingAttempt._id,
          currentQuestionIndex: existingAttempt.currentQuestionIndex,
          totalQuestions: room.questions.length,
        },
        questions: room.questions,
      });
    }

    // Create new attempt
    const attempt = await QuizAttempt.create({
      userId,
      roomId,
      answers: [],
      currentQuestionIndex: 0,
      status: "in-progress",
    });

    console.log(`✅ Quiz started: ${roomId} by user ${userId}`);

    res.json({
      success: true,
      attempt: {
        attemptId: attempt._id,
        currentQuestionIndex: 0,
        totalQuestions: room.questions.length,
      },
      questions: room.questions, // Return all questions with order
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Submit answer for a question
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer, timeSpent } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (
      !attemptId ||
      !questionId ||
      !selectedAnswer ||
      timeSpent === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Get attempt
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId) {
      return res
        .status(404)
        .json({ success: false, error: "Attempt not found" });
    }

    if (attempt.status !== "in-progress") {
      return res
        .status(400)
        .json({ success: false, error: "Quiz already completed" });
    }

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    // Check if already answered
    const alreadyAnswered = attempt.answers.some(
      (a) => a.questionId.toString() === questionId,
    );
    if (alreadyAnswered) {
      return res
        .status(400)
        .json({ success: false, error: "Question already answered" });
    }

    // Validate time spent
    const validTimeSpent = Math.min(Math.max(0, parseFloat(timeSpent)), 30);
    const roundedTimeSpent = Math.round(validTimeSpent * 100) / 100; // 2 decimal places

    // Check if answer is correct
    const isCorrect = selectedAnswer.trim() === question.correctAnswer.trim();

    // Calculate points
    const pointsEarned = calculatePoints(
      question.difficulty,
      roundedTimeSpent,
      isCorrect,
    );

    // Add answer to attempt
    attempt.answers.push({
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent: roundedTimeSpent,
      pointsEarned,
      answeredAt: new Date(),
    });

    // Update totals
    attempt.totalScore += pointsEarned;
    attempt.totalTime += roundedTimeSpent;
    attempt.currentQuestionIndex += 1;
    attempt.lastHeartbeat = new Date();

    await attempt.save();

    console.log(
      `✅ Answer submitted: Q${attempt.currentQuestionIndex} - ${pointsEarned} pts`,
    );

    res.json({
      success: true,
      answer: {
        isCorrect,
        pointsEarned,
        timeBonus: isCorrect
          ? Math.max(0, Math.floor((30 - roundedTimeSpent) * 3))
          : 0,
        currentQuestionIndex: attempt.currentQuestionIndex,
        totalScore: attempt.totalScore,
      },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get current leaderboard after each question
export const getCurrentLeaderboard = async (req, res) => {
  try {
    const { roomId, questionIndex } = req.params;
    const userId = req.user.id;

    // Get all attempts for this room (completed + in-progress)
    const attempts = await QuizAttempt.find({ roomId })
      .populate("userId", "username")
      .lean();

    // Build leaderboard with per-question breakdown
    const leaderboard = attempts.map((attempt) => {
      const questionsAnswered = attempt.answers.slice(
        0,
        parseInt(questionIndex),
      );

      return {
        userId: attempt.userId._id,
        username: attempt.userId.username,
        isCurrentUser: attempt.userId._id.toString() === userId,
        totalScore: attempt.totalScore,
        totalTime: attempt.totalTime,
        status: attempt.status,
        questionsAnswered: questionsAnswered.length,
        perQuestionScores: questionsAnswered.map((a) => ({
          pointsEarned: a.pointsEarned,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent,
        })),
      };
    });

    // Sort by total score (descending)
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks (with tie handling)
    let currentRank = 1;
    leaderboard.forEach((entry, index) => {
      if (index > 0 && entry.totalScore < leaderboard[index - 1].totalScore) {
        currentRank = index + 1;
      }
      entry.rank = currentRank;
    });

    res.json({
      success: true,
      leaderboard,
      currentQuestion: parseInt(questionIndex),
    });
  } catch (error) {
    console.error("Error getting current leaderboard:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete quiz
export const completeQuiz = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId) {
      return res
        .status(404)
        .json({ success: false, error: "Attempt not found" });
    }

    // Mark as completed
    attempt.status = "completed";
    attempt.completedAt = new Date();
    await attempt.save();

    // Add user to room participants
    await Room.findOneAndUpdate(
      { roomId: attempt.roomId },
      { $addToSet: { participants: userId } },
    );

    console.log(`✅ Quiz completed: ${attempt.roomId} by user ${userId}`);

    res.json({
      success: true,
      message: "Quiz completed successfully",
      totalScore: attempt.totalScore,
      totalTime: attempt.totalTime,
    });
  } catch (error) {
    console.error("Error completing quiz:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get final leaderboard
export const getFinalLeaderboard = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Get room details
    const room = await Room.findOne({ roomId }).populate("questions");
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Get all completed/abandoned attempts
    const attempts = await QuizAttempt.find({
      roomId,
      status: { $in: ["completed", "abandoned"] },
    })
      .populate("userId", "username")
      .lean();

    // Build leaderboard
    const leaderboard = attempts.map((attempt) => ({
      userId: attempt.userId._id,
      username: attempt.userId.username,
      isCurrentUser: attempt.userId._id.toString() === userId,
      totalScore: attempt.totalScore,
      totalTime: attempt.totalTime,
      accuracy:
        attempt.answers.length > 0
          ? Math.round(
              (attempt.answers.filter((a) => a.isCorrect).length /
                attempt.answers.length) *
                100,
            )
          : 0,
      questionsAnswered: attempt.answers.length,
      totalQuestions: room.questions.length,
      status: attempt.status,
      completedAt: attempt.completedAt,
    }));

    // Sort by total score
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    let currentRank = 1;
    leaderboard.forEach((entry, index) => {
      if (index > 0 && entry.totalScore < leaderboard[index - 1].totalScore) {
        currentRank = index + 1;
      }
      entry.rank = currentRank;
    });

    // Get current user's performance
    const userPerformance = leaderboard.find((entry) => entry.isCurrentUser);

    res.json({
      success: true,
      leaderboard,
      userPerformance,
      roomInfo: {
        roomName: room.roomName,
        totalQuestions: room.questions.length,
      },
    });
  } catch (error) {
    console.error("Error getting final leaderboard:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Heartbeat to prevent abandonment
export const heartbeat = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId) {
      return res
        .status(404)
        .json({ success: false, error: "Attempt not found" });
    }

    if (attempt.status === "in-progress") {
      attempt.lastHeartbeat = new Date();
      await attempt.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Auto-abandon inactive quizzes (run via cron or manually)
export const checkAbandonedQuizzes = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const abandonedAttempts = await QuizAttempt.find({
      status: "in-progress",
      lastHeartbeat: { $lt: fiveMinutesAgo },
    });

    for (const attempt of abandonedAttempts) {
      attempt.status = "abandoned";
      attempt.completedAt = new Date();
      await attempt.save();

      // Add to participants even if abandoned
      await Room.findOneAndUpdate(
        { roomId: attempt.roomId },
        { $addToSet: { participants: attempt.userId } },
      );

      console.log(
        `⚠️ Quiz abandoned: ${attempt.roomId} by user ${attempt.userId}`,
      );
    }

    return abandonedAttempts.length;
  } catch (error) {
    console.error("Error checking abandoned quizzes:", error);
    return 0;
  }
};
