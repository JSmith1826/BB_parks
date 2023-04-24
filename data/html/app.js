const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_output_data.json";
let fetchedData;
let polygons = [];
let currentLine = null;


async function fetchData() {
  console.log("Fetching data...");
  const response = await fetch(jsonUrl);
  const data = await response.json();
  return data;
}

function init(data) {
  console.log("Initializing map...");
  const mapOptions = {
    zoom: 19,
    center: new google.maps.LatLng(42.73048536830354, -84.50655614253925),
    mapTypeId: 'hybrid',
  };
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  renderPolygons(data, map);
  addMapClickHandler(map);
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchData();
    fetchedData = data; // Set the fetchedData global variable
    init(data);
  });
  
  
  function addMapClickHandler(map) {
    map.addListener("click", async (event) => {
      await handleMapClick(event, map);
    });
  }
  


  function renderPolygons(data, map) {
    console.log("Rendering polygons...");
    polygons = []; // Empty the polygons array before rendering new polygons
    data.forEach(field => {
        console.log("Rendering field:", field);

        const fopCoords = field.fop;
        console.log("Coordinates before creating FOP polygon:", fopCoords);
        createPolygon(fopCoords, "#00FF00", map);

        const foulCoords = field.foul;
        console.log("Coordinates before creating FOUL polygon:", foulCoords);
        createPolygon(foulCoords, "#FF0000", map);

        createMarker(field.home_plate, field.field, map);
    });
}


  
function createPolygon(coordinates, fillColor, map) {
  const polygon = new google.maps.Polygon({
      paths: coordinates.map(coord => {
          return { lat: coord[1], lng: coord[0] }; // Reverse the coordinates
      }),
      fillColor: fillColor,
      strokeColor: fillColor,
      strokeWeight: 1,
      fillOpacity: 0.35,
      map: map
  });

  
    polygons.push(polygon);
  
    // Add a click event listener to the polygon
    polygon.addListener("click", event => {
      handleMapClick(event, map);
    });

    console.log("Created polygon:", polygon);
  
    return polygon; // Add this line to return the created polygon
  }
  

function createMarker(homePlate, fieldName, map) {
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(homePlate[0], homePlate[1]),
        title: fieldName,
        map: map
    });
}

function createMarker(homePlate, fieldName, map) {
  const marker = new google.maps.Marker({
      position: new google.maps.LatLng(homePlate[1], homePlate[0]), // Reverse the coordinates
      title: fieldName,
      map: map
  });
}


async function handleMapClick(event, map) {
  console.log("Handling map click...");
  console.log("Click event:", event);

  const data = fetchedData; // Use the fetchedData global variable
  const closestField = findClosestField(event.latLng, data);
  console.log("Closest field:", closestField);

  if (closestField) {
    const insideField = polygons.some(polygon => google.maps.geometry.poly.containsLocation(event.latLng, polygon));
    console.log("Inside field?", insideField);

    if (insideField) {
      console.log("Clicked inside a field");
      drawLineAndDisplayDistance(event.latLng, closestField.home_plate, map, closestField.field);
    } else {
      console.log("Clicked outside of any fields");
      const fieldPolygon = createPolygon(closestField.fop, "#00FF00", null); // Pass null for the map to avoid adding the polygon to the map
      const fenceDistance = calculateFenceDistance(event.latLng, closestField.home_plate, fieldPolygon);
      // Draw the line even when the click is outside of any fields
      drawLineAndDisplayDistance(event.latLng, closestField.home_plate, map, closestField.field, fenceDistance);
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


function drawLineAndDisplayDistance(start, end, map, fieldName, fenceDistance = null) {
  console.log("Drawing line and displaying distance...");
  const lineCoordinates = [
    new google.maps.LatLng(start.lat(), start.lng()),
    new google.maps.LatLng(end[1], end[0]) // Reverse the coordinates
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
  displayDistance(distance, fieldName);
  if (fenceDistance !== null) {
    displayFenceDistance(fenceDistance);
  }
}

///////////// START DISTANCE DISPLAYS //////////////


function displayFenceDistance(fenceDistance) {
  console.log("Fence distance:", fenceDistance);

  const fenceDistanceElement = document.getElementById("fence-distance");
  fenceDistanceElement.innerText = `Fence distance: ${fenceDistance.toFixed(0)} feet`;
}

function displayDistance(distance, fieldName) {
  console.log("Displaying distance...");
  const distanceInFeet = distance * 3.28084;

  const fieldNameElement = document.getElementById("field-name");
  const totalDistanceElement = document.getElementById("total-distance");

  fieldNameElement.innerText = `Field name: ${fieldName}`;
  totalDistanceElement.innerText = `Total distance: ${distanceInFeet.toFixed(0)} feet`;
}





///////////// END DISTANCE DISPLAYS //////////////

async function main() {
    const data = await fetchData(jsonUrl);
    initMap(data);
    const map = new google.maps.Map(document.getElementById("map"));
    addMapClickHandler(map);
}



//////// NEW FUNCTIONS FOR FENCE DISTANCE ////////

function calculateFenceDistance(clickLatLng, homePlateLatLng, fieldPolygon) {
  console.log("calculateFenceDistance:", clickLatLng, homePlateLatLng, fieldPolygon);
  const clickPoint = new google.maps.LatLng(clickLatLng.lat(), clickLatLng.lng());
  const homePlatePoint = new google.maps.LatLng(homePlateLatLng[1], homePlateLatLng[0]); // Reverse the coordinates


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



////// END NEW FUNCTIONS /////////////

