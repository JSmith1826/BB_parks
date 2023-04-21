///// This script is to create the backbone of the maps for the baseball field project. 
// / The goal is to take a json and plot it using Google Maps API
// / The json contains data of the 600+ baseball fields I have ploted using google MediaCapabilities.
// / This map will be the starting piece of how the data is displayed.I
// / The map will also be interactive and offer the user a live measurement of the fields dimentions.
// / This project's code was started using chatgpt but the dificulty of creating a comprehensive 100+ line script was too much. for it to handle
// / I decided to try to do it this way instead utilizing Github copilot and the backbone functions I created with CHATGPT

////////// REFERENCE //////////
//////////JSON KEY NAMES ///////////////

// Key,Data Types,Description,Sample Value
// field,str,The name of the baseball field.,Frankfort-Elberta Area HS
// foul,list,"A list of coordinates representing the foul territory of the field. (lon, lat)","[[-86.2258505, 44.6344082], [-86.2258357, 44.6336304], [-86.225664, 44.6336323], [-86.22566, 44.6341229], [-86.2256587, 44.6342565], [-86.2256694, 44.6342841], [-86.2256801, 44.6344836], [-86.2257472, 44.6345313], [-86.2257928, 44.6345313], [-86.2259457, 44.6345666], [-86.2259671, 44.6345743], [-86.2260489, 44.6345752], [-86.2264499, 44.6344588], [-86.2270427, 44.6344588], [-86.2270454, 44.6343977], [-86.2258505, 44.6344082]]"
// fop,list,"A list of coordinates representing the fair territory of the field. (lon, lat)","[[-86.2258505, 44.6344082], [-86.2270454, 44.6343977], [-86.2270414, 44.6343471], [-86.2270454, 44.6342431], [-86.2270548, 44.6340704], [-86.2270601, 44.6339234], [-86.2270601, 44.6337841], [-86.2270172, 44.6337612], [-86.2269368, 44.633703], [-86.2268348, 44.6336342], [-86.226631, 44.6336371], [-86.226454, 44.6336352], [-86.2262434, 44.6336304], [-86.2261053, 44.6336295], [-86.226006, 44.6336304], [-86.2258357, 44.6336304], [-86.2258505, 44.6344082]]"
// level,str,"The level of the field, e.g., high_school, college, etc.",high_school
// home_plate,list,"A list of coordinates representing the home plate location on the field. (lon, lat)","[-86.2258505, 44.6344082]"
// foul_area_sqft,float,The total area of the foul territory in square feet.,35981.5542452338
// fop_area_sqft,float,The total area of the fair territory in square feet.,121616.9328361733
// distances,list,A list of distances from home plate to the outfield fence at the vertices of the wall.,"[310, 310, 316, 336, 360, 388, 384, 382, 381, 347, 323, 302, 292, 287, 284]"
// max_distance,int,The maximum distance from home plate to the outfield fence.,388
// min_distance,int,The minimum distance from home plate to the outfield fence.,284
// avg_distance,float,The average distance from home plate to the outfield fence.,333.4666666667
// fop_centroid,list,A list of coordinates representing the centroid of the fair territory.,"[-86.2266388688, 44.6338790875]"
// field_orientation,float,"The angle (in degrees) of the field's orientation, with 0 degrees being North.",226.6762549688
// field_cardinal_direction,str,"The cardinal direction abbreviation (N, S, E, W, NE, NW, SE, SW) representing the field's orientation.",SW
// match,NoneType,The matched school name found using fuzzy matching.,Frankfort HS
// school_id,NoneType,The unique identifier of the matched school.,7558.0
// school_name,NoneType,The name of the matched school.,Frankfort HS
// students,NoneType,The number of students enrolled in the matched school.,154.0
// division,NoneType,The athletic division the matched school belongs to.,D


let map;
let fieldData;
let polygons = [];
let markers = [];
let clickMarker;
let polyLine;

// from config import API_KEY
// from config import JSON_URL


// Function to load the JSON data from the URL
function loadJSON() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';
    console.log("loadJSON called");
    return fetch(url)
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
  }

// Long and LAt coordinates use for center of map
// Old Park, Lansing = 42.73515943514113, -84.54566558512492

  // Function to initialize the map
  function initMap() {
    console.log("initMap called");

    /// CONFIGURE MAP
    map = new google.maps.Map(document.getElementById("map"), {
        /// DEFAULT CENTER LOCATION OF MAP
        center: { lat: 42.73515943514113, lng: -84.54566558512492 },
        ///ZOOM LEVEL OF MAP & OTHER SETTINGS
        zoom = 16,
        mapTypeId: "satellite",
        tilt: 0,
        heading: 0,
        mapTypeControl: false,
    });

    loadJSON().then(data) => {
        fieldData = data;
        console.log(fieldData);
        createPolygons();
        createMarkers();
        createPolyLine();
        createPolygons(data);
    });
}

