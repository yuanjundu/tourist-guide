import logo from './logo.svg';
import Map from './Map';
import Attraction from './Attraction';
import Itinerary from './Itinerary';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from 'whatwg-fetch';
import './App.css';
import './index.css';

import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  // Scroll to map
  const mapDivRef = useRef(null);
  const scrollToMap = () => {
    mapDivRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  // Scroll to home page top
  const homePageRef = useRef(null);
  const scrollToHome = () => {
    homePageRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  // Fetch attractions
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/attractions/?format=json")
      .then((response) => response.json())
      .then((data) => setAttractions(data));
  }, []);

  const [places, setPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);

  const handleAddAttraction = (attraction) => {
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
  };

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

  const navigate = useNavigate();
  const reDirectToEditProfile = () => {
    navigate('/editprofile');
  }

  return (
    <div className="App">
      {/* Fixed header on the screen top */}
      <Header />

      <main ref={homePageRef}>
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


        {/* Itinerary */}
        <Itinerary places={places} handleAddPlace={handleAddPlace} handleDeletePlace={handleDeletePlace} />

      </main>
      

      {/* Fixed footer on the screen bottom */}
    <Footer />
    </div>
  );
}

export default App;
