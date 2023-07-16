import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './History.module.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

const History = () => {
    const [history, setHistory] = useState([]);

    function refreshToken(callback) {
        // retrieve refresh token from storage
        const refreshToken = localStorage.getItem('refresh');

        axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken })
            .then((response) => {
                // store the new access token
                localStorage.setItem('access', response.data.access);
                // retry the failed request
                callback();
            })
            .catch((error) => {
                console.log(error);
                alert("An error occurred while refreshing the token.");
            });
    }

    const handleDelete = async (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`http://localhost:8000/api/itinerary/${itineraryId}/delete/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                // handle success
                console.log("Itinerary deleted successfully!");
                // remove the deleted itinerary from the state
                setHistory(history.filter(itinerary => itinerary.id !== itineraryId));
            })
            .catch((error) => {
                // handle error
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleDelete(itineraryId));  // retry after refreshing the token
                } else {
                    console.log(error);
                }
            });
    }

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access');
            axios.get('http://localhost:8000/api/history/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((response) => {
                    setHistory(response.data);
                })
                .catch((error) => {
                    // handle error
                    if (error.response && error.response.status === 401) {
                        refreshToken(fetchHistory);  // Pass fetchHistory as a callback to retry the request after refreshing the token
                    } else {
                        console.log(error);
                    }
                });
        };
        fetchHistory();
    }, []);


    return (
        <div className={styles.historyContainer}>
            <Header />
            <h1 className={styles.header}>History</h1>
            {history.map((itinerary, index) => (
                <div key={index} className={styles.itinerary}>
                    <h2>Itinerary {index + 1} for {itinerary.saved_date}
                        <button className={styles.deleteButton} onClick={() => handleDelete(itinerary.id)}>Delete</button>
                    </h2>
                    <div className={styles.attractionSection}>
                        <h3>Morning Attractions:</h3>
                        {itinerary.morning_attractions.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Restaurant:</h3>
                        <p>{itinerary.selected_restaurant.name}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Afternoon Attractions:</h3>
                        {itinerary.afternoon_attractions.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}
                    </div>
                </div>
            ))}
            <Footer onLocationChange={() => { }} />
        </div>
    );
};

export default History;
