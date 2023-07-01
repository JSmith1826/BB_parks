# Overall Baseball Project ReadMe

## Scope of project

### Why Baseball?
    - history, love of the game
    - accidentaial start of the project when measuring baseball parks in google maps when I was a scorekeeper and scoreboard operator

############## NOTES ###################

### Statistical Analysis
#### Sourcing and Parsing 
##### MHSAA Website
    - Scraping for valid school IDs
    - Scraping valid IDs for game level data
        - game level data
        - school info dataframe
###### School and demographic data NCES - databases
    - scraping for public school demographics
##### Google Maps and Earth 
    - ploting and titling each field
    -when 
        - structure of the kml file
        - very specific for the etl notbooks
            - rely on coordinate positions



############ Chat GPT OUTPUT 6-24-23 ###############################


BB_parks: A Deep Dive into Baseball Parks and Statistics
Project Overview
Ever wonder about the stories that baseball parks could tell if they could talk? This project began with a simple curiosity about the dimensions of baseball parks and has evolved into a comprehensive analysis that intertwines love for the game, history, and data science.

Why Baseball?
Baseball isn't just America's favorite pastime. It's a game filled with history, strategic depth, and emotional highs and lows. The project was born out of an accidental foray into measuring baseball parks on Google Maps while working as a scorekeeper and scoreboard operator. Over time, it has grown into a full-fledged analysis project.

Scope of the Project
The BB_parks project aims to showcase the application of data analysis and various programming languages in the context of a topic of great personal interest - baseball. The goal is to shed light on patterns and trends that are hidden in the game's data.

Data Collection
MHSAA Website
The Michigan High School Athletic Association (MHSAA) website is a wealth of information, providing both game-level data and school information. The data collection process involves:

Scraping for Valid School IDs: We first scrape the website for valid school IDs that will be used in the later data collection stages.
Scraping for Game Level Data: With the school IDs, we scrape the website for detailed game-level data which provides insight into the performance of various teams.
Creating a School Info Dataframe: This dataframe includes comprehensive information about the schools involved in the games.
NCES Databases
The National Center for Education Statistics (NCES) databases are used to collect public school demographic data. This data is crucial for understanding the socio-economic contexts of the various teams and schools involved.

Google Maps and Earth
Google Maps and Earth are used to plot and title each field. This data is crucial for visualizing the geographical distribution of baseball parks and understanding how geographical factors might influence game outcomes.

Data Parsing and Analysis
The analysis process involves parsing the scraped data and deriving meaningful insights from it. This involves the use of various programming languages and data analysis techniques.

Please note that the structure of the KML files from Google Earth are very specific to the ETL notebooks as they rely heavily on coordinate positions.


### CODE: Explanation of how the kml portion of the project works.

#### Unedited 
This script is used to parse and analyze data from KML files exported from Google Earth, related to baseball ballparks (presumably high school level, given the file name). It extracts a lot of detailed information about each ballpark from the KML files, and then performs several calculations and transformations on this data. Here's a summary of what each block does:

LOAD BLOCK: This part of the script reads the KML file and uses BeautifulSoup to parse the XML data. It finds all the 'Folder' tags in the KML data, which contain information about each ballpark, and extracts the 'name', 'coordinates', and 'description' (if it exists) for each one. It then creates a DataFrame from this data.

The script then cleans the DataFrame by removing newline and space characters from the 'foul' and 'fop' fields (which represent the coordinates of the foul and fair parts of the field, respectively), dropping duplicate rows based on the 'field' column, and dropping any rows with empty fields.

AREA CALCULATION: The script calculates the area in square feet of the foul and fair parts of the field. It does this by first parsing the coordinates (which are given as strings), then creating a Polygon object for each set of coordinates, and finally using the pyproj and shapely libraries to calculate the area of each polygon in square feet. It also calculates the total area of each field and the ratio of foul area to total area.

FENCE DISTANCE CALCULATION: This block calculates the distance from home plate to the fence at various points around the field. It does this by first calculating the total length of the outfield fence, then dividing this length into 540 equal segments, and calculating the distance from home plate to each segment.

CHECK BLOCK: This block checks that the 'distances' list (which holds the distances from home plate to the fence at various points) has the correct length for each row in the DataFrame.

Orienting the map to the home plate location: This block calculates the centroid of the outfield fence and the bearing from home plate to this centroid for each field. It then converts this bearing into a cardinal direction (e.g., 'N', 'NE', etc.).

Finally, the script uses the Google Maps API to retrieve the altitude, city, and state for each field, based on the coordinates of its home plate. The API key is hardcoded into the script, which is generally not recommended for security reasons.

The resulting DataFrame holds a lot of detailed information about each ballpark, including its name, the coordinates and area of the foul and fair parts of the field, the ratio of foul to fair area, the distances from home plate to various points on the outfield fence, the bearing from home plate to the center of the outfield fence, the altitude, city, and state of the field, and any additional notes from the KML file.



Game-Level Data Collection
Our game-level data collection process involves parsing the Michigan High School Athletic Association (MHSAA) website for detailed game-level data, which provides insight into the performance of various teams.

We achieve this through two Python functions: parse_game_data and initialize_parsing.

Function: parse_game_data
This function takes two arguments: data and game. The data argument is a JSON object containing the overall team and league information for a particular game, while the game argument is a JSON object containing the details of a specific game.

The function parses these data objects and extracts the following information:

Team and League Information: Name of the team and the league.
Opponent Information: ID and popular name of the opposing team.
Game Timing: Start date and time of the game.
Game Location: Whether the game was home or away, and the location of the contest.
Game Scores: Scores of the team and the opponent, and any additional notes. These are extracted and cleaned using a regular expression.
Additional Game Information: This includes the type of contest, season type, post-season information, tournament details, contest name, and season type code.
This function returns a dictionary containing all the above-mentioned game-level data.

Function: initialize_parsing
This function initiates the data parsing process. It takes three arguments: base_url, school_id, and url_end. The function combines these to form the full URL for a particular school's games page on the MHSAA website. It then sends a GET request to this URL and receives the response.

The function checks the HTTP status code of the response and proceeds only if the status is 200 (HTTP OK). It then converts the response to a JSON object. If the JSON object contains a 'Contests' key and its value is not empty, the function iterates over the games and applies the parse_game_data function to each game. The parsed data for each game is then appended to a list.

The initialize_parsing function returns this list of parsed game data, which can then be used for further analysis.

This process allows us to gather detailed game-level data in a structured format directly from the MHSAA w