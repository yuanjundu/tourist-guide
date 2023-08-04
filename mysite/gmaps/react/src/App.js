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
  const [attractionMarkers, setAttractionMarkers] = useState([]);

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
      fetch(`${process.env.REACT_APP_API_URL}/api/attractions/?format=json`)
        .then((response) => response.json())
        .then((data) => {
          const updatedData = data.map(attraction => ({ ...attraction, isSelected: false }));
          setAttractions(data);
          localStorage.setItem('attractions', JSON.stringify(data));
        });
    }
  }, []);


  const handleToggleSelection = (attractionToToggle) => {
    setAttractions(attractions.map(attraction =>
      attraction.id === attractionToToggle.id ? { ...attraction, isSelected: !attraction.isSelected } : attraction
    ));
  
    // If the attraction is currently selected, remove it from the Placebar
    if (attractionToToggle.isSelected) {
      const indexToRemove = placesAttractions.findIndex(attraction => attraction.id === attractionToToggle.id);
      if (indexToRemove !== -1) {
        handleDeletePlace(indexToRemove);
        
        // Remove the unselected markers
        const markerToRemove = attractionMarkers[indexToRemove];
        if(markerToRemove){
          markerToRemove[0].setMap(null);
          const updatedMarkers = [...attractionMarkers];
          updatedMarkers.splice(indexToRemove, 1);
          setAttractionMarkers(updatedMarkers);
        }
      }
    }
  };
  
  const handleAddAttraction = (attraction) => {
    // Restrict the number of attractions
    if (places.length >= 5) {
      alert("You could choose at most 5 attractions!");
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
  

  // Show markers of selected attractions
  const handleShowAttraction= (attraction) => {
    const newMarkers = []
    const geocoder = new window.google.maps.Geocoder;
    geocoder.geocode({address: attraction.name}, (results, status) => {
      if(status === window.google.maps.GeocoderStatus.OK && results.length > 0){
        const location = results[0].geometry.location;
        // console.log(location)
        newMarkers.push(
          new window.google.maps.Marker({
            map: mapInstance,
            position: location
          })
        );
        setAttractionMarkers([...attractionMarkers, newMarkers])
        console.log(newMarkers)
        console.log(attractionMarkers)
      }
    })
  };

  const handleDeletePlace = (index) => {
    const updatedPlaces = [...places];
    const updatedPlacesAttractions = [...placesAttractions];
    
    // Unselect the respective attraction in the attractions list
    const attractionToUnselect = updatedPlacesAttractions[index];
    handleToggleSelection(attractionToUnselect);
  
    updatedPlaces.splice(index, 1);
    updatedPlacesAttractions.splice(index, 1);
  
    setPlaces(updatedPlaces);
    setPlacesAttractions(updatedPlacesAttractions);
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
          <h1>Hi Shubh!</h1>
          <p id="intro">Discover, Navigate and Immerse yourself in the wonders of travelling</p>
          <hr className="divider" />
        </div>

        <div id='content'>
          {/* Recommendations */}
          <div className="left-container">
            <div id='recommendations'>
              <div id="recommendation-box">
                {attractions.map((attraction) => (
                  <Attraction
                    key={attraction.id}
                    attraction={attraction}
                    onAddAttraction={handleAddAttraction}
                    onShowAttraction={handleShowAttraction}
                    isSelected={attraction.isSelected}
                    onToggleSelection={handleToggleSelection}
                  />
                ))}
              </div>
            </div>

            <div id='place-bar-desktop'>
              <Placebar places={places} handleShowAttraction={handleShowAttraction} handleDeletePlace={handleDeletePlace} />
            </div>
          </div>

          {/* Google maps */}
          <div ref={mapDivRef} id='mapcon'>
            <Map placeDetails={placeDetails} setPlaceDetails={setPlaceDetails} setMapInstance={setMapInstance} />
          </div>

          {/* Placebar */}
          <div id='place-bar-mobile'>
            <Placebar places={places} handleShowAttraction={handleShowAttraction} handleDeletePlace={handleDeletePlace} />
          </div>

          {/* Fixed Navigation on the screen bottom */}
          <div className='nav-box'>
            <Navigation onLocationChange={handleLocationChange} myLocation={myLocation} placesAttractions={placesAttractions} selectedDate={selectedDate} mapInstance={mapInstance} />
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
