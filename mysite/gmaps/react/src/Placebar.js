import React, { useState, useContext } from 'react';
import * as icons from 'react-bootstrap-icons';

function Placebar({ places = [], handleAddPlace, handleDeletePlace }) {
  return (
    <div>
      <div id='add-place'>
        <button onClick={handleAddPlace}>
          <p>Add this place</p>
          <icons.PlusCircle />
        </button>
      </div>
      <hr className="divider" id='bottom-divider'/>
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

export default Placebar;

