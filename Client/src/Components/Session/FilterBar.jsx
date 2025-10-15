import React from 'react';

const FilterBar = ({ filters, onFilter }) => (
  <div className="filter-bar">
    {filters.map((filter, index) => (
      <button key={index} onClick={() => onFilter(filter)}>
        {filter}
      </button>
    ))}
  </div>
);

export default FilterBar;