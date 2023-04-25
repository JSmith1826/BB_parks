//  JavaScript file attempting to refactor a script for a Google Map. 
// The primary goal is to rewrite and streamline the way data 
// is loaded, displayed, and used to calculate distance. 
// The code being refactored, app.js, has too many pieces, 
// with distance measuring and data loading spread over 5
//  or 6 separate functions. The aim is to accomplish this in
// just a few functions, with one to measure both clickDistance 
// and fenceDistance and another that loads all available data 
// about the field closest to a mouse click.


/// Declair global variables
const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_updated_output.json";
let fetchedData;
let ballfields = []; // Array to hold all of the ballfield objects
let currentLine = null;

/////////// MAIN LOADING FUNCTION ///////////
async function main() {
    const data = await fetchData(jsonUrl);
    init(data);
  }
  

//// Load data from jsonUrl
async function fetchData() {
    console.log("Fetching data...");
    const response = await fetch(jsonUrl);
    const data = await response.json();
    return data;
  }


  //// Create a map object
  function init(data) {
    console.log("Initializing map...");
    const mapOptions = {
        zoom: 19,
        center: new google.maps.LatLng(42.73048536830354, -84.50655614253925),
        heading: true,
        mapTypeId: 'hybrid',  
    };
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    createFieldObjects(data, map); // Passing all of the data to createFieldObjects;
    createMarkers(data, map); // Passing the data to createMarker;
    addMapClickHandler(map) // Passing the map to addMapClickHandler;
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchData();
    fetchedData = data; // Set the fetchedData global variable
    init(data);
  });

  
  
 
  

/////// Function to Create Field Objects

function createFieldObjects(data, map) {
    ballfields = []; // Make sure the array is empty
    // console.log("Creating field objects...");
    data.forEach(field => {
        /// NAME AND TITLE INFORMATION
        const park_name = field.park_name; // Field name
        const parkLevel = field.level; // Field level classification (highsch, college, ect.)
        const homeTeam = field.school_name; // Primary Home Team - Right now tied to school name from match will need to change when data is re organized
        const northSouthEastWest = field.field_cardinal_direction; // Abbreviation of ball parks cardnal direction
        const fieldBearing = field.field_orientation; // Float of exact field bearing in degrees
        // BALLPARK COORDINATES
        const homePlate = field.home_plate; // Home Plate Coordinates
        const fopCoordinates = field.fop; // Fair Territory Coordinates
        const foulCoordinates = field.foul; // Foul Ground Coordinates
        /// STATIC DISTANCE INFORMATION
        const distanceList = field.distances; // List of distances to other fence vertices
        const fenceMin = field.min_distance; // Minimum fence distance
        const fenceMax = field.max_distance; // Maximum fence distance
        const fenceAvg = field.avg_distance; // Average fence distance
        /// AREA INFORMATION
        const fairAreaAcres = field.fop_area_sqft / 43560; // Fair territory area in acres
        const foulAreaAcres = field.foul_area_sqft / 43560; // Foul territory area in acres
        const fairFoulRatio = (fairAreaAcres / foulAreaAcres).toFixed(2); // Fair to foul area ratio

        /// PLACEHOLDER FOR ADDITIONAL DATA
        /// SCHOOL ENROLLMENT, CAPACITY, ECT, 
        /// CURRENTLY NOT IN DATA SET

        // // Console logs to check data
        // console.log('Name: ', park_name);
        // console.log('Level: ', parkLevel);
        // console.log('Home Team: ', homeTeam);
        // console.log('Cardinal Direction: ', northSouthEastWest);
        // console.log('Field Bearing: ', fieldBearing);
        // console.log('Home Plate: ', homePlate);
        // console.log('Fair Territory: ', fopCoordinates);
        // console.log('Foul Territory: ', foulCoordinates);
        // console.log('Distance List: ', distanceList);
        // console.log('Minimum Distance: ', fenceMin);
        // console.log('Maximum Distance: ', fenceMax);
        // console.log('Average Distance: ', fenceAvg);
        // console.log('Fair Area: ', fairAreaAcres);
        // console.log('Foul Area: ', foulAreaAcres);
        // console.log('Fair to Foul Ratio: ', fairFoulRatio);

        // Pass the data to other functions
        renderPolygons(fopCoordinates, foulCoordinates, map); // Render the polygons on the map

        //
        
    })
}

