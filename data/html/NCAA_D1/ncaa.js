
// Map Data JSON
const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/NCAA_D1/conf_tourn_map.json"; // fields json file

let fetchedData;
let polygons = [];
let currentLine = null;
let currentMarker = null;
let currentDivision = null;
let currentLevel = null;
let markers = [];  
let fenceMarkers = [];
let defaultIconUrl = "https://github.com/JSmith1826/BB_parks/blob/7ed36c05c89fe22ae7e43598b9357c57f5610069/data/images/icons/baseball/stadium_lt_blue.png";  
let isInitial = true;

// LOAD THE JSON WITH THE TOURNAMENT GAMES DATA
const gamesUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/NCAA_D1/tournaments.json"; // schedule json file
let gameData;

async function loadGamesData() {
  console.log("Loading games data...");
  const response = await fetch(gamesUrl);
  gameData = await response.json();
}

window.onload = async function() {
  await loadGamesData();
};

  
// const epsilon = 1e-9; // set epsilon to 1e-9 for use in the fenceDistance and intersectionPoint functions

//fetch data from json file
// Async function to fetch data from the JSON file
async function fetchData() {
    console.log("Fetching data...");
    const response = await fetch(jsonUrl);
    const data = await response.json();
    return data;
  }

//initialize map
// Async function to initialize the map
async function initMap() {
  const data = await fetchData();
  fetchedData = data;
  const levelCounts = countFieldsByLevel(fetchedData);
  let initialCenter = {lat: 39.50, lng: -98.35};
  let initialZoom = 5;

  console.log("Initializing map...");
  const mapOptions = {
      zoom: initialZoom,
      center: new google.maps.LatLng(initialCenter),
      mapTypeId: 'roadmap',
  };
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  renderPolygons(data, map, levelCounts, gameData);
  google.maps.event.addListener(map, "click", (event) => {
      MapClickHandler(event, fetchedData, map, polygons, levelCounts);
  });

  // Here we add the 'zoom_changed' event listener
  google.maps.event.addListener(map, 'zoom_changed', function() {
    let zoom = map.getZoom();
    map.setMapTypeId((zoom > 10) ? 'hybrid' : 'roadmap');
  });
  
  initSearchBox(map);

  // Add reset button to the map
  let resetButton = document.createElement('button');
  resetButton.innerHTML = 'Reset Map';
  resetButton.style.fontSize = '20px'; // make the text bigger
  resetButton.style.fontFamily = 'Arial, sans-serif'; // use Arial font
  resetButton.style.padding = '10px'; // add some padding around the text
  resetButton.style.backgroundColor = '#007BFF'; // set background color to blue
  resetButton.style.color = 'white'; // set text color to white
  resetButton.style.border = 'none'; // remove border
  resetButton.style.borderRadius = '5px'; // round the corners
  resetButton.addEventListener('click', function() {
      map.setZoom(initialZoom);
      map.setCenter(initialCenter);
  });

  document.body.appendChild(resetButton);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(resetButton);

  
function filterByLevel(level) {
    console.log("Filtering by level:", level);
    level = Number(level);

    // Iterate over each marker
    for (let i = 0; i <= 4; i++) {
        // Skip if the marker is undefined
        if (!markers[i]) continue;

        for (let j = 0; j < markers[i].length; j++) {
            // Skip if the marker is undefined
            if (!markers[i][j]) continue;

            // Check if the marker has a setMap function
            if (typeof markers[i][j].setMap !== 'function') {
                console.log('Not a Marker object:', markers[i][j]);
                continue;
            }

            if (i > level) {
                markers[i][j].setMap(map);
            } else {
                markers[i][j].setMap(null);
            }
        }
    }
}
}
document.addEventListener("DOMContentLoaded", initMap);

function countFieldsByLevel(data) {
  const levelCounts = {};
  data.forEach(field => {
      const level = field.level;
      if (levelCounts.hasOwnProperty(level)) {
          levelCounts[level]++;
      } else {
          levelCounts[level] = 1;
      }
  });
  return levelCounts;
}


  // Create the map click handler - The big boy of functions
    // input data - full 'data' object from json file, 'map' object from fetchData() and initMap(), 
    // closestField from closestFieldFunction, and 'polygons' array from renderPolygons()  

    // output - a marker on the map at the location of the click, with a line drawn from the home plate of the closest field
    // a html element containing field info and the dynamic distance element with the
    // distance from home plate to the click location and the fence distance from home plate if the click is outside the fence

    
