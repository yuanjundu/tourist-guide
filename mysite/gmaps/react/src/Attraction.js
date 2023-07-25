import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';

function Attraction({ attraction, onAddAttraction, isSelected, onToggleSelection }) {
  const handleDoubleClick = () => {
    if (onAddAttraction) {
      onAddAttraction(attraction);
    }
  };

  const handleClick = () => {
    if (!isSelected) {
      if (onAddAttraction) {
        onAddAttraction(attraction);
      }
    }
    if (onToggleSelection) {
      onToggleSelection(attraction);
    }
  };

  return (
    <div className={`attraction ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      <div className="tick-container">
      {isSelected && <FaCheckCircle className="tick-icon" />}
      </div>
      <img src={attraction.image} alt={attraction.name} className="attraction-image" />
      <h3>{attraction.name}</h3>
    </div>
  );
  
};


export default Attraction;
