let map;
let polyline;
let distanceDisplay;


function initMap() {
    ///////////////////CONSOLE LOG CHECK/////////////////////
    console.log("Initializing map...");
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
        const closest = findClosestHomePlate(clickedPoint, baseballFieldData);
        measureDistance(closest.field, clickedPoint, closest.polygon);
    });
    
}

async function loadJSONData() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';

    try {
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        baseballFieldData.forEach(field => {
            if (field.field_name === 'ballparks — Union City HS') {
                console.log("Field data:", field);
            }
            createPolygon(field);
            createHomePlateMarker(field);
        });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}


///////////// CREATE POLYGON FUNCTION/////////////

function createPolygon(field) {
    ///// CONSOLE LOG CHECK ////
    console.log("Creating polygon for: ", field.name);
    ////////////////////////////////////////////
    const coordinates = field.polygon.map(coord => {
        return new google.maps.LatLng(coord[1], coord[0]);
    });

    const fillColor = field.fair_foul === 'fop' ? '#90EE90' : '#FFB6C1';

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

    field.polygonObj = polygon; // Store the created polygon in the field object

    polygon.addListener('click', (event) => {
        measureDistance(field, event.latLng, polygon);
    });
}





/// MEASURE DISTANCE FUNCTION///


function measureDistance(field, clickedPoint, polygon) {
    //// CONSTANT THAT ALLOWS ME TO USE THE GOOGLE MAPS API FUNCTIONS ////
    const homePlate = field.home_plate;

    console.log("Field name: ", field.name);
    console.log("Home plate coordinates: ", homePlate);
    console.log("Clicked point coordinates: ", clickedPoint.toJSON());
// TURNED OFF FOR CLAIRITY IN CONSOLE LOGS
    // console.log("Field name: ", field.name);
// OFF ////////////////////////////
    let isInsidePolygon = false;
    let closestPoint = clickedPoint;

    if (polygon) {
        isInsidePolygon = google.maps.geometry.poly.containsLocation(clickedPoint, polygon);
        if (!isInsidePolygon) {
            const tolerance = 0.0001; // Set a small tolerance value
            let intersectionPoint;

            for (let t = 0; t <= 1; t += 0.001) {
                const interpolatedPoint = google.maps.geometry.spherical.interpolate(
                    new google.maps.LatLng(homePlate[1], homePlate[0]),
                    clickedPoint,
                    t
                );

                if (isLocationOnEdge(interpolatedPoint, polygon, tolerance)) {
                    intersectionPoint = interpolatedPoint;
                    break;
                }
            }

            closestPoint = intersectionPoint || google.maps.geometry.poly.closestLocation(clickedPoint, polygon).point;
        }
    } else {
        isInsidePolygon = false;
    }
    
    if (polygon && !isInsidePolygon) {
        console.log("Intersection point coordinates: ", closestPoint.toJSON());
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

    const fence_length = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        closestPoint
    );

    const click_length = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        clickedPoint
    );

    const fence_lengthInFeet = fence_length * 3.28084;
    const click_lengthInFeet = click_length * 3.28084;

    updateDistanceDisplay(fence_lengthInFeet, click_lengthInFeet);
    updateFieldNameDisplay(field.name);
}

//// FUNTION TO DISPLAY FIELD NAME ///
function updateFieldNameDisplay(fieldName) {
    console.log('fieldName:', fieldName); // Add this line to check the value of fieldName
    const fieldNameDisplay = document.getElementById('field-name-display');
    fieldNameDisplay.textContent = `Field name: ${fieldName}`;
}

 

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

function updateDistanceDisplay(fence_lengthInFeet, click_lengthInFeet) {
    document.getElementById('fence-distance-display').textContent = `Fence distance: ${Math.round(fence_lengthInFeet)} feet`;

    document.getElementById('click-distance-display').textContent = `Click distance: ${Math.round(click_lengthInFeet)} feet`;
}


////////////// FIND CLOSEST HOME PLATE FUNCTION //////////////
function findClosestHomePlate(clickedPoint, baseballFieldData) {
    let closestField;
    let minDistance = Infinity;
    let closestPolygon;

    baseballFieldData.forEach(field => {
        const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(clickedPoint, homePlateLatLng);

        if (distance < minDistance) {
            minDistance = distance;
            closestField = field;
            closestPolygon = field.polygonObj; // Retrieve the stored polygon from the field object
        }
    });

    if (closestField) {
        closestField.name = closestField.field_name;
    }

    updateFieldNameDisplay(closestField.name);

    return { field: closestField, polygon: closestPolygon }; // Return both the field object and its polygon
}

