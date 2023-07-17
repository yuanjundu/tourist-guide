import React from "react";
import Map from '../Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Footer = ({ onLocationChange, myLocation, placesAttractions = [], selectedDate}) => {
    // Scroll to map
    //   const mapDivRef = useRef(null);
    //   const scrollToMap = () => {
    //     mapDivRef.current.scrollIntoView({ behavior: 'smooth' });
    //   }

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
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
        <footer>
            <nav>
                <ul id="nav-list">
                    <li><button onClick={redirectToCommunity}><icons.PeopleFill /></button></li>
                    <li><button onClick={getCurrentLocation}><icons.GeoAlt /></button></li>
                    <li><button onClick={redirectToItinerary}><icons.RocketTakeoff /></button></li>
                    <li><button onClick={redirectToHome}><icons.HouseDoor /></button></li>
                    <li><button><icons.Gear onClick={reDirectToEditProfile} /></button></li>
                </ul>
            </nav>
        </footer>
    )
}

export default Footer