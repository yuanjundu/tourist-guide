import logo from './logo.svg';
import './App.css';
import Map from './Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { fetch } from 'whatwg-fetch';
import Attraction from './Attraction';
import Itinerary from './Itinerary';


function App() {
  // Click then display or fold the account details
  const accountSelectionRef = useRef(null);

  // Check if logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignupRedirect = () => {
    window.location.href = "http://localhost:8000/signup";
  };

  const handleLogout = () => {
    fetch('/logout_user/', { method: 'POST' })
      .then(() => {
        setIsLoggedIn(false);
        // window.location.href = "http://localhost:3000"; 
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/check-login")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsLoggedIn(data.isLoggedIn);
      });
  }, []);
  
  useEffect(() => {
    console.log(isLoggedIn);
  }, [isLoggedIn]);
  
  
  

  const showAccountDetails = () => {
    const displayStatus = window.getComputedStyle(accountSelectionRef.current).getPropertyValue('display');
    accountSelectionRef.current.style.display = displayStatus === 'none' ? 'block' : 'none';
  }

  // Select time
  const [selectedDate, setSelectedDate] = useState('');
  const handleSelectedDate = (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
  }

  useEffect(() => {
    console.log(selectedDate);
  }, [selectedDate]);

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
    fetch("/api/attractions/?format=json")
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

  return (
    <div className="App">
      {/* Fixed header on the screen top */}
      <header>
        <input type='date' value={selectedDate} onChange={handleSelectedDate} />
        {/* <button id="date-select"><icons.CalendarDate /></button> */}
        <button id="checkAccount" onClick={isLoggedIn ? showAccountDetails : handleSignupRedirect}>
          {isLoggedIn ? <icons.PersonCircle /> : <icons.BoxArrowInRight />}
        </button>

        {isLoggedIn && (
          <div id="account-selection" ref={accountSelectionRef}>
            <ul>
              <li id="check-history">Itinerary history</li>
              <li id="log-out" onClick={handleLogout}>log out</li>
            </ul>
          </div>
        )}
      </header>


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

      <footer>
        <nav>
          <ul id="nav-list">
            <li><button><icons.Wallet2 /></button></li>
            <li><button onClick={scrollToMap}><icons.GeoAlt /></button></li>
            <li><button><icons.RocketTakeoff /></button></li>
            <li><button onClick={scrollToHome}><icons.HouseDoor /></button></li>
            <li><button><icons.Gear /></button></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}


export default App;