// This function is called in the initMap() function
async function MapClickHandler(event, data, map, polygons, levelCounts) {
        console.log("Map click handler:", event.latLng); // log the event to the console
        // console.log('Data from MapClickHandler:', data); // log the data to the console
        // console.log('Check polygons array:', polygons); // log the polygons array to the console

        // call the closestField function and pass in the click location and the data object
        const closestField = closestFieldFunction(event.latLng, data); // create variable closestField and set it to the closestFieldFunction
        // console.log("Closest field:", closestField); // log the closestField to the console
        // returned the closest field to the click location

        // Call the function to draw the line from the home plate of the closest field to the click location
        drawLine(closestField, event.latLng, map); // send closestField, click location, and map to drawLine function

        
        // Call the drawLine function and store the returned value
        const distanceFeet = drawLine(closestField, event.latLng, map);

        // Call the checkFence function and store the returned value
        const fenceDist = checkFence(closestField, event.latLng, map, polygons);

        // Call the function to make a marker at the click location
        clickMarker(event.latLng, map); // remove levelCounts from this function call

 

        // // // Call the function to check if the click location is inside the fence
        // checkFence(closestField, event.latLng, map, polygons); // send closestField, click location, map, and polygons array to checkFence function
        
        // Call the function to make the html element with the field info and distance
        fieldInfo(closestField, distanceFeet, fenceDist, map, levelCounts); // send closestField, distanceFeet, fenceDist, and map to fieldInfo function


        // print the lat and lng of the click location to the console
        console.log("Click location:", event.latLng.lat(), event.latLng.lng()); // log the click location to the console


    }

////////////////////////////////////// NEW FUNCTION TO ADD SEARCH FUNCTION//////////////////
// This function should be called in your initMap() function
function initSearchBox(map) {
  // Create the search box and link it to the UI element.
  const input = document.getElementById("search-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards the current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    // Pan the map to the selected location
    const location = places[0].geometry.location;
    map.panTo(location);
  });
}


        

    // Create the function to find the closest field to the click location
    // input data - click location and full 'data' object from json file
    // output - the closest field to the click location
    // Loops through every field in the data object and finds the distance between the click location 
    // and the home plate of each field. The field with the shortest distance is returned.
    // Eventually might be able to refactor so it doesn't have to check every field
    function closestFieldFunction(clickLocation, data) {
        console.log("Finding closest field...");
        let minDistance = Infinity; // create variable minDistance and set it to infinity to compair distances
        let closestField = null; // create variable closestField and set it to null
      
        data.forEach(field => {
            // create fieldLatLng variable and set it to the home plate coordinates of the field
            const fieldLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]); // Reverse the coordinates
            // create distance variable and set it to the distance between the click location and the home plate of the field
            const distance = google.maps.geometry.spherical.computeDistanceBetween(clickLocation, fieldLatLng);
            // if the distance is less than the minDistance
            if (distance < minDistance) {
                minDistance = distance;
                closestField = field; // set the closestField to this field
            }
        });
        // If the distance to the closest field is over 1 mile return null
        if (minDistance > 1609) {
            return null;
        }
        console.log("Closest field:", closestField, "Min distance:", minDistance); //
      
        return closestField;
      }


