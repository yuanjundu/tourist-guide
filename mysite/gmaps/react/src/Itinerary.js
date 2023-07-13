import React, { useState, useContext } from 'react';
import * as icons from 'react-bootstrap-icons';
import { clickPlaceInfo } from './Map';

function Itinerary({ places = [], handleAddPlace, handleDeletePlace }) {
  return (
    <div>
      <button id='add-place' onClick={handleAddPlace}>Add this place</button>
      <hr className="divider" />
      {places.map((place, index) => (
        <div key={index}>
          {place}
          <button className="delete-place" onClick={() => handleDeletePlace(index)} place-index={index}>Delete</button>
          <hr className="divider" />
          </div>
      ))}
    </div>
  );
}

export default Itinerary;