// //// URLS OF ICON IMAGES in Dictionary format for easy access
// const icon_dict = {high_school: 'https://github.com/JSmith1826/BB_parks/blob/42d8d96bc0dfd487ea5fbb893df1a8a7c1fee2c5/data/images/icons/baseball/baseball_ball.jpg/high_school_icon.png',
//             college: 'https://github.com/JSmith1826/BB_parks/blob/42d8d96bc0dfd487ea5fbb893df1a8a7c1fee2c5/data/images/icons/baseball/diamond_2.png',
//             pro: 'https://github.com/JSmith1826/BB_parks/blob/42d8d96bc0dfd487ea5fbb893df1a8a7c1fee2c5/data/images/icons/baseball/diamond_2.png',
//             other: 'https://github.com/JSmith1826/BB_parks/blob/42d8d96bc0dfd487ea5fbb893df1a8a7c1fee2c5/data/images/icons/baseball/emblem.png'}

/// Deafualt icon image
const defaultIcon = "https://github.com/JSmith1826/BB_parks/blob/42d8d96bc0dfd487ea5fbb893df1a8a7c1fee2c5/data/images/icons/baseball/baseball_dark.png";


////////////// NOT WORKING YET
/////// Function to Create Markers



function createMarkers(data, map) {
    // console.log("Creating markers...");
  
    const infoWindow = new google.maps.InfoWindow();
  
    data.forEach((field) => {
      const homePlate = field.home_plate;
      const nameValue = field.park_name;
      const levelValue = field.level;
  
      const marker = new google.maps.Marker({
        position: { lat: homePlate[1], lng: homePlate[0] },
        map: map,
        title: field.park_name,
        content: `<h3>${field.park_name} - ${field.level}</h3>`,
      });
    //   console.log(field.park_name, field.level);
  
     // Mouseover event
marker.addListener("mouseover", () => {
    console.log("Mouseover event");
    console.log(field.park_name, field.level) // SHOWING UP IN CONSOLE
    
    infoWindow.setContent(`<h3>${field.park_name} - ${field.level}</h3>`);
    infoWindow.open(map, marker);
  });
  
  
      // Mouseout event
      marker.addListener("mouseout", () => {
        infoWindow.close();
      });
  
      // Double click event
      marker.addListener("dblclick", () => {
        map.setZoom(18);
        map.setCenter(marker.getPosition());
      });
    });
}

/////////////// END NON WORTKING MARKER FUNCTION /////////////////


/////// Function to Render the Polygons on the Map

function renderPolygons(fopCoordinates, foulCoordinates, map) {
const fop_polygon = new google.maps.Polygon({
    paths: fopCoordinates.map((coord) => {
    // Reverse the order of the coordinates
    return { lat: coord[1], lng: coord[0] };
    }),
    fillColor: "#00FF00", // Green    
    strokeWeight: 1, // Width of the polygon border
    // strokeColor: "#000000", // Black
    fillOpacity: 0.4, // Opacity of the polygon
    map: map, // Map to render the polygon on
});

const foul_polygon = new google.maps.Polygon({
    paths: foulCoordinates.map((coord) => {
    // Reverse the order of the coordinates
    return { lat: coord[1], lng: coord[0] };
    }),
    fillColor: "#FF0000", // Red
    strokeWeight: 1, // Width of the polygon border
    fillOpacity: 0.4, // Opacity of the polygon
    map: map, // Map to render the polygon on
});

fop_polygon.setMap(map);
foul_polygon.setMap(map);

return fop_polygon; // Add this line to return the fop_polygon object
}