// Function to create the polygons
function createPolygons() {
    data.forEach((field) => {
        // create 
        // const polygon = new google.maps.Polygon({
            
        // extract the fair territory coordinates
        let fairCoords = field.fop((coord) => ({
            lat: coord[1],
            lng: coord[0],

        }));

        // extract the foul territory coordinates
        let foulCoords = field.foul((coord) => ({
            lat: coord[1],
            lng: coord[0],

        }));

        /// Plot and fill the polygons
        /// fair territory
        let fairTerrirory = new google.maps.Polygon({
            paths: fairCoords,
            fillColor: "green",
            fillOpacity: 0.5,
            strokeColor: "green",
            strokeOpacity: 1,
            strokeWeight: 1,
        });

        let foulTerrirory = new google.maps.Polygon({
            paths: foulCoords,
            fillColor: 'red';
            fillOpacity: 0.5,
            strokeColor: 'red';
            strokeOpacity: 1,
            strokeWeight: 1,
        });

        /// Add the polygons to the map
        fairTerrirory.setMap(map);
        foulTerrirory.setMap(map);
        polygons.push(fairTerrirory, foulTerrirory, fairCoords, foulCoords);
        // close the function
    });

    // close the function
}



///// Home Plate Marker Creation Function
function createMarkers() {
    data.forEach((field) => {
        // extract the home plate coordinates
        let homeCoords = field.home_plate((coord) => ({
            lat: coord[1],
            lng: coord[0],

        }));

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
        // close the function
    });

    // close the function
}

/////////////MONEYTIME/////////////////////
/////// CLICK BEHAVIOR FOR MARKERS /////////

function onMapClick(event) {
    console.log("Map Click Called");
    // create a marker
    clickMarker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "yellow",
            fillOpacity: 1,
            strokeColor: "black",
            strokeWeight: 1,
        },
    });
    
    /// Call the function to find the closest field
    let closeField = findClosestField(event.latLng);
    console.log(closeField);

    // pass the closest field info to the document for display
    document.getElementById("field_name").innerHTML = 'Field Name: ' + closeField.field_name;

    //draw the polyline
    drawPolyLine(closeField);

    // calculate the raw distance from home plate to the clicked marker
    let distance = google.maps.geometry.spherical.computeDistanceBetween(


}


///// FUnction to find the closest field to the clicked marker
function findClosestField() {
    // get the clicked marker's coordinates
    let clickedCoords = clickMarker.getPosition();

    // create an array to store the distances
    let distances = [];

    // loop through the fields
    data.forEach((field) => {
        // extract the home plate coordinates
        let homeCoords = field.home_plate((coord) => ({
            lat: coord[1],
            lng: coord[0],

        }));

        // calculate the distance between the clicked marker and the home plate
        let distance = google.maps.geometry.spherical.computeDistanceBetween(
            clickedCoords,
            homeCoords
        );

        // add the distance to the array
        distances.push(distance);
    });

    // find the index of the minimum distance
    let minIndex = distances.indexOf(Math.min(...distances));

    // return the closest field
    return data[minIndex];
    // return the closest home plate coordinates
    return data[minIndex].home_plate((coord) => ({
        lat: coord[1],
        lng: coord[0],

    }));

    // close the function

}
    


////// Function to create the polyline
function createPolyLine() {

    //// get th cordinates of the clicked marker
    let clickedCoords = clickMarker.getPosition();

    /// get the coordinates of the closest home plate
    let closestCoords = findClosestField();

    /// create the polyline
    let line = new google.maps.Polyline({
        path: [clickedCoords, closestCoords],
        strokeColor: "black",
        strokeOpacity: 1,
        strokeWeight: 1,
    });

    /// apply it to the map
    line.setMap(map);
    polyLine.push(line);
    // close the function
}

/// Measure raw distance from home plate to the clicked marker
function totalDistance() {
    /// get the coordinates of the clicked marker
    let clickedCoords = clickMarker.getPosition();
    /// get the coordinates of the closest home plate
    let closestCoords = findClosestField();
    /// calculate the distance between the clicked marker and the closest home plate
    let distance = google.maps.geometry.spherical.computeDistanceBetween(
        clickedCoords,
        closestCoords
    );
    /// pass the distance to the document for display
    document.getElementById("distance").innerHTML = "Total Distance: " + distance.toFixed(2) + "meters";
    // close the function
}

//////////////////////// FENCE DISTANCE FUNCTIONS ////////////////////////
/// measure the distance on the polyline that is not inside the field
function fenceDistance() {
    // find the point where the polyLine intersects the field boundry
    /// create line segments from the vertices of the polygon so we can find an intersection point
    let lineSegments = [];
    let fieldCoords = findClosestField();
    for (let i = 0; i < fieldCoords.length; i++) {
        let lineSegment = new google.maps.Polyline({
            path: [fieldCoords[i], fieldCoords[i + 1]],
        });
        lineSegments.push(lineSegment);
    }
    // find the intersection point
    let intersection = [];
    for (let i = 0; i < lineSegments.length; i++) {
        let intersection = google.maps.geometry.intersects(
            lineSegments[i],
            polyLine[0]
        );
        if (intersection) {
            break;
        }
    }
    // calculate the distance from the home plate to the intersection point
    let homeCoords = findClosestField();
    let fenceDistance = google.maps.geometry.spherical.computeDistanceBetween(
        homeCoords,
        intersection
    );
}

    


