import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';

const Itinerary = () => {

    const location = useLocation();
    const { myRestaurant, placesAttractions } = location.state || {};

    //<------------------Test--------------------->
    useEffect(() => {
        console.log(placesAttractions);
        console.log(myRestaurant);
    });
    //<------------------Test--------------------->


    return (
        <div>
            <Header />

            



            <Footer onLocationChange={() => { }} myRestaurant={myRestaurant} placesAttractions={placesAttractions} />
        </div>
    );
};

export default Itinerary;
