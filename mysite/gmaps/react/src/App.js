import logo from './logo.svg';
import Map from './Map';
import Attraction from './Attraction';
import Placebar from './Placebar';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from 'whatwg-fetch';
import './App.css';
import './index.css';

import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  // Fetch attractions
  const [attractions, setAttractions] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedAttractionForRestaurant, setSelectedAttractionForRestaurant] = useState(null);
  const [placesAttractions, setPlacesAttractions] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);




  //<------------------Test--------------------->
  useEffect(() => {
    console.log(placesAttractions);
    console.log(myRestaurant);
  });
 //<------------------Test--------------------->




  useEffect(() => {
    if (selectedAttractionForRestaurant) {
      fetchRestaurantsByAttraction(selectedAttractionForRestaurant.id);
    }
  }, [selectedAttractionForRestaurant]);


  // Get restaurant data
  const fetchRestaurantsByAttraction = (attractionId) => {
    fetch(`http://localhost:8000/api/attractions/${attractionId}/restaurants/?format=json`)
      .then((response) => response.json())
      .then((data) => setSelectedRestaurant(data));
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/attractions/?format=json")
      .then((response) => response.json())
      .then((data) => setAttractions(data));
  }, []);


  // Set my restaurant
  const handleSetMyRestaurant = (restaurant) => {
    setMyRestaurant(restaurant);
  }


  const [places, setPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);


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
    undatedPlaces.splice(index, 1);
    setPlaces(undatedPlaces);
  }

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
      <Header />

      <main >
        {/* Title */}
        <div id="headline">
          <h1>Tourist Guide</h1>
          <p id="intro">Discover, Navigate and Immerse yourself in the wonders of travelling</p>
          <hr className="divider" />
        </div>

        {/* Recommendations */}
        <div id="recommendations">
          <div id="recommendation-box">
            {attractions.map((attraction) => (
              <Attraction key={attraction.id} attraction={attraction} onAddAttraction={handleAddAttraction} />
            ))}
          </div>
        </div>


        {/* Google maps */}
        <div ref={mapDivRef}>
          <Map placeDetails={placeDetails} setPlaceDetails={setPlaceDetails} />
        </div>


        {/* Placebar */}
        <Placebar places={places} handleAddPlace={handleAddPlace} handleDeletePlace={handleDeletePlace} />

      </main>


      {/* Fixed footer on the screen bottom */}
      <Footer onLocationChange={handleLocationChange} myRestaurant={myRestaurant} placesAttractions={placesAttractions} />

    </div>
  );
}

export default App;
