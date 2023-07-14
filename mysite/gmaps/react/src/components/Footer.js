import React from "react";
import Map from '../Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = ({ onLocationChange, myRestaurant = null, placesAttractions = [] }) => {
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
        navigate('/itinerary', { state: { myRestaurant: myRestaurant, placesAttractions: placesAttractions } });
    }

    return (
        <footer>
            <nav>
                <ul id="nav-list">
                    <li><button><icons.Wallet2 /></button></li>
                    <li><button onClick={getCurrentLocation}><icons.GeoAlt /></button></li>
                    <li><button><icons.RocketTakeoff onClick={redirectToItinerary}/></button></li>
                    <li><button onClick={redirectToHome}><icons.HouseDoor /></button></li>
                    <li><button><icons.Gear onClick={reDirectToEditProfile} /></button></li>
                </ul>
            </nav>
        </footer>
    )
}

export default Footer