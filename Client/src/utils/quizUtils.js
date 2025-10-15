// utils/quizUtils.js

// Mock Quiz Data
export const mockQuizData = {
  roomId: "ROOM123",
  roomName: "JavaScript Basics Quiz",
  questions: [
    {
      id: 1,
      question: "What does 'DOM' stand for in JavaScript?",
      options: [
        "Document Object Model",
        "Data Object Management",
        "Digital Orientation Method",
        "Dynamic Object Manipulation"
      ],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Which method is used to add an element at the end of an array?",
      options: [
        "push()",
        "pop()",
        "shift()",
        "unshift()"
      ],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "What will 'typeof null' return in JavaScript?",
      options: [
        "null",
        "undefined",
        "object",
        "number"
      ],
      correctAnswer: 2,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Which company developed JavaScript?",
      options: [
        "Microsoft",
        "Netscape",
        "Oracle",
        "Google"
      ],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "What is a closure in JavaScript?",
      options: [
        "A function that has access to its outer function's variables",
        "A method to close browser windows",
        "A way to end loops",
        "A CSS property"
      ],
      correctAnswer: 0,
      difficulty: "hard"
    }
  ]
};

// Mock previous users data
export const mockPreviousUsers = [
  {
    userId: "user001",
    username: "CodeMaster",
    answers: [
      { questionId: 1, timeSpent: 5.2, isCorrect: true },
      { questionId: 2, timeSpent: 3.8, isCorrect: false },
      { questionId: 3, timeSpent: 8.5, isCorrect: true },
      { questionId: 4, timeSpent: 4.1, isCorrect: true },
      { questionId: 5, timeSpent: 12.3, isCorrect: false }
    ]
  },
  {
    userId: "user002",
    username: "QuizNinja",
    answers: [
      { questionId: 1, timeSpent: 6.7, isCorrect: true },
      { questionId: 2, timeSpent: 5.9, isCorrect: true },
      { questionId: 3, timeSpent: 10.2, isCorrect: false },
      { questionId: 4, timeSpent: 6.2, isCorrect: true },
      { questionId: 5, timeSpent: 15.8, isCorrect: true }
    ]
  }
];

// Current user data (simulated)
export const currentUser = {
  userId: "user003",
  username: "You",
  answers: []
};

// Scoring Logic - Fastest Finger First
export const calculatePoints = (timeSpent, isCorrect, difficulty = "easy") => {
  if (!isCorrect) return 0;

  const basePoints = {
    easy: 100,
    medium: 150,
    hard: 200
  };

  const base = basePoints[difficulty] || 100;
  
  // Time bonus: faster answer = more points
  // Max time is 30 seconds, minimum bonus for correct at 30s, max bonus for correct at <5s
  const timeBonus = Math.max(0, Math.floor((30 - timeSpent) * 3));
  
  return base + timeBonus;
};

// Calculate leaderboard for a specific question
export const calculateLeaderboard = (questionId, allUsers, currentUserAnswer = null) => {
  const leaderboard = [];

  // Add previous users
  allUsers.forEach(user => {
    const answer = user.answers.find(a => a.questionId === questionId);
    if (answer) {
      const difficulty = mockQuizData.questions.find(q => q.id === questionId)?.difficulty || "easy";
      const points = calculatePoints(answer.timeSpent, answer.isCorrect, difficulty);
      leaderboard.push({
        userId: user.userId,
        username: user.username,
        points: points,
        timeSpent: answer.timeSpent,
        isCorrect: answer.isCorrect,
        isCurrentUser: false
      });
    }
  });

  // Add current user if they've answered
  if (currentUserAnswer) {
    const difficulty = mockQuizData.questions.find(q => q.id === questionId)?.difficulty || "easy";
    const points = calculatePoints(currentUserAnswer.timeSpent, currentUserAnswer.isCorrect, difficulty);
    leaderboard.push({
      userId: currentUser.userId,
      username: currentUser.username,
      points: points,
      timeSpent: currentUserAnswer.timeSpent,
      isCorrect: currentUserAnswer.isCorrect,
      isCurrentUser: true
    });
  }

  // Sort by points (descending), then by time (ascending)
  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.timeSpent - b.timeSpent;
  });

  // Add ranks
  leaderboard.forEach((user, index) => {
    user.rank = index + 1;
  });

  return leaderboard;
};

// Calculate cumulative leaderboard up to a specific question
export const calculateCumulativeLeaderboard = (upToQuestionId, allUsers, currentUserAnswers = []) => {
  const leaderboard = [];

  // Calculate total points for previous users
  allUsers.forEach(user => {
    let totalPoints = 0;
    user.answers.forEach(answer => {
      if (answer.questionId <= upToQuestionId) {
        const difficulty = mockQuizData.questions.find(q => q.id === answer.questionId)?.difficulty || "easy";
        totalPoints += calculatePoints(answer.timeSpent, answer.isCorrect, difficulty);
      }
    });

    leaderboard.push({
      userId: user.userId,
      username: user.username,
      totalPoints: totalPoints,
      isCurrentUser: false
    });
  });

  // Calculate total points for current user
  if (currentUserAnswers.length > 0) {
    let totalPoints = 0;
    currentUserAnswers.forEach(answer => {
      if (answer.questionId <= upToQuestionId) {
        const difficulty = mockQuizData.questions.find(q => q.id === answer.questionId)?.difficulty || "easy";
        totalPoints += calculatePoints(answer.timeSpent, answer.isCorrect, difficulty);
      }
    });

    leaderboard.push({
      userId: currentUser.userId,
      username: currentUser.username,
      totalPoints: totalPoints,
      isCurrentUser: true
    });
  }

  // Sort by total points
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

  // Add ranks
  leaderboard.forEach((user, index) => {
    user.rank = index + 1;
  });

  return leaderboard;
};