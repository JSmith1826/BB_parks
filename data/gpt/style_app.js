// <!-- 
// <h1>{fieldName}</h1>
// <h3>Home of {home_of}{</h3>
// <body>Field Facts:
//     Fence: <num>{fence_min}</num> | <num>{fence_max}</num> | <num>{fence_avg}</num>
//               MIN           MAX           AVG
//     Area: <num>{area_acres}</num> acres | <num>{area_ratio} : 1</num>  Fair/Foul
//     <h3>Click Around The Field To measure Distances</h3>
//     Click Distance: <num>{distance}</num> | <num>{fence_distance}</num> to Fence
// </body> -->
// LYOUT INPUT FOR PROMPT ABOVE

// RETURNED GPT OUTPUT BELOW
const distance = 250; // Example value
const fenceDistance = null; // Invalid value


const clickDistance = document.createElement("p");
clickDistance.innerHTML = `Click Distance: <span class="num">${distance >= 0 ? distance : '---'}</span> | <span class="num">${fenceDistance >= 0 ? fenceDistance : '---'}</span> to Fence`;

function displayInfo(field) {
    // Get the container element
    const container = document.getElementById("info-container");

    // Clear the container's content
    container.innerHTML = "";

    // Create the elements using the data from the JSON object
    const h1 = document.createElement("h1");
    h1.textContent = field.park_name;

    const h3Home = document.createElement("h3");
    h3Home.textContent = "Home of " + field.school_name;

    const fieldFacts = document.createElement("p");
    fieldFacts.innerHTML = `Outfield Fence (feet): <number>&nbsp;${field.min_distance}</number> MIN &nbsp;<number> ${field.max_distance}</number> MAX &nbsp;<number> ${Math.round(field.avg_distance)}</number> AVG<br>
                
      Field Area (acres): <number>&nbsp;${(field.fop_area_sqft / 43560).toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp;</number>
      Fair : Foul Ratio <number>${(field.fop_area_sqft / field.foul_area_sqft).toFixed(2)} : 1</number>`;

    const h3Click = document.createElement("h3");
    h3Click.textContent = "Click Around The Field To Measure Distances";

    // // Define distance and fenceDistance variables
    // const distance = 250; // Example value
    // const fenceDistance = 0; // Invalid value

    const clickDistance = document.createElement("p");
    clickDistance.innerHTML = `Click Distance: <number>&nbsp;${(distance !== null && distance >= 0) ? distance : '---'}</number>ft <number> | ${(fenceDistance !== null && fenceDistance >= 0) ? fenceDistance : '---'}</number> ft&nbsp; To Fence`;
    
    console.log(field)

    // Append the elements to the container
    container.appendChild(h1);
    container.appendChild(h3Home);
    container.appendChild(fieldFacts);
    container.appendChild(h3Click);
    container.appendChild(clickDistance);
}

// // Replace this example JSON data with your actual data
// const field = {
//     park_name: "Example Park",
//     school_name: "Example School",
//     min_distance: 300,
//     max_distance: 400,
//     avg_distance: 350,
//     fop_area_sqft: 50000,
//     foul_area_sqft: 10000
// };

displayInfo(field);
