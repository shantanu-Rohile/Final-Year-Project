import React from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {rooms.map((room, index) => (
      <RoomCard key={index} {...room} />
    ))}
  </div>
);

export default RoomList;