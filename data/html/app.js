//set up variables

const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_updated_output.json";
let fetchedData;
let polygons = [];
let currentLine = null;
let currentMarker = null;
let fenceMarkers = [];
let fenceDist = null;

const epsilon = 1e-9; // set epsilon to 1e-9 for use in the fenceDistance and intersectionPoint functions

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
  
    console.log("Initializing map...");
  
    // Set the display and other options for the map
    const mapOptions = {
      zoom: 10, // deafualt zoom level
      center: new google.maps.LatLng(43.6200, -84.8000), // default center location
      mapTypeId: 'hybrid', // default map type

    // // map controls
    // disableDefaultUI: true, // disable all map controls
    // zoomControl: true, // enable zoom control
    // mapTypeControl: false, // enable map type control
    // scaleControl: true, // enable scale control
    // streetViewControl: true, // enable street view control
    // rotateControl: true, // enable rotate control
    // fullscreenControl: true, // enable fullscreen control

    };
  
    // Create the map object by calling the Google Maps API and passing in the map div and map options
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    // Create level count holder and call function (must be below the fetchData function I think)
    const levelCounts = countFieldsByLevel(fetchedData);
    


    // call renderPolygons function and pass in full data and map
    renderPolygons(data, map); 
    // Create a listener on the map to detect a click and run the handleMapClick function
    map.addListener("click", async (event) => {
      await MapClickHandler(event, data, map, polygons, levelCounts);

    });
        // Initialize the search box
        initSearchBox(map);
  }
  
    // Wait for the DOM to load before running the initMap function
  // DOM is the html document
  document.addEventListener("DOMContentLoaded", initMap);

/////////////////////////////// TEST CODE ////////////////////////////


        /// NEW FUNCTION TO COUNT THE AMOUNT OF FIELDS IN EACH LEVEL
        function countFieldsByLevel(fetchedData) {
          const levelCounts = {};
        
          fetchedData.forEach(field => {
            const level = field.level;
            if (levelCounts.hasOwnProperty(level)) {
              levelCounts[level]++;
            } else {
              levelCounts[level] = 1;
            }
          });
        
          return levelCounts;
        }

  ////////////////////////////////////////////////////////
  ///////////////////END TEST CODE //////////////////////
  



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
        clickMarker(event.latLng, map); // send click location and map to makeMarker function

 

        // // Call the function to check if the click location is inside the fence
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


  // /// Find the intersection points to measure the fence distance  
  // const epsilon = 1e-9;
  
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
    function renderPolygons(data, map, levelCounts) {
      console.log("calling rendering polygons...");
      polygons = [];
    
      data.forEach(field => {
        const fopCoords = field.fop;
        createPolygon(fopCoords, "#00FF00", map, field);
    
        const foulCoords = field.foul;
        createPolygon(foulCoords, "#FF0000", map, field);
    
        createMarker(field.home_plate, field.park_name, field.level, field.field_cardinal_direction, map);
      });
    
      polygons.forEach(polygon => {
        polygon.setOptions({ zIndex: 0 });
      });
    }
    
      //  Create the polygons on the map
      // input data - coordinates, color, and map from renderPolygons()