/// Create the draw line function and specify the line options
// input data - closestField from closestFieldFunction, click location, and map from MapClickHandler
// output - a line drawn on the map from the home plate of the closest field to the click location
// and a numberical distance from home plate to the click location
function drawLine(closestField, clickLocation, map) {
  // remove the old line if it exists
  if (currentLine) {
    currentLine.setMap(null);
  }
  // create an empty line
  const line = new google.maps.Polyline({
      path: [],
      strokeColor: "#0000FF",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      zIndex: 1,
      map: map,
  });

  // store currentLine to be able to remove it later
  currentLine = line;

  const start = new google.maps.LatLng(closestField.home_plate[1], closestField.home_plate[0]);
  const end = clickLocation;

  const stepCount = 100; // number of steps to take from start to end
  const latStep = (end.lat() - start.lat()) / stepCount;
  const lngStep = (end.lng() - start.lng()) / stepCount;

  const minSize = 22; // minimum size of the icon
  const maxSize = 32; // maximum size of the icon

  let i = 0;
  const intervalId = setInterval(() => {
      // calculate the next point along the line
      const nextPoint = new google.maps.LatLng(start.lat() + i * latStep, start.lng() + i * lngStep);

      // get the current path and append the next point
      const path = line.getPath();
      path.push(nextPoint);

      // update the line's path
      line.setPath(path);

      // update the marker's position
      currentMarker.setPosition(nextPoint);

      // change the size of the icon
      const customIcon = currentMarker.getIcon();
      let newSize;
      if (i <= stepCount / 2) {
          // we're before the midpoint, so grow the icon
          newSize = minSize + ((maxSize - minSize) * (i / (stepCount / 2)));
      } else {
          // we're after the midpoint, so shrink the icon
          newSize = maxSize - ((maxSize - minSize) * ((i - stepCount / 2) / (stepCount / 2)));
      }
      customIcon.scaledSize = new google.maps.Size(newSize, newSize);
      currentMarker.setIcon(customIcon);

      // increment step count
      i++;

      // if we've reached the end, stop the interval
      if (i > stepCount) {
          clearInterval(intervalId);
      }
      
  }, 1); // delay between steps in milliseconds

  // create the distance variable and set it to the distance between the click location and the home plate of the closest field
  const distance = google.maps.geometry.spherical.computeDistanceBetween(end, start);
  // convert the distance to feet
  const distanceFeet = distance * 3.28084;

  // display in console for testing
  console.log("Total distance:", distanceFeet.toFixed(0) + " ft");

  // set the distance element to the distance in feet
  // document.getElementById("clickDistance").innerHTML = distanceFeet.toFixed(0) + " ft";

  // close the function and return distanceFeet
  return distanceFeet;
}

// Create the clickMarker function and specify the marker options
// input data - click location and map from MapClickHandler
// output - a marker on the map at the location of the click
function clickMarker(clickLocation, map) {
  console.log("Making marker...");

  // Specify the custom icon URL
  const customIconUrl = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/icons/baseball/ball.png';

  // Create the custom icon with scaling and adjusted positioning
  const customIcon = {
    url: customIconUrl,
    scaledSize: new google.maps.Size(22, 22), // Scale the icon to 32x32 pixels
    anchor: new google.maps.Point(11, 11) // Shift the icon down by 10 pixels
  };

  // Create the marker
  const marker = new google.maps.Marker({
    position: clickLocation, // Set the position to the click location
    map: map, // Set the map
    icon: customIcon // Set the custom scaled icon with adjusted positioning
  });

  // Clear the marker once a new one is created
  if (currentMarker) {
    currentMarker.setMap(null);
  }

  // Set the currentMarker to the marker we just created
  currentMarker = marker;

  // Close the function
  return;
}


// Create a function to check if the click location is inside the fence
// input data - closestField from closestFieldFunction, click location, map, and polygons array from MapClickHandler
// output triggers the fenceDistance function if the click location is outside the fence
function checkFence(closestField, clickLocation, map, polygons) {
    console.log("Checking fence...");
    let fenceDist = null;
  
    for (let i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];
        if (!google.maps.geometry.poly.containsLocation(clickLocation, polygon)) { // IF THE CLICK LOCATION IS OUTSIDE THE POLYGON
            console.log("Click location is outside the fence");
            // show closest field
            console.log("Closest field:", closestField);
            
            const homePlateLatLng = closestField.home_plate;
            const homePlatePoint = new google.maps.LatLng(homePlateLatLng[1], homePlateLatLng[0]);
            const polygonCoords = polygon.getPath().getArray();
            fenceDist = findFenceDistance(clickLocation, homePlatePoint, polygonCoords, map);
            if (fenceDist !== null) { // IF THE FENCE DISTANCE IS NOT NULL
                console.log("Fence distance:", fenceDist.toFixed(0) + " ft"); // PRINT THE FENCE DISTANCE TO THE CONSOLE
                break; // Break the loop as we found a valid fence distance
            }
        }
    }
    return fenceDist;
}

  
  
  
/// Create function to find 2 intersection points where the line drawn passes through the fence
// measure the distance between the 2 intersection points and return in feet as fenceDistance

