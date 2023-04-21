// Load JSON data from a URL
async function loadData(url) {
    const response = await fetch(url);
    return await response.json();
}

// Initialize the Google Map
function initMap(fields) {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 44.6344082, lng: -86.2258505 },
        zoom: 16,
        mapTypeId: "hybrid",
        mapTypeControl: true
    });

    // Add baseball fields to the map
    fields.forEach(field => {
        addFieldToMap(field, map);
    });

    // Add click event listener to the map
    map.addListener("click", (event) => {
        handleMapClick(event, fields);
    });
}

// Add a baseball field to the map
function addFieldToMap(field, map) {
    // Draw fair and foul territories
    drawPolygon(field.fop, "#00FF00", map);
    drawPolygon(field.foul, "#FF0000", map);

    // Add marker for home plate
    const marker = new google.maps.Marker({
        position: { lat: field.home_plate[1], lng: field.home_plate[0] },
        map,
        title: field.field
    });
}

// Draw a polygon on the map
function drawPolygon(coordinates, color, map) {
    const polygon = new google.maps.Polygon({
        paths: coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
        fillColor: color,
        fillOpacity: 0.3,
        strokeColor: color,
        strokeWeight: 2,
        map
    });
}

// Handle click event on the map
function handleMapClick(event, fields) {
    const clickLatLng = event.latLng.toJSON();

    // Find the closest home plate
    const closestField = findClosestField(fields, clickLatLng);

    // Draw a line from the closest home plate to the clicked point
    drawLine(closestField, clickLatLng, event.map);

    // Calculate distance between home plate and clicked point
    const distance = calculateDistance(closestField.home_plate, [clickLatLng.lng, clickLatLng.lat]);
    displayDistance(distance);

    // Display field information
    displayFieldInfo(closestField);
}

// Draw a line from the closest home plate to the clicked point
function drawLine(closestField, clickLatLng, map) {
    const line = new google.maps.Polyline({
        path: [
            { lat: closestField.home_plate[1], lng: closestField.home_plate[0] },
            clickLatLng
        ],
        strokeColor: "#0000FF",
        strokeWeight: 2,
        map: map
    });
}

// Find the closest field to a clicked point
function findClosestField(fields, clickLatLng) {
    let closestField;
    let minDistance = Infinity;

    fields.forEach(field => {
        const distance = calculateDistance(field.home_plate, [clickLatLng.lng, clickLatLng.lat]);
        if (distance < minDistance) {
            minDistance = distance;
            closestField = field;
        }
    });

    return closestField;
}

// Display the distance between the clicked point and the closest home plate
function displayDistance(distance) {
    const distanceElement = document.getElementById("distance");
    distanceElement.textContent = `Distance: ${distance.toFixed(2)} feet`;
}

// Display information about the field
function displayFieldInfo(field) {
    const fieldInfoElement = document.getElementById("field-info");
    fieldInfoElement.textContent = `Field: ${field.field}, Level: ${field.level}`;
}