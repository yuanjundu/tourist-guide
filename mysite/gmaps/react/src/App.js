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
import styles from './pages/HeadDesign.module.css';
import background from './pages/assets/background.jpg'
import video from './pages/assets/video.mp4'
import Header from './components/Header';
import Navigation from './components/Navigation';
import { CSSTransition } from 'react-transition-group';
import './FadeInEffect.css';
import Datepicker from './components/DatePicker';
import Footer from './components/Footer'

function App() {
  // Fetch attractions
  const [attractions, setAttractions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [placesAttractions, setPlacesAttractions] = useState([]);
  const [attractionMarkers, setAttractionMarkers] = useState([]);
  const [selectedTag, setSelectedTag] = useState('Sightseeing');


  //<------------------Test--------------------->
  useEffect(() => {
    // console.log(typeof handleLocationChange);
    // console.log(mapInstance);
    // console.log(selectedDate);
    // console.log(myLocation);
    // console.log(placesAttractions);
    // console.log(displayedAttractions);
  });
  //<------------------Test--------------------->


  // Select time
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);


  const [showDatePicker, setShowDatePicker] = useState(false);
  const toggleDatePickerInApp = () => {
    setShowDatePicker(prev => !prev);
  };


  const currentTime = new Date();
  const formattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
  const [selectedTime, setSelectedTime] = useState(formattedTime);


  // const handleSelectedDate = (event) => {
  //   const dateValue = event.target.value;
  //   setSelectedDate(dateValue);
  // }

  const handleSelectedDate = (dateValue) => {
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
    if (places.length >= 5) {
      if (attractionToToggle.isSelected) {
        const indexToRemove = placesAttractions.findIndex(attraction => attraction.id === attractionToToggle.id);
        if (indexToRemove !== -1) {
          handleDeletePlace(indexToRemove);

        }
      }
      return;
    }
    setAttractions(attractions.map(attraction =>
      attraction.id === attractionToToggle.id ? { ...attraction, isSelected: !attraction.isSelected } : attraction
    ));

    // If the attraction is currently selected, remove it from the Placebar
    if (attractionToToggle.isSelected) {
      const indexToRemove = placesAttractions.findIndex(attraction => attraction.id === attractionToToggle.id);
      if (indexToRemove !== -1) {
        handleDeletePlace(indexToRemove);
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
  const handleShowAttraction = (attraction) => {
    if (places.length >= 5) {
      return;
    }
    const newMarkers = []
    const geocoder = new window.google.maps.Geocoder;
    geocoder.geocode({ address: attraction.name }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
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

    // Remove the unselected markers
    const markerToRemove = attractionMarkers[index];
    console.log('TO REMOVE:', markerToRemove)
    if (markerToRemove) {
      markerToRemove[0].setMap(null);
      const updatedMarkers = [...attractionMarkers];
      updatedMarkers.splice(index, 1);
      setAttractionMarkers(updatedMarkers);
    }

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


  const [fadeIn, setFadeIn] = useState(false);

  // const handleScroll = () => {
  //   if (window.scrollY >= 20) {
  //     setFadeIn(true);
  //   } else {
  //     setFadeIn(false);
  //   }
  // };

  useEffect(() => {
    window.addEventListener('wheel', setFadeIn(true));
    return () => {
      window.removeEventListener('wheel', setFadeIn(false));
    };
  }, []);

  const navigate = useNavigate();
  const redirectToItinerary = () => {
    navigate('/lunchrestaurants', { state: { myLocation, placesAttractions: placesAttractions, selectedDate, selectedTime } });
  }

  const displayedAttractions = selectedTag === 'Sightseeing'
    ? attractions
    : attractions.filter(attraction => {
      const attractionTags = attraction.tag.split(';').map(tag => tag.trim());
      return attractionTags.includes(selectedTag);
    });


  return (
    <div className={styles.container}>
      <div className={styles.image}>
        {/* <img className={styles.img} src={background}></img> */}
        <video className={styles.img} autoPlay loop muted>
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Fixed header on the screen top */}
      <Header selectedDate={selectedDate} setSelectedDate={handleSelectedDate} toggleDatePicker={toggleDatePickerInApp} showDatePicker={showDatePicker} />

      <main >
        {/* Title */}
        <div id='headline' className={styles.titleContainer}>
          <h1 className={styles.title}>Tourist Guide</h1>
          <p className={styles.intro}>Discover, Navigate and Immerse yourself in the wonders of travelling</p>
          <p className={styles.sideIntro}>---Create itinerary based on busyness</p>
        </div>
          <div>
            <div className={'filter-buttons-container'}>
              <button
                className={'filter-buttons'}
                onClick={() => setSelectedTag('Sightseeing')}
              >
                All
              </button>

            <button
              className={'filter-buttons'}
              onClick={() => setSelectedTag('Outdoor Activities')}
            >
              Outdoor Activities
            </button>

            <button
              className={'filter-buttons'}
              onClick={() => setSelectedTag('Historical')}
            >
              Historical
            </button>

            <button
              className={'filter-buttons'}
              onClick={() => setSelectedTag('Museum')}
            >
              Museum
            </button>

            <button
              className={'filter-buttons'}
              onClick={() => setSelectedTag('Architecture')}
            >
              Architecture
            </button>

              <button
                className={'filter-buttons'}
                onClick={() => setSelectedTag('Shopping')}
              >
                Shopping
              </button>
            </div>

          <div className={'selected-datetime'}>
            <div onClick={toggleDatePickerInApp}>
              <p>Select&nbsp;</p>
              <p className='selectDate'>Date </p>: {selectedDate}
            </div>
            <Datepicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <div>Time:&nbsp;
              <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            </div>
          </div>

          <div id='content' className={styles.container2}>
            {/* Recommendations */}
            <div className="left-container">
              <div id='recommendations'>
                <div id="recommendation-box">
                  {displayedAttractions.map((attraction) => (
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
                <button id='createItineraryBtn' onClick={redirectToItinerary}>Create Itinerary</button>
                <Placebar places={places} handleShowAttraction={handleShowAttraction} handleDeletePlace={handleDeletePlace} />
              </div>
            </div>

            {/* Google maps */}
            <div ref={mapDivRef} id='mapcon'>
              <Map selectedDate={selectedDate} selectedTime={selectedTime} placeDetails={placeDetails} setPlaceDetails={setPlaceDetails} setMapInstance={setMapInstance} />
            </div>

            {/* Placebar */}
            <div id='place-bar-mobile'>
              <button id='createItineraryBtn' onClick={redirectToItinerary}>Create Itinerary</button>
              <Placebar places={places} handleShowAttraction={handleShowAttraction} handleDeletePlace={handleDeletePlace} />
            </div>

          </div>
        </div>
        {/* Fixed Navigation on the screen bottom */}
        <div className='nav-box'>
          <Navigation onLocationChange={handleLocationChange} myLocation={myLocation} placesAttractions={placesAttractions} selectedDate={selectedDate} mapInstance={mapInstance} />
        </div>
      </main>
      <Footer />

    </div>

  );
}

export default App;