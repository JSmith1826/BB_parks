# College Baseball Homerun Compairison README.


## Scraping ESPN college baseball scoreboard
Used code in ESPN_College... notebook
- the code goes day by day through a range that includes entire seasons and gets the scoreboard for each day.

- was able to get box scores that included the numbers of home runs hit by each team for over 1000 games in the 2023 season
    - also able to get box scores from NCAA tournament games in previous years

- The site also had scoreboard pages going back all the way to 2016 but regular season games do not have links to box scores so I couldn't get data on the number of home runs hit each game. 
    - still collected it because the runs hits and error for each team may be useful
    - scoreboard did not include stadium name but I should be able to assign those based on the home team

## ESPN_HR_SCORE_DATA_Cleaning_Book

- Takes the scraped data and calculates total hits runs and error for all games
- Also works with the data from all 0f 2023 season and NCAA games from previous seasons that have Location names and Home Run data

- Creates some simple plots (histograms) get a sense of data

- uses Google maps api to find lat and lng coordinates for each stadium 
<CODE>
### Get a list of all of the locations in the HR dataset and use google api to get a lat and long for each location

import googlemaps

# Your API Key goes here
gmaps = googlemaps.Client(key='AIzaSyA_BhlTupRdBPBhRptQuR6pYorMVYQnRMA')


# Create a list to store the results
results = []

# Loop through all locations
for location in locations:
    # Geocode location
    geocode_result = gmaps.geocode(location)
    # If a result was returned, append the result as a dictionary to the results list
    if geocode_result:
        latitude = geocode_result[0]['geometry']['location']['lat']
        longitude = geocode_result[0]['geometry']['location']['lng']
        results.append({'Location': location, 'Latitude': latitude, 'Longitude': longitude})
    else:
        print(f"Could not find coordinates for {location}.")

# Create a DataFrame from the results
df_locations = pd.DataFrame(results)

# Print the DataFrame
print(df_locations)

## Save as a csv as backup
df_locations.to_csv('TEMP/NCAA_locations_lat_lng.csv', index=False)
</CODE>

## ORIGINAL NOTES
-set to a range of dates. 2/17/23 to the end of the season (College WS)

## Purpose
To collect conprehensive stats for the number of home runs hit at each ballpark in espn's dataset for the spring portion of the 2023 season

- compare to field plots and stats being developed in other notebook to train a machine learning model to look for what makes a field offence or deffensive friendly.

This intial scrape only returns runs hits error and home runs for each game - they are sperated by home and away team. each team is designated by a 3 letter abriviation - will need to match these up to more friendly names


ESPN SITE can be used to go back to previous seasons before 2019 at least but not box scores. can only get hits runs errors for each team but could use this info to infer park and add to the total runs data points\



