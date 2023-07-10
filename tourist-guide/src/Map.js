import React, { createContext, useRef, useState, useEffect } from 'react';
import { GoogleMap, StandaloneSearchBox, useLoadScript } from '@react-google-maps/api';
import Itinerary from './Itinerary';

export const clickPlaceInfo = createContext();
const libraries = ['places'];

function Map() {
    // Map reference
    const mapRef = useRef(null);
    // Search box reference
    const searchBoxRef = useRef(null);
    // Markers
    let markers = []
    // Info window
    const infoWindowRef = useRef(null);
    // Select or search detailed place
    const [placeDetails, setPlaceDetails] = useState(null);

    // Make sure the map is loaded
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyDMTnLlJMThssazGhjRyY6fwjaci2lpat8",
        libraries,
    });

    // Control the map loads
    const handleMapLoad = (map) => {
        mapRef.current = map;
        mapRef.current.addListener('click', handleMapClick);
        console.log('Map loaded:', map);
    };

    // Control the search box loads
    const handleSearchBoxLoad = (searchBox) => {
        searchBoxRef.current = searchBox;
        console.log('Search box loaded:', searchBox);
    };

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

        if(places){
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
    
                // // Adjust the viewport of map
                if(places && places.length === 1){
                    mapRef.current.setZoom(15);
                    mapRef.current.panTo(place.geometry.location);
                }else{
                    mapRef.current.setZoom(11);
                    mapRef.current.panTo(place.geometry.location);
                }
            });
        }
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
                center={{ lat: 40.768, lng: -73.976 }}
                zoom={11}
                mapContainerClassName='map-container'
                onLoad={handleMapLoad}
                options={{
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
            <clickPlaceInfo.Provider value={{placeDetails}}><Itinerary /></clickPlaceInfo.Provider>
        </>
    );
};


export default Map;


