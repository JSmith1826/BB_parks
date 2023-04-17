let map;
let polyline;
let polygons = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 41.9898236, lng: -84.3395166 },
    zoom: 16,
    mapTypeId: 'satellite'
  });

  loadJSONData();

  document.getElementById('toggleMeasure').addEventListener('click', toggleMeasuring);
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
    return { lat: parseFloat(coord[1]), lng: parseFloat(coord[0]) };
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
    lastPolygon = polygon; // Add this line
    measureDistance(field.home_plate, event.latLng, polygon);
  });

  polygons.push(polygon);
}

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

function toggleMeasuring() {
  const button = document.getElementById('toggleMeasure');
  const measuring = button.innerText === 'Start Measuring';

  if (measuring) {
    button.innerText = 'Stop Measuring';

    map.addListener('mousemove', updateMeasurement);
  } else {
    button.innerText = 'Start Measuring';

    google.maps.event.clearListeners(map, 'mousemove');

    if (polyline) {
      polyline.setMap(null);
    }
  }
}

function updateMeasurement(event) {
    let closestPolygon = null;
    let homePlate = null;
    let minDistance = Infinity;
  
    polygons.forEach((polygon) => {
      const field = polygon.get('fieldData');
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(field.home_plate[1], field.home_plate[0]),
        event.latLng
      );
  
      if (distance < minDistance && google.maps.geometry.poly.containsLocation(event.latLng, polygon)) {
        minDistance = distance;
        closestPolygon = polygon;
        homePlate = field.home_plate;
      }
    });
  
    // Add this block
    if (!closestPolygon && lastPolygon) {
      closestPolygon = lastPolygon;
      homePlate = closestPolygon.get('fieldData').home_plate;
    }
  
    measureDistance(homePlate, event.latLng, closestPolygon);
  }

  function updateDistanceLabels(distanceToClick, distanceToEdge, insidePolygon) {
    document.getElementById("distanceToClick").innerText =
      `Distance from home plate to clicked point: ${distanceToClick.toFixed(1)} feet`;
  
    if (insidePolygon) {
      document.getElementById("distanceToEdge").innerText =
        `Distance from home plate to polygon edge: ${distanceToEdge.toFixed(1)} feet`;
    } else {
      document.getElementById("distanceToEdge").innerText = "";
    }
  }
  
  
  function measureDistance(homePlate, clickedPoint, polygon) {
    const startPoint = new google.maps.LatLng(homePlate[1], homePlate[0]);
    let endPoint = clickedPoint;
    let insidePolygon = true;
  
    if (!google.maps.geometry.poly.containsLocation(endPoint, polygon)) {
      endPoint = google.maps.geometry.poly.closestLocation(endPoint, polygon).point;
      insidePolygon = false;
    }
  
    if (polyline) {
      polyline.setMap(null);
    }
  
    polyline = new google.maps.Polyline({
      path: [startPoint, endPoint],
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
  
    polyline.setMap(map);
  
    const distanceToClick = google.maps.geometry.spherical.computeDistanceBetween(
      startPoint,
      clickedPoint
    );
    const distanceToEdge = google.maps.geometry.spherical.computeDistanceBetween(
      startPoint,
      endPoint
    );
  
    // Convert distances from meters to feet
    const distanceToClickFeet = distanceToClick * 3.28084;
    const distanceToEdgeFeet = distanceToEdge * 3.28084;
  
    updateDistanceLabels(distanceToClickFeet, distanceToEdgeFeet, insidePolygon);
  }
  
