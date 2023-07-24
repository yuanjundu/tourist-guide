import logo from './logo.svg';
import Map from './Map';
import Attraction from './Attraction';
import Placebar from './Placebar';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from 'whatwg-fetch';
import axios from 'axios';
import './App.css';
import './index.css';
import './desktop-index.css';

import Header from './components/Header';
import Navigation from './components/Navigation';

function App() {
  // Fetch attractions
  const [attractions, setAttractions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [placesAttractions, setPlacesAttractions] = useState([]);

  //<------------------Test--------------------->
  useEffect(() => {
    // console.log(typeof handleLocationChange);
    // console.log(mapInstance);
    // console.log(selectedDate);
    // console.log(myLocation);
    // console.log(placesAttractions);
  });
  //<------------------Test--------------------->


  // Select time
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const handleSelectedDate = (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
  }


  useEffect(() => {
    const localAttractions = localStorage.getItem('attractions');
    if (localAttractions) {
        setAttractions(JSON.parse(localAttractions));
    } else {
        fetch("http://localhost:8000/api/attractions/?format=json")
        .then((response) => response.json())
        .then((data) => {
            setAttractions(data);
            localStorage.setItem('attractions', JSON.stringify(data)); // 'response' is replaced with 'data'
        });
    }
}, []);



  const handleAddAttraction = (attraction) => {
    // Restrict the number of attractions
    if (places.length >= 4) {
      alert("You could choose at most 4 attractions!");
      return;
    }
    const newPlace = (
      <div className="add-places">
        <icons.Geo />
        <span className="details">
          <p className="place-details">{attraction.name}</p>
        </span>
        <button className="add-details">I'm Here</button>
      </div>
    );

    // Add the new place into array
    setPlaces([...places, newPlace]);
    setPlacesAttractions([...placesAttractions, attraction]);
  };

  // Add places from map
  const handleAddPlace = () => {
    if (placeDetails !== null) {
      const newPlace = (
        <div className="add-places">
          <icons.Geo />
          <span className="details">
            <p className="place-details">{placeDetails}</p>
          </span>
          <button className="add-details">I'm Here</button>
        </div>
      );

      setPlaces([...places, newPlace]);
    } else {
      alert("Please select a place first.");
    }
  };

  const handleDeletePlace = (index) => {
    const undatedPlaces = [...places];
    const newPlacesAttractions = [...placesAttractions];
    undatedPlaces.splice(index, 1);
    newPlacesAttractions.splice(index, 1);
    setPlaces(undatedPlaces);
    setPlacesAttractions(newPlacesAttractions);
  }

  // State to store map instance
  const [mapInstance, setMapInstance] = useState(null);

  // Scroll to map
  const mapDivRef = useRef(null);
  const scrollToMap = () => {
    mapDivRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  // Get myLocation
  const [myLocation, setMyLocation] = useState({ latitude: null, longitude: null });
  const handleLocationChange = (location) => {
    setMyLocation(location);
  };

  return (
    <div className="App">
      {/* Fixed header on the screen top */}
      <Header selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />

      <main >
        {/* Title */}
        <div id="headline">
          <h1>Tourist Guide</h1>
          <p id="intro">Discover, Navigate and Immerse yourself in the wonders of travelling</p>
          <hr className="divider" />
        </div>

        <div id='content'>
          {/* Recommendations */}
          <div className="left-container">
            <div id='recommendations'>
              <div id="recommendation-box">
                {attractions.map((attraction) => (
                  <Attraction key={attraction.id} attraction={attraction} onAddAttraction={handleAddAttraction} />
                ))}
              </div>
            </div>

            <div id='place-bar-desktop'>
              <Placebar places={places} handleAddPlace={handleAddPlace} handleDeletePlace={handleDeletePlace}/>
          </div>
          </div>

          {/* Google maps */}
          <div ref={mapDivRef} id='mapcon'>
            <Map placeDetails={placeDetails} setPlaceDetails={setPlaceDetails} setMapInstance={setMapInstance}/>
          </div>

          {/* Placebar */}
          <div id='place-bar-mobile'>
            <Placebar places={places} handleAddPlace={handleAddPlace} handleDeletePlace={handleDeletePlace}/>
          </div>

          {/* Fixed Navigation on the screen bottom */}
          <div className='nav-box-mobile'>
            <Navigation onLocationChange={handleLocationChange} myLocation={myLocation} placesAttractions={placesAttractions} selectedDate={selectedDate} mapInstance={mapInstance} />
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
