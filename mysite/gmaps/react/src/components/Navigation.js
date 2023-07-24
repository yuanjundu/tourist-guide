import React from "react";
import { getMapInstance } from '../Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';


const Navigation = ({ onLocationChange, myLocation, placesAttractions = [], selectedDate, mapInstance}) => {
    // Scroll to map
    //   const mapDivRef = useRef(null);
    //   const scrollToMap = () => {
    //     mapDivRef.current.scrollIntoView({ behavior: 'smooth' });
    //   }
    // const mapInstance = useContext(getMapInstance);
    console.log(mapInstance)
    useEffect(() => {
        getCurrentLocation();
    }, [mapInstance]);

    const getCurrentLocation = () => {
        if (Navigation.geolocation) {
            Navigation.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    const showPosition = (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        onLocationChange(location);
        console.log('Current latitude:', latitude);
        console.log('Current longitude:', longitude);

        if(mapInstance){
            const myLocationMarkers = [];
            myLocationMarkers.forEach(marker => marker.setMap(null))
            myLocationMarkers.push(
                new window.google.maps.Marker({
                    map: mapInstance,
                    position: {lat: latitude, lng: longitude}
                })
            )
        }else{
            console.log('no map right now')
        }
      };
    
    const navigate = useNavigate();

    // Scroll to home page top
    const homePageRef = useRef(null);
    const redirectToHome = () => {
        navigate('/');
    }

    // Redirect to profile
    const reDirectToEditProfile = () => {
        navigate('/editprofile');
    }

    const redirectToItinerary = () => {
        navigate('/itinerary', { state: { myLocation, placesAttractions: placesAttractions, selectedDate} });
    }

    const redirectToCommunity = () => {
        navigate('/community');
    }


    return (
        <nav>
            <ul id="nav-list">
                <li><button onClick={redirectToCommunity}><icons.PeopleFill /><p className='nav-items'>Community</p></button></li>
                <li><button onClick={getCurrentLocation}><icons.GeoAlt /><p className='nav-items'>Location</p></button></li>
                <li><button onClick={redirectToItinerary}><icons.RocketTakeoff /><p className='nav-items'>Itineraries</p></button></li>
                <li><button onClick={redirectToHome}><icons.HouseDoor /><p className='nav-items'>Home</p></button></li>
                <li><button onClick={reDirectToEditProfile}><icons.Gear /><p className='nav-items'>Settings</p></button></li>
            </ul>
        </nav>
    )
}

export default Navigation