function findFenceDistance(p1, p2, polygonCoords, map) {
  const intersectionPoints = [];

  // Call function to clear any previous fence markers
  clearFenceMarkers();

  for (let i = 0; i < polygonCoords.length; i++) {
    const p3 = polygonCoords[i];
    const p4 = polygonCoords[(i + 1) % polygonCoords.length];

    const intersectionPoint = findLineIntersection(p1, p2, p3, p4);

    if (intersectionPoint) {
      intersectionPoints.push(intersectionPoint);


    }

    if (intersectionPoints.length === 2) {
            // Pass the intersection point to a function to create a marker at that point
            createFenceMarker(intersectionPoint, map);
      const fenceDist_meters = google.maps.geometry.spherical.computeDistanceBetween(
        intersectionPoints[0],
        intersectionPoints[1]
      );
      const fenceDist = fenceDist_meters * 3.28084; // Convert meters to feet
      return fenceDist;
    }
  }
  return null;
}

function createFenceMarker(fencePoint, map) {
  console.log("Making fence marker...");

  const marker = new google.maps.Marker({
    position: fencePoint,
    map: map,
    icon: {
      url: 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/icons/baseball/firework.png', // Customize the icon if needed
      scaledSize: new google.maps.Size(26, 26),
      fillColor: "#FFFF00", // Does not work with custom icons from url. need to be svg symbol
    }
  });

  // Add the created marker to the fenceMarkers array
  fenceMarkers.push(marker);

  return marker;
}

function clearFenceMarkers() {
  for (let i = 0; i < fenceMarkers.length; i++) {
    fenceMarkers[i].setMap(null);
  }
  // Empty the fenceMarkers array
  fenceMarkers = [];
}


  /// Find the intersection points to measure the fence distance  
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





  // map out the data for polygons
  // input data - full 'data' object from json file and 'map' object from fetchData() and initMap()
    // output - polygons rendered on map
//  RenderPolygons to pass the new data to createMarker
function renderPolygons(data, map, levelCounts, gameData) {
  console.log("calling rendering polygons...");
  polygons = [];

  data.forEach(field => {
      const fopCoords = field.fop;
      const foulCoords = field.foul;
      
      // Check if fopCoords and foulCoords are not empty before calling createPolygon
      if (fopCoords && fopCoords.length > 0) {
          createPolygon(fopCoords, "#00FF00", map, levelCounts, gameData);
      }

      if (foulCoords && foulCoords.length > 0) {
          createPolygon(foulCoords, "#FF0000", map, levelCounts, gameData);
      }

      // Pass new data to createMarker
      createMarker(field, map);

  });

  polygons.forEach(polygon => {
      polygon.setOptions({ zIndex: 0 });
  });
}

    
    
      //  Create the polygons on the map
      // input data - coordinates, color, and map from renderPolygons()
      function createPolygon(coordinates, fillColor, map, levelCounts, gameData) {
        const polygon = new google.maps.Polygon({ // call polygon function from google maps api
          paths: coordinates.map(coord => { // set paths to coordinates
            return { lat: coord[1], lng: coord[0] }; // Reverse the coordinates to (lat, lng), stored in json the other way
          }),
          fillColor: fillColor, // set fill color
          strokeColor: fillColor, // set border color
          strokeWeight: 1, // set border weight
          fillOpacity: 0.35, // set fill opacity by percentage (0-1)
          map: map // set map to the map object - not sure why this is nessisary. must be needed by api
        });

        // Create a listener for clicks within the polygon
        // Goal: open the info window for the field when the polygon is clicked
        // and pass the location of the click to the drawLine function
        polygon.addListener("click", (event) => {
          console.log("Polygon click:", event.latLng);
          
          const closestField = closestFieldFunction(event.latLng, fetchedData);
          
          const distanceFeet = drawLine(closestField, event.latLng, map);
          
          
          
          clickMarker(event.latLng, map, levelCounts);
          fieldInfo(closestField, distanceFeet, fenceDist = null, map, levelCounts, gameData)

      
          return;
      });
        
        polygons.push(polygon); // add polygon we created to polygons array (created on top in global variables)
      
        return polygon; // return the polygon we created
        // will be used in the addMapClickHandler function to check the click location against
      }
