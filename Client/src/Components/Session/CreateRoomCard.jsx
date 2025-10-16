import React from 'react';

const CreateRoomCard = () => (
  <div className="bg-[var(--bg-sec)] hover:bg-[var(--bg-ter)] cursor-pointer rounded-[var(--radius)] shadow-sm p-6 w-64 flex flex-col items-center justify-center text-[var(--txt-dim)] transition">
    <span className="text-4xl font-bold text-[var(--btn)]">+</span>
    <h3 className="mt-2 text-lg font-semibold text-[var(--txt)]">Create Room</h3>
  </div>
);

export default CreateRoomCard;