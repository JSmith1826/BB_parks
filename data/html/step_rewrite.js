//set up variables

const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_updated_output.json";
let fetchedData;
let polygons = [];
let currentLine = null;
let currentMarker = null;
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
  
    console.log("Initializing map...");
  
    // Set the display and other options for the map
    const mapOptions = {
      zoom: 19, // deafualt zoom level
      center: new google.maps.LatLng(42.73048536830354, -84.50655614253925), // default center location
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

    // call renderPolygons function and pass in full data and map
    renderPolygons(data, map); 
    // Create a listener on the map to detect a click and run the handleMapClick function
    map.addListener("click", async (event) => {
        await MapClickHandler(event, data, map, polygons);
    });
  }
  
    // Wait for the DOM to load before running the initMap function
  // DOM is the html document
  document.addEventListener("DOMContentLoaded", initMap);



  // Create the map click handler - The big boy of functions
    // input data - full 'data' object from json file, 'map' object from fetchData() and initMap(), 
    // closestField from closestFieldFunction, and 'polygons' array from renderPolygons()  

    // output - a marker on the map at the location of the click, with a line drawn from the home plate of the closest field
    // a html element containing field info and the dynamic distance element with the
    // distance from home plate to the click location and the fence distance from home plate if the click is outside the fence

    // This function is called in the initMap() function
    async function MapClickHandler(event, data, map, polygons) {
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

        // Call the function to measure the totalDistance from home plate to the click location
        // totalDistance(closestField, event.latLng, map); // send closestField, click location, and map to totalDistance function
        // Call the function to make a marker at the click location
        clickMarker(event.latLng, map); // send click location and map to makeMarker function
        // // Call the function to check if the click location is inside the fence
        // checkFence(closestField, event.latLng, map, polygons); // send closestField, click location, map, and polygons array to checkFence function
        // Call the function to make the html element with the field info and distance
        fieldInfo(closestField, distanceFeet, fenceDist, map); // send closestField, distanceFeet, fenceDist, and map to fieldInfo function



        // print the lat and lng of the click location to the console
        console.log("Click location:", event.latLng.lat(), event.latLng.lng()); // log the click location to the console


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

        /// Create the clickMarker function and specify the marker options
        // input data - click location and map from MapClickHandler
        // output - a marker on the map at the location of the click
        function clickMarker(clickLocation, map) {
            console.log("Making marker...");
            // log distance of line
         

            
            // create the marker
            const marker = new google.maps.Marker({
                position: clickLocation, // set the position to the click location
                map: map, // set the map
            });
            // clear the marker once an new one is created
            if (currentMarker) {
                currentMarker.setMap(null);
            }

            // set the currentMarker to the marker we just created
            currentMarker = marker;
            // close the function

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
        fenceDist = findFenceDistance(clickLocation, homePlatePoint, polygonCoords);
        if (fenceDist !== null) { // IF THE FENCE DISTANCE IS NOT NULL
          console.log("Fence distance:", fenceDist.toFixed(0) + " ft"); // PRINT THE FENCE DISTANCE TO THE CONSOLE
          
        }
      }
    }
    return fenceDist;
  }
  
  
  
