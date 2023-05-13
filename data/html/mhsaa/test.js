// Set up variables

// Load JSON with district teams
var districtTeams;

// Load district teams JSON from localStorage
try {
  districtTeams = JSON.parse(localStorage.getItem("data/district_dict.json"));
} catch (error) {
  console.error("Error parsing JSON data:", error);
}

document.addEventListener("DOMContentLoaded", function() {
  // Get the district select element
  const districtSelect = document.getElementById("districtSelect");

  // Populate the district options
  for (const district in districtTeams) {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = `District ${district}`;
    districtSelect.appendChild(option);
  }
});

function displayTeams() {
  const selectedDistrict = document.getElementById("districtSelect").value;
  const container = document.getElementById("districtContainer");
  container.innerHTML = ""; // Clear previous content

  if (selectedDistrict) {
    const districtHeading = document.createElement("h2");
    districtHeading.textContent = `District ${selectedDistrict}`;
    container.appendChild(districtHeading);

    const teamList = document.createElement("ul");
    for (const team of districtTeams[selectedDistrict]) {
      const listItem = document.createElement("li");
      if (Array.isArray(team)) {
        const searchLink = document.createElement("a");
        searchLink.href = `https://www.example.com/search?q=${encodeURIComponent(team[0])}`;
        searchLink.textContent = "Search";
        listItem.appendChild(searchLink);
      } else {
        listItem.textContent = team;
      }
      teamList.appendChild(listItem);
    }
    container.appendChild(teamList);
  }
}

console.log("District Teams:", districtTeams);


document.addEventListener("DOMContentLoaded", function() {
  // Get the district select element
  const districtSelect = document.getElementById("districtSelect");

  // Populate the district options
  for (const district in districtTeams) {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = `District ${district}`;
    districtSelect.appendChild(option);
  }
});

function displayTeams() {
  const selectedDistrict = document.getElementById("districtSelect").value;
  const container = document.getElementById("districtContainer");
  container.innerHTML = ""; // Clear previous content

  if (selectedDistrict) {
    const districtHeading = document.createElement("h2");
    districtHeading.textContent = `District ${selectedDistrict}`;
    container.appendChild(districtHeading);

    const teamList = document.createElement("ul");
    for (const team of districtTeams[selectedDistrict]) {
      const listItem = document.createElement("li");
      if (Array.isArray(team)) {
        const searchLink = document.createElement("a");
        searchLink.href = `https://www.example.com/search?q=${encodeURIComponent(team[0])}`;
        searchLink.textContent = "Search";
        listItem.appendChild(searchLink);
      } else {
        listItem.textContent = team;
      }
      teamList.appendChild(listItem);
    }
    container.appendChild(teamList);
  }
}

console.log("District Teams:", districtTeams);
