import React from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms }) => (
  <div className="room-list">
    {rooms.map((room, index) => (
      <RoomCard key={index} {...room} />
    ))}
  </div>
);

export default RoomList;