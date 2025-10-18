// src/Components/GitHubStats.jsx
import { useEffect, useState } from "react";
import { FaStar, FaCodeBranch, FaGithub } from "react-icons/fa";

export default function GitHubStats({ repoUrl }) {
  const [stats, setStats] = useState({ forks: 0, stars: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Extract "owner/repo" from repoUrl
        const repoPath = repoUrl.replace("https://github.com/", "").replace(".git", "");

        const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
          headers: {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`, // Use your PAT from .env.local
          },
        });

        if (!response.ok) throw new Error("GitHub API error");

        const data = await response.json();
        setStats({
          forks: data.forks_count,
          stars: data.stargazers_count,
        });
      } catch (err) {
        console.error("Failed to fetch GitHub stats:", err);
      }
    };

    fetchStats();
  }, [repoUrl]);

  return (
    <div className="bg-[--bg-sec] rounded-[--radius] shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-[--bg-ter] transition">
      {/* Left: Repo Info */}
      <div className="flex items-center gap-3">
        <FaGithub className="text-3xl" />
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-semibold hover:underline"
        >
          Open on GitHub
        </a>
      </div>

      {/* Right: Stats */}
      <div className="flex gap-6 text-lg">
        <div className="flex items-center gap-2 hover:scale-110 transition-transform">
          <FaCodeBranch /> <span>{stats.forks} Forks</span>
        </div>
        <div className="flex items-center gap-2 hover:scale-110 transition-transform">
          <FaStar /> <span>{stats.stars} Stars</span>
        </div>
      </div>
    </div>
  );
}
