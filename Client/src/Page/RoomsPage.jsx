import React, { useState, useEffect } from 'react';
import RoomList from '../Components/Session/RoomList';
import FilterBar from '../Components/Session/FilterBar';
import CreateRoomCard from '../Components/Session/CreateRoomCard';

const initialYourRooms = [
  { name: 'Temp Room', category: 'Career-Development', description: 'Temp', action: 'Enter Room' }
];

const allRoomsData = [
  { name: 'hbhcjsd', category: 'Hobbies', description: 'sdkfhcbsd', action: 'Request Join' },
  { name: 'asdfasdf', category: 'Tech', description: 'asdfasdf', action: 'Enter Room' },
  { name: 'adf', category: 'Tech', description: 'asdf', action: 'Enter Room' },
];

const categories = [
  'Tech',
  'Science',
  'Language-learning',
  'Professional',
  'Career-Development',
  'General',
  'Study-Room',
  'Hobbies'
];

const filters = ['All', ...categories];

const RoomsPage = () => {
  const [yourRooms, setYourRooms] = useState(initialYourRooms);
  const [allRooms] = useState(allRoomsData);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });

  // Load from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('yourRooms');
    if (savedRooms) {
      setYourRooms(JSON.parse(savedRooms));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('yourRooms', JSON.stringify(yourRooms));
  }, [yourRooms]);

  const filteredRooms = allRooms.filter(room => {
    const matchesCategory = selectedFilter === 'All' || room.category === selectedFilter;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    const newRoom = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      action: 'Enter Room'
    };

    setYourRooms([...yourRooms, newRoom]);
    setFormData({ name: '', category: '', description: '' });
    setShowModal(false);
  };

  const handleDeleteRoom = (index) => {
    const updatedRooms = yourRooms.filter((_, i) => i !== index);
    setYourRooms(updatedRooms);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--txt)]">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Your Rooms */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
          <div className="flex flex-wrap gap-4">
            {yourRooms.map((room, i) => (
              <div key={i} className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-4 w-64 hover:shadow-md transition">
                <h3 className="text-lg font-bold text-[var(--txt)]">{room.name}</h3>
                <p className="text-sm text-[var(--txt-dim)]">{room.category}</p>
                <p className="text-sm text-[var(--txt-disabled)]">{room.description}</p>
                <div className="flex justify-between mt-3">
                  <button className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white px-3 py-1 rounded-[var(--radius)] transition">
                    {room.action}
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-[var(--radius)] transition"
                    onClick={() => handleDeleteRoom(i)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div onClick={() => setShowModal(true)} className="cursor-pointer">
              <CreateRoomCard />
            </div>
          </div>
        </section>

        {/* Explore Rooms */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Explore Rooms</h2>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm mb-4 px-3 py-2 rounded-[var(--radius)] bg-[var(--bg-sec)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
          />
          <FilterBar filters={filters} onFilter={setSelectedFilter} activeFilter={selectedFilter} />
          <RoomList rooms={filteredRooms} />
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-sec)] p-6 rounded-[var(--radius)] shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-[var(--txt)]">Create a New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Room Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius)] bg-[var(--bg-primary)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius)] bg-[var(--bg-primary)] text-[var(--txt)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
              >
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-[var(--radius)] bg-[var(--bg-primary)] text-[var(--txt)] placeholder-[var(--txt-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--btn)]"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white px-4 py-2 rounded-[var(--radius)] transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-[var(--bg-ter)] hover:bg-[var(--bg-sec)] text-white px-4 py-2 rounded-[var(--radius)] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;