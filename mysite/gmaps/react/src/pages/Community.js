import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './Community.module.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { refreshToken } from '../components/refreshToken';

const Community = () => {
    const [sharedItineraries, setSharedItineraries] = useState([]);
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const comparedUserId = JSON.parse(localStorage.getItem('userId'))

    const fetchSharedItineraries = useCallback(async () => {
        const token = localStorage.getItem('access');
        axios.get('http://localhost:8000/api/community_itinerary/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                setSharedItineraries(response.data);
                console.log(sharedItineraries);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(fetchSharedItineraries);
                } else {
                    console.log(error);
                }
            });
    }, []);

    useEffect(() => {
        fetchSharedItineraries();   
        console.log(sharedItineraries);
    }, [fetchSharedItineraries]);

    const handleJoin = async (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.post(`http://localhost:8000/api/community_itinerary/${itineraryId}/join/`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Joined the itinerary successfully!");
                axios.get('http://localhost:8000/api/community_itinerary/')
                    .then(response => {
                        setSharedItineraries(response.data);
                    });
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleJoin(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleDelete = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`http://localhost:8000/api/itinerary/${itineraryId}/share/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Deleted the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleDelete(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleExit = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`http://localhost:8000/api/community_itinerary/${itineraryId}/exit/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Exited the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleExit(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }


    return (
        <div className={styles.communityContainer}>
            <Header />
            <h1 className={styles.header}>Community</h1>
            {sharedItineraries.map((itinerary, index) => (
                <div key={index} className={styles.itinerary}>
                    <h2>Itinerary {index + 1} (Joined by {itinerary.joined_users.length} users)
                        Created by {itinerary.user.first_name + " " + itinerary.user.last_name}
                        {itinerary.user.id === comparedUserId
                            ? <button className={styles.deleteButton} onClick={() => handleDelete(itinerary.id)}>Delete</button>
                            : itinerary.joined_users.includes(comparedUserId)
                                ? <button className={styles.exitButton} onClick={() => handleExit(itinerary.id)}>Exit</button>
                                : <button className={styles.joinButton} onClick={() => handleJoin(itinerary.id)}>Join</button>
                        }
                    </h2>
                    <div className={styles.attractionSection}>
                        <h3>Date of travelling:</h3>
                        <p>{itinerary.itinerary.saved_date}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Morning Attractions:</h3>
                        {itinerary.itinerary.morning_attractions?.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Restaurant:</h3>
                        <p>{itinerary.itinerary.selected_restaurant?.name}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3>Afternoon Attractions:</h3>
                        {itinerary.itinerary.afternoon_attractions?.map((attraction, index) => (
                            <p key={index}>{attraction.name}</p>
                        ))}
                    </div>
                </div>
            ))}
            <Footer onLocationChange={() => { }} />
        </div>
    );
};

export default Community;
