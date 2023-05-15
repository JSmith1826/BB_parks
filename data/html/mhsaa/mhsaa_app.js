////////////////// UPDATE THIS TO MAKE THE MHSAA MAP ///////////////////////
//////// WORK STARTED 5-9-23 ////////
///set up variables

const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/mhsaa/data/map.json"; // Michigan fields json file
let fetchedData;
let polygons = [];
let currentLine = null;
let currentMarker = null;
let fenceMarkers = [];
let defaultIconUrl = "https://github.com/JSmith1826/BB_parks/blob/3508a593be080a4fb7cf102cda697ce8f893c840/data/images/icons/base/TEMP/infield2_black.png";  
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
    
    let initialCenter = {lat: 44.3148, lng: -85.6024}; // Set to your desired initial center
    let initialZoom = 8; // Set to your desired initial zoom

  
    console.log("Initializing map...");
  
    // Set the display and other options for the map
    const mapOptions = {
      zoom: 8, // deafualt zoom level
      center: new google.maps.LatLng(44.3148, -85.6024), // geogrpahic center of Michigan - default center location
      mapTypeId: 'hybrid', // default map type
    };
  
    // Create the map object by calling the Google Maps API and passing in the map div and map options
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // call renderPolygons function and pass in full data and map
    renderPolygons(data, map, levelCounts); 
    // Create a listener on the map to detect a click and run the handleMapClick function
// Inside the initMap function
google.maps.event.addListener(map, "click", (event) => {
  MapClickHandler(event, fetchedData, map, polygons, levelCounts);
});
    // Initialize the search box
    initSearchBox(map);


//////////////////////////////////////////////////////////
  //// Add Reset Button To The Map for quick zoom out
  //////////////////////////////////////////////////////
    let resetButton = document.createElement('button');
resetButton.innerHTML = 'Reset Map';
resetButton.style.background = 'blue'; // Set to your desired background color
resetButton.style.border = '2px solid #4CAF50'; // Set to your desired border color/style
resetButton.style.color = 'white'; // Set to your desired text color
resetButton.style.padding = '15px 32px'; // Set to your desired padding
resetButton.style.textAlign = 'center'; // Set to your desired text alignment
resetButton.style.textDecoration = 'bold'; // Set to your desired text decoration
resetButton.style.display = 'inline-block'; // Set to your desired display
resetButton.style.fontSize = '2.0rem'; // Set to your desired font size
resetButton.style.margin = '4px 2px'; // Set to your desired margin
resetButton.style.cursor = 'pointer'; // Set to your desired cursor style
resetButton.style.borderRadius = '12px'; // Set to your desired border radius

resetButton.addEventListener('click', function() {
  map.setZoom(initialZoom);
  map.setCenter(initialCenter);
});

// Append the button to a desired parent element
document.body.appendChild(resetButton);
map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(resetButton);

// In the example above, TOP_RIGHT can be replaced with any of the following positions:
// BOTTOM_CENTER, BOTTOM_LEFT, BOTTOM_RIGHT, LEFT_BOTTOM, LEFT_CENTER, LEFT_TOP, 
// RIGHT_BOTTOM, RIGHT_CENTER, RIGHT_TOP, TOP_CENTER, TOP_LEFT.


  }
  
  // Wait for the DOM to load before running the initMap function
  // DOM is the html document
  document.addEventListener("DOMContentLoaded", initMap);

