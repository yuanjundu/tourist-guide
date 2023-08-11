import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './History.module.css';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';
import Footer from '../components/Footer';

const History = () => {
    const [history, setHistory] = useState([]);

    console.log(history);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access');
            axios.get(`${process.env.REACT_APP_API_URL}/api/itinerary/history/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then((response) => {
                console.log(response.data);
                setHistory(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(fetchHistory);
                } else {
                    console.log(error);
                }
            });
        };
        fetchHistory();
    }, []);

    const handleDelete = async (itineraryId) => {
        console.log("Trying to delete itinerary with ID:", itineraryId);

        const token = localStorage.getItem('access');
        axios.delete(`${process.env.REACT_APP_API_URL}/api/itinerary/${itineraryId}/delete/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                // handle success
                console.log("Itinerary deleted successfully!");
                const newHistory = history.filter(itinerary => itinerary.id !== itineraryId);
                setHistory(newHistory);

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

    const handleShare = async (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.post(`${process.env.REACT_APP_API_URL}/api/itinerary/${itineraryId}/share/`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Itinerary shared successfully!");
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleShare(itineraryId));  // retry after refreshing the token
                } else {
                    console.log(error);
                }
            });
    }

    return (
        <div className={styles.historyContainer}>
            {/* <Header /> */}
            <h1 className={styles.header}>History</h1>
            {history.map((itinerary, index) => (
                <div key={index} className={styles.itinerary}>
                    <h2>Itinerary {index + 1} for {itinerary.saved_date}
                        <button className={styles.deleteButton} onClick={() => handleDelete(itinerary.id)}>Delete</button>
                        <button className={styles.shareButton} onClick={() => handleShare(itinerary.id)}>Share</button>
                    </h2>
                    <div className={styles.attractionSection}>
                        <h3>Morning Attractions:</h3>
                        {itinerary.morning_attractions?.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}

                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Lunch Restaurant:</h3>
                        <p>{itinerary.lunch_restaurant?.name}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Afternoon Attractions:</h3>
                        {itinerary.afternoon_attractions?.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Dinner Restaurant:</h3>
                        <p>{itinerary.dinner_restaurant?.name}</p>
                    </div>
                </div>
            ))}

            <div className='nav-box'>
                <Navigation onLocationChange={() => { }} />
            </div>
            <Footer />
        </div>
    );
};

export default History;