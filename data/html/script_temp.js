let map;
let homePlateMarkers = [];
let jsonDataUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json";

// Assign initMap to the global window object before its declaration
window.initMap = initMap;

function initMap() {
    const mapOptions = {
        center: { lat: 42.73083599794937, lng: -84.50644300218417 }, // Center of the United States
        zoom: 16,
        mapTypeId: "hybrid",
    };
    
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    fetchDataAndDisplayFields();
    homePlateMarkers = createHomePlateMarkers(homePlates, map);

}


function fetchDataAndDisplayFields() {
    fetch(jsonDataUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log("Fetched data:", data); // Add this console log
            // ...
            for (const field of data) {
                if (field.foul && field.fop) {
                    displayField(field);
                }
            }
            map.addListener("click", onMapClick);
        });
}

function displayField(field) {
    console.log("Displaying field:", field); // Add this console log
    //..
    const foulCoords = field.foul.map(coord => ({ lat: coord[1], lng: coord[0] }));
    const fopCoords = field.fop.map(coord => ({ lat: coord[1], lng: coord[0] }));
    const homePlate = { lat: field.home_plate[1], lng: field.home_plate[0] };


    const foulPolygon = new google.maps.Polygon({
        paths: foulCoords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    });
    foulPolygon.setMap(map);

    const fopPolygon = new google.maps.Polygon({
        paths: fopCoords,
        strokeColor: "#008000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#008000",
        fillOpacity: 0.35,
    });
    fopPolygon.setMap(map);

    const homePlateMarker = new google.maps.Marker({
        position: homePlate,
        map,
        title: field.field,
    });
    homePlateMarkers.push(homePlateMarker);
}

function onMapClick(event) {
    console.log("Map clicked:", event); // Add this console log
    ///...
    const closestHomePlate = findClosestHomePlate(event.latLng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(event.latLng, closestHomePlate.position);
    const distanceInFeet = distance * 3.28084;

    displayLine(closestHomePlate.position, event.latLng);
    displayFieldInfo(closestHomePlate.title, distanceInFeet);
}

console.log("Home plate markers:", homePlateMarkers);

function findClosestHomePlate(clickLocation) {
    let minDistance = Infinity;
    let closestMarker;

    for (let i = 0; i < homePlateMarkers.length; i++) {
        const marker = homePlateMarkers[i];
        const distance = google.maps.geometry.spherical.computeDistanceBetween(clickLocation, marker.getPosition());

        console.log("Marker:", marker, "Distance:", distance); // Add this console log

        if (distance < minDistance) {
            minDistance = distance;
            closestMarker = marker;
        }
    }

    console.log("Closest home plate:", closestMarker, "Distance:", minDistance);
    return closestMarker;
}

function displayLine(start, end) {
    const line = new google.maps.Polyline({
        path: [start, end],
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    line.setMap(map);
}

function displayFieldInfo(fieldName, distance) {
    const infoContainer = document.getElementById("info-container");
    const distanceInFeetRounded = Math.round(distance * 100) / 100;
    infoContainer.innerHTML = `<h2>${fieldName}</h2><p>Distance: ${distanceInFeetRounded} feet</p>`;
}
function createHomePlateMarkers(homePlates, map) {
    const markers = [];
  
    for (const homePlate of homePlates) {
      // Accessing latitude and longitude from the "home_plate" field
      const position = new google.maps.LatLng(homePlate.home_plate[1], homePlate.home_plate[0]);
  
      const marker = new google.maps.Marker({
        position: position,
        map: map
      });
  
      // Create a polygon for each home plate
      const polygon = new google.maps.Polygon({
        paths: homePlate.fop, // Use the "fop" field for the polygon points
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: map
      });
  
      markers.push({
        marker: marker,
        polygon: polygon
      });
    }
  
    console.log("Created home plate markers:", markers);
    return markers;
  }
  
  

// Assign initMap to the global window object
window.initMap = initMap;