import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const WaitingLobby = () => {
  const navigate=useNavigate()
  const [copied, setCopied] = useState(false);

  const roomCode = "2v46z";

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 p-6">
      {/* Top bar */}
      <div className="mb-6">
  <div className="flex justify-between items-center mb-4">
    {/* Left - Leave Room */}
    <button className="text-sm text-gray-600 hover:underline" onClick={() => navigate("/")} >
      ← Leave Room
    </button>

    {/* Right - Room Code */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Room Code:</span>
      <div
        className="flex items-center gap-2 bg-white border rounded-md px-3 py-1 cursor-pointer hover:bg-gray-50"
        onClick={handleCopy}
      >
        <span className="font-mono text-gray-800">{roomCode}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2h-6l-2-2H6a2 2 0 00-2 2v2"
          />
        </svg>
      </div>
      {copied && <span className="text-xs text-green-600">Copied!</span>}
    </div>
  </div>

  {/* Title + Subtitle */}
  <h1 className="text-2xl font-semibold text-gray-800">
    Chemistry Fundamentals
  </h1>
  <p className="text-sm text-gray-600">
    Hosted by Dr. Wilson • Waiting for quiz to start
  </p>
</div>


      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* AI Quiz Generation */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-medium text-gray-800 mb-2">AI Quiz Generation</h2>
            <p className="text-sm text-gray-600 mb-4">Processing your content...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-black h-2 rounded-full w-[100%]"></div>
            </div>
            <span className="text-xs text-white bg-black px-2 py-0.5 rounded-md">
              Complete
            </span>
            <div className="flex gap-6 mt-4 text-sm text-green-600">
              <span>✓ Content Analysis</span>
              <span>✓ Question Generation</span>
              <span>✓ Ready to Start</span>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-medium text-gray-800 mb-4">How to Play</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 font-medium px-2 py-1 rounded-full">
                  1
                </span>
                <span>Answer questions as quickly and accurately as possible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 font-medium px-2 py-1 rounded-full">
                  2
                </span>
                <span>Faster correct answers earn more points</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-600 font-medium px-2 py-1 rounded-full">
                  3
                </span>
                <span>Compete with classmates on the live leaderboard</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-medium text-gray-800 mb-4">Participants (6)</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                    DW
                  </span>
                  <div>
                    <p className="font-medium">Dr. Wilson</p>
                    <p className="text-xs text-gray-500">Host</p>
                  </div>
                </div>
              </li>
              {["Alice", "Bob", "Charlie", "Diana Ross", "Eva Chen"].map((name, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {name.charAt(0)}
                    </span>
                    <p>{name}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Waiting Box */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Waiting for the host to start the quiz...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingLobby;
