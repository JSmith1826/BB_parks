


const jsonUrl = "https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/mhsaa/data/district_dict.json"; // Districts Number and list of teams

// Open The JSON File
var request = new XMLHttpRequest();
request.open('GET', jsonUrl);
request.responseType = 'json';
request.send();


