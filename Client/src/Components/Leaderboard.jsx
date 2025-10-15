// components/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Clock, ArrowRight } from "lucide-react";

const Leaderboard = ({
  data,
  questionNumber,
  totalQuestions,
  onNext,
  isFinal = false,
}) => {
  const [animatedData, setAnimatedData] = useState([]);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    // Initialize with 0 points for users who have points, keep 0 for those without
    setAnimatedData(
      data.map((user) => ({
        ...user,
        displayPoints: user.totalPoints > 0 ? 0 : 0,
      }))
    );

    // Slower animation - 2 seconds total
    const animationDuration = 2000; // 2 seconds
    const steps = 40; // Number of steps for smooth animation
    const intervalTime = animationDuration / steps;

    const interval = setInterval(() => {
      setAnimatedData((prevData) => {
        const newData = prevData.map((user) => {
          // Don't animate if user has 0 points
          if (user.totalPoints === 0) {
            return { ...user, displayPoints: 0 };
          }
          // Increment points gradually
          const increment = Math.ceil(user.totalPoints / steps);
          return {
            ...user,
            displayPoints: Math.min(
              user.displayPoints + increment,
              user.totalPoints
            ),
          };
        });

        // Sort by displayPoints to show visible rank swapping
        return newData
          .sort((a, b) => b.displayPoints - a.displayPoints)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      });
    }, intervalTime);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      // Final sort and update
      const finalData = data
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((user, index) => ({ ...user, rank: index + 1 }));
      setAnimatedData(finalData);
      setShowNext(true);
    }, animationDuration + 200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [data]);

  const getRankColor = (rank) => {
    if (rank === 1) return "#fbbf24"; // Gold
    if (rank === 2) return "#d1d5db"; // Silver
    if (rank === 3) return "#cd7f32"; // Bronze
    return "var(--txt-dim)";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4"
          style={{ backgroundColor: "var(--btn)", color: "white" }}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xl font-bold">
            {isFinal ? "Final Results" : `Question ${questionNumber} Results`}
          </span>
        </div>
        {!isFinal && (
          <p className="text-base" style={{ color: "var(--txt-dim)" }}>
            Standings after question {questionNumber} of {totalQuestions}
          </p>
        )}
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        className="rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--bg-sec)",
          boxShadow: `0 16px 50px rgba(var(--shadow-rgb), 0.3)`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {animatedData.map((user, index) => (
            <motion.div
              key={user.userId}
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: index * 0.1,
              }}
              className={`flex items-center gap-4 p-4 rounded-xl mb-3 transition-all duration-300 ${
                user.isCurrentUser ? "ring-4" : ""
              }`}
              style={{
                backgroundColor: user.isCurrentUser
                  ? "var(--btn)" + "20"
                  : "var(--bg-ter)",
                borderColor: user.isCurrentUser ? "var(--btn)" : "transparent",
                borderWidth: user.isCurrentUser ? "2px" : "0px",
              }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              {/* Rank */}
              <motion.div
                className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl"
                style={{
                  backgroundColor:
                    user.rank <= 3
                      ? getRankColor(user.rank) + "30"
                      : "var(--bg-primary)",
                  color: getRankColor(user.rank),
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {getRankIcon(user.rank)}
              </motion.div>

              {/* Username */}
              <div className="flex-1">
                <p
                  className="font-bold text-lg flex items-center gap-2"
                  style={{ color: "var(--txt)" }}
                >
                  {user.username}
                  {user.isCurrentUser && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "var(--btn)", color: "white" }}
                    >
                      YOU
                    </span>
                  )}
                </p>
              </div>

              {/* Points with animation */}
              <motion.div
                className="flex items-center gap-2"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: "var(--btn)" }}
                />
                <span
                  className="font-bold text-2xl"
                  style={{ color: "var(--txt)" }}
                >
                  {user.displayPoints || user.totalPoints}
                </span>
                <span className="text-sm" style={{ color: "var(--txt-dim)" }}>
                  pts
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Next Button */}
      <AnimatePresence>
        {showNext && !isFinal && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.button
              onClick={onNext}
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg"
              style={{ backgroundColor: "var(--btn)", color: "white" }}
              whileHover={{ scale: 1.05, backgroundColor: "var(--btn-hover)" }}
              whileTap={{ scale: 0.95 }}
            >
              {questionNumber < totalQuestions
                ? "Next Question"
                : "View Final Results"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Leaderboard;
