import { FaStar, FaCodeBranch, FaGithub } from "react-icons/fa";

export default function GitHubStats({ repoUrl, forks, stars }) {
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
          <FaCodeBranch /> <span>{forks} Forks</span>
        </div>
        <div className="flex items-center gap-2 hover:scale-110 transition-transform">
          <FaStar /> <span>{stars} Stars</span>
        </div>
      </div>
    </div>
  );
}
