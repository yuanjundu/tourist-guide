import React, { createContext, useRef, useState, useEffect } from 'react';
import { GoogleMap, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';
import geoJsonData from './JSON/map.geojson';
import axios from 'axios';
import chroma from 'chroma-js';
import Itinerary from './Placebar';

export const clickPlaceInfo = createContext();
const libraries = ['places'];

function Map({ selectedDate, selectedTime, placeDetails, setPlaceDetails, setMapInstance }) {
    // Map reference
    const mapRef = useRef(null);
    // Search box reference
    const searchBoxRef = useRef(null);
    // Markers
    let markers = []
    // Info window
    const infoWindowRef = useRef(null);
    // Select or search detailed place
    // const [placeDetails, setPlaceDetails] = useState(null);

    const [places, setPlaces] = useState([]);
    const [busynessData, setBusynessData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Combine date and time to form the required format
        const formattedDateTime = `${selectedDate} ${selectedTime}:00`;
        // console.log(selectedDate);
        // console.log(selectedTime);
        console.log(formattedDateTime);
        fetchBusynessData(formattedDateTime);
    }, [selectedDate, selectedTime]);

    const fetchBusynessData = async (date) => {
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/all_busyness/?format=json`, { date_str: date });
            console.log("Response Data:", response.data);
            
            setBusynessData(response.data);
            localStorage.setItem('busynessData', JSON.stringify(response.data));
            
        } catch (error) {
            console.error("Error fetching busyness data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Make sure the map is loaded
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyD0DJ6Y_h6dUHAlAyRA82RScpFjrgZgNIM",
        libraries,
    });

    // console.log(busynessData);

    function busynessToColor(busynessValue) {
        const colorScale = chroma.scale(['green', 'red']).domain([0, 0.03]); 
        return colorScale(busynessValue).hex();
    }

    const displayInfoWindow = (position, zone, locationId, busyness) => {
        console.log(position);
        const contentString = `
            <div>
                <h3>${zone}</h3>
                <p>Location ID: ${locationId}</p>
                <p>Busyness: ${busyness}</p>
            </div>
        `;
    
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
        }
        
        infoWindowRef.current = new window.google.maps.InfoWindow({
            content: contentString,
            position: position
        });
    
        infoWindowRef.current.open(mapRef.current);
    }
    

    const handleFeatureClick = (event) => {
        const storedDataString = localStorage.getItem('busynessData');
        const storedData = JSON.parse(storedDataString || '[]'); 
        console.log(loading);
        console.log(storedData);
        const zone = event.feature.getProperty('zone');
        const locationId = event.feature.getProperty('locationid');
        const matchingBusynessData = storedData.find(item => item.zone_id === locationId);
        
        let busynessValue = "Unknown";
        if (matchingBusynessData && matchingBusynessData.busyness && matchingBusynessData.busyness.length > 0) {
            busynessValue = matchingBusynessData.busyness[0];
        }
    
        displayInfoWindow(event.latLng, zone, locationId, busynessValue);
    }
    

    // Control the map loads
    const handleMapLoad = (map) => {
        mapRef.current = map;
        mapRef.current.addListener('click', handleMapClick);
        console.log('Map loaded:', map);
        setMapInstance(map);
      
        map.data.loadGeoJson(geoJsonData);
        console.log(loading);
        map.data.addListener('click', handleFeatureClick);    
      };

  
      useEffect(() => {
        if (mapRef.current) {
            mapRef.current.data.setStyle(feature => {
                const storedDataString = localStorage.getItem('busynessData');
                const storedData = JSON.parse(storedDataString || '[]'); 
                const locationId = feature.getProperty("locationid");
                const zone = storedData.find(item => item.zone_id === locationId);
                
                // If no match or no busyness data, default to white color
                const busynessValue = zone?.busyness[0] || 0;
                
                return {
                    fillColor: busynessToColor(busynessValue),
                    strokeWeight: 1
                };
            });
        }
    }, [selectedDate, selectedTime, mapRef.current]);
    
      

    // Control the search box loads
    const handleSearchBoxLoad = (searchBox) => {
        searchBoxRef.current = searchBox;
        console.log('Search box loaded:', searchBox);
    };

    const mapStyle = [
        {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                },
                {
                    "color": "#5b6571"
                },
                {
                    "lightness": "35"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#f3f4f4"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                {
                    "weight": 0.9
                },
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#83cead"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#fee379"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.highway.controlled_access",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                },
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#7fc8ed"
                }
            ]
        }
    ]
    // Handle search place
    // const handleSearchPlace = () => {
    //     const places = searchBoxRef.current.getPlaces();
    //     console.log(places)
    //     if (places && places.length === 1) {
    //         setPlaceDetails(places[0].name);
    //     }
    // }

    // Handle places changes
    const handlePlacesChanged = () => {
        // Remove the former markers
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        const places = searchBoxRef.current.getPlaces();

        // The places only change when the length of name is > 0
        if (places && places.length === 0) {
            return;
        }

        // if (places && places.length === 1) {
            // infoWindowRef.current = new window.google.maps.InfoWindow(); 
            // // Set the content and open the info window
            // infoWindowRef.current.setContent(places[0].name);
            // infoWindowRef.current.setPosition(places[0].geometry.location);
            // infoWindowRef.current.open(mapRef.current, places[0]);
        // }
        
        let bounds = new window.google.maps.LatLngBounds();

        places.forEach((place) => {
            console.log(place.name)
            // If doesn't find this place
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            // Icons
            const icon = {
                url: place.icon,
                size: new window.google.maps.Size(71, 71),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(17, 34),
                scaledSize: new window.google.maps.Size(25, 25),
            };

            // Add new marker on map
            markers.push(
                new window.google.maps.Marker({
                    map: mapRef.current,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                })
            );

            // Adjust the viewport of map
            if (places && places.length === 1) {
                mapRef.current.setZoom(15);
                mapRef.current.panTo(place.geometry.location);
            } else {
                mapRef.current.setZoom(12);
                mapRef.current.panTo(place.geometry.location);
            }
        });

        // // If only one place searched, then it can be added to itinerary
        // if(places && places.length === 1){
        //     setPlaceDetails(places[0].name);
    // }
    };


    // Let place details update immediately
    useEffect(() => {
        console.log(placeDetails);
      }, [placeDetails]);

    const handleMapClick = (event) => {
        // Remove the markers on the map
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        console.log("click!")
        const place = event.latLng;
        // Get the place name based on the event latlng 
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({location: place}, (results, status) => {
            if(status === 'OK' && results[0]){
                const placeName = results[0].formatted_address;
                setPlaceDetails(placeName);

                // Data need to display in info window
                const content = placeName;
                // Set an info window
                infoWindowRef.current = new window.google.maps.InfoWindow(); 
                // Set the content and open the info window
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.setPosition(place);
                infoWindowRef.current.open(mapRef.current, place);
            }
        })
        // Adjust the map's bounds
        // const bounds = new window.google.maps.LatLngBounds();
        // mapRef.current.setCenter(place);
    }

    // If the map doesn't load
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <>

            <GoogleMap
                ref={mapRef}
                center={{ lat: 40.7590322, lng: -74.0516319 }}
                zoom={12}
                mapContainerClassName='map-container'
                onLoad={handleMapLoad}
                options={{
                    styles: mapStyle,
                    mapTypeControl: true,
                    mapTypeControlOptions: { style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU },
                    restriction: {
                        latLngBounds: {
                            north: 40.8822,
                            south: 40.6797,
                            west: -74.0479,
                            east: -73.9070
                          },
                        strictBounds: false
                    }
                }}
            >
            <StandaloneSearchBox onLoad={handleSearchBoxLoad}   onPlacesChanged={handlePlacesChanged} >
                <input type="text" id="search-box" placeholder="Search for a place"  />
            </StandaloneSearchBox>
            </GoogleMap>

            {/* <clickPlaceInfo.Provier value={{placeDetails}}><Itinerary /></clickPlaceInfo.Provier> */}
        </>
    );
};


export default Map;


