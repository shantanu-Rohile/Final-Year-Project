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
    <div className="bg-[--bg-primary] text-[--txt] min-h-screen py-10 px-6">
      {/* Our Open Source Work */}
      <motion.section
        className="max-w-5xl mx-auto mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-6">About EduQuest</h2>
<p className="text-[--txt-dim] leading-relaxed mb-6">
  <span className="font-semibold">EduQuest</span> is an interactive learning
  platform designed to transform assessments into engaging experiences. It
  offers <strong>real-time quizzes</strong>, <strong>personalized question banks</strong>,
  <strong>leaderboards</strong>, and <strong>performance analytics</strong>.
  Built for both students and educators, EduQuest makes learning
  social, competitive, and fun while providing meaningful insights into
  knowledge progress.
</p>


        {/* GitHub Stats Card */}
<GitHubStats repoUrl="https://github.com/shantanu-Rohile/Final-Year-Project.git" />

      </motion.section>

      {/* Idea Behind EduQuest */}
      <motion.section
        className="max-w-5xl mx-auto mb-16"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-6">Idea Behind EduQuest</h2>
        <ul className="list-disc list-inside text-[--txt-dim] space-y-3">
          <li>
            During our college days, we noticed that most learning platforms were
            either <strong>boring</strong> or <strong>focused only on grading</strong>,
            with little room for collaboration and fun.
          </li>
          <li>
            Existing quiz tools lacked <strong>real-time interaction</strong> and{" "}
            <strong>gamification</strong>, making assessments feel like a burden
            rather than a challenge.
          </li>
          <li>
            That’s why we built <strong>EduQuest</strong> – a platform that blends{" "}
            <strong>quizzes, gamification, and collaboration</strong> into one
            experience.
          </li>
          <li>
            With <strong>live quiz rooms</strong>, <strong>interactive challenges</strong>, 
            <strong> leaderboards</strong>, and <strong>analytics-driven insights</strong>, 
            EduQuest makes assessments something to look forward to.
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
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6 justify-items-center">
    {contributors.map((user, index) => (
      <motion.a
        key={index}
        href={`https://github.com/${user.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[--bg-sec] rounded-[--radius] shadow-md text-center py-6 px-4 cursor-pointer hover:bg-[--bg-ter] transition w-36 overflow-visible"
        whileHover={{ scale: 1.05 }}
      >
        {/* Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <img
            src={`https://github.com/${user.name}.png`}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-[--bg-ter] shadow-sm"
          />
          {/* Contribution Badge with pulse */}
          <motion.span
            className="absolute -top-2 -right-2 bg-[--btn] text-[--txt] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(107,33,168,0.6)]"
            whileHover={{
              scale: [1, 1.3, 1],
              boxShadow: "0 0 15px rgba(107,33,168,0.9)",
              transition: { duration: 0.6, repeat: Infinity },
            }}
          >
            {user.contributions}
          </motion.span>
        </div>
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <p className="text-[--txt-disabled] text-sm">Contributions</p>
      </motion.a>
    ))}
  </div>
</motion.section>



      {/* Final Section */}
      <motion.section
        className="max-w-5xl mx-auto text-center mt-20 pb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-4">🚀 Explore More</h2>
        <p className="text-[--txt-dim] mb-6">
          EduQuest is constantly evolving with the help of our amazing community.{" "}
          Whether you’re a student, educator, or developer — you can be a part of
          this journey.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://github.com/your-repo-link/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[--btn] hover:bg-[--btn-hover] px-4 py-2 rounded-[--radius] shadow-md transition"
          >
            📖 Read Documentation
          </a>

          <a
            href="https://github.com/your-repo-link/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[--btn] hover:bg-[--btn-hover] px-4 py-2 rounded-[--radius] shadow-md transition"
          >
            🤝 Contribute
          </a>

          <a
            href="/contact"
            className="bg-[--btn] hover:bg-[--btn-hover] px-4 py-2 rounded-[--radius] shadow-md transition"
          >
            📩 Contact Us
          </a>
        </div>

        <p className="text-[--txt-disabled] mt-8 text-sm">
          Made with ❤️ by the EduQuest Team
        </p>
      </motion.section>
    </div>
  );
}
