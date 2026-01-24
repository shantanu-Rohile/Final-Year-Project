// client/src/components/CreateRoomModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const CATEGORIES = [
  "Tech",
  "Science",
  "Language-learning",
  "Professional",
  "Career-Development",
  "General",
  "Study-Room",
  "Hobbies",
];

const CreateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: "",
    category: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.roomName || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    // Generate unique 5-character room ID
    const roomId = nanoid(5).toUpperCase();

    // Store room initialization data in localStorage
    const roomInitData = {
      roomId,
      roomName: formData.roomName,
      category: formData.category,
      description: formData.description,
      timestamp: Date.now(),
    };

    localStorage.setItem("currentRoomInit", JSON.stringify(roomInitData));

    // Navigate to create room page
    navigate(`/create-room/${roomId}`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl
                 bg-[var(--bg-ter)] text-[var(--txt)]
                 shadow-xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Create New Room</h2>
          <button
            onClick={onClose}
            className="text-[var(--txt-dim)] hover:text-[var(--txt)]
                     text-2xl leading-none text-4xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Room Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              placeholder="e.g. Advanced JavaScript Quiz"
              required
              className="w-full px-4 py-2.5 rounded-md
                       bg-[var(--bg-sec)] text-[var(--txt)]
                       border border-black/10
                       focus:outline-none focus:ring-2
                       focus:ring-[var(--btn)]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-md
                       bg-[var(--bg-sec)] text-[var(--txt)]
                       border border-black/10
                       focus:outline-none focus:ring-2
                       focus:ring-[var(--btn)]"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description{" "}
              <span className="text-[var(--txt-dim)]">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of your quiz room…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-md resize-none bg-[var(--bg-sec)] text-[var(--txt)]
                       border border-black/10 focus:outline-none focus:ring-2
                       focus:ring-[var(--btn)]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-md bg-[var(--btn)] text-white
                       hover:bg-[var(--btn-hover)] transition font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
