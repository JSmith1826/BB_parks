var districtTeams; // Declare the variable outside the event listener

// Load district teams JSON from remote URL
fetch("https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/mhsaa/data/district_dict.json")
  .then(response => response.json())
  .then(data => {
    districtTeams = data; // Assign the loaded data to the variable
    console.log("District Teams:", districtTeams);

    // Populate the district options
    const districtSelect = document.getElementById("districtSelect");
    for (const district in districtTeams) {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = `District ${district}`;
      districtSelect.appendChild(option);
    }
  })
  .catch(error => console.error("Error loading JSON data:", error));

document.addEventListener("DOMContentLoaded", function() {
  // Rest of the code...
});


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
