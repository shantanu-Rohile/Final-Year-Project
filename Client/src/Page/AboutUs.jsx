// src/Page/AboutUs.jsx
import { motion } from "framer-motion";
import GitHubStats from "../Components/GitHubStats";

export default function AboutUs() {
  const contributors = [
    { name: "Sandesh987-coder", contributions: 12 },
    { name: "shantanu-Rohile", contributions: 8 },
    { name: "Aryan-Lokhande", contributions: 15 },
  ];

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--txt)] min-h-screen py-8 px-5 text-justify">
      {/* About Section */}
      <motion.section
        className="max-w-5xl mx-auto mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-6">About EduQuest</h2>

        <p className="text-[var(--txt-dim)] leading-relaxed mb-6">
          <span className="font-semibold">EduQuest</span> is an interactive
          learning platform designed to transform assessments into engaging
          experiences. It offers <strong>real-time quizzes</strong>,{" "}
          <strong>personalized question banks</strong>,{" "}
          <strong>leaderboards</strong>, and{" "}
          <strong>performance analytics</strong>. Built for both students and
          educators, EduQuest makes learning social, competitive, and fun.
        </p>

        <GitHubStats repoUrl="https://github.com/shantanu-Rohile/Final-Year-Project.git" />
      </motion.section>

      {/* Idea Section */}
      <motion.section
        className="max-w-5xl mx-auto mb-16"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-6">Idea Behind EduQuest</h2>

        <ul className="list-disc list-inside text-[var(--txt-dim)] space-y-3">
          <li>
            Most platforms were <strong>boring</strong> or focused only on
            grades.
          </li>
          <li>
            Lack of <strong>real-time interaction</strong> and gamification.
          </li>
          <li>
            EduQuest blends{" "}
            <strong>quizzes + gamification + collaboration</strong>.
          </li>
          <li>
            Includes <strong>live rooms, leaderboards, analytics</strong>.
          </li>
        </ul>
      </motion.section>

      {/* Contributors */}
      <motion.section
        className="max-w-5xl mx-auto mb-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          Built Together by Amazing People
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {contributors.map((user, index) => (
            <motion.a
              key={index}
              href={`https://github.com/${user.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-md text-center py-6 px-4 hover:bg-[var(--bg-ter)] transition w-full max-w-[200px] mx-auto"
              whileHover={{ scale: 1.05 }}
            >
              {/* Avatar */}
              <div className="relative w-20 h-20 mx-auto mb-3">
                <img
                  src={`https://github.com/${user.name}.png`}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-[var(--bg-ter)]"
                />

                {/* Badge */}
                <motion.span
                  className="absolute -top-2 -right-2 bg-[var(--btn)] text-[var(--txt)] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(var(--shadow-rgb),0.6)]"
                  whileHover={{
                    scale: [1, 1.3, 1],
                    boxShadow: "0 0 15px rgba(var(--shadow-rgb),0.9)",
                    transition: { duration: 0.6, repeat: Infinity },
                  }}
                >
                  {user.contributions}
                </motion.span>
              </div>

              <h3 className="font-semibold text-base sm:text-lg break-words">
                {user.name}
              </h3>
              <p className="text-[var(--txt-disabled)] text-xs sm:text-sm">
                Contributions
              </p>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="max-w-5xl mx-auto text-center mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-4">🚀 Explore More</h2>

        <p className="text-[var(--txt-dim)] mb-6">
          EduQuest is constantly evolving with community support.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://github.com/shantanu-Rohile/Final-Year-Project"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-4 py-2 rounded-[var(--radius)] shadow-md transition"
          >
            📖 Read Docs
          </a>

          <a
            href="https://github.com/shantanu-Rohile/Final-Year-Project/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-4 py-2 rounded-[var(--radius)] shadow-md transition"
          >
            🤝 Contribute
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=eduquest@gmail.com"
            className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] px-4 py-2 rounded-[var(--radius)] shadow-md transition"
          >
            📩 Contact
          </a>
        </div>

        <p className="text-[var(--txt-disabled)] mt-8 text-sm">
          Made with ❤️ by EduQuest Team
        </p>
      </motion.section>
    </div>
  );
}
