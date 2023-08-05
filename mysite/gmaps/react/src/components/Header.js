import React from "react";
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshToken } from "./refreshToken";
import axios from 'axios';
import Navigation from "./Navigation";

import DatePicker from "./DatePicker";


const Header = () => {
    // useEffect(() => {
    //     console.log(selectedDate);
    // }, [selectedDate]);

    // Check if logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [user, setUser] = useState({ firstName: '', lastName: '' });

    const getUserInfo = () => {
        const accessToken = localStorage.getItem('access');
    
        axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then((response) => {
                console.log(response);
                setUser(response.data);
    
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('userId', JSON.stringify(response.data.id))

            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => getUserInfo());  // retry after refreshing the token
                } else {
                    console.log(error);
                    alert("An error occurred while fetching the user info.");
                }
            });
    };
    

    useEffect(() => {
        if (isLoggedIn) {
            getUserInfo();
        }
    }, [isLoggedIn]);

    const navigate = useNavigate();

    const redirectToLogin = () => {
        navigate('/login');
    };

    const redirectToHistory = () => {
        navigate('/history');
    }

    const checkIfLoggedIn = () => {
        const token = localStorage.getItem('access');
        if (token) {
            setIsLoggedIn(true);
    
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                getUserInfo();  // Fetch from API if no user data in localStorage
            }
        } else {
            setIsLoggedIn(false);
        }
    };
    

    const handleLogout = () => {
        // remove tokens and user data
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
    };

    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    // Click then display or fold the account details
    const accountSelectionRef = useRef(null);

    const showAccountDetails = () => {
        const displayStatus = window.getComputedStyle(accountSelectionRef.current).getPropertyValue('display');
        accountSelectionRef.current.style.display = displayStatus === 'none' ? 'block' : 'none';
    }

    return (
        <header>
            {/* <input type='date' className={styles.date} value={selectedDate} onChange={handleSelectedDate} /> */}
            <DatePicker />

            {/* <button id="date-select"><icons.CalendarDate /></button> */}
            <button id="checkAccount" onClick={isLoggedIn ? showAccountDetails : redirectToLogin}>
                {isLoggedIn ? (
                    <div>
                        <span>Hello {user?.first_name} {user?.last_name}</span>
                        <icons.PersonCircle />
                    </div>
                ) : (
                    <icons.BoxArrowInRight />
                )}
            </button>


            {isLoggedIn && (
                <div id="account-selection" ref={accountSelectionRef}>
                    <ul>
                        <li id="check-history" onClick={redirectToHistory}>Itinerary history</li>
                        <li id="log-out on" onClick={handleLogout}>log out</li>
                    </ul>
                </div>
            )}
        </header>
    )
}

export default Header