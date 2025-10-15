// pages/FinalLeaderboard.jsx - Responsive Version
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Home,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import {
  calculateCumulativeLeaderboard,
  calculatePoints,
} from "../../utils/quizUtils";

const FinalLeaderboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userAnswers = [],
    quizData,
    previousUsers = [],
    incomplete = false,
  } = location.state || {};

  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScores, setAnimatedScores] = useState([]);

  // Calculate final leaderboard
  const lastQuestionId =
    userAnswers.length > 0 ? userAnswers[userAnswers.length - 1].questionId : 0;

  const finalLeaderboard = calculateCumulativeLeaderboard(
    lastQuestionId,
    previousUsers,
    userAnswers
  );

  const currentUserData = finalLeaderboard.find((user) => user.isCurrentUser);
  const userRank = currentUserData?.rank || 0;

  // Calculate user statistics
  const totalQuestions = quizData?.questions?.length || 0;
  const attemptedQuestions = userAnswers.length;
  const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
  const accuracy =
    attemptedQuestions > 0
      ? Math.round((correctAnswers / attemptedQuestions) * 100)
      : 0;
  const totalPoints = currentUserData?.totalPoints || 0;

  useEffect(() => {
    // Show confetti for top 3
    if (userRank > 0 && userRank <= 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Animate scores
    setAnimatedScores(
      finalLeaderboard.map((user) => ({ ...user, displayPoints: 0 }))
    );

    // Slower animation - 2 seconds total for better visibility
    const animationDuration = 2000; // 2 seconds
    const steps = 40; // Smooth animation steps
    const intervalTime = animationDuration / steps;

    const interval = setInterval(() => {
      setAnimatedScores((prev) => {
        const updated = prev.map((user) => {
          // Don't animate if user has 0 points
          if (user.totalPoints === 0) {
            return { ...user, displayPoints: 0 };
          }
          // Gradually increment points
          const increment = Math.ceil(user.totalPoints / steps);
          return {
            ...user,
            displayPoints: Math.min(
              user.displayPoints + increment,
              user.totalPoints
            ),
          };
        });

        // Sort by displayPoints for visible rank swapping animation
        return updated
          .sort((a, b) => b.displayPoints - a.displayPoints)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      });
    }, intervalTime);

    setTimeout(() => {
      clearInterval(interval);
      // Final state with correct rankings
      const finalData = finalLeaderboard
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((user, index) => ({ ...user, rank: index + 1 }));
      setAnimatedScores(finalData);
    }, animationDuration + 200);

    return () => clearInterval(interval);
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return "#fbbf24";
    if (rank === 2) return "#d1d5db";
    if (rank === 3) return "#cd7f32";
    return "var(--txt-dim)";
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getPerformanceMessage = () => {
    if (userRank === 1) return "Outstanding Performance! 🎉";
    if (userRank === 2) return "Excellent Work! 🌟";
    if (userRank === 3) return "Great Job! 🎊";
    if (accuracy >= 80) return "Well Done! 👏";
    if (accuracy >= 60) return "Good Effort! 💪";
    return "Keep Practicing! 📚";
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#fbbf24",
                  "#ef4444",
                  "#10b981",
                  "#3b82f6",
                  "#a855f7",
                ][i % 5],
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: window.innerHeight + 50,
                x: Math.random() * 200 - 100,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Header - Responsive */}
      <motion.div
        className="text-center mb-6 sm:mb-8 md:mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full mb-3 sm:mb-4 md:mb-6"
          style={{ backgroundColor: "var(--btn)", color: "white" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          <span className="text-xs sm:text-lg md:text-xl lg:text-2xl font-bold">
            {incomplete ? "Test Ended Early" : "Quiz Complete!"}
          </span>
        </motion.div>

        <h1
          className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 px-4"
          style={{ color: "var(--txt)" }}
        >
          {getPerformanceMessage()}
        </h1>
        <p
          className="text-xs sm:text-sm md:text-base lg:text-lg"
          style={{ color: "var(--txt-dim)" }}
        >
          {quizData?.roomName || "Quiz Results"}
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Column - User Stats */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--bg-sec)",
              boxShadow: `0 20px 60px rgba(var(--shadow-rgb), 0.3)`,
            }}
          >
            <h2
              className="text-xs sm:text-sm md:text-base font-bold mb-4 sm:mb-5 md:mb-6 flex items-center gap-2"
              style={{ color: "var(--txt)" }}
            >
              <Award
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                style={{ color: "var(--btn)" }}
              />
              Your Performance
            </h2>

            {/* Rank Card */}
            <motion.div
              className="rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 text-center"
              style={{ backgroundColor: "var(--bg-ter)" }}
              whileHover={{ scale: 1.02 }}
            >
              <p
                className="text-[10px] sm:text-xs mb-1 sm:mb-2"
                style={{ color: "var(--txt-dim)" }}
              >
                Your Rank
              </p>
              <div
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2"
                style={{ color: getRankColor(userRank) }}
              >
                {getRankEmoji(userRank)}
              </div>
              <p
                className="text-xs sm:text-sm md:text-base font-bold"
                style={{ color: "var(--txt)" }}
              >
                Rank {userRank}
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="space-y-3 sm:space-y-4">
              <StatCard
                icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Total Score"
                value={totalPoints}
                suffix="pts"
                color="var(--btn)"
              />
              <StatCard
                icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Correct Answers"
                value={`${correctAnswers}/${attemptedQuestions}`}
                color="#10b981"
              />
              <StatCard
                icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Accuracy"
                value={`${accuracy}%`}
                color="#fbbf24"
              />
              <StatCard
                icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                label="Questions Attempted"
                value={`${attemptedQuestions}/${totalQuestions}`}
                color="#3b82f6"
              />
            </div>

            {/* Home Button */}
            <motion.button
              onClick={() => navigate("/")}
              className="w-full mt-4 sm:mt-5 md:mt-6 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
              style={{ backgroundColor: "var(--btn)", color: "white" }}
              whileHover={{ scale: 1.02, backgroundColor: "var(--btn-hover)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Home
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column - Leaderboard */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl"
            style={{
              backgroundColor: "var(--bg-sec)",
              boxShadow: `0 20px 60px rgba(var(--shadow-rgb), 0.3)`,
            }}
          >
            <h2
              className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3"
              style={{ color: "var(--txt)" }}
            >
              <Trophy
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                style={{ color: "var(--btn)" }}
              />
              Final Leaderboard
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {animatedScores.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      user.isCurrentUser ? "ring-2 sm:ring-4" : ""
                    }`}
                    style={{
                      backgroundColor: user.isCurrentUser
                        ? "var(--btn)" + "20"
                        : "var(--bg-ter)",
                      borderColor: user.isCurrentUser
                        ? "var(--btn)"
                        : "transparent",
                      borderWidth: user.isCurrentUser ? "2px" : "0px",
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    {/* Rank Badge */}
                    <motion.div
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full font-bold text-sm sm:text-base md:text-lg flex-shrink-0"
                      style={{
                        backgroundColor:
                          user.rank <= 3
                            ? getRankColor(user.rank) + "30"
                            : "var(--bg-primary)",
                        color: getRankColor(user.rank),
                      }}
                      animate={{ rotate: user.rank === 1 ? [0, 5, -5, 0] : 0 }}
                      transition={{
                        duration: 2,
                        repeat: user.rank === 1 ? Infinity : 0,
                      }}
                    >
                      {getRankEmoji(user.rank)}
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 truncate"
                        style={{ color: "var(--txt)" }}
                      >
                        {user.username}
                        {user.isCurrentUser && (
                          <motion.span
                            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--btn)",
                              color: "white",
                            }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            YOU
                          </motion.span>
                        )}
                      </p>
                    </div>

                    {/* Points */}
                    <motion.div
                      className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Star
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        style={{ color: "var(--btn)" }}
                      />
                      <span
                        className="font-bold text-sm sm:text-base md:text-lg lg:text-xl"
                        style={{ color: "var(--txt)" }}
                      >
                        {user.displayPoints || user.totalPoints}
                      </span>
                      <span
                        className="text-[10px] sm:text-xs"
                        style={{ color: "var(--txt-dim)" }}
                      >
                        pts
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Stat Card Component - Responsive
const StatCard = ({ icon, label, value, suffix = "", color }) => (
  <motion.div
    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl"
    style={{ backgroundColor: "var(--bg-ter)" }}
    whileHover={{ scale: 1.03, x: 5 }}
    transition={{ type: "spring", stiffness: 400 }}
  >
    <div
      className="p-2 sm:p-3 rounded-lg"
      style={{ backgroundColor: color + "20", color: color }}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs sm:text-sm" style={{ color: "var(--txt-dim)" }}>
        {label}
      </p>
      <p
        className="text-lg sm:text-xl md:text-2xl font-bold"
        style={{ color: "var(--txt)" }}
      >
        {value}
        {suffix}
      </p>
    </div>
  </motion.div>
);

export default FinalLeaderboard;
