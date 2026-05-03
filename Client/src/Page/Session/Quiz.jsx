// client/src/page/Session/Quiz.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QuizCard from "../../Components/Session/QuizCard";
import Timer from "../../Components/Session/Timer";
import CurrentLeaderboard from "../../Components/Session/CurrentLeaderboard";

const Quiz = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [quizState, setQuizState] = useState({
    attemptId: null,
    questions: [],
    currentQuestionIndex: 0,
    totalQuestions: 0,
    isLoading: true,
    error: null,
  });

  const [questionState, setQuestionState] = useState({
    isAnswered: false,
    selectedAnswer: null,
    timeSpent: 0,
    showLeaderboard: false,
  });

  const [leaderboardData, setLeaderboardData] = useState({
    leaderboard: [],
    userPointsEarned: 0,
    timeBonus: 0,
    isCorrect: false,
  });

  const [timerActive, setTimerActive] = useState(false);
  const timeElapsedRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);

  // Initialize quiz
  useEffect(() => {
    initializeQuiz();
    return () => {
      // Cleanup heartbeat on unmount
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  const initializeQuiz = async () => {
    try {
      const token = localStorage.getItem("token");

      // Check if user already attempted
      const checkRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/quiz/check-attempt/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (checkRes.data.hasAttempted) {
        // Redirect to final leaderboard
        navigate(`/final-leaderboard/${roomId}`);
        return;
      }

      // Start quiz
      const startRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/quiz/start/${roomId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (startRes.data.success) {
        setQuizState({
          attemptId: startRes.data.attempt.attemptId,
          questions: startRes.data.questions,
          currentQuestionIndex: 0,
          totalQuestions: startRes.data.questions.length,
          isLoading: false,
          error: null,
        });

        // Start timer for first question
        setTimerActive(true);

        // Start heartbeat (every 30 seconds)
        heartbeatIntervalRef.current = setInterval(() => {
          sendHeartbeat(startRes.data.attempt.attemptId);
        }, 30000);
      }
    } catch (error) {
      console.error("Error initializing quiz:", error);
      if (error.response?.data?.redirect === "final-leaderboard") {
        navigate(`/final-leaderboard/${roomId}`);
      } else {
        setQuizState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.error || "Failed to start quiz",
        }));
      }
    }
  };

  const sendHeartbeat = async (attemptId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/quiz/heartbeat`,
        { attemptId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  };

  const handleTimerTick = (elapsed) => {
    timeElapsedRef.current = elapsed;
  };

  const handleTimeout = () => {
    // Auto-submit with empty answer (0 points)
    if (!questionState.isAnswered) {
      handleAnswerSubmit("", 30.0);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (questionState.isAnswered) return;

    // Stop timer
    setTimerActive(false);
    const timeSpent = Math.round(timeElapsedRef.current * 100) / 100;

    // Mark as answered
    setQuestionState((prev) => ({
      ...prev,
      isAnswered: true,
      selectedAnswer: answer,
      timeSpent,
    }));

    // Submit answer
    handleAnswerSubmit(answer, timeSpent);
  };

  const handleAnswerSubmit = async (answer, timeSpent) => {
    try {
      const token = localStorage.getItem("token");
      const currentQuestion =
        quizState.questions[quizState.currentQuestionIndex];

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/quiz/submit-answer`,
        {
          attemptId: quizState.attemptId,
          questionId: currentQuestion._id,
          selectedAnswer: answer,
          timeSpent: timeSpent,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        // Fetch current leaderboard
        const leaderboardRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/quiz/current-leaderboard/${roomId}/${quizState.currentQuestionIndex + 1}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Show leaderboard
        setLeaderboardData({
          leaderboard: leaderboardRes.data.leaderboard,
          userPointsEarned: response.data.answer.pointsEarned,
          timeBonus: response.data.answer.timeBonus,
          isCorrect: response.data.answer.isCorrect,
        });

        setQuestionState((prev) => ({
          ...prev,
          showLeaderboard: true,
        }));
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = quizState.currentQuestionIndex + 1;

    if (nextIndex >= quizState.totalQuestions) {
      // Quiz completed
      completeQuiz();
    } else {
      // Move to next question
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
      }));

      setQuestionState({
        isAnswered: false,
        selectedAnswer: null,
        timeSpent: 0,
        showLeaderboard: false,
      });

      timeElapsedRef.current = 0;
      setTimerActive(true);
    }
  };

  const completeQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/quiz/complete`,
        { attemptId: quizState.attemptId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Navigate to final leaderboard
      navigate(`/final-leaderboard/${roomId}`);
    } catch (error) {
      console.error("Error completing quiz:", error);
      navigate(`/final-leaderboard/${roomId}`);
    }
  };

  if (quizState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[var(--btn)] mx-auto mb-4" />
          <p className="text-[var(--txt-dim)] text-lg">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (quizState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="bg-[var(--bg-ter)] rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-[var(--txt-dim)] mb-6">{quizState.error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-md
                     bg-[var(--btn)] text-white
                     hover:bg-[var(--btn-hover)]
                     transition font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 text-[var(--txt)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[var(--bg-ter)] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--txt)]">
                Quiz in Progress
              </h1>
              <p className="text-[var(--txt-dim)] text-sm mt-1">
                Question {quizState.currentQuestionIndex + 1} of{" "}
                {quizState.totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--txt-dim)] mb-1">Progress</div>
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[var(--btn)] h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${((quizState.currentQuestionIndex + 1) / quizState.totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        {!questionState.showLeaderboard && (
          <div className="bg-[var(--bg-ter)] rounded-xl shadow-lg p-6 mb-6">
            <Timer
              duration={30}
              onTimeout={handleTimeout}
              isActive={timerActive}
              onTick={handleTimerTick}
            />
          </div>
        )}

        {/* Question or Leaderboard */}
        {questionState.showLeaderboard ? (
          <CurrentLeaderboard
            leaderboard={leaderboardData.leaderboard}
            userPointsEarned={leaderboardData.userPointsEarned}
            timeBonus={leaderboardData.timeBonus}
            isCorrect={leaderboardData.isCorrect}
            onNext={handleNextQuestion}
            canSkipAnimation={true}
          />
        ) : (
          <QuizCard
            question={currentQuestion}
            questionNumber={quizState.currentQuestionIndex + 1}
            totalQuestions={quizState.totalQuestions}
            onAnswerSelect={handleAnswerSelect}
            isAnswered={questionState.isAnswered}
          />
        )}
      </div>
    </div>
  );
};

export default Quiz;
