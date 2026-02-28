// client/src/pages/Session.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, LogOut, Search, BookmarkCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import CreateRoomModal from "../Components/Session/CreateRoomModal";
import RoomCard from "../Components/Session/RoomCard";

const Session = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myRooms, setMyRooms] = useState([]);
  const [exploredRooms, setExploredRooms] = useState([]);
  const [searchedRoom, setSearchedRoom] = useState(null);
  const [savedRoomIds, setSavedRoomIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const [roomId, setRoomId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Fetch Rooms ---------------- */
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");

      const [myRoomsRes, savedRoomsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/rooms/my-rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/saved-rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (myRoomsRes.data.success) {
        setMyRooms(myRoomsRes.data.rooms);
      }

      if (savedRoomsRes.data.success) {
        setExploredRooms(savedRoomsRes.data.rooms);
        setSavedRoomIds(new Set(savedRoomsRes.data.rooms.map((r) => r.roomId)));
      }
    } catch (err) {
      console.error("Error fetching rooms", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Search Room ---------------- */
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearchedRoom(null);

    if (roomId.length !== 5) {
      setError("Room ID must be exactly 5 characters");
      return;
    }

    setIsSearching(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/rooms/search/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setSearchedRoom(res.data.room);
        setRoomId("");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Room not found");
    } finally {
      setIsSearching(false);
    }
  };

  /* ---------------- Save / Remove ---------------- */
  const handleToggleSave = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const isSaved = savedRoomIds.has(roomId);

      if (isSaved) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/saved-rooms/remove/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setExploredRooms((prev) => prev.filter((r) => r.roomId !== roomId));
        setSavedRoomIds((prev) => {
          const next = new Set(prev);
          next.delete(roomId);
          return next;
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/saved-rooms/add`,
          { roomId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        fetchRooms();
      }
      setSearchedRoom(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--btn)]" />
      </div>
    );
  }

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 sm:px-6 md:px-8 py-8 text-[var(--txt)] ml-[70px] ">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <p className="text-[var(--txt-dim)] mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-[var(--btn)]">
                {user?.username}
              </span>
              !
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-xl sm:text-base md:text-lg
                     bg-[var(--btn)] text-white font-semibold shadow-lg"
          >
            <Plus size={22} />
            Create New Room
          </motion.button>

          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md
                       bg-[var(--bg-ter)] text-[var(--txt)]
                       hover:bg-[var(--bg-sec)] transition"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </motion.button> */}

          {/* Create Room */}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
        {/* Left Column */}
        {/* LEFT COLUMN (Your Rooms + Saved Rooms) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Your Rooms */}
          <div className="bg-[var(--bg-sec)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="text-[var(--btn)]" />
              <h2 className="text-2xl font-bold">Your Rooms</h2>
              <span className="ml-auto text-sm text-[var(--txt-dim)]">
                {myRooms.length} room(s)
              </span>
            </div>

            {myRooms.length === 0 ? (
              <div className="text-center py-12 text-[var(--txt-dim)]">
                You haven’t created any rooms yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myRooms.map((room) => (
                  <RoomCard key={room.roomId} room={room} isOwnRoom />
                ))}
              </div>
            )}
          </div>

          {/* Saved Rooms (moved here ⬇️) */}
          <div className="bg-[var(--bg-sec)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookmarkCheck className="text-[var(--btn)]" />
              <h3 className="text-xl font-bold">Saved Rooms</h3>
            </div>

            {exploredRooms.length === 0 ? (
              <p className="text-sm text-[var(--txt-dim)]">
                No saved rooms yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto hide-scrollbar">
                {exploredRooms.map((room) => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    onToggleSave={handleToggleSave}
                    isSaved
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-sec)] rounded-2xl p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <Search className="text-[var(--btn)]" />
              <h2 className="text-2xl font-bold">Explore Rooms</h2>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value.toUpperCase());
                    setError("");
                    setSearchedRoom(null);
                  }}
                  maxLength={5}
                  placeholder="Enter Room ID"
                  className="w-full px-4 py-3 rounded-md
                             bg-[var(--bg-ter)] text-[var(--txt)]
                             border border-black/10 font-mono
                             focus:ring-2 focus:ring-[var(--btn)]"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                             px-4 py-2 rounded-md bg-[var(--btn)]
                             text-white text-sm disabled:opacity-50"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>

              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </form>

            {/* Search Result */}
            <AnimatePresence>
              {searchedRoom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6"
                >
                  <RoomCard
                    room={searchedRoom}
                    onToggleSave={handleToggleSave}
                    isSaved={savedRoomIds.has(searchedRoom.roomId)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Session;
