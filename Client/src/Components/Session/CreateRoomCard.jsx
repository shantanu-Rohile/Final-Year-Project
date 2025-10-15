import React from 'react';

const CreateRoomCard = () => (
  <div className="bg-gray-700 hover:bg-gray-600 cursor-pointer rounded-lg shadow-md p-6 w-64 flex flex-col items-center justify-center text-gray-300 transition">
    <span className="text-4xl font-bold">+</span>
    <h3 className="mt-2 text-lg font-semibold">Create Room</h3>
  </div>
);

export default CreateRoomCard;