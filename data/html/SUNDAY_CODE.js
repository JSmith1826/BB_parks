const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/default_updated_output.json";
let fetchedData;
let polygons = [];
let currentLine = null;

async function fetchData() {
  console.log("Fetching data...");
  const response = await fetch(jsonUrl);
  const data = await response.json();
  return data;
}

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

document.addEventListener("DOMContentLoaded", initMap);

function renderPolygons(data, map) {
  console.log("Rendering polygons...");
  polygons = [];

  data.forEach(field => {
    const fopCoords = field.fop;
    createPolygon(fopCoords, "#00FF00", map);

    const foulCoords = field.foul;
    createPolygon(foulCoords, "#FF0000", map);

    createMarker(field.home_plate, field.park_name, field.level, map);
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

  return polygon;
}

function createMarker(homePlate, fieldName, fieldLevel, map) {
  const marker = new google.maps.Marker({
    position: new google.maps.LatLng(homePlate[1], homePlate[0]),
    map: map,
    title: fieldName,
  });

  return marker;
}
function handleMapClick(event, map, fetchedData, polygons) {
    console.log("Handling map click...");
    console.log("Click event:", event);
  
    const data = fetchedData;
    const closestField = findClosestField(event.latLng, data);
    console.log("Closest field:", closestField);
  
    if (closestField) {
      const insideField = polygons.some(polygon => google.maps.geometry.poly.containsLocation(event.latLng, polygon));
      console.log("Inside field?", insideField);
  
      if (insideField) {
        console.log("Clicked inside a field");
  
        drawLineAndDisplayDistance(event.latLng, closestField.home_plate, map, closestField);
        
      } else {
        console.log("Clicked outside of any fields");
        drawLineAndDisplayDistance(event.latLng, closestField.home_plate, map, closestField);
        calculateFenceDistance(event.latLng, closestField.home_plate, polygon);
      }
    } else {
      console.log("No closest field found");
    }
  }
    
  function addMapClickHandler(map, fetchedData, polygons) {
    map.addListener("click", async (event) => {
      const closestField = await handleMapClick(event, map, fetchedData, polygons);
      displayFieldInfo(closestField);
    });
  }



// Finds the closest field to the given LatLng
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

// Draws a line between start and end points on the map, and displays distance information
function drawLineAndDisplayDistance(start, end, map, closestField) {
  console.log("Drawing line and displaying distance...");
  const lineCoordinates = [
    new google.maps.LatLng(start.lat(), start.lng()),
    new google.maps.LatLng(end[1], end[0]) // Reverse the coordinates
  ];

  updateLine(lineCoordinates, map);
  displayDistanceInfo(start, lineCoordinates[1]);
  updateFieldContainer(closestField);
}

// Updates the line on the map with the given lineCoordinates
function updateLine(lineCoordinates, map) {
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
}

// Displays distance information for the given start and end points
function displayDistanceInfo(start, end) {
  const distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
  const distanceInFeet = distance * 3.28084;
  const totalDistanceElement = document.getElementById("total-distance");
  totalDistanceElement.innerText = `Total distance: ${distanceInFeet.toFixed(0)} feet`;
}

// Updates the field container with the given closestField object
function updateFieldContainer(closestField) {
  const fieldContainer = displayFieldInfo(closestField);
  const clickDistance = document.createElement("p");
  clickDistance.innerHTML = `Click Distance: <span class="num">${distance.toFixed(2)}</span> meters`;
  fieldContainer.append(clickDistance);

  // Replace the existing field-container with the new one
  const existingFieldContainer = document.querySelector('.field-container');
  if (existingFieldContainer) {
    existingFieldContainer.replaceWith(fieldContainer);
  } else {
    document.body.appendChild(fieldContainer);
  }
}

// Calculate the fence distance for the given clickLatLng, homePlateLatLng, and fieldPolygon
function calculateFenceDistance(clickLatLng, homePlateLatLng, fieldPolygon) {
  console.log("calculateFenceDistance:", clickLatLng, homePlateLatLng, fieldPolygon);
  const clickPoint = new google.maps.LatLng(clickLatLng.lat(), clickLatLng.lng());
  const homePlatePoint = new google.maps.LatLng(homePlateLatLng[1], homePlateLatLng[0]); // Reverse the coordinates
  const polygonCoords = fieldPolygon.getPath().getArray();
  const intersectionPoints = getIntersectionPoints(clickPoint, homePlatePoint, polygonCoords);
  const validIntersectionPoints = filterValidIntersectionPoints(homePlatePoint, intersectionPoints);

  if (validIntersectionPoints.length === 1) {
    const fenceDistance_meters = google.maps.geometry.spherical.computeDistanceBetween(homePlatePoint, validIntersectionPoints[0]);
    const fenceDistance = fenceDistance_meters * 3.28084;
    displayFenceDistance(fenceDistance);
  }
}

function getIntersectionPoints(clickPoint, homePlatePoint, polygonCoords) {
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

  return intersectionPoints;
}

function filterValidIntersectionPoints(homePlatePoint, intersectionPoints) {
  const epsilon = 1e-6;

  return intersectionPoints.filter(
    (point) =>
      google.maps.geometry.spherical.computeDistanceBetween(homePlatePoint, point) > epsilon
  );
}

function findLineIntersection(p1, p2, p3, p4) {
  const s1_x = p2.lng() - p1.lng();
  const s1_y = p2.lat() - p1.lat();
  const s2_x = p4.lng() - p3.lng();
  const s2_y = p4.lat() - p3.lat();

  const s = (-s1_y * (p1.lng() - p3.lng()) + s1_x * (p1.lat() - p3.lat())) / (-s2_x * s1_y + s1_x * s2_y);
  const t = (s2_x * (p1.lat() - p3.lat()) - s2_y * (p1.lng() - p3.lng())) / (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    // Collision detected
    const i_x = p1.lng() + (t * s1_x);
    const i_y = p1.lat() + (t * s1_y);
    return new google.maps.LatLng(i_y, i_x);
  }

  // No collision
  return null;
}

function displayFieldInfo(closestField) {
  // ... the same code as before
}

// This function displays the fence distance on the page
function displayFenceDistance(fenceDistance) {
  const fenceDistanceElement = document.getElementById("fence-distance");
  fenceDistanceElement.innerText = `Fence distance: ${fenceDistance.toFixed(0)} feet`;
}

