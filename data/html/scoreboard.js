const colorCombinations = [
  { background: '#f44336', highlight: '#ff9800' },
  { background: '#3f51b5', highlight: '#2196f3' },
  { background: '#4caf50', highlight: '#8bc34a' },
  { background: '#795548', highlight: '#9e9e9e' }
];

const sampleTexts = [
  "Score: 10",
  "Score: 20",
  "Score: 30",
  "Score: 40"
];

const content = document.querySelector('.content');
const scoreboard = document.querySelector('.scoreboard');
const sampleTextElement = document.getElementById('sample-text');

let index = 0;

function cycleColorsAndText() {
  const colors = colorCombinations[index];
  const sampleText = sampleTexts[index];

  scoreboard.style.backgroundColor = colors.background;
  scoreboard.style.borderColor = colors.highlight;
  content.style.color = colors.highlight;
  sampleTextElement.textContent = sampleText;

  index = (index + 1) % colorCombinations.length;
}

setInterval(cycleColorsAndText, 3000); // Change colors and text every 3 seconds