// Define the paths to the icons outside of the function, as they don't change
const iconPathBase = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/7ed36c05c89fe22ae7e43598b9357c57f5610069/data/NCAA_D1/conf_logos/';


// Create the icon filepaths from the base url and the field.Filename
function createIconUrl(filename) {
  return iconPathBase + filename;

}

async function createMarker(field, map) {
  let iconUrl;
  let defaultIconUrl = "https://github.com/JSmith1826/BB_parks/blob/7ed36c05c89fe22ae7e43598b9357c57f5610069/data/images/icons/baseball/stadium_lt_blue.png";  
  let iconSize = new google.maps.Size(90, 90);

  console.log("field: ", field); // prints the field object

  // Check if the field has a filename
  if (field.filename) {
    console.log("filename: ", field.filename); // prints the filename
    iconUrl = createIconUrl(field.filename);
    console.log("iconUrl: ", iconUrl); // prints the iconUrl after verification
  } else {
    iconUrl = defaultIconUrl;
    console.log("default called: ", iconUrl); // prints the iconUrl after verification
  }

  const marker = new google.maps.Marker({
      position: new google.maps.LatLng(field.home_plate[1], field.home_plate[0]),
      map: map,
      title: field.conference,
      icon: {
          url: iconUrl,
          scaledSize: iconSize,
      },
      city: field.city,
      state: field.state,
      park_name: field.park_name,
      
  });

  console.log("marker: ", marker); // prints the created marker object

  if (!markers[field.level]) {
    markers[field.level] = [];
  }
  markers[field.level].push(marker);
  console.log("markers: ", markers); // prints the markers object

  let markerPopupContent = `<div class="custom-infoTitle">${field.conference}</div>`;
  markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">${field.park_name}</div><br>`;
  markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">${field.city}, ${field.state}</div>`;
  // markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">Notes: ${field.notes}</div>`;
  
  markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">${field.date_range}</div>`;
  // markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">Host: ${field.host_raw}</div>`;
  // markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">Final Game Info: ${field.final_game_info}</div>`;
  markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center custom-markerPopup-light">Double Click to Zoom</div>`;

  const infowindow = new google.maps.InfoWindow({
      content: markerPopupContent
  });

  marker.addListener("click", () => {
      infowindow.open(map, marker);
  });
  marker.addListener("mouseover", () => {
      infowindow.open(map, marker);
  });
  marker.addListener("mouseout", () => {
      infowindow.close();
  });

  const adjustment = 0.0005;
  marker.addListener("dblclick", () => {
      let latAdjustment = 0;
      let lngAdjustment = 0;

      switch (field.field_cardinal_direction) {
          case 'NE':
              latAdjustment = adjustment;
              lngAdjustment = adjustment;
              break;
          case 'SE':
              latAdjustment = -adjustment;
              lngAdjustment = adjustment;
              break;
          case 'SW':
              latAdjustment = -adjustment;
              lngAdjustment = -adjustment;
              break;
          case 'NW':
              latAdjustment = adjustment;
              lngAdjustment = -adjustment;
              break;
          case 'N':
              latAdjustment = adjustment;
              break;
          case 'S':
              latAdjustment = -adjustment;
              break;
          case 'E':
              lngAdjustment = adjustment;
              break;
          case 'W':
              lngAdjustment = -adjustment;
              break;
          default:
              break;
      }
  
      const centerPosition = new google.maps.LatLng(field.home_plate[1] + latAdjustment, field.home_plate[0] + lngAdjustment);
  
      map.setCenter(centerPosition);
      map.setZoom(19);
      closestFieldFunction(centerPosition, fetchedData)
  });
  
  return marker;
}  



  function wrapDigits(value) {
    const numberElement = document.createElement("number");
    numberElement.textContent = value;
    return numberElement;
}




