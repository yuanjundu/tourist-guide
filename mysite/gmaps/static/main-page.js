function initMap() {
    const map = new google.maps.Map(document.getElementById("maps"), {
        center: { lat: 40.76817295972691, lng: -73.97604600510499 },
        zoom: 11,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          }
    });

    // Create the search box
    const input = document.getElementById("search-box");
    const searchBox = new google.maps.places.SearchBox(input);

    // Put the search box at the top center
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Record markers
    let markers = [];

    // Change the viewport of the map and get the new bounds
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

    // Add listener of the search box
    searchBox.addListener('places_changed', () => {
        // Get new bounds
        const bounds = new google.maps.LatLngBounds();
        // Get the places input
        const places = searchBox.getPlaces();
        // The places only change when the length of name is > 0
        if (places.length === 0) {
            return;
        }
        const place = places[0];
        // Remove the markers added before
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
        }

        const icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
            };

        markers.push(
            new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            })
        );

        // Adjust the viewport
        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        map.fitBounds(bounds);
    });
};

function clickAccount(){
    const checkAccountBtn = document.getElementById("checkAccount");
    const accountSelection = document.getElementById("account-selection");

    document.addEventListener("click", (event) => {
        const isClickTarget = accountSelection.contains(event.target);
        const isClickButton = checkAccountBtn.contains(event.target);

        // Click the account and display or fold the details
        if(isClickButton){
            accountSelection.style.display = accountSelection.style.display === 'none' ? 'block' : 'none';
        }
        else{
            // Click the other places then fold the details
            if(!isClickTarget && accountSelection.style.display === 'block'){
                accountSelection.style.display = 'none';
            };
        };
    });
}


window.addEventListener('load', () => {
    initMap();
    clickAccount();
});
