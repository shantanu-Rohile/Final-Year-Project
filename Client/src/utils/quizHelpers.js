// client/src/utils/quizHelpers.js

// Calculate points (client-side preview)
export const calculatePoints = (difficulty, timeSpent, isCorrect) => {
  if (!isCorrect) return 0;
  
  const BASE_POINTS = {
    'Easy': 100,
    'Medium': 150,
    'Hard': 200
  };
  
  const basePoints = BASE_POINTS[difficulty] || 0;
  const timeBonus = Math.max(0, Math.floor((30 - timeSpent) * 3));
  
  return basePoints + timeBonus;
};

// Format time as MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get difficulty color
export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Get base points by difficulty
export const getBasePoints = (difficulty) => {
  const BASE_POINTS = {
    'Easy': 100,
    'Medium': 150,
    'Hard': 200
  };
  return BASE_POINTS[difficulty] || 0;
};

// Calculate max possible points for a question
export const getMaxPoints = (difficulty) => {
  return getBasePoints(difficulty) + 90; // 90 is max time bonus (30 * 3)
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get rank suffix (1st, 2nd, 3rd, 4th...)
export const getRankSuffix = (rank) => {
  const j = rank % 10;
  const k = rank % 100;
  
  if (j === 1 && k !== 11) return `${rank}st`;
  if (j === 2 && k !== 12) return `${rank}nd`;
  if (j === 3 && k !== 13) return `${rank}rd`;
  return `${rank}th`;
};

// Get medal emoji for podium
export const getMedalEmoji = (rank) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
};

// Calculate accuracy percentage
export const calculateAccuracy = (correctAnswers, totalAnswers) => {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
};