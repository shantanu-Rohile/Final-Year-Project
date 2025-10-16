import React, { useState } from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {rooms.map((room, index) => (
        <RoomCard
          key={index}
          {...room}
          isSelected={selectedIndex === index}
          onClick={() => setSelectedIndex(index)}
        />
      ))}
    </div>
  );
};

export default RoomList;