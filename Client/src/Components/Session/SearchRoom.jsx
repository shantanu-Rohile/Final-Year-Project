// client/src/components/SearchRoom.jsx
import { useState } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";

const SearchRoom = ({ onRoomFound }) => {
  const [roomId, setRoomId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");

    if (!roomId || roomId.length !== 5) {
      setError("Room ID must be exactly 5 characters");
      return;
    }

    setIsSearching(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/rooms/search/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        onRoomFound(response.data.room);
        setRoomId("");
      }
    } catch (error) {
      console.log("Error searching room:", error);
      setError(error.response?.data?.error || "Room not found");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        {/* Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Enter 5-character Room ID"
            maxLength={5}
            className={`w-full px-4 py-3 rounded-md font-mono text-sm
            bg-[var(--bg-ter)] text-[var(--txt)]
            border ${error ? "border-red-500" : "border-black/10"}
            focus:outline-none focus:ring-2 focus:ring-[var(--btn)]`}
          />

          {error && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSearching || roomId.length !== 5}
          className="flex items-center gap-2 px-5 py-3 rounded-md
                   bg-[var(--btn)] text-white text-sm font-medium
                   hover:bg-[var(--btn-hover)] transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search size={16} />
              Search
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchRoom;
