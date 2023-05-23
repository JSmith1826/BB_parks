//////////////////////// NEW JAVASCRIPT TO DISPLAY NAAA CONFERENCE TOURNEY MAP //////////////

// Adapting from MHSAA map app

// Global variables
const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/NCAA_D1/data/conf_tourn_map.json"; // CONFERENCE fields json file
let fetchedData;
let polygons = [];
let currentLine = null;
let currentMarker = null;
let currentDivision = null;
let currentLevel = null;
let markers = [];  
let fenceMarkers = [];
let defaultIconUrl = "https://github.com/JSmith1826/BB_parks/blob/3508a593be080a4fb7cf102cda697ce8f893c840/data/images/icons/base/TEMP/infield2_black.png";  

//fetch data from json file
// Async function to fetch data from the JSON file
async function fetchData() {
    console.log("Fetching data...");
    const response = await fetch(jsonUrl);
    const data = await response.json();
    return data;
  }

  
// Async function to initialize the map
async function initMap() {
    const data = await fetchData();
    fetchedData = data;

    const levelCounts = {}

    let initialCenter = {lat: 44.3148, lng: -85.6024};
    let initialZoom = 7;

    console.log("Initializing map...");
    const mapOptions = {
        zoom: initialZoom,
        center: new google.maps.LatLng(initialCenter),
        mapTypeId: 'hybrid',
    };
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    renderPolygons(data, map, levelCounts);
    google.maps.event.addListener(map, "click", (event) => {
        MapClickHandler(event, fetchedData, map, polygons, levelCounts);
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
}

document.addEventListener("DOMContentLoaded", initMap);

// Create the map click handler - The big boy of functions
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

//  RenderPolygons to pass the new data to createMarker
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

////////////////////INSERT ICON DICTIONARY HERE////////////////////
// // Define the paths to the icons outside of the function, as they don't change
// const iconPathBase = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/mhsaa/';
// const iconDist = {
//     '1': `${iconPathBase}1_red.png`,
//     '2': `${iconPathBase}1_blue.png`,
//     '3': `${iconPathBase}1_lt_blue.png`,
//     '4': `${iconPathBase}1_white.png`,
// };
// const iconRSF = {
//     '1': `${iconPathBase}2_red.png`,
//     '2': `${iconPathBase}2_blue.png`,
//     '3': `${iconPathBase}2_lt_blue.png`,
//     '4': `${iconPathBase}2_white.png`,
// };
// const iconRF = {
//     '1': `${iconPathBase}3_red.png`,
//     '2': `${iconPathBase}3_blue.png`,
//     '3': `${iconPathBase}3_lt_blue.png`,
//     '4': `${iconPathBase}3_white.png`,
// };
// const iconChamp = `${iconPathBase}champ.png`;
  

function createMarker(field, map) {
    let iconUrl;
    let iconSize = new google.maps.Size(35, 35);
  
    // if (field.finals !== null) {
    //     iconUrl = iconChamp;
    // } else if (field.region_final_quarter !== null) {
    //     iconUrl = iconRF[field.regional_div];
    // } else if (field.region_semi_number !== null) {
    //     iconUrl = iconRSF[field.regional_div];
    // } else if (field.district !== null) {
    //     iconUrl = iconDist[field.division];
    //     iconSize = new google.maps.Size(15, 15);
    // } else {
    //     iconUrl = defaultIconUrl;
    // }
  
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(field.home_plate[1], field.home_plate[0]),
        map: map,
        title: field.display_name,
        icon: {
            url: iconUrl,
            scaledSize: iconSize,
        },
        level: field.level,
        division: field.division_final,
    });
  
    if (!markers[field.level]) {
      markers[field.level] = [];
  }
  markers[field.level].push(marker);
  
  
    let markerPopupContent = `<div class="custom-infoTitle">${field.display_name}</div>`;
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
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center"><br>Hosted by the ${field.host_team} ${field.nickname}</div>`;
    markerPopupContent += `<div class="custom-markerPopup custom-markerPopup-center custom-markerPopup-light"><br>Double Click to Zoom</div>`;
  
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

////// Function Just Changes the typefacr of the text in the info window
function wrapDigits(value) {
    const numberElement = document.createElement("number");
    numberElement.textContent = value;
    return numberElement;
}
  
// Create the Field Info HTML
function fieldInfo(closestField, distanceFeet, fenceDist = null, map, levelCounts) {
    console.log("Creating field info...");

    // Call the gameInfo
    gameInfo(closestField);
  
    const fieldTitle = document.getElementById("fieldTitle");
    fieldTitle.innerHTML = "";
  
    const fieldName = document.createElement("h2");
    fieldName.innerHTML = `${closestField.display_name}`;
    
    fieldTitle.appendChild(fieldName);
  
    if (closestField.nickname) {
      const homeOf = document.createElement("h3");
      homeOf.innerHTML = `Home of the ${closestField.host_team} ${closestField.nickname}`;
      fieldTitle.appendChild(homeOf);
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

        // Create the fenceBlock
        const fenceBlock = document.getElementById("fenceBlock");
        fenceBlock.innerHTML = "";

        const fenceInfo = document.createElement("p");
        fenceInfo.innerHTML = `Fence Dimensions<br>`;
        
        fenceInfo.appendChild(wrapDigits(closestField.min_distance));
        fenceInfo.innerHTML += `<number> | </number>`;
        fenceInfo.appendChild(wrapDigits((closestField.avg_distance).toFixed(0)));
        
        fenceInfo.innerHTML += `<number> | </number>`;
        fenceInfo.appendChild(wrapDigits(closestField.max_distance));
        
        fenceInfo.innerHTML += `<br>MINIMUM   |   AVERAGE    |   MAXIMUM<br>`;
       
        fenceBlock.appendChild(fenceInfo);

    // Add the fenceBlock to the flex container
    // flexContainer.appendChild(fenceBlock);

    // Create the areaBlock
    const areaBlock = document.getElementById("areaBlock");
    areaBlock.innerHTML = "";

    const areaInfo = document.createElement("p");
    areaInfo.innerHTML = `Field Size<br> `;
    areaInfo.appendChild(wrapDigits(((closestField.fop_area_sqft + closestField.foul_area_sqft) / 43560).toFixed(2)));
    areaInfo.innerHTML += ` Acres  `;
    // areaInfo.innerHTML += `Rank: ${closestField.field_area_rank}<br>`; // Rank of field area
    areaInfo.appendChild(wrapDigits((closestField.fop_area_sqft / closestField.foul_area_sqft).toFixed(2)));
    areaInfo.innerHTML += `<b> X </b> Fair Ground<br>`;
    // areaInfo.innerHTML += `Rank: ${closestField.ratio_rank}<br>`; // Rank of fair:foul ratio
    areaBlock.appendChild(areaInfo);


function createGradientBar(closestField) {
    // Check for existing gradient bar and remove it if it exists
    const oldGradientBar = document.getElementById('gradientBar');
    if (oldGradientBar) {
        oldGradientBar.remove();
    }
    // Create a new canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'gradientBar';  // Assign an id to the gradient bar
    canvas.width = 200;
    canvas.height = 30;  // Increased height to accommodate labels
    const ctx = canvas.getContext('2d');

    // Create a linear gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    // Create gradient in steps instead of a smooth transition
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'green');

    // Draw thicker white outline
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Fill the canvas with the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(1, 1, canvas.width - 2, canvas.height - 2);  // -2 to accommodate the outline

    // Draw the tick mark
    const normalizedScore = ((closestField.score + 15) / 23) * canvas.width;
    ctx.fillStyle = 'black';
    ctx.fillRect(normalizedScore, 0, 2, canvas.height);

    // Add labels
    ctx.font = '14px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Favors Pitcher', 2, 12);  // Adjust these numbers as needed
    ctx.textAlign = 'end';  // Align text to the right for the second label
    ctx.fillText('Favors Hitter', canvas.width - 2, 12);  // Adjust these numbers as needed

    return canvas;
    }


        // Create the gradient bar
    let gradientBar = createGradientBar(closestField);

    // Append the gradient bar to a container in your HTML
    document.getElementById('fieldInfo').appendChild(gradientBar);


    // Append the flexContainer to the parent element of fenceBlock and areaBlock
    // document.getElementById('fieldInfo').appendChild(flexContainer);

    // Continue with the rest of the code
    const distanceContainer = distanceDisplay(distanceFeet, fenceDist, levelCounts);
    const distanceBlock = document.getElementById("distanceBlock");
    distanceBlock.innerHTML = ""; // Clear the previous distanceContainer if any
    distanceBlock.appendChild(distanceContainer);




    return;

}

/// NEED TO REVAMP WITH CONF TOURNY INFO
// function gameInfo(closestField) {
//     console.log("Creating game info...");
  
//     const hostInfo = document.getElementById("hostInfo");
//     hostInfo.innerHTML = "Hosting:";
//     const divisionInfo = document.createElement("p");
    
//     if (closestField.district !== null) {
//       divisionInfo.innerHTML = `Division ${closestField.division} District ${closestField.district}<br>`;
      
//     } 
    
//     if (closestField.region_semi_number !== null) {
//       divisionInfo.innerHTML += `Division ${closestField.regional_div} Regional Semi ${closestField.region_semi_number}`;
//     }
    
//     if (closestField.region_final_quarter !== null) {
//       divisionInfo.innerHTML += `Division ${closestField.regional_div}<br>Regional Final and Quarter Final ${closestField.region_final_quarter}`;
//     }
    
//     if (closestField.finals !== null) {
//       divisionInfo.innerHTML += `Host of State Semi-Finals and Finals for All Divisions`;
//     }
  
//     hostInfo.appendChild(divisionInfo);
//   }


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