/// Create function to find 2 intersection points where the line drawn passes through the fence
// measure the distance between the 2 intersection points and return in feet as fenceDistance
  function findFenceDistance(p1, p2, polygonCoords) {
    const intersectionPoints = [];
  
    for (let i = 0; i < polygonCoords.length; i++) {
      const p3 = polygonCoords[i];
      const p4 = polygonCoords[(i + 1) % polygonCoords.length];
  
      const intersectionPoint = findLineIntersection(p1, p2, p3, p4);

        if (intersectionPoint) {
            intersectionPoints.push(intersectionPoint);
        }

        if (intersectionPoints.length === 2) {
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
    function renderPolygons(data, map) {
        console.log("calling rendering polygons...");
        polygons = [];
      
        data.forEach(field => { // for each field in the data object
          const fopCoords = field.fop; // create variable fopCoords and set it the fop coordinates data
          createPolygon(fopCoords, "#00FF00", map); // send fopCoords, color, and map to createPolygon function
      
          const foulCoords = field.foul; // create variable foulCoords and set it the foul coordinates data
          createPolygon(foulCoords, "#FF0000", map); // send foulCoords, color, and map to createPolygon function
      
          //send to the createMarker function
          // home_plate_coords, park_name, level, cardinal direction map
          createMarker(field.home_plate, field.park_name, field.level, field.field_cardinal_direction, map); 
        });

        // set the polygons to be on the bottom layer of the map
        polygons.forEach(polygon => {
            polygon.setOptions({ zIndex: 0 });
        });
      }
    
      //  Create the polygons on the map
      // input data - coordinates, color, and map from renderPolygons()
      function createPolygon(coordinates, fillColor, map) {
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
            console.log("Polygon click:", event.latLng); // log the event to the console
            // pass the click location to the drawLine function
            drawLine(closestFieldFunction(event.latLng, fetchedData), event.latLng, map); // send closestField, click location, and map to drawLine function
            
            // pass the closestField to the fieldInfo function
            fieldInfo(closestFieldFunction(event.latLng, fetchedData), map); // send closestField and map to fieldInfo function

            // pass the click location to the clickMarker function
            clickMarker(event.latLng, map); // send click location and map to makeMarker function

            return;
        });
      
        polygons.push(polygon); // add polygon we created to polygons array (created on top in global variables)
      
        return polygon; // return the polygon we created
        // will be used in the addMapClickHandler function to check the click location against
      }

        // Create the markers on the map
        // input data - home_plate_coords, park_name, level, cardinal_direction, map from renderPolygons()
        function createMarker(homePlate, park_name, level, field_cardinal_direction, map) {
            const marker = new google.maps.Marker({
              position: new google.maps.LatLng(homePlate[1], homePlate[0]),
              map: map,
              title: park_name,
            });
          
            // create the info window
            const infowindow = new google.maps.InfoWindow({
              content: `<h4>${park_name} - ${level}<h4><p>${field_cardinal_direction}</p>`,
            });

            // Define the look of the marker
            //goal: change the marker icon based on the level of the field
            // pathes to the icons
            const iconPath = {
                'youth': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/icons/baseball/youth.png',
                'high_school': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/high_school.png',
                'college': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/college.png',
                'pro': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/pro.png',
                'mlb': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/mlb.png',
                'muni': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/muni.png',
                'international': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images//icons/baseball/park1.png',
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


    // Create the function to make the html element with the field info and distance display
    // input data - closestField from closestFieldFunction, totalDistance, fenceDistance, map from MapClickHandler
    // output - a html element containing field info and the dynamic distance element with the
    // distance from home plate to the click location and the fence distance from home plate if the click is outside the fence
    // This function is called in the MapClickHandler function
    function fieldInfo(closestField, distanceFeet, fenceDist, map) {
        console.log("Creating field info...");
        // create the html element
        const fieldInfo = document.createElement("div");
        // set the id of the html element
        fieldInfo.id = "fieldInfo";

        // Field name and level as a header
        const fieldName = document.createElement("h2");
        fieldName.innerHTML = `${closestField.park_name} - ${closestField.level}`;
        
        fieldInfo.appendChild(fieldName);

        // Cardinal direction of the field
        const fieldCardinalDirection = document.createElement("p");
        fieldCardinalDirection.innerHTML = `${closestField.field_cardinal_direction}`;

        fieldInfo.appendChild(fieldCardinalDirection);

        // Fence Information
        const fenceInfo = document.createElement("p");
        fenceInfo.textContent = `Fence Distance: MIN ${closestField.min_distance} | MAX ${closestField.max_distance} | AVG ${closestField.avg_distance.toFixed(0)}`;
        fieldInfo.append(fenceInfo);

        // Area information
        const areaInfo = document.createElement("p");
        areaInfo.textContent = `Field Size (Fair): ${(closestField.fop_area_sqft / 43560).toFixed(2) } acres | Fair / Foul Ratio ${(closestField.fop_area_sqft/closestField.foul_area_sqft).toFixed(2)} / 1`;
        fieldInfo.append(areaInfo);

      // Call the distanceDisplay function and append the returned element to the fieldInfo element
    const distanceContainer = distanceDisplay(distanceFeet, fenceDist);
    fieldInfo.append(distanceContainer);

    // Append the fieldInfo element to the infoContainer element
    const infoContainer = document.getElementById("infoContainer");
    infoContainer.innerHTML = ""; // Clear the previous fieldInfo if any
    infoContainer.appendChild(fieldInfo);

    // close the function
    return;
}

/// Create a function that dynamically displays the distance from home plate to the click location 
/// and the fence distance from home plate if the click is outside the fence
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
        distanceContainer.textContent = `Distance: ${distanceFeet} ft | Fence Distance: --- ft`;}

    // close the function
    return distanceContainer;
}

    



        