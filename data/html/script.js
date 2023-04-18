let map;
let polyline;
let distanceDisplay;


function initMap() {
    console.log("initMap function executed"); // Add this line to check if the function is executed
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 41.9898236, lng: -84.3395166 },
        zoom: 10,
        mapTypeId: 'satellite'
    });

    distanceDisplay = document.getElementById('distance-display');

    loadJSONData();

    map.addListener('click', async (event) => {
        const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        const clickedPoint = event.latLng;
        const closestField = findClosestHomePlate(clickedPoint, baseballFieldData);
        measureDistance(closestField, clickedPoint); // Pass the closestField object instead of just home_plate
    });
}

async function loadJSONData() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';

    try {
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        baseballFieldData.forEach(field => {
            // console.log(field); // Add this line to check the field objects
            createPolygon(field);
            createHomePlateMarker(field);
        });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}


///////////// CREATE POLYGON FUNCTION/////////////
function createPolygon(field) {
    const coordinates = field.polygon.map(coord => {
        return new google.maps.LatLng(coord[1], coord[0]);
    });

    const fillColor = field.fair_foul === 'fair' ? '#90EE90' : '#FFB6C1';

    const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: fillColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: 0.35
    });

    polygon.setMap(map);

    // Set the name property of the field object to the value of field_name from the JSON data
    field.name = field.field_name;

    polygon.addListener('click', (event) => {
        measureDistance(field, event.latLng, polygon);
    });
}





/// MEASURE DISTANCE FUNCTION///


function measureDistance(field, clickedPoint, polygon) {
    const homePlate = field.home_plate; // Use the home_plate property from the field object
    ////// CHECKE CHECK/////
    console.log("Field name: ", field.name); // add this line
    ////// CHECKE CHECK/////

    let isInsidePolygon = false;
    let closestPoint = clickedPoint;

    if (polygon) {
        isInsidePolygon = google.maps.geometry.poly.containsLocation(clickedPoint, polygon);
        if (!isInsidePolygon) {
            closestPoint = google.maps.geometry.poly.closestLocation(clickedPoint, polygon).point;
        }
    } else {
        // If there's no polygon provided, assume the click is outside any polygon
        isInsidePolygon = false;
    }

    if (polyline) {
        polyline.setMap(null);
    }

    polyline = new google.maps.Polyline({
        path: [new google.maps.LatLng(homePlate[1], homePlate[0]), closestPoint],
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    polyline.setMap(map);

    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        closestPoint
    );

    const totalDistanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        clickedPoint
    );

    const distanceInFeet = distanceInMeters * 3.28084;
    const totalDistanceInFeet = totalDistanceInMeters * 3.28084;

    // Pass both distances to the updateDistanceDisplay function
    updateDistanceDisplay(distanceInFeet, totalDistanceInFeet); // Pass the totalDistanceInFeet value
    updateFieldNameDisplay(field.name); // Display the field name
}

//// FUNTION TO DISPLAY FIELD NAME ///
function updateFieldNameDisplay(fieldName) {
    console.log('fieldName:', fieldName); // Add this line to check the value of fieldName
    const fieldNameDisplay = document.getElementById('field-name-display');
    fieldNameDisplay.textContent = `Field name: ${fieldName}`;
}

// function updateFieldNameDisplay(field) {
//     const fieldNameDisplay = document.getElementById('field-name-display');
//     if (field) {
//       const fieldName = field.field_name || "Unknown Field";
//       fieldNameDisplay.textContent = `Field name: ${fieldName}`;
//     } else {
//       fieldNameDisplay.textContent = "";
//     }
//   }
  

/// Function that adds a marker to the home plate location 
/// This should make it easier to find the location of the fields
function createHomePlateMarker(field) {
    const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);

    const marker = new google.maps.Marker({
        position: homePlateLatLng,
        map: map,
        title: 'Home Plate',
    });
}

function updateDistanceDisplay(distanceInFeet, totalDistanceInFeet) {
    distanceDisplay.textContent = `Distance from home plate: ${Math.round(distanceInFeet)} feet`;
    document.getElementById('fence-distance-display').textContent = `Fence distance: ${Math.round(totalDistanceInFeet)} feet`;
}

////////////// FIND CLOSEST HOME PLATE FUNCTION //////////////
function findClosestHomePlate(clickedPoint, baseballFieldData) {
    let closestField;
    let minDistance = Infinity;

    baseballFieldData.forEach(field => {
        const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(clickedPoint, homePlateLatLng);

        if (distance < minDistance) {
            minDistance = distance;
            closestField = field;
        }
    });
  // Update the closestField object to use the field_name property instead of the name property
  if (closestField) {
    closestField.name = closestField.field_name;
}

// Update the Field name display on the HTML page
updateFieldNameDisplay(closestField.name);

return closestField;
}