function filterByLevel(level) {
  console.log("Filtering by level:", level);
  level = Number(level);

  for (let i = 0; i < markers.length; i++) {
    // Skip if the marker is undefined
    if (!markers[i]) continue;

    for (let j = 0; j < markers[i].length; j++) {
      // Skip if the marker is undefined
      if (!markers[i][j]) continue;

      // Check if the marker has a setMap function
      if (typeof markers[i][j].setMap !== 'function') {
        console.log('Not a Marker object:', markers[i][j]);
        continue;
      }

      if (i <= level) {
        markers[i][j].setMap(map);
      } else {
        markers[i][j].setMap(null);
      }
    }
  }
}





/////////////////////////////// TEST CODE ////////////////////////////

    // Create the function to make the html element with the field info and distance display
    // input data - closestField from closestFieldFunction, totalDistance, fenceDistance, map from MapClickHandler
    // output - a html element containing field info and the dynamic distance element with the
    // distance from home plate to the click location and the fence distance from home plate if the click is outside the fence
    // This function is called in the MapClickHandler function
function fieldInfo(closestField, distanceFeet, fenceDist = null, map, levelCounts, gameData) {
  console.log("Creating field info...");

  // Call the gameInfo, pass closestField and gameData
  gameInfo(closestField, gameData);

  const fieldTitle = document.getElementById("fieldTitle");
  fieldTitle.innerHTML = ""; // Clear the previous children

  const fieldName = document.createElement("h2");
  fieldName.innerHTML = `${closestField.park_name}`;
  fieldTitle.appendChild(fieldName);

    // Add the city and state under the park name if there is one
    if (closestField.city && closestField.state) {
      const cityState = document.createElement("h3");
      cityState.innerHTML = `${closestField.city}, ${closestField.state}`;
      fieldTitle.appendChild(cityState);
    }

    // Define default colors
    let dynamicBgColor = '#627454'; // Background default color
    let dynamicTextColor = '#f8e2e2'; //  default color
  
    if (closestField.color1 && closestField.color2) {
      dynamicBgColor = closestField.color1;
      dynamicTextColor = closestField.color2;
    }
    console.log(dynamicBgColor);
    console.log(dynamicTextColor);
  
    // Apply colors
    document.documentElement.style.setProperty('--dynamic-bg-color', dynamicBgColor);
    document.documentElement.style.setProperty('--dynamic-text-color', dynamicTextColor);

    // Create the flex container
    // const flexContainer = document.createElement('div');
    // flexContainer.style.display = 'flex';
    // flexContainer.style.justifyContent = 'space-between'; // Add some space between the columns

      // Clear the fenceBlock and areaBlock containers
const fenceBlock = document.getElementById("fenceBlock");
fenceBlock.innerHTML = "";

    const fenceInfo = document.createElement("p");
    fenceInfo.innerHTML = `Batter's Eye: ${closestField.field_cardinal_direction} | Altitude: ${(closestField.altitude * 3.281).toFixed(0)} ft<br>`;


    fenceInfo.innerHTML += `<br>Fence Dimensions<br><br>`;

    fenceInfo.appendChild(wrapDigits(closestField.min_distance));
    fenceInfo.innerHTML += `<number> |  </number>`;
    fenceInfo.appendChild(wrapDigits((closestField.avg_distance).toFixed(0)));

    fenceInfo.innerHTML += `<number>  |  </number>`;
    fenceInfo.appendChild(wrapDigits(closestField.max_distance));

    fenceInfo.innerHTML += `<br>MINIMUM   <number>|</number>   AVERAGE    <number>|</number>   MAXIMUM<br>`;

    fenceBlock.appendChild(fenceInfo);


    // Add the fenceBlock to the flex container
    // flexContainer.appendChild(fenceBlock);

    // Create the areaBlock
    const areaBlock = document.getElementById("areaBlock");
    areaBlock.innerHTML = "";

    const areaInfo = document.createElement("p");
    areaInfo.innerHTML = `Fair Territory `;
    areaInfo.appendChild(wrapDigits((closestField.fop_area_sqft / 43560).toFixed(2)));
    areaInfo.innerHTML += ` Acres<br> Foul Ground `;
    // areaInfo.innerHTML += `Rank: ${closestField.field_area_rank}<br>`; // Rank of field area
    areaInfo.appendChild(wrapDigits(100*(closestField.foul_area_sqft / (closestField.fop_area_sqft + closestField.foul_area_sqft)).toFixed(1)));
    areaInfo.innerHTML += `<number>%</number>`;
    // areaInfo.innerHTML += `Rank: ${closestField.ratio_rank}<br>`; // Rank of fair:foul ratio
    areaBlock.appendChild(areaInfo);


    function createGradientBars(field, hr_min, hr_max, unique_min, unique_max) {
      // Normalize the scores
      const hr_normalized = (field.hr_friendliness - hr_min) / (hr_max - hr_min);
      const unique_normalized = (field.uniqueness_score - unique_min) / (unique_max - unique_min);
      
      // Check for existing gradient bars and remove them if they exist
      const oldGradientBar1 = document.getElementById('gradientBar1');
      const oldGradientBar2 = document.getElementById('gradientBar2');
      if (oldGradientBar1) oldGradientBar1.remove();
      if (oldGradientBar2) oldGradientBar2.remove();
  
      // Create two new canvas elements
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      canvas1.id = 'gradientBar1';
      canvas2.id = 'gradientBar2';
      canvas1.width = canvas2.width = 200;
      canvas1.height = canvas2.height = 30;
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');
  
      // Create linear gradients
      const gradient1 = ctx1.createLinearGradient(0, 0, canvas1.width, 0);
      const gradient2 = ctx2.createLinearGradient(0, 0, canvas2.width, 0);
  
      // Create gradients in steps instead of a smooth transition
      gradient1.addColorStop(0, 'red');
      gradient1.addColorStop(0.5, 'yellow');
      gradient1.addColorStop(1, 'green');
  
      gradient2.addColorStop(0, 'blue');
      gradient2.addColorStop(0.5, 'purple');
      gradient2.addColorStop(1, 'pink');
  
      // Draw thicker white outlines
      [ctx1, ctx2].forEach(ctx => {
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'white';
          ctx.strokeRect(0, 0, canvas1.width, canvas1.height);
      });
  
      // Fill the canvases with the gradients
      ctx1.fillStyle = gradient1;
      ctx2.fillStyle = gradient2;
      [ctx1, ctx2].forEach(ctx => {
          ctx.fillRect(1, 1, canvas1.width - 2, canvas1.height - 2);
      });
  
      // Draw the tick marks
      const normalizedScore1 = hr_normalized * canvas1.width;
      const normalizedScore2 = unique_normalized * canvas2.width;
      ctx1.fillStyle = ctx2.fillStyle = 'black';
      ctx1.fillRect(normalizedScore1, 0, 2, canvas1.height);
      ctx2.fillRect(normalizedScore2, 0, 2, canvas2.height);
  
      // Add labels
      [ctx1, ctx2].forEach(ctx => {
          ctx.font = '14px Arial';
          ctx.fillStyle = 'black';
      });
      // ctx1.fillText('HR Unfriendliness', 2, 12);
      ctx1.textAlign = 'end';
      ctx1.fillText('HR Friendliness', canvas1.width - 2, 12);
      
      ctx2.fillText('Not Unique', 2, 12);
      ctx2.textAlign = 'end';
      ctx2.fillText('Unique', canvas2.width - 2,12);
  
      return [canvas1, canvas2];
  }
  
  // Then use this function in your code like this:
  
// Define the min and max scores
const hr_min = -1.682192601;
const hr_max = 0.834846515;
const unique_min = 0.774357376;
const unique_max = 3.69218139;

// Create gradient bars
let [gradientBar1, gradientBar2] = createGradientBars(closestField, hr_min, hr_max, unique_min, unique_max);

// Append the gradient bars to a container in your HTML
let fieldInfo = document.getElementById('fieldInfo');
fieldInfo.appendChild(gradientBar1);
//  fieldInfo.appendChild(gradientBar2);
  

    
    // Append the flexContainer to the parent element of fenceBlock and areaBlock
    // document.getElementById('fieldInfo').appendChild(flexContainer);

    // Continue with the rest of the code
    const distanceContainer = distanceDisplay(distanceFeet, fenceDist, levelCounts);
    const distanceBlock = document.getElementById("distanceBlock");        
    distanceBlock.innerHTML = ""; // Clear the previous distanceContainer if any
    distanceBlock.appendChild(distanceContainer);


    

    return;

}

