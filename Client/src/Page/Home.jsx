import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f0f1a] to-[#1b1133] text-gray-100">
      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-6 text-center">
        Welcome to <span className="text-purple-500">EduQuest</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 mb-10 text-center max-w-lg">
        A Hybrid AI-Powered Intelligent Quiz Generation and Real-Time Assessment Platform ✨
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link to="/login">
          <button className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-[0_0_15px_#8b5cf6] hover:shadow-[0_0_25px_#a78bfa] transition-all">
            Login
          </button>
        </Link>

        <Link to="/signup">
          <button className="px-8 py-3 rounded-xl border-2 border-purple-500 text-purple-400 font-semibold hover:bg-purple-600 hover:text-white hover:shadow-[0_0_20px_#a78bfa] transition-all">
            Signup
          </button>
        </Link>
      </div>

      {/* Footer text */}
    </div>
  );
}

export default Home;
