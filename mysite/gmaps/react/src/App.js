import logo from './logo.svg';
import './App.css';
import Map from './Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import Attraction from './Attraction';


function App() {
  // Click then display or fold the account details
  const accountSelectionRef = useRef(null);
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
  

  return (
    <div className="App">
      {/* Fixed header on the screen top */}
      <header>
        <input type='date' value={selectedDate} onChange={handleSelectedDate} />
        {/* <button id="date-select"><icons.CalendarDate /></button> */}
        <button id="checkAccount" onClick={showAccountDetails}><icons.PersonCircle /></button>
        <div id="account-selection" ref={accountSelectionRef}>
          <ul>
            <li id="check-history">Itinerary history</li>
            <li id="log-out">log out</li>
          </ul>
        </div>
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
              <Attraction key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>

        {/* Google maps */}
        <div ref={mapDivRef}>
          <Map />
        </div>

        {/* Itinerary */}

      </main>

      <footer>
        <nav>
          <ul id="nav-list">
            <li><button><icons.Wallet2 /></button></li>
            <li><button onClick={scrollToMap}><icons.GeoAlt /></button></li>
            <li><button><icons.PersonCircle /></button></li>
            <li><button onClick={scrollToHome}><icons.HouseDoor /></button></li>
            <li><button><icons.Gear /></button></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}


export default App;
