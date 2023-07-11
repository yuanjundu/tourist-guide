import React from 'react';

function Attraction({ attraction }) {
    return (
      <span className="attraction">
        <img src={attraction.image} alt={attraction.name} className="attraction-image"/>
        <h3>{attraction.name}</h3>
      </span>
    );
  }
  
export default Attraction;
