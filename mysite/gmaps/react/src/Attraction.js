import React from 'react';

function Attraction({ attraction, onAddAttraction }) {
  const handleDoubleClick = () => {
    if (onAddAttraction) {
      onAddAttraction(attraction);
    }
  };

  return (
    <span className="attraction" onDoubleClick={handleDoubleClick}>
      <img src={attraction.image} alt={attraction.name} className="attraction-image" />
      <h3>{attraction.name}</h3>
    </span>
  );
}

export default Attraction;
