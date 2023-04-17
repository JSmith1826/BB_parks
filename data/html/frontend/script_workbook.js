/// Congfiguration Info

var apiKey = config.MAPS_API_KEY;


/// Functions that will be able to get location from the browser

/// Define a variable to store the user's location
var userLocation = null;

// Define the getLocation() function to retrieve the user's location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Define the showPosition() function to display the user's location and save it to the userLocation variable
function showPosition(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // Save the user's location to the userLocation variable or to local storage
  userLocation = {lat: lat, lng: lng};
  // OR
  // localStorage.setItem('userLocation', JSON.stringify({lat: lat, lng: lng}));

  // Use the user's location to center the map
  initMap(userLocation);
}

// Define the initMap() function to initialize the map centered on the user's location
function initMap(center) {
  var map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 10,
  });

  // Add a marker at the center of the map
  var marker = new google.maps.Marker({
    position: center,
    map: map,
  });
}

// Define the showError() function to handle any errors that occur while retrieving the user's location
function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
