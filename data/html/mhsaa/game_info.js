window.onload = function() {
    fetch('https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/mhsaa/data/district_dict.json')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('districtSelect');
            Object.keys(data).forEach((district) => {
                const option = document.createElement('option');
                option.text = `District ${district}`;
                option.value = district;
                select.add(option);
            });
        });
}

function displayTeams() {
    const select = document.getElementById('districtSelect');
    const district = select.value;
    if (!district) {
        return;
    }

    fetch('https://raw.githubusercontent.com/JSmith1826/BB_parks/main/data/html/mhsaa/data/district_dict.json')
        .then(response => response.json())
        .then(data => {
            const teamList = document.getElementById('teamList');
            teamList.innerHTML = '';
            data[district].forEach((team) => {
                const listItem = document.createElement('li');
                listItem.textContent = team;
                teamList.appendChild(listItem);
            });
        });
}
