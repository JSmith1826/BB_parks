//set up variables

const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_updated_output.json";
let fetchedData;
let polygons = [];
let currentLine = null;

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
  
    const mapOptions = {
      zoom: 19,
      center: new google.maps.LatLng(42.73048536830354, -84.50655614253925),
      mapTypeId: 'hybrid',
    };
  
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  
    renderPolygons(data, map);
    addMapClickHandler(map, fetchedData, polygons);
  }

  // Wait for the DOM to load before running the initMap function
  // DOM is the html document
  document.addEventListener("DOMContentLoaded", initMap);


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
                'youth': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/youth.png',
                'high_school': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/high_school.png',
                'college': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/college.png',
                'pro': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/pro.png',
                'mlb': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/mlb.png',
                'muni': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/muni.png',
                'other': 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/images/park1.png',
            };

            // set the icon based on the level of the field
            marker.setIcon(iconPath[level]);
            

                
          
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