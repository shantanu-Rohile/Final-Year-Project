import React from 'react';

const RoomCard = ({ name, category, description, action, onDelete }) => (
  <div className="bg-[var(--bg-sec)] rounded-[var(--radius)] shadow-sm p-4 w-64 hover:shadow-md transition">
    <h3 className="text-lg font-bold text-[var(--txt)]">{name}</h3>
    <p className="text-sm text-[var(--txt-dim)]">{category}</p>
    {description && <p className="text-sm text-[var(--txt-disabled)]">{description}</p>}
    <div className="flex justify-between mt-3">
      <button className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white px-3 py-1 rounded-[var(--radius)] transition">
        {action}
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-[var(--radius)] transition"
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default RoomCard;