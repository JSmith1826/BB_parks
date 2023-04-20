let map;
let polyline;
let distanceDisplay;

function initMap() {
    console.log("Initializing map...");
    console.log("initMap function executed");
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 41.9898236, lng: -84.3395166 },
        zoom: 10,
        mapTypeId: 'satellite'
    });

    distanceDisplay = document.getElementById('distance-display');

    loadJSONData();

    map.addListener('click', async (event) => {
        const url = 'https://path.to/your/new_json_file.json';
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        baseballFieldData.forEach(field => {
            createHomePlateMarker(field);
        });

        const clickedPoint = event.latLng;
        const closest = findClosestHomePlate(clickedPoint, baseballFieldData);
        measureDistance(closest.field, clickedPoint, closest.polygon);
    });
}


async function loadJSONData() {
    const url = 'https://path.to/your/new_json_file.json';

    try {
        const response = await fetch(url);
        const baseballFieldData = await response.json();

        baseballFieldData.forEach(field => {
            createPolygon(field);
            createHomePlateMarker(field);
        });
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

function createPolygon(field) {
    console.log("Creating polygon for: ", field.field);
    const coordinates = field.fop.map(coord => {
        return new google.maps.LatLng(coord[1], coord[0]);
    });

    const fillColor = '#90EE90';

    const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: fillColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: 0.35
    });

    polygon.setMap(map);

    field.name = field.field;

    field.polygonObj = polygon;

    polygon.addListener('click', (event) => {
        measureDistance(field, event.latLng, polygon);
    });
}

function measureDistance(field, clickedPoint, polygon) {
    const homePlate = field.home_plate;

    console.log("Field name: ", field.field);
    console.log("Home plate coordinates: ", homePlate);
    console.log("Clicked point coordinates: ", clickedPoint.toJSON());

    let isInsidePolygon = false;
    let closestPoint = clickedPoint;

    if (polygon) {
        isInsidePolygon = google.maps.geometry.poly.containsLocation(clickedPoint, polygon);
        if (!isInsidePolygon) {
            const tolerance = 0.0001;
            let intersectionPoint;

            for (let t = 0; t <= 1; t += 0.001) {
                const interpolatedPoint = google.maps.geometry.spherical.interpolate(
                    new google.maps.LatLng(homePlate[1], homePlate[0]),
                    clickedPoint,
                    t
                );

                if (isLocationOnEdge(interpolatedPoint, polygon, tolerance)) {
                    intersectionPoint = interpolatedPoint;
                    break;
                }
            }

            closestPoint = intersectionPoint || google.maps.geometry.poly.closestLocation(clickedPoint, polygon).point;
        }
    } else {
        isInsidePolygon = false;
    }
    
    if (polygon && !isInsidePolygon) {
        console.log("Intersection point coordinates: ", closestPoint.toJSON());
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

    const fence_length = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        closestPoint
    );

    const click_length = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(homePlate[1], homePlate[0]),
        clickedPoint
    );

    const fence_lengthInFeet = fence_length * 3.28084;
    const click_lengthInFeet = click_length * 3.28084;

    updateDistanceDisplay(fence_lengthInFeet, click_lengthInFeet);
    updateFieldNameDisplay(field.field);
}

function updateFieldNameDisplay(fieldName) {
    console.log('fieldName:', fieldName);
    const fieldNameDisplay = document.getElementById('field-name-display');
    fieldNameDisplay.textContent = `Field name: ${fieldName}`;
}

function createHomePlateMarker(field) {
    const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);

    const marker = new google.maps.Marker({
        position: homePlateLatLng,
        map: map,
        title: 'Home Plate',
    });
}

function updateDistanceDisplay(fence_lengthInFeet, click_lengthInFeet) {
    document.getElementById('fence-distance-display').textContent = `Fence distance: ${Math.round(fence_lengthInFeet)} feet`;

    document.getElementById('click-distance-display').textContent = `Click distance: ${Math.round(click_lengthInFeet)} feet`;
}

function findClosestHomePlate(clickedPoint, baseballFieldData) {
    let closestField;
    let minDistance = Infinity;
    let closestPolygon;

    baseballFieldData.forEach(field => {
        const homePlateLatLng = new google.maps.LatLng(field.home_plate[1], field.home_plate[0]);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(clickedPoint, homePlateLatLng);

        if (distance < minDistance) {
            minDistance = distance;
            closestField = field;

            if (field.polygon) {
                closestPolygon = new google.maps.Polygon({
                    paths: field.polygon.map(coord => new google.maps.LatLng(coord[1], coord[0])),
                    clickable: false
                });
            } else {
                closestPolygon = null;
            }
        }
    });

    return { field: closestField, polygon: closestPolygon };
}