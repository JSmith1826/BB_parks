let map;
let polyline;
let distanceDisplay;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 41.9898236, lng: -84.3395166 },
        zoom: 10,
        mapTypeId: 'satellite'
    });

    distanceDisplay = document.getElementById('distance-display');

    loadJSONData();

    map.addListener('click', async (event) => {
        const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        const clickedPoint = event.latLng;
        const closestHomePlate = findClosestHomePlate(clickedPoint, baseballFieldData);
        measureDistance(closestHomePlate, clickedPoint);
    });
}

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

function createPolygon(field) {
    const coordinates = field.polygon.map(coord => {
        return new google.maps.LatLng(coord[1], coord[0]);
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

    polygon.addListener('click', (event) => {
        measureDistance(field.home_plate, event.latLng, polygon);
    });
}

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

function updateDistanceDisplay(distanceInFeet) {
    distanceDisplay.textContent = `Distance from home plate: ${Math.round(distanceInFeet)} feet`;
}

function findClosestHomePlate(clickedPoint, baseballFieldData) {
    let closestHomePlate;
    let minDistance = Infinity;

    baseballFieldData.forEach(field => {
        const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(clickedPoint, homePlateLatLng);

        if (distance < minDistance) {
            minDistance = distance;
            closestHomePlate = field.home_plate;
        }
    });

    return closestHomePlate;
}