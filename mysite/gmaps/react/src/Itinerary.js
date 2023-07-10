import React, { useState, useContext } from 'react';
import * as icons from 'react-bootstrap-icons';
import { clickPlaceInfo } from './Map';

function Itinerary() {
  const [places, setPlaces] = useState([]);
  // Get the place details from Map

  const placeDetails = useContext(clickPlaceInfo);
  
  const handleAddPlace = () => {
    if(placeDetails['placeDetails'] !== null){
      console.log("have clicked");
      console.log(placeDetails);
  
      const newPlace = (
        <div className="add-places">
          <icons.Geo />
          <span className="details">
            <p className="place-details">{placeDetails['placeDetails']}</p>
          </span>
          <button className="add-details">I'm Here</button>
        </div>
      )

      // Add the new place into array
      setPlaces([...places, newPlace]);

    }else{
      alert("Please select a place first.");
    }

  }

  const handleDeletePlace = (index) => {
    const undatedPlaces = [...places];
    undatedPlaces.splice(index, 1);
    setPlaces(undatedPlaces);
  }

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

