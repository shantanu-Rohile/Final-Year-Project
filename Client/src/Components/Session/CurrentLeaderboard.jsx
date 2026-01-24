// client/src/components/CurrentLeaderboard.jsx
import { useState, useEffect } from "react";
import { getRankSuffix, formatNumber } from "../../utils/quizHelpers";

const CurrentLeaderboard = ({
  leaderboard,
  userPointsEarned,
  timeBonus,
  isCorrect,
  onNext,
  canSkipAnimation = true,
}) => {
  const [animatedScores, setAnimatedScores] = useState({});
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Animate score counting
    if (showAnimation) {
      const targetScores = {};
      leaderboard.forEach((entry) => {
        targetScores[entry.userId] = entry.totalScore;
      });

      // Start from previous scores (current - latest points)
      const startScores = {};
      leaderboard.forEach((entry) => {
        const latestPoints =
          entry.perQuestionScores[entry.perQuestionScores.length - 1]
            ?.pointsEarned || 0;
        startScores[entry.userId] = entry.totalScore - latestPoints;
      });

      setAnimatedScores(startScores);

      // Animate to target scores
      const duration = 2000; // 2 seconds
      const steps = 50;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        const newScores = {};
        leaderboard.forEach((entry) => {
          const start = startScores[entry.userId];
          const target = targetScores[entry.userId];
          newScores[entry.userId] = Math.round(
            start + (target - start) * progress,
          );
        });

        setAnimatedScores(newScores);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedScores(targetScores);
        }
      }, interval);

      return () => clearInterval(timer);
    } else {
      // No animation, show final scores
      const finalScores = {};
      leaderboard.forEach((entry) => {
        finalScores[entry.userId] = entry.totalScore;
      });
      setAnimatedScores(finalScores);
    }
  }, [leaderboard, showAnimation]);

  const handleSkipAnimation = () => {
    setShowAnimation(false);
  };

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-8
                  bg-[var(--bg-ter)] text-[var(--txt)]
                  shadow-xl"
    >
      {/* Result Summary */}
      <div
        className={`mb-6 rounded-xl p-6 border
        ${
          isCorrect
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{isCorrect ? "✅" : "❌"}</div>
          <h3 className="text-2xl font-bold mb-2">
            {isCorrect ? "Correct!" : "Incorrect"}
          </h3>
          <p className="text-3xl font-bold mb-1">+{userPointsEarned} pts</p>
          {isCorrect && timeBonus > 0 && (
            <p className="text-sm text-green-400">
              Includes +{timeBonus} time bonus ⚡
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Current Standings</h3>
        {canSkipAnimation && showAnimation && (
          <button
            onClick={handleSkipAnimation}
            className="px-3 py-1.5 rounded-md text-sm
                     bg-[var(--bg-sec)] text-[var(--txt-dim)]
                     hover:bg-[var(--bg-primary)] transition"
          >
            Skip Animation
          </button>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left py-3 px-2 font-semibold text-[var(--txt-dim)]">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--txt-dim)]">
                Player
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[var(--txt-dim)]">
                Score
              </th>
              <th className="text-right py-3 px-2 font-semibold text-[var(--txt-dim)]">
                Latest
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const latestScore =
                entry.perQuestionScores[entry.perQuestionScores.length - 1];
              const displayScore =
                animatedScores[entry.userId] ?? entry.totalScore;

              return (
                <tr
                  key={entry.userId}
                  className={`border-b border-black/5 transition
                  ${
                    entry.isCurrentUser
                      ? "bg-[var(--bg-sec)] font-bold"
                      : "hover:bg-[var(--bg-primary)]"
                  }`}
                >
                  <td className="py-4 px-2">
                    <span className="text-lg font-bold">
                      {getRankSuffix(entry.rank)}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {entry.isCurrentUser ? "You" : entry.username}
                      </span>
                      {entry.status === "in-progress" && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs
                                       bg-yellow-500/20 text-yellow-400"
                        >
                          In Progress
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="text-xl font-bold">
                      {formatNumber(displayScore)}
                    </span>
                  </td>

                  <td className="py-4 px-2 text-right">
                    {latestScore && (
                      <span
                        className={`text-sm font-medium ${
                          latestScore.isCorrect
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {latestScore.isCorrect ? "+" : ""}
                        {latestScore.pointsEarned}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-Question Breakdown */}
      <details className="mb-6">
        <summary
          className="cursor-pointer text-sm font-medium
                          text-[var(--btn-hover)] hover:opacity-80"
        >
          View detailed scores per question
        </summary>

        <div className="mt-4 rounded-lg p-4 bg-[var(--bg-sec)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left py-2 px-2 font-semibold text-[var(--txt-dim)]">
                  Player
                </th>
                {leaderboard[0]?.perQuestionScores.map((_, i) => (
                  <th
                    key={i}
                    className="text-center py-2 px-2 font-semibold text-[var(--txt-dim)]"
                  >
                    Q{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`border-b border-black/5 ${
                    entry.isCurrentUser
                      ? "bg-[var(--bg-primary)] font-bold"
                      : ""
                  }`}
                >
                  <td className="py-2 px-2">
                    {entry.isCurrentUser ? "You" : entry.username}
                  </td>
                  {entry.perQuestionScores.map((score, i) => (
                    <td key={i} className="text-center py-2 px-2">
                      <span
                        className={
                          score.isCorrect ? "text-green-400" : "text-red-400"
                        }
                      >
                        {score.pointsEarned}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-xl text-lg font-bold
                 bg-[var(--btn)] text-white
                 hover:bg-[var(--btn-hover)]
                 transition shadow-lg hover:shadow-xl"
      >
        Next Question →
      </button>
    </div>
  );
};

export default CurrentLeaderboard;
