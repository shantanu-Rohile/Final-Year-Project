// client/src/components/RoomCard.jsx
import { Bookmark, BookmarkCheck, Users, HelpCircle, Play } from "lucide-react";

const RoomCard = ({ room, onToggleSave, isSaved, isOwnRoom = false }) => {
  const getCategoryStyle = (category) => {
    const map = {
      Tech: "bg-blue-500/10 text-blue-400",
      Science: "bg-green-500/10 text-green-400",
      "Language-learning": "bg-purple-500/10 text-purple-400",
      Professional: "bg-indigo-500/10 text-indigo-400",
      "Career-Development": "bg-pink-500/10 text-pink-400",
      "Study-Room": "bg-yellow-500/10 text-yellow-400",
      Hobbies: "bg-orange-500/10 text-orange-400",
      General: "bg-[var(--bg-sec)] text-[var(--txt-dim)]",
    };
    return map[category] || map.General;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      className="bg-[var(--bg-ter)] rounded-lg border border-black/5 p-5
                 hover:shadow-md transition flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[var(--txt)] leading-snug">
            {room.roomName}
          </h3>
          <p className="text-xs text-[var(--txt-dim)] font-mono mt-0.5">
            ID: {room.roomId}
          </p>
        </div>

        {!isOwnRoom && (
          <button
            onClick={() => onToggleSave(room.roomId)}
            title={isSaved ? "Remove from explored" : "Add to explored"}
            className={`p-2 rounded-md transition
              ${
                isSaved
                  ? "bg-red-500/10 text-red-400"
                  : "bg-[var(--bg-sec)] text-[var(--txt-dim)] hover:bg-[var(--bg-primary)]"
              }`}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(
            room.category,
          )}`}
        >
          {room.category}
        </span>
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-sm text-[var(--txt-dim)] mb-4 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-[var(--txt-dim)] mb-4">
        <div className="flex items-center gap-1">
          <HelpCircle size={14} />
          <span>{room.questionCount} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{room.participantCount || 0} Participants</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-auto">
        <div className="text-xs text-[var(--txt-dim)]">
          {room.createdBy && <span>By {room.createdBy}</span>}
          {room.createdAt && <span> • {formatDate(room.createdAt)}</span>}
        </div>

        <button
          onClick={() => (window.location.href = `/quiz/${room.roomId}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-md
                     bg-[var(--btn)] text-white text-sm font-medium
                     hover:bg-[var(--btn-hover)] transition"
        >
          <Play size={14} />
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
