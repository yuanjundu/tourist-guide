import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './History.module.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { refreshToken } from '../components/refreshToken';

const History = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const localHistory = localStorage.getItem('history');
            if (localHistory) {
                // Parse the JSON string back into an array
                setHistory(JSON.parse(localHistory));
            } else {
                const token = localStorage.getItem('access');
                axios.get('http://localhost:8000/api/history/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then((response) => {
                        // Store the history data in localStorage
                        localStorage.setItem('history', JSON.stringify(response.data));
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
            }
        };
        fetchHistory();
    }, []);

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
                const newHistory = history.filter(itinerary => itinerary.id !== itineraryId);
                setHistory(newHistory);
                console.log(newHistory);
                // Also update localStorage
                localStorage.setItem('history', JSON.stringify(newHistory));
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
        axios.post(`http://localhost:8000/api/itinerary/${itineraryId}/share/`, {}, {
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
            <Header/>
            <h1 className={styles.header}>History</h1>
            <div className={styles.div1}>
                <p className={styles.div1p}>Total time saved by the app</p>
                <p className={styles.div1time}>2 Hr 43 mins</p>
            </div>
            
            <div className={styles.line}>
                <p>_________________________________________________</p>
            </div>

            <div className={styles.div2}>
                <p className={styles.div2p}>Itinerary 1</p>
                <p className={styles.div2ps}>Date: 24th July 2023</p>
                <p className={styles.div2ps}>Spots: Empire Estate, Museum</p>
                <p className={styles.div2ps}>Time saved: 65 mins</p>
            </div>

            <div className={styles.div2}>
                <p className={styles.div2p}>Itinerary 2</p>
                <p className={styles.div2ps}>Date: 20th July 2023</p>
                <p className={styles.div2ps}>Spots: XYZ Library, ABC Garden</p>
                <p className={styles.div2ps}>Time saved: 93 min</p>
            </div>

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
                        <h3>Restaurant:</h3>
                        <p>{itinerary.selected_restaurant?.name}</p>
                    </div>

                    <div className={styles.attractionSection}>
                        <h3>Afternoon Attractions:</h3>
                        {itinerary.afternoon_attractions?.map((attraction, index) => (
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
