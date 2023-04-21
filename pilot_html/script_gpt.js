let map;
let fieldData;
let polygons = [];
let markers = [];
let clickMarker;
// let polyLine;
let polyLines = []; // This will store all polylines created on the map


function loadJSON() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';
    console.log("loadJSON called");
    return fetch(url)
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
}


function initMap() {
    console.log("initMap called");

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 42.73515943514113, lng: -84.54566558512492 },
        zoom: 16,
        mapTypeId: "satellite",
        tilt: 0,
        heading: 0,
        mapTypeControl: false,
    });

    loadJSON().then((data) => {
        fieldData = data;
        console.log(fieldData);
        createPolygons(fieldData); // Pass the fieldData to createPolygons
        createMarkers();
    });

    // add the click event listener to the map
    map.addListener("click", (event) => {
        // create a new marker at the clicked location
        clickMarker = new google.maps.Marker({ // remove 'let' keyword here
            position: event.latLng,
            map: map,
        });
    
        // call the createPolyLine function with the clickMarker as an argument
        let createdPolyLine = createPolyLine(clickMarker);
        onMapClick(event);
        totalDistance();
        fenceDistance();
    });
    

    google.maps.event.addListener(map, 'click', (event) => {
        if (clickMarker) {
            clickMarker.setMap(null);
        }
        if (polyLines.length > 0) {
            let lastPolyLine = polyLines[polyLines.length - 1];
            lastPolyLine.setMap(null);
            polyLines.pop(); // Remove the last polyline from the array
        }
        onMapClick(event);
        totalDistance();
        fenceDistance();
    });

}

/////////////MONEYTIME/////////////////////
/////// CLICK BEHAVIOR FOR MARKERS /////////

function onMapClick(event) {
    console.log("onMapClick called");
    if (clickMarker) {
        clickMarker.setMap(null);
    }
    if (polyLines.length > 0) {
        let lastPolyLine = polyLines[polyLines.length - 1];
        lastPolyLine.setMap(null);
        polyLines.pop(); // Remove the last polyline from the array
    }

    clickMarker = new google.maps.Marker({
        position: event.latLng,
        map: map,
    });

    let closestFieldInfo = findClosestFieldInfo(event.latLng);
    document.getElementById("field-name").innerHTML = `Field Name: ${closestFieldInfo.fieldName}`;

    let distance = closestFieldInfo.distanceInFeet;
    document.getElementById("distance").innerHTML = `Distance: ${distance.toFixed(2)} feet`;

    let fenceDistance = closestFieldInfo.fenceDistanceInFeet;
    document.getElementById("fence-distance").innerHTML = `Fence Distance: ${fenceDistance.toFixed(2)} feet`;

    let polyline = new google.maps.Polyline({
        path: [closestFieldInfo.homePlateLatLng, event.latLng],
        map: map,
        strokeColor: "blue",
        strokeWeight: 2,
    });
    polyLines.push(polyline); // Add the new polyline to the array
}

function createPolygons() {
    fieldData.forEach((field, index) => {
        if (field.fop && field.foul) { // Check if fop and foul properties exist
            console.log(`Processing field ${index}:`, field); // Add logging statement

            let fairCoords = field.fop.map((coord) => ({
                lat: coord[1],
                lng: coord[0],
            }));

            let foulCoords = field.foul.map((coord) => ({
                lat: coord[1],
                lng: coord[0],
            }));

            console.log(`FairCoords for field ${index}:`, fairCoords); // Add logging statement
            console.log(`FoulCoords for field ${index}:`, foulCoords); // Add logging statement

            let fairTerritory = new google.maps.Polygon({ // corrected variable name
                paths: fairCoords,
                fillColor: "green",
                fillOpacity: 0.5,
                strokeColor: "green",
                strokeOpacity: 1,
                strokeWeight: 1,
            });

            let foulTerritory = new google.maps.Polygon({ // corrected variable name
                paths: foulCoords,
                fillColor: 'red',
                fillOpacity: 0.5,
                strokeColor: 'red',
                strokeOpacity: 1,
                strokeWeight: 1,
            });

            fairTerritory.setMap(map);
            foulTerritory.setMap(map);
            polygons.push(fairTerritory, foulTerritory);
        } else {
            console.warn("Field object is missing fop and/or foul properties:", field);
        }
    });
}



function createMarkers() {
    fieldData.forEach((field) => {
        // extract the home plate coordinates
        let homeCoords = {
            lat: field.home_plate[1],
            lng: field.home_plate[0],
        };

        // create the home plate marker
        let homePlate = new google.maps.Marker({
            position: homeCoords,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: "white",
                fillOpacity: 1,
                strokeColor: "black",
                strokeWeight: 1,
            },
        });

        // add the marker to the map
        homePlate.setMap(map);
        markers.push(homePlate);
    });
}



function createPolyLine(clickedMarker) {
    // get the coordinates of the clicked marker
    let clickedCoords = clickedMarker.getPosition();

    // get the coordinates of the closest home plate
    let closestCoords = findClosestField(clickedCoords);

    // create the polyline
    let line = new google.maps.Polyline({
        path: [clickedCoords, closestCoords],
        strokeColor: "black",
        strokeOpacity: 1,
        strokeWeight: 1,
    });

    // apply it to the map
    line.setMap(map);
    polyLines.push(line);
    return line;
}


/////////////////////////////////////////
/////////////// BREAK ///////////////////
/////////////////////////////////////////

function fenceDistance() {
    // find the point where the polyLine intersects the field boundary
    /// create line segments from the vertices of the polygon so we can find an intersection point
    let lineSegments = [];
    let fieldCoords = findClosestField().fair;
    for (let i = 0; i < fieldCoords.length - 1; i++) {
        let lineSegment = [fieldCoords[i], fieldCoords[i + 1]];
        lineSegments.push(lineSegment);
    }

    // find the intersection point
    let intersection = null;
    for (let i = 0; i < lineSegments.length; i++) {
        if (google.maps.geometry.poly.isLocationOnEdge(clickMarker.getPosition(), new google.maps.Polygon({paths: [lineSegments[i]]}), 1e-5)) {
            intersection = lineSegments[i];
            break;
        }
    }

    if (!intersection) {
        console.error("Intersection not found");
        return;
    }

    // calculate the distance from the home plate to the intersection point
    let homeCoords = new google.maps.LatLng(findClosestField().home_plate[1], findClosestField().home_plate[0]);
    let fenceDistance = google.maps.geometry.spherical.computeDistanceBetween(
        homeCoords,
        new google.maps.LatLng(intersection[0].lat, intersection[0].lng)
    );

    // pass the distance to the document for display
    document.getElementById("fence_distance").innerHTML = "Fence Distance: " + fenceDistance.toFixed(2) + " meters";
}


function findClosestField(latLng) {
    let minDistance = Infinity;
    let closestField = null;

    fieldData.forEach((field) => {
        if (field.home_plate && field.fop) {
            let homeCoords = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);
            let distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, homeCoords);

            if (distance < minDistance) {
                minDistance = distance;
                closestField = {
                    fieldName: field.name,
                    homePlateLatLng: { lat: field.home_plate[1], lng: field.home_plate[0] },
                    distanceInFeet: distance * 3.28084, // Convert meters to feet
                };
            }
        }
    });

    // Calculate fence distance
    let fenceDistance = 0; // Add your fence distance calculation logic here

    closestField.fenceDistanceInFeet = fenceDistance;

    return closestField || {};
}
