import React from "react";
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({selectedDate, handleSelectedDate}) => {
    useEffect(() => {
        console.log(selectedDate);
    }, [selectedDate]);

    // Check if logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        } else {
            setIsLoggedIn(false);
        }
    };

    const handleLogout = () => {
        // remove tokens
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
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
            <input type='date' value={selectedDate} onChange={handleSelectedDate} />
            {/* <button id="date-select"><icons.CalendarDate /></button> */}
            <button id="checkAccount" onClick={isLoggedIn ? showAccountDetails : redirectToLogin}>
                {isLoggedIn ? <icons.PersonCircle /> : <icons.BoxArrowInRight />}
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