import React from 'react';


const RoomCard = ({ name, category, action }) => (
  <div className="room-card">
    <h3>{name}</h3>
    <p>{category}</p>
    <button>{action}</button>
  </div>
);

export default RoomCard;