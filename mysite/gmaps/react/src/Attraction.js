import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

function Attraction({ attraction, onAddAttraction, onShowAttraction, isSelected, onToggleSelection }) {
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
      if (onShowAttraction){
        onShowAttraction(attraction);
      }
    }
    if (onToggleSelection) {
      onToggleSelection(attraction);
    }
  };

  const openAttractionWebsite = (url) => {
    // Open the URL in a new pop-up window.
    window.open(url, 'attractionWindow', 'height=600,width=800,toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
  };

  return (
    <div className={`attraction ${isSelected ? 'selected' : ''}`}>
      <div className="tick-container">
        {isSelected && <FaCheckCircle className="tick-icon" />}
      </div>
      <img src={attraction.image} alt={attraction.name} className="attraction-image" onClick={handleClick} />
      <h3 onClick={() => openAttractionWebsite(attraction.website)}>{attraction.name}</h3>

      <span className="open-website-label">Open Website</span>
    </div>
  );
};

export default Attraction;
