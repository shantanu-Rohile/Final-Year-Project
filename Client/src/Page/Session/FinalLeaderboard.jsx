// client/src/pages/Session/FinalLeaderboard.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getRankSuffix,
  getMedalEmoji,
  formatNumber,
} from "../../utils/quizHelpers";
import {
  Trophy,
  XCircle,
  BarChart3,
  Medal,
  Crown,
  Award,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const FinalLeaderboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    leaderboard: [],
    userPerformance: null,
    roomInfo: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    fetchFinalLeaderboard();
  }, []);

  const fetchFinalLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/quiz/final-leaderboard/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setData({
          leaderboard: response.data.leaderboard,
          userPerformance: response.data.userPerformance,
          roomInfo: response.data.roomInfo,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error fetching final leaderboard:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.error || "Failed to load leaderboard",
      }));
    }
  };
  const Stat = ({ label, value, accent = "text-[var(--txt)]" }) => {
    return (
      <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-sec)]">
        <span className="text-sm text-[var(--txt-dim)] font-medium">
          {label}
        </span>
        <span className={`text-lg font-bold ${accent}`}>{value}</span>
      </div>
    );
  };

  if (data.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--btn)] mx-auto mb-4" />
          <p className="text-[var(--txt-dim)] text-lg">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-ter)] rounded-xl shadow-lg p-8 max-w-md text-center">
          <XCircle size={56} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-[var(--txt-dim)] mb-6">{data.error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[var(--btn)] text-white rounded-lg hover:bg-[var(--btn-hover)] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { leaderboard, userPerformance, roomInfo } = data;
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Trophy size={40} className="text-[var(--btn)]" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-[var(--txt)]">
            Final Leaderboard
          </h1>
          <p className="text-[var(--txt-dim)] text-lg">{roomInfo?.roomName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Your Performance */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-ter)] rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-[var(--txt)] mb-4 flex items-center gap-2">
                <BarChart3 className="text-[var(--btn)]" />
                Your Performance
              </h2>

              {userPerformance ? (
                <div className="space-y-4">
                  {/* Rank */}
                  <div className="text-center p-6 bg-[var(--bg-sec)] rounded-xl">
                    <Medal
                      size={48}
                      className="mx-auto text-[var(--btn)] mb-2"
                    />
                    <div className="text-3xl font-bold mb-1 text-[var(--txt)]">
                      {getRankSuffix(userPerformance.rank)}
                    </div>
                    <div className="text-sm text-[var(--txt-dim)]">Place</div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <Stat
                      label="Total Score"
                      value={formatNumber(userPerformance.totalScore)}
                      accent="text-blue-500"
                    />
                    <Stat
                      label="Accuracy"
                      value={`${userPerformance.accuracy}%`}
                      accent="text-green-500"
                    />
                    <Stat
                      label="Questions"
                      value={`${userPerformance.questionsAnswered} / ${userPerformance.totalQuestions}`}
                    />
                    <Stat
                      label="Total Time"
                      value={`${Math.round(userPerformance.totalTime)}s`}
                      accent="text-purple-500"
                    />

                    {userPerformance.status === "abandoned" && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-400" />
                        <p className="text-yellow-400 text-sm font-medium">
                          Quiz was abandoned
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--txt-dim)]">
                  You haven't attempted this quiz yet.
                </div>
              )}

              <button
                onClick={() => navigate("/session")}
                className="w-full mt-6 py-3 bg-[var(--btn)] text-white rounded-lg hover:bg-[var(--btn-hover)] transition font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Home
              </button>
            </div>
          </div>

          {/* RIGHT: Full Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-ter)] rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-[var(--txt)]">
                All Participants
              </h2>

              {/* Podium */}
              {topThree.length > 0 && (
                <div className="flex items-end justify-center gap-6 mb-10">
                  {topThree.map((user, idx) => (
                    <div
                      key={user.userId}
                      className="flex flex-col items-center"
                    >
                      {idx === 0 && (
                        <Crown size={36} className="text-yellow-400 mb-2" />
                      )}
                      {idx === 1 && (
                        <Award size={32} className="text-gray-400 mb-2" />
                      )}
                      {idx === 2 && (
                        <Award size={32} className="text-orange-400 mb-2" />
                      )}

                      <div
                        className="rounded-t-xl px-6 py-4 text-center text-[var(--txt)] bg-[var(--bg-sec)]"
                        style={{
                          height: idx === 0 ? 180 : idx === 1 ? 140 : 120,
                        }}
                      >
                        <div className="font-bold mb-1">{user.username}</div>
                        <div className="text-2xl font-bold">
                          {formatNumber(user.totalScore)}
                        </div>
                        <div className="text-xs text-[var(--txt-dim)] mt-1">
                          {user.accuracy}% accuracy
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10 text-[var(--txt-dim)]">
                      <th className="text-left py-3 px-3 text-sm">Rank</th>
                      <th className="text-left py-3 px-4 text-sm">Player</th>
                      <th className="text-center py-3 px-3 text-sm">Score</th>
                      <th className="text-center py-3 px-3 text-sm">
                        Accuracy
                      </th>
                      <th className="text-center py-3 px-3 text-sm">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.userId}
                        className={`border-b border-black/5 ${
                          entry.isCurrentUser
                            ? "bg-[var(--bg-sec)] font-semibold text-[var(--txt)] "
                            : "hover:bg-[var(--bg-sec)] text-[var(--txt-dim)]"
                        }`}
                      >
                        <td className="py-4 px-3">
                          {getRankSuffix(entry.rank)}
                        </td>
                        <td className="py-4 px-4">
                          {entry.isCurrentUser ? "You" : entry.username}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {formatNumber(entry.totalScore)}
                        </td>
                        <td className="py-4 px-3 text-center text-green-500">
                          {entry.accuracy}%
                        </td>
                        <td className="py-4 px-3 text-center text-[var(--txt-dim)]">
                          {Math.round(entry.totalTime)}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-[var(--txt-dim)]">
                  No participants yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalLeaderboard;
