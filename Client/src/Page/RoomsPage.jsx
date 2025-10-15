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

const filters = ['All', 'Tech', 'Hobbies', 'Career-Development'];

const RoomsPage = () => {
  const [yourRooms, setYourRooms] = useState(initialYourRooms);
  const [allRooms] = useState(allRoomsData);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const savedRooms = localStorage.getItem('yourRooms');
    if (savedRooms) {
      setYourRooms(JSON.parse(savedRooms));
    }
  }, []);

  // ✅ Save to localStorage whenever yourRooms changes
  useEffect(() => {
    localStorage.setItem('yourRooms', JSON.stringify(yourRooms));
  }, [yourRooms]);

  const filteredRooms = allRooms.filter(room => {
    const matchesCategory =
      selectedFilter === 'All' || room.category === selectedFilter;
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

  // ✅ Delete room
  const handleDeleteRoom = (index) => {
    const updatedRooms = yourRooms.filter((_, i) => i !== index);
    setYourRooms(updatedRooms);
  };

  return (
    <div className="rooms-layout">
    
      <div className="rooms-content">
        {/* Your Rooms */}
        <section>
          <h2>Your Rooms</h2>
          <div className="room-list">
            {yourRooms.map((room, i) => (
              <div key={i} className="room-card">
                <h3>{room.name}</h3>
                <p>{room.category}</p>
                <p>{room.description}</p>
                <div className="room-actions">
                  <button>{room.action}</button>
                  <button className="delete-btn" onClick={() => handleDeleteRoom(i)}>Delete</button>
                </div>
              </div>
            ))}
            <div onClick={() => setShowModal(true)}>
              <CreateRoomCard />
            </div>
          </div>
        </section>

        {/* Explore Rooms */}
        <section>
          <h2>Explore Rooms</h2>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <FilterBar filters={filters} onFilter={setSelectedFilter} />
          <RoomList rooms={filteredRooms} />
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create a New Room</h3>
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                placeholder="Room Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;