import React from 'react';

const FilterBar = ({ filters, onFilter, activeFilter }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {filters.map((filter, index) => (
      <button
        key={index}
        onClick={() => onFilter(filter)}
        className={`px-4 py-1 rounded-full text-sm font-medium transition 
          ${
            activeFilter === filter
              ? 'bg-[var(--btn)] text-white'
              : 'bg-[var(--bg-sec)] text-[var(--txt-dim)] hover:bg-[var(--bg-ter)]'
          }`}
      >
        {filter}
      </button>
    ))}
  </div>
);

export default FilterBar;