////////// FUNCTION TO CREATE THE BOX WITH GAME INFO //////////
// input data - closestField from closestFieldFunction
// output - a html element containing info about the games that will be hosted for the tourney
function gameInfo(closestField) {
  console.log("Creating game info...");

  const hostInfo = document.getElementById("hostInfo");
  hostInfo.style.display = "block";

  hostInfo.innerHTML = "";

  // Filter the games for the selected conference
  const filteredGames = gameData.filter(game => game.conference === closestField.conference);

  // Add the conference logo
  if (closestField.filename && iconPathBase) {
    const conferenceLogo = document.createElement("img");
    conferenceLogo.src = iconPathBase + closestField.filename;
    conferenceLogo.onerror = function() {
      console.error('Error loading logo: ' + conferenceLogo.src);
    };
    hostInfo.appendChild(conferenceLogo);
  } else {
    console.error('Missing icon path base or logo filename');
  }

  if (filteredGames.length > 0) {
    // Display conference info once at the top
    const conferenceInfo = document.createElement("h3");
    // Change the font color to black
    conferenceInfo.style.color = "black";
    conferenceInfo.innerHTML = `${filteredGames[0].conference}`;
    hostInfo.appendChild(conferenceInfo);
  } else {
    console.log(`No games found for conference: ${closestField.conference}`);
  }


    
// Loop through the filtered games
filteredGames.forEach((game) => {
  const timeInfo = document.createElement("p");
  timeInfo.style.color = "var(--ash-gray)"; // Set color to "--ash-gray"
  timeInfo.style.marginBottom = "0px"; // Reduce the bottom margin for spacing
  timeInfo.innerHTML = `Game # ${game.game} - ${game.date} at ${game.time}<br>`;
  hostInfo.appendChild(timeInfo);

  const gameInfo = document.createElement("p");
  const homeScore = game.home_score !== null ? game.home_score : '';
  const roadScore = game.road_score !== null ? game.road_score : '';
  gameInfo.innerHTML += `${game.road_team} ${roadScore} vs ${game.home_team} ${homeScore}<br>`;
  hostInfo.appendChild(gameInfo);

  const emptyLine = document.createElement("br");
  hostInfo.appendChild(emptyLine);
});
}






    // Call this function when the page loads or before field selection
