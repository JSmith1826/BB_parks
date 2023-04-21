let map;
let fieldData;
let polygons = [];
let homePlateMarkers = [];
let clickMarker;
let polyline;

function loadJSON() {
    const url = 'https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/360_test/output.json';
    console.log("loadJSON called");
    return fetch(url)
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
  }
  
  

  function initMap() {
    console.log("initMap called");
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
    });
  
    loadJSON().then((data) => {
      createPolygons(data);
    });
  }


function createPolygons(data) {
    data.forEach((field) => {
      let fairTerritoryCoordinates = field.fop.map((coord) => ({
        lat: coord[1],
        lng: coord[0],
      }));
  
      let foulTerritoryCoordinates = field.foul.map((coord) => ({
        lat: coord[1],
        lng: coord[0],
      }));
  
      let fairTerritory = new google.maps.Polygon({
        paths: fairTerritoryCoordinates,
        fillColor: "green",
        fillOpacity: 0.5,
        strokeWeight: 1,
      });
  
      let foulTerritory = new google.maps.Polygon({
        paths: foulTerritoryCoordinates,
        fillColor: "red",
        fillOpacity: 0.5,
        strokeWeight: 1,
      });
  
      fairTerritory.setMap(map);
      foulTerritory.setMap(map);
      polygons.push({ fair: fairTerritory, foul: foulTerritory });
  
      let homePlateMarker = new google.maps.Marker({
        position: { lat: field.home_plate[1], lng: field.home_plate[0] },
        title: field.field,
        map: map,
      });
      homePlateMarkers.push(homePlateMarker);
    });
  }
    
  
  function onMapClick(event) {
    console.log("onMapClick called");
    if (clickMarker) {
      clickMarker.setMap(null);
    }
    if (polyline) {
      polyline.setMap(null);
    }
  
    clickMarker = new google.maps.Marker({
      position: event.latLng,
      map: map,
    });
  
    let closestFieldInfo = findClosestFieldInfo(event.latLng);
    document.getElementById("field-name").innerHTML = `Field Name: ${closestFieldInfo.fieldName}`;
  
    let distance = closestFieldInfo.distanceInFeet;
    document.getElementById("distance").innerHTML = `Distance: ${distance.toFixed(2)} feet`;
  
    let fenceDistance = closestFieldInfo.fenceDistanceInFeet;
    document.getElementById("fence-distance").innerHTML = `Fence Distance: ${fenceDistance.toFixed(2)} feet`;
  
    polyline = new google.maps.Polyline({
      path: [closestFieldInfo.homePlateLatLng, event.latLng],
      map: map,
      strokeColor: "blue",
      strokeWeight: 2,
    });
  }  

  
    
function findClosestFieldInfo(latLng) {
    let closestFieldInfo = {
    fieldName: "",
    homePlateLatLng: null,
    distanceInFeet: Infinity,
    fenceDistanceInFeet: Infinity,
    closestPointOnBoundary: null,
    };

    homePlateMarkers.forEach((marker, index) => {
    let homePlateLatLng = marker.getPosition();
    let distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, homePlateLatLng) * 3.28084; // Convert meters to feet

    if (distance < closestFieldInfo.distanceInFeet) {
        closestFieldInfo.fieldName = marker.getTitle();
        closestFieldInfo.homePlateLatLng = homePlateLatLng;
        closestFieldInfo.distanceInFeet = distance;

        let fenceDistance = findFenceDistance(latLng, polygons[index]);
        closestFieldInfo.fenceDistanceInFeet = fenceDistance.distanceInFeet;
        closestFieldInfo.closestPointOnBoundary = fenceDistance.closestPoint;
    }
    });

    return closestFieldInfo;
}
    
function findFenceDistance(latLng, polygon, closestFieldInfo) {
    let fenceDistance = Infinity;
    let closestPoint = null;
  
    let fairTerritory = polygon.fair;
    let foulTerritory = polygon.foul;
  
    if (!google.maps.geometry.poly.containsLocation(latLng, fairTerritory)) {
      console.log("Clicked point is outside the fair territory.");
      [fairTerritory, foulTerritory].forEach((territory) => {
        let previousVertex = territory.getPath().getAt(territory.getPath().getLength() - 1);
        territory.getPath().forEach((vertex) => {
          let intersection = intersectLine(closestFieldInfo.homePlateLatLng, latLng, previousVertex, vertex);
          if (intersection) {
            let distance = google.maps.geometry.spherical.computeDistanceBetween(closestFieldInfo.homePlateLatLng, intersection) * 3.28084; // Convert meters to feet
            if (distance < fenceDistance) {
              fenceDistance = distance;
              closestPoint = intersection;
            }
          }
          previousVertex = vertex;
        });
      });
    } else {
      fenceDistance = google.maps.geometry.spherical.computeDistanceBetween(closestFieldInfo.homePlateLatLng, latLng) * 3.28084; // Convert meters to feet
      closestPoint = latLng;
    }
  
    return {
      distanceInFeet: fenceDistance,
      closestPoint: closestPoint,
    };
  }
  

// Helper function to calculate the cross product
function crossProduct(p1, p2, p3) {
    let x1 = p2.lat() - p1.lat();
    let y1 = p2.lng() - p1.lng();
    let x2 = p3.lat() - p1.lat();
    let y2 = p3.lng() - p1.lng();
  
    return x1 * y2 - x2 * y1;
  }
  
  // Helper function to check if two line segments intersect
  function doSegmentsIntersect(p1, p2, q1, q2) {
    let d1 = crossProduct(q1, p1, p2);
    let d2 = crossProduct(q2, p1, p2);
    let d3 = crossProduct(p1, q1, q2);
    let d4 = crossProduct(p2, q1, q2);
  
    return (d1 * d2 < 0) && (d3 * d4 < 0);
  }
  
  // Helper function to find the intersection point of two line segments
  function findIntersectionPoint(p1, p2, q1, q2) {
    let A1 = p2.lat() - p1.lat();
    let B1 = p1.lng() - p2.lng();
    let C1 = A1 * p1.lat() + B1 * p1.lng();
    let A2 = q2.lat() - q1.lat();
    let B2 = q1.lng() - q2.lng();
    let C2 = A2 * q1.lat() + B2 * q1.lng();
  
    let det = A1 * B2 - A2 * B1;
    if (det === 0) {
      return null;
    } else {
      let lat = (B2 * C1 - B1 * C2) / det;
      let lng = (A1 * C2 - A2 * C1) / det;
      return new google.maps.LatLng(lat, lng);
    }
  }
  
  // Intersection function
  function intersectLine(p1, p2, q1, q2) {
    if (doSegmentsIntersect(p1, p2, q1, q2)) {
      return findIntersectionPoint(p1, p2, q1, q2);
    } else {
      return null;
    }
  }
  