// Create the polygons on the map
function createPolygon(coordinates, fillColor, map, levelCounts) {
  const polygon = new google.maps.Polygon({
    paths: coordinates.map(coord => {
      return { lat: coord[1], lng: coord[0] };
    }),
    fillColor: fillColor,
    strokeColor: fillColor,
    strokeWeight: 1,
    fillOpacity: 0.35,
    map: map
  });

  polygon.addListener("click", (event) => {
    console.log("Polygon click:", event.latLng);
  
    const closestField = closestFieldFunction(event.latLng, fetchedData);
    const distanceFeet = drawLine(closestField, event.latLng, map);
  
    const fenceDist = checkFence(closestField, event.latLng, map, polygons);
  
    fieldInfo(closestField, distanceFeet, fenceDist, map, levelCounts);
  
    clickMarker(event.latLng, map);
  
    return;
  });
  
}  
        


        // Create the markers on the map
                // Create the markers on the map
        // input data - home_plate_coords, park_name, level, cardinal_direction, map from renderPolygons()
        function createMarker(homePlate, park_name, level, field_cardinal_direction, map) {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(homePlate[1], homePlate[0]),
            map: map,
            title: park_name,
            level: level,
          });
        
          // create the info window
          // and set content
          const infowindow = new google.maps.InfoWindow({
            content: `<div class="custom-infoTitle">${park_name}</div> 
                        <div class="custom-infowindow">
                        
                        Field Class: ${level}<br>                         
                      </div>`,
          });


          // Define the look of the marker
          //goal: change the marker icon based on the level of the field
          // pathes to the icons
          const iconPath = {
              'Youth': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/icons/baseball/youth.png',
              'High School': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/high_school.png',
              'College': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/college.png',
              'Professional': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/pro.png',
              'Major League': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/mlb.png',
              'State / County / Municipal': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/muni.png',
              'International': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/muni.png',
              'Unknown': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/other.png',
          };

          // set the icon based on the level of the field and scale it
          marker.setIcon({
              url: iconPath[level],
              scaledSize: new google.maps.Size(30, 30),
          });


              
        
           // Control mouse behavior
          // Add a click event listener to the marker
          marker.addListener("click", () => {
            infowindow.open(map, marker);
          });

          // add event listenr for a mouseover on the marker
          marker.addListener("mouseover", () => {
              infowindow.open(map, marker); // open the info window
            });

          // add event listener for a mouseout on the marker
            marker.addListener("mouseout", () => {
              infowindow.close(); // close the info window
            });

          // Add a listener for double click on the marker
          // Goal: center map on marker and zoom
          marker.addListener("dblclick", () => {
              map.setCenter(marker.getPosition()); // center map on marker
              map.setZoom(19); // zoom in to 19
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
    
      // Title block
      const titleBlock = document.getElementById("titleBlock");
      titleBlock.innerHTML = "";
    
      const fieldName = document.createElement("h2");
      fieldName.innerHTML = `${closestField.park_name}`;
      titleBlock.appendChild(fieldName);
    
      const fieldLevel = document.createElement("p");
      fieldLevel.innerHTML = `Field Class: ${closestField.level}`;
      titleBlock.appendChild(fieldLevel);
    
      if (closestField.home_team != null) {
        const homeOf = document.createElement("p");
        homeOf.innerHTML = `Home of the ${closestField.home_team}`;
        titleBlock.appendChild(homeOf);
      }
    
      // Fence block
      const fenceBlock = document.getElementById("fenceBlock");
      fenceBlock.innerHTML = "";
    
      const fenceInfo = document.createElement("p");
      fenceInfo.innerHTML = `Fence Distance | Rank<br>`;
      fenceInfo.appendChild(wrapDigits(closestField.min_distance));
      fenceInfo.innerHTML += ` MIN | ${closestField.min_distance_rank} of ${levelCounts[closestField.level]}<br>`;
      fenceInfo.appendChild(wrapDigits(closestField.max_distance));
      fenceInfo.innerHTML += ` MAX | ${closestField.max_distance_rank} of ${levelCounts[closestField.level]}<br>`;
      fenceInfo.appendChild(wrapDigits((closestField.avg_distance).toFixed(0)));
      fenceInfo.innerHTML += ` AVG | ${closestField.avg_distance_rank} of ${levelCounts[closestField.level]}<br>`;
      fenceBlock.appendChild(fenceInfo);
    
      // Area block
      const areaBlock = document.getElementById("areaBlock");
      areaBlock.innerHTML = "";
    
      const areaInfo = document.createElement("p");
      
      areaInfo.innerHTML += ` Field Area<br> `;
      areaInfo.appendChild(wrapDigits(((closestField.fop_area_sqft + closestField.foul_area_sqft) / 43560).toFixed(2)));
      areaInfo.innerHTML += ` acres<br>`;
      
      areaInfo.innerHTML += `${closestField.field_area_rank} of ${levelCounts[closestField.level]} in class<br><br>`;


      // areaInfo.appendChild(wrapDigits((closestField.foul_area_sqft / 43560).toFixed(2)));
      // areaInfo.innerHTML += ` Foul Ground<br>`;
      areaInfo.innerHTML += `Fair : Foul Ratio<br>`;
      areaInfo.appendChild(wrapDigits((closestField.fop_area_sqft / closestField.foul_area_sqft).toFixed(2)));
      areaInfo.innerHTML += `<number> : 1 </number><br>`;
      
      areaInfo.innerHTML += `${closestField.ratio_rank} of ${levelCounts[closestField.level]} in class<br>`;
      areaBlock.appendChild(areaInfo);
      
    
      const distanceContainer = distanceDisplay(distanceFeet, fenceDist);
    
      const infoContainer = document.getElementById("infoContainer");
      infoContainer.innerHTML = ""; // Clear the previous fieldInfo if any
      infoContainer.appendChild(distanceContainer);
    
      return;
    }
    

function distanceDisplay(distanceFeet, fenceDist) {
    console.log("Creating distance display...");
    // check the values of the distanceFeet and fenceDist variables
    console.log("Distance feet:", distanceFeet, "Fence distance:", fenceDist);
    
    // create the distanceContainer element
    const distanceContainer = document.createElement("div");
    // set the id of the distanceContainer element
    distanceContainer.id = "distanceContainer";

    // set the text of the distanceContainer element
    // if fenceDist is null display '---' for the fence distance
    if (fenceDist === null) {
      distanceContainer.innerHTML = `Click on the field to measure distance<br>`;
      distanceContainer.appendChild(wrapDigits(distanceFeet.toFixed(0)));
      distanceContainer.innerHTML += ` FT to Marker<number> | ---</number> FT to Fence`;
      
    } else {
        // if fenceDist is not null, display the fence distance value
        distanceContainer.innerHTML = `Click on the field to measure distance<br>`;        
        distanceContainer.appendChild(wrapDigits(distanceFeet.toFixed(0)));
        distanceContainer.innerHTML += ` FT to Marker <number>| </number>`;
        distanceContainer.appendChild(wrapDigits(fenceDist.toFixed(0)));
        distanceContainer.innerHTML += ` FT to Fence`;

    }

    // close the function
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
  