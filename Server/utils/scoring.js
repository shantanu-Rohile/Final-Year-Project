export const calculatePoints = (difficulty, timeSpent, isCorrect) => {
  if (!isCorrect) return 0;
  const BASE_POINTS = { Easy: 100, Medium: 150, Hard: 200 };
  const basePoints = BASE_POINTS[difficulty] || 0;
  const timeBonus = Math.max(0, Math.floor((30 - timeSpent) * 3));
  return basePoints + timeBonus;
};
export default calculatePoints;