//////////////////// ADDDED ////////////////////////
// Function to draw a line between home_plate and click location, and return the distance in feet
function drawLineAndComputeDistance(map, homePlateCoordinates, clickCoordinates) {
    const homeLatLng = new google.maps.LatLng(home_plate[1], home_plate[0]);
  
    if (currentLine) {
      currentLine.setMap(null);
    }
  
    currentLine = new google.maps.Polyline({
      path: [homeLatLng, clickLatLng],
      geodesic: true,
      strokeColor: "#FF00FF",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
      // Add console logs to check if the line is being drawn
  console.log("Home plate coordinates:", homePlateCoordinates);
  console.log("Click coordinates:", clickCoordinates);
  console.log("Line path:", line.getPath().getArray());
  
    currentLine.setMap(map);
  
    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(homeLatLng, clickLatLng);
    const distanceInFeet = distanceInMeters * 3.28084;
  
    return distanceInFeet;
  }
  
  // Function to check if a line intersects a polygon, and if so, calculate the distance between intersection points
  function checkLineIntersectionWithPolygon(line, polygon, map) {
    const path = polygon.getPath();
    const verticesCount = path.getLength();
    let intersectionPoints = [];
  
    for (let i = 0; i < verticesCount; i++) {
      const p1 = path.getAt(i);
      const p2 = path.getAt((i + 1) % verticesCount);
      const lineStart = line.getPath().getAt(0);
      const lineEnd = line.getPath().getAt(1);
  
      const intersection = findLineIntersection(p1, p2, lineStart, lineEnd);
      if (intersection) {
        intersectionPoints.push(intersection);
      }
    }
  
    if (intersectionPoints.length >= 2) {
      const fenceDistance = google.maps.geometry.spherical.computeDistanceBetween(intersectionPoints[0], intersectionPoints[1]);
      return fenceDistance;
    }
  
    return null;
    console.log("Intersection points:", intersectionPoints);
  }

  ///////////////END ADDED1 ////////////////////////
    

///// Click Handler Function

// Update the handleMapClick function
async function handleMapClick(event, map) {
    console.log("Handling map click...");
    console.log("Click event:", event);
  
    const data = fetchedData; // Use the fetchedData global variable
    const closestField = findClosestField(event.latLng, data);
    console.log("Closest field:", closestField);
  
    // Draw the line and compute the distance
    const distanceInFeet = drawLineAndComputeDistance(map, closestField.home_plate, event.latLng);
    console.log("Distance between home plate and click location:", distanceInFeet);
  
    // Find the fop_polygon of the closest field
    const fop_polygon = renderPolygons(closestField.fop, closestField.foul, null); // Pass null for the map to avoid re-rendering
  
    // Check if the line intersects the polygon and compute the fence distance
    const fenceDistance = checkLineIntersectionWithPolygon(currentLine, fop_polygon, map);
    console.log("Fence distance:", fenceDistance);
  
    // Display the field info in the info box
    const fieldInfo = displayFieldInfo(closestField);
    // Append the field info to the DOM
    const container = document.getElementById("field-info-container");
    container.innerHTML = "";
    container.append(fieldInfo);
  
    return closestField; // Add this line to return the closestField object
  }
 


////////////// Find the Closest Field ( OLD FUNCTION BUT WORKING ) //////////////
////// LEAVE AS IS FOR NOW
function findClosestField(latLng, data) {
    console.log("Finding closest field...");
    let minDistance = Infinity;
    let closestField = null;
  
    data.forEach(field => {
        const fieldLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]); // Reverse the coordinates
        const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, fieldLatLng);
  
        if (distance < minDistance) {
            minDistance = distance;
            closestField = field;
        }
    });
    console.log("Closest field:", closestField, "Min distance:", minDistance);
  
    return closestField;
  }

/////////////// USE The closestfield to get the data for the field object and display it 
/////////////// in the html divs
function displayFieldInfo(closestField) {
    const fieldContainer = document.createElement("div");
    fieldContainer.classList.add("field-container");

    // Field Name
  const fieldName = document.createElement("h2");
  fieldName.classList.add("field-name");
  fieldName.textContent = closestField.park_name;
  fieldContainer.append(fieldName);

  // Field Level of Play
    const fieldLevel = document.createElement("p");
    fieldLevel.classList.add("field-level");
    fieldLevel.textContent = `Level of Play: ${closestField.level}`;
    fieldContainer.append(fieldLevel);

//   // School Name
//   const schoolName = document.createElement("p");
//   schoolName.classList.add("school-name");
//   schoolName.textContent = `Home of ${closestField.school_name}`;
//   fieldContainer.append(schoolName);

  // Field Facts
  const fieldFacts = document.createElement("div");
  fieldFacts.classList.add("field-facts");

  // Fence Distance
  const fenceDistance = document.createElement("p");
  fenceDistance.textContent = `Fence Distance: MIN ${closestField.min_distance} | MAX ${closestField.max_distance} | AVG ${closestField.avg_distance.toFixed(0)}`;
  fieldFacts.append(fenceDistance);

  // Fair Territory
  const fairTerritory = document.createElement("p");
  fairTerritory.textContent = `Field Size (Fair): ${(closestField.fop_area_sqft / 43560).toFixed(2) } acres | Fair / Foul Ratio ${(closestField.fop_area_sqft/closestField.foul_area_sqft).toFixed(2)} / 1`;
  fieldFacts.append(fairTerritory);

  fieldContainer.append(fieldFacts);

  // Click around message
  const clickMessage = document.createElement("p");
  clickMessage.classList.add("click-message");
  clickMessage.textContent = "Click around the field to measure distances";
  fieldContainer.append(clickMessage);

  return fieldContainer;


    // //// CONSOLE LOGS TO CHECK DATA
    // console.log('Name: ', park_name);
    // console.log('Level: ', parkLevel);
    // console.log('Home Team: ', homeTeam);
    // console.log('Cardinal Direction: ', northSouthEastWest);
    // console.log('Field Bearing: ', fieldBearing);
    // // console.log('Home Plate: ', homePlate);
    // // console.log('Fair Territory: ', fopCoordinates);
    // // console.log('Foul Territory: ', foulCoordinates);
    // console.log('Distance List: ', distanceList);
    // console.log('Minimum Distance: ', fenceMin);
    // console.log('Maximum Distance: ', fenceMax);
    // console.log('Average Distance: ', fenceAvg);
    // console.log('Fair Area: ', fairAreaAcres);
    // // console.log('Foul Area: ', foulAreaAcres);
    // console.log('Fair to Foul Ratio: ', fairFoulRatio);

}









///////// FUNCTION TO MEASURE DISTANCE AFTER MOUSE CLICK /////////
//// GOAL HANDLE all click events (inside and outside of the polygons and measure distance 
//// all in one function block)
//// Don't know if draw line should be in this function or not

function addMapClickHandler(map) {
    map.addListener("click", async (event) => {
      const closestField = await handleMapClick(event, map);
      displayFieldInfo(closestField);
    });
  }
  



//  /// DRAW A LINE FROM HOME PLATE TO THE CLICKED LOCATION and measure distance
//  function drawLine(event, home_plate, map) {
//     console.log("Drawing line and displaying distance...");
//     const lineCoordinates = [
//       new google.maps.LatLng(home_plate[1], home_plate[0]), // Reverse the coordinates
//       event.latLng
//     ];
  
//     // Remove the previous line if it exists
//     if (currentLine) {
//       currentLine.setMap(null);
//     }
  
//     // Draw the line
//     const line = new google.maps.Polyline({
//       path: lineCoordinates,
//       strokeColor: "#0000FF", // Blue
//       strokeOpacity: 1.0,
//       strokeWeight: 2,
//       map: map
//     });
  
//     // Set the current line to the newly created line
//     currentLine = line;
  
//     // Calculate the distance
//     const distance = google.maps.geometry.spherical.computeDistanceBetween(
//       lineCoordinates[0],
//       lineCoordinates[1]
//     );
//     console.log("Distance:", distance);
//     // Call a function to display the distance
//   }
  
  
  

// /// PLACEHOLDER FOR DYNAMIC DISTANCE DISPLAY
// function distanceDynamicDisplay(distance) {
//     const distanceDisplay = document.createElement("p");
//     distanceDisplay.classList.add("distance-display");
//     distanceDisplay.textContent = `Distance: ${distance.toFixed(0)} ft`;
//     return distanceDisplay;
//     }