/////////////////////////////// TEST CODE ////////////////////////////
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
            console.log("Drawing line...");
            // clear the current line and distance in feet if there is one
            if (currentLine) {
                currentLine.setMap(null);

            }
            // Call function to clear any previous fence markers
            clearFenceMarkers();
            
            // create the line
            const line = new google.maps.Polyline({
                path: [
                    new google.maps.LatLng(closestField.home_plate[1], closestField.home_plate[0]), // Reverse the coordinates  
                    clickLocation,
                ],
                strokeColor: "#0000FF", // set the line color
                strokeOpacity: 1.0, // set the line opacity
                strokeWeight: 2, // set the line weight
                zIndex: 1, // set the line to be on top of the polygons
                map: map, // set the map
            });
            // set the currentLine to the line we just created
            currentLine = line;
            // create the distance variable and set it to the distance between the click location and the home plate of the closest field
            const distance = google.maps.geometry.spherical.computeDistanceBetween(clickLocation, new google.maps.LatLng(closestField.home_plate[1], closestField.home_plate[0]));
            // convert the distance to feet
            const distanceFeet = distance * 3.28084;

            // display in console for testing
            console.log("Total distance:", distanceFeet.toFixed(0) + " ft");


            // set the distance element to the distance in feet
            // document.getElementById("clickDistance").innerHTML = distanceFeet.toFixed(0) + " ft";
            
            // close the function
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
// Modify renderPolygons to pass the new data to createMarker
function renderPolygons(data, map, levelCounts) {
  console.log("calling rendering polygons...");
  polygons = [];

  data.forEach(field => {
      const fopCoords = field.fop;
      const foulCoords = field.foul;
      
      // Check if fopCoords and foulCoords are not empty before calling createPolygon
      if (fopCoords && fopCoords.length > 0) {
          createPolygon(fopCoords, "#00FF00", map, levelCounts);
      }

      if (foulCoords && foulCoords.length > 0) {
          createPolygon(foulCoords, "#FF0000", map, levelCounts);
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
      function createPolygon(coordinates, fillColor, map, levelCounts) {
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
          fieldInfo(closestField, distanceFeet, null, map, levelCounts);
      
          return;
      });
        
        polygons.push(polygon); // add polygon we created to polygons array (created on top in global variables)
      
        return polygon; // return the polygon we created
        // will be used in the addMapClickHandler function to check the click location against
      }
// Define the paths to the icons outside of the function, as they don't change
const iconPathBase = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/mhsaa/';
const iconDist = {
    '1': `${iconPathBase}1_red.png`,
    '2': `${iconPathBase}2_blue.png`,
    '3': `${iconPathBase}3_lt_blue.png`,
    '4': `${iconPathBase}4_white.png`,
};
const iconRSF = {
    '1': `${iconPathBase}2_red.png`,
    '2': `${iconPathBase}2_blue.png`,
    '3': `${iconPathBase}2_lt_blue.png`,
    '4': `${iconPathBase}2_white.png`,
};
const iconRF = {
    '1': `${iconPathBase}3_red.png`,
    '2': `${iconPathBase}3_blue.png`,
    '3': `${iconPathBase}3_lt_blue.png`,
    '4': `${iconPathBase}3_white.png`,
};
const iconChamp = `${iconPathBase}champ.png`;


function createMarker(field, map) {
    

    
    // Set the icon based on the level round and division
    let iconUrl;
    if (field.finals !== null) {
        iconUrl = iconChamp;
    } else if (field.region_final_quarter !== null) {
        iconUrl = iconRF[field.regional_div];
    } else if (field.region_semi_number !== null) {
        iconUrl = iconRSF[field.regional_div];
    } else if (field.district !== null) {
        iconUrl = iconDist[field.division];
    } else {
        // Default icon URL if none of the conditions are met
        iconUrl = defaultIconUrl;
    }

    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(field.home_plate[1], field.home_plate[0]),
        map: map,
        title: field.park_name,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40)  // Sets the icon size to 30x30 pixels
        },
        level: field.level,
    });

    // Create the marker popup content
    let markerPopupContent = `<div class="custom-infoTitle">${field.park_name}</div>`;
    
    function createMarker(field, map) {
        // Set the icon based on the level round and division
        let iconUrl;
        if (field.finals !== null) {
            iconUrl = iconChamp;
        } else if (field.region_final_quarter !== null) {
            iconUrl = iconRF[field.regional_div];
        } else if (field.region_semi_number !== null) {
            iconUrl = iconRSF[field.regional_div];
        } else if (field.district !== null) {
            iconUrl = iconDist[field.division];
        } else {
            // Default icon URL if none of the conditions are met
            iconUrl = defaultIconUrl;
        }
    
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(field.home_plate[1], field.home_plate[0]),
            map: map,
            title: field.park_name,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(40, 40)  // Sets the icon size to 30x30 pixels
            },
            level: field.level,
        });
    


    
        const infowindow = new google.maps.InfoWindow({
            content: markerPopupContent
        });
    
        // Control mouse behavior
        marker.addListener("click", () => {
            infowindow.open(map, marker);
        });
    
        marker.addListener("mouseover", () => {
            infowindow.open(map, marker);
        });
    
        marker.addListener("mouseout", () => {
            infowindow.close();
        });
    
        marker.addListener("dblclick", () => {
            map.setCenter(marker.getPosition());
            map.setZoom(19);
            
        });
    
        return marker;
    }
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">Hosted by the ${field.host_team} ${field.nickname}</div>`;
if (field.district !== null) {
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center"><span class="custom-markerPopup-light">Division ${field.division}</span> District ${field.district}</div>`;
} 

