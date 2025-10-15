import React from 'react';

const RoomCard = ({ name, category, description, action, onDelete }) => (
  <div className="bg-gray-800 rounded-lg shadow-md p-4 w-64">
    <h3 className="text-lg font-bold text-gray-100">{name}</h3>
    <p className="text-sm text-gray-400">{category}</p>
    {description && <p className="text-sm text-gray-500">{description}</p>}
    <div className="flex justify-between mt-3">
      <button className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded transition">
        {action}
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default RoomCard;