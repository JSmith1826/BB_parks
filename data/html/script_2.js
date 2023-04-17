let map;
let polyline;
let distanceDisplay;
let distanceToFenceDisplay;

// Initiate Map
//function initMap() {
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 41.9898236, lng: -84.3395166 },
            zoom: 16,
            mapTypeId: 'satellite'
        });
    
        distanceDisplay = document.getElementById('distance-display');
        distanceToFenceDisplay = document.getElementById('distance-to-fence-display');
    
        loadJSONData();
    
        google.maps.event.addListener(map, 'click', function(event) {
            const clickedPoint = event
    
/// Load Data Layer 
async function loadJSONData() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';

    try {
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        baseballFieldData.forEach(field => {
            createPolygon(field);
        });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

/// Create all the overlay polygons and apply style
function createPolygon(field) {
    const coordinates = field.polygon.map(coord => {
        return { lat: coord[1], lng: coord[0] };
    });

    const fillColor = field.fair_foul === 'fair' ? '#90EE90' : '#FFB6C1';

    const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: fillColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: 0.35
    });

    polygon.setMap(map);
    createLabel(field, polygon);

    polygon.addListener('click', (event) => {
        measureDistance(field.home_plate, event.latLng, polygon);
    });
}

/// Create the label for each polygon
// very ugly, going to want to update of eliminate
function createLabel(field, polygon) {
    const label = new google.maps.Marker({
        position: polygon.getPath().getAt(0),
        label: {
            text: `${field.field_name} (${field.fair_foul})`,
            fontSize: '12px',
            fontWeight: 'bold'
        },
        map: map
    });

    map.addListener('zoom_changed', () => {
        const zoom = map.getZoom();
        label.setVisible(zoom >= 18);
    });
}


////function measureDistance////
function measureDistance(homePlate, clickedPoint, polygon) {
    let isInsidePolygon = false;
    let closestPoint = clickedPoint;

    if (polygon) {
        isInsidePolygon = google.maps.geometry.poly.containsLocation(clickedPoint, polygon);
        if (!isInsidePolygon) {
            closestPoint = google.maps.geometry.poly.closestLocation(clickedPoint, polygon).point;
        }
    }

    if (polyline) {
        polyline.setMap(null);
    }

    polyline = new google.maps.Polyline({
        path: [new google.maps.LatLng(homePlate[1], homePlate[0]), closestPoint],
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    polyline.setMap(map);

    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        closestPoint
    );

    const distanceInFeet = distanceInMeters * 3.28084;
    updateDistanceDisplay(distanceInFeet);
}