function initializeDistanceDisplay() {
  const distanceContainer = distanceDisplay(null, null);
  // Now add distanceContainer to your page where you want it to appear
  document.body.appendChild(distanceContainer); // Change this line as needed
}
  

function distanceDisplay(distanceFeet, fenceDist, levelCounts) {
  console.log("Creating distance display...");
  console.log("Distance feet:", distanceFeet, "Fence distance:", fenceDist);

  const distanceContainer = document.createElement("div");
  distanceContainer.id = "distanceContainer";

  if (distanceFeet === null && fenceDist === null) {
    distanceContainer.innerHTML = "Select a Field and Click to Measure Distance";
  } else if (distanceFeet !== null && fenceDist === null) {
    
    distanceContainer.innerHTML += `Landing Spot: `;
    distanceContainer.appendChild(wrapDigits(distanceFeet.toFixed(0)));
    distanceContainer.innerHTML += ` ft <number> | </number> Home Run Distance <number> --- </number> ft`;
  } else {
    distanceContainer.innerHTML += `Landing Spot: `;
    distanceContainer.appendChild(wrapDigits(distanceFeet.toFixed(0)));
    distanceContainer.innerHTML += ` ft <number>| </number>`;
    distanceContainer.innerHTML += ` Home Run Distance: `;
    distanceContainer.appendChild(wrapDigits(fenceDist.toFixed(0)));
    distanceContainer.innerHTML += ` ft`;
  }

  return distanceContainer;
}


function filterMarkers(level) {
  console.log("Filtering by level: ", level); // Log the level parameter
  console.log("Markers before filtering: ", markers); // Log the state of markers before filtering

  // Hide all markers
  for (var key in markers) {
      if (markers[key]) {
          for (var i = 0; i < markers[key].length; i++) {
              markers[key][i].setMap(null);
          }
      }
  }

  // Show only the markers with the selected level
  if (markers[level]) {
      for (var i = 0; i < markers[level].length; i++) {
          markers[level][i].setMap(map);
      }
  } else {
      console.log("No markers for level: ", level); // Log if there are no markers for this level
  }
}

