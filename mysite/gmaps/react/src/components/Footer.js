import React from "react";
import Map from '../Map';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    // Scroll to map
  const mapDivRef = useRef(null);
  const scrollToMap = () => {
    mapDivRef.current.scrollIntoView({ behavior: 'smooth' });
  }

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


    return (
        <footer>
            <nav>
                <ul id="nav-list">
                    <li><button><icons.Wallet2 /></button></li>
                    <li><button onClick={scrollToMap}><icons.GeoAlt /></button></li>
                    <li><button><icons.RocketTakeoff /></button></li>
                    <li><button onClick={redirectToHome}><icons.HouseDoor /></button></li>
                    <li><button><icons.Gear onClick={reDirectToEditProfile} /></button></li>
                </ul>
            </nav>
        </footer>
    )
}




export default Footer