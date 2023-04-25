//////////// NOT WORKING WAS GOING WELL BUT THEN IT GOT ALL SCREWED UP. SEE IF I CAN BRING SOME OF THE PARTS 
//////////// THAT WORKED (THE DISPLAY STUFF) INTO THE OTHER CODE. /////////////////

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
let polygons = []; // Array to hold all of the polygon objects



  

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
    // createMarkers(data, map); // Passing the data to createMarker;
    addMapClickHandler(map, fetchedData, polygons)
  }

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchData();
    fetchedData = data; // Set the fetchedData global variable
    init(data);
  });

  
  // Assuming you have a variable 'map' referencing the Google Maps instance
map.addListener('click', (event) => {
  const clickLatLng = event.latLng;
  // Replace 'homePlateLatLng' and 'fieldPolygon' with actual values
  calculateFenceDistance(clickLatLng, homePlateLatLng, fieldPolygon);
});
 
  

/////// Function to Create Field Objects

function createFieldObjects(data, map) {
    ballfields = []; // Make sure the array is empty
    console.log("Creating field objects...");
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

        // Console logs to check data
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

polygons.push(fop_polygon);
polygons.push(foul_polygon);
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
  }
  
function addMapClickHandler(map, fetchedData, polygons) {
  map.addListener("click", async (event) => {
    const closestField = await handleMapClick(event, map, fetchedData, polygons);
    displayFieldInfo(closestField);
  });
}
      
  
///// Click Handler Function
async function handleMapClick(event, map, fetchedData) {
  console.log("Handling map click...");
  console.log("Click event:", event);

  const data = fetchedData; // Use the fetchedData global variable
  const closestField = findClosestField(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()), data);

  console.log("Closest field:", closestField);

  if (closestField) {
    const insideField = polygons.some(polygon => google.maps.geometry.poly.containsLocation(event.latLng, polygon));
    console.log("Inside field?", insideField);

    if (insideField) {
      console.log("Clicked inside a field");

      drawLineAndCalculateDistance(event.latLng, closestField.home_plate, map, closestField);
    } else {
      console.log("Clicked outside of any fields");
      const fieldPolygon = renderPolygons(closestField.fop, "#00FF00", null); // Pass null for the map to avoid adding the polygon to the map
      const fenceDistance = calculateFenceDistance(event.latLng, closestField.home_plate, fieldPolygon);
      // Draw the line even when the click is outside of any fields
      drawLineAndCalculateDistance(event.latLng, closestField.home_plate, map, closestField, fenceDistance);
    }
  } else {
    console.log("No closest field found");
  }
}

function findClosestField(latLng, data) {
  console.log("Finding closest field...");
  let minDistance = Infinity;
  let closestField = null;

  data.forEach(field => {
      const fieldLatLng = new google.maps.LatLng(field.home_plate[0], field.home_plate[1]);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, fieldLatLng);

      if (distance < minDistance) {
          minDistance = distance;
          closestField = field;
      }
  });
  console.log("Closest field:", closestField, "Min distance:", minDistance);

  return closestField;
}


function drawLineAndCalculateDistance(start, end, map, fieldData, fenceDistance = null) {
  console.log("Drawing line and calculating distance...");
  const lineCoordinates = [
    start,
    new google.maps.LatLng(end[0], end[1])
  ];

  // Remove the previous line if it exists
  if (currentLine) {
    currentLine.setMap(null);
  }

  const line = new google.maps.Polyline({
    path: lineCoordinates,
    strokeColor: "#0000FF",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map
  });

  // Set the current line to the newly created line
  currentLine = line;

  const distance = google.maps.geometry.spherical.computeDistanceBetween(start, lineCoordinates[1]);
  displayDistance(distance, fieldData.field);
  if (fenceDistance !== null) {
    displayFenceDistance(fenceDistance);
  }
}


  ////// Calculate Fence Distance Function
  function calculateFenceDistance(clickLatLng, homePlateLatLng, fieldPolygon) {
    console.log("calculateFenceDistance:", clickLatLng, homePlateLatLng, fieldPolygon);
    const clickPoint = clickLatLng;
    const homePlatePoint = new google.maps.LatLng(homePlateLatLng[0], homePlateLatLng[1]);
  
    const polygonCoords = fieldPolygon.getPath().getArray();
    const intersectionPoints = [];
  
    for (let i = 0; i < polygonCoords.length; i++) {
      const startPoint = polygonCoords[i];
      const endPoint = polygonCoords[(i + 1) % polygonCoords.length];
  
      const intersectionPoint = findLineIntersection(clickPoint, homePlatePoint, startPoint, endPoint);
  
      console.log("intersectionPoint:", intersectionPoint);
      if (intersectionPoint) {
        intersectionPoints.push(intersectionPoint);
      }
    }
  
    const validIntersectionPoints = intersectionPoints.filter(
      (point) =>
        google.maps.geometry.spherical.computeDistanceBetween(homePlatePoint, point) > 1e-6
    );
  
    if (validIntersectionPoints.length === 1) {
      const fenceDistance_meters = google.maps.geometry.spherical.computeDistanceBetween(homePlatePoint, validIntersectionPoints[0]);
      const fenceDistance = fenceDistance_meters * 3.28084;
      displayFenceDistance(fenceDistance);
    }
  }
  
  const epsilon = 1e-9;
  
  function findLineIntersection(p1, p2, p3, p4) {
    // console.log("findLineIntersection:", p1, p2, p3, p4);
    const s1_x = p2.lng() - p1.lng();
    const s1_y = p2.lat() - p1.lat();
    const s2_x = p4.lng() - p3.lng();
    const s2_y = p4.lat() - p3.lat();
  
    const s = (-s1_y * (p1.lng() - p3.lng()) + s1_x * (p1.lat() - p3.lat())) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (p1.lat() - p3.lat()) - s2_y * (p1.lng() - p3.lng())) / (-s2_x * s1_y + s1_x * s2_y);
  
    if (s >= -epsilon && s <= 1 + epsilon && t >= -epsilon && t <= 1 + epsilon) {
      // Collision detected
      const i_x = p1.lng() + (t * s1_x);
      const i_y = p1.lat() + (t * s1_y);
      return new google.maps.LatLng(i_y, i_x);
    }
  
    // No collision
    return null;
  }
  