if (field.finals !== null) {
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center">TROPHY WEEKEND<br>June DATE</div>`;
} 

if (field.region_final_quarter !== null) {
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center"><span class="custom-markerPopup-light">Division ${field.regional_div}</span> Final and Quarter Final ${field.region_final_quarter}</div>`;
} 

if (field.region_semi_number !== null) {
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center"><span class="custom-markerPopup-light">Division ${field.regional_div}</span> Regional Semi ${field.region_semi_number}</div>`;
} 

markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center custom-markerPopup-light"><br>Double Click to Zoom</div>`;

const infowindow = new google.maps.InfoWindow({
    content: markerPopupContent
});


    // Control mouse behavior
    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });

    marker.addListener("mouseover", () => {
        infowindow.open(map, marker);
    });

    marker.addListener("mouseout", () => {
        infowindow.close();
    });

    marker.addListener("dblclick", () => {
        map.setCenter(marker.getPosition());
        map.setZoom(19);
    });

    return marker;
}




  function wrapDigits(value) {
    const numberElement = document.createElement("number");
    numberElement.textContent = value;
    return numberElement;
}
        

    // Create the function to make the html element with the field info and distance display
    // input data - closestField from closestFieldFunction, totalDistance, fenceDistance, map from MapClickHandler
    // output - a html element containing field info and the dynamic distance element with the
    // distance from home plate to the click location and the fence distance from home plate if the click is outside the fence
    // This function is called in the MapClickHandler function
    function fieldInfo(closestField, distanceFeet, fenceDist = null, map, levelCounts) {
        console.log("Creating field info...");
      
        const fieldTitle = document.getElementById("fieldTitle");
        fieldTitle.innerHTML = "";
      
        const fieldName = document.createElement("h2");
        fieldName.innerHTML = `${closestField.park_name}`;
        
        fieldTitle.appendChild(fieldName);
      
        if (closestField.nickname) {
          const homeOf = document.createElement("h2");
          homeOf.innerHTML = `Home of the ${closestField.host_team} ${closestField.nickname}`;
          fieldTitle.appendChild(homeOf);
        }
      
        if (closestField.district) {
          const districtLevel = document.createElement("h3");
          districtLevel.innerHTML = `<b>Host Site</b><br><br> Division ${closestField.division} | District ${closestField.district}`;
          fieldTitle.appendChild(districtLevel);
        }
      
        if (closestField.region_semi_number) {
          const regionSemiLevel = document.createElement("h3");
          regionSemiLevel.innerHTML = `Division ${closestField.regional_div} Regional Semi-Final<br>(Game ${closestField.region_semi_number})`;
          fieldTitle.appendChild(regionSemiLevel);
        }
      
        if (closestField.region_final_quarter) {
          const regionFinalLevel = document.createElement("h3");
          regionFinalLevel.innerHTML = `Division ${closestField.regional_div} Regional Final and Quarter Final ${closestField.region_final_quarter}`;
          fieldTitle.appendChild(regionFinalLevel);
        }
      
        if (closestField.finals) {
          const finalsLevel = document.createElement("h3");
          finalsLevel.innerHTML = `Host of the Semi-Finals and Finals`;
          fieldTitle.appendChild(finalsLevel);
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
const flexContainer = document.createElement('div');
flexContainer.style.display = 'flex';
flexContainer.style.justifyContent = 'space-between'; // Add some space between the columns

// Create the fenceBlock
const fenceBlock = document.getElementById("fenceBlock");
fenceBlock.innerHTML = "";

const fenceInfo = document.createElement("p");
fenceInfo.innerHTML = `Fence<br>MINIMUM `;
fenceInfo.appendChild(wrapDigits(closestField.min_distance));
fenceInfo.innerHTML += `<br>MAXIMUM `;
fenceInfo.appendChild(wrapDigits(closestField.max_distance));
fenceInfo.innerHTML += `<br>AVERAGE `;
fenceInfo.appendChild(wrapDigits((closestField.avg_distance).toFixed(0)));
fenceInfo.innerHTML += `<br>`;
fenceInfo.appendChild(wrapDigits((closestField.median_distance).toFixed(0)));
fenceInfo.innerHTML += ` MED | (${closestField.median_distance_rank})<br>`;
fenceBlock.appendChild(fenceInfo);

// Add the fenceBlock to the flex container
flexContainer.appendChild(fenceBlock);

// Create the areaBlock
const areaBlock = document.getElementById("areaBlock");
areaBlock.innerHTML = "";

const areaInfo = document.createElement("p");
areaInfo.innerHTML = `Total Area<br>`;
areaInfo.appendChild(wrapDigits(((closestField.fop_area_sqft + closestField.foul_area_sqft) / 43560).toFixed(2)));
areaInfo.innerHTML += ` Acres<br>`;
areaInfo.innerHTML += `Rank: ${closestField.field_area_rank}<br>`; // Rank of field area
areaInfo.appendChild(wrapDigits((closestField.fop_area_sqft / closestField.foul_area_sqft).toFixed(2)));
areaInfo.innerHTML += `<number> : 1 </number> Fair : Foul Ratio<br>`;
areaInfo.innerHTML += `Rank: ${closestField.ratio_rank}<br>`; // Rank of fair:foul ratio
areaBlock.appendChild(areaInfo);

// Add the areaBlock to the flex container
flexContainer.appendChild(areaBlock);

// Append the flexContainer to the parent element of fenceBlock and areaBlock
document.getElementById('fieldInfo').appendChild(flexContainer);

// Continue with the rest of the code
const distanceContainer = distanceDisplay(distanceFeet, fenceDist, levelCounts);
const distanceBlock = document.getElementById("distanceBlock");
distanceBlock.innerHTML = ""; // Clear the previous distanceContainer if any
distanceBlock.appendChild(distanceContainer);

return;

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


  /////////// FILTER FUNCTIONS ///////////

  function filterMarkers(level) {
    // Hide all markers
    for (var key in markers) {
      for (var i = 0; i < markers[key].length; i++) {
        markers[key][i].setMap(null);
      }
    }
  
    // Show only the markers with the selected level
    if (markers[level]) {
      for (var i = 0; i < markers[level].length; i++) {
        markers[level][i].setMap(map);
      }
    }
  }

  function applyFilter(level) {
    if (level === "") {
      // Show all markers
      for (var key in markers) {
        for (var i = 0; i < markers[key].length; i++) {
          markers[key][i].setMap(map);
        }
      }
    } else {
      // Show markers based on the selected level
      filterMarkers(level);
    }
  }
  