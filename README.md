# Baseball Park Project

## Intro
In the realm of major American sports, the distinctive nature of baseball's field of play sets it apart from its counterparts. Sports like basketball, football, and hockey all adhere to rigidly defined dimensions and markings, ensuring a consistent playing experience across various venues. Baseball, however, deviates from this pattern, embracing the unique character of its stadiums. While infields must conform to certain specifications, the outfield is left to the discretion of stadium designers. This freedom results in a diverse array of ballpark configurations, imbuing each venue with its own distinct atmosphere and playing conditions, and further distinguishing baseball from its more regimented counterparts.

## Project Links
*![NCAA 2023 Map](data\images\export\MIAMI.png)*
*[2023 NCAA Baseball Tournament Host Site Map](https://jsmith1826.github.io/BB_parks/data/html/NCAA_REG/)*





*![MHSAA 2023 Map](data\images\export\HS_2.png)*
*[2023 Michigan High School Baseball Tournament Host Site Map](https://jsmith1826.github.io/BB_parks/data/html/mhsaa/)*





## Tools Used. 
### Google Maps, Google Earth Pro
Fields were plotted using the Google MyMaps web interface and output as a KML (Keyhole Markup Language) file. The KML files were passed to Google Earth pro to be quality checked. Earth Pro's access to additional imagery was useful when the satellite imagery available in Google Map posed a problem. Then the fields were combined into a single KML structure and exported.

Google Maps API is also used to create custom maps to showcase the data


### Python
ETL (Extract, Transform, Load) is performed by Python using the BeautifulSoup to parse the KML file, Pandas / NumPy for data transformation, and Shapely to perform some spatial calculations.

The restructured data is then be stored as a JSON that can be fed back to Google Maps API to create the custom display


### Javascript
HTML pages with extensive use of Javascript were created to showcase the hosts sites of both the 2023 NCAA and MHSAA postseason tournaments. 

### ChatGPT
ChatGPT, both model 3.5 and 4, were used to assist writing javascript.


## Project Scope - Total Fields: 716

### Fields by Level:
- High School                   494
- Youth                          78
- College                        57
- Major League                   23
- Unknown                        18
- Professional                   17
- International                  15
- State / County / Municipal     14

### AREA CALCULATIONS:
- Total Fair Territory: 3.7 square miles
- Total Foul Territory: 1.1 square miles
- Total Territory: 4.8 square miles


### BOUNTRY LINES:
- Total Field of Play Distance: 156.7 miles
- Total Foul Territory Distance: 185.4 miles
- Total Distance: 342.1 miles

### Documentation

### Columns used and created in the Field_Compare_workbook

### Basic Information
- `park_name`: The name of the baseball park.
- `level`: The level of play (e.g., high school, college, professional).
- `home_plate`: The location of home plate in the field.
- `geometry`: The geometric shape of the baseball park.

### Measurements
- `distances`: List of distances from home plate to outfield fence at each angle.
- `max_distance`: The maximum distance from home plate to the outfield fence.
- `min_distance`: The minimum distance from home plate to the outfield fence.
- `avg_distance`: The average distance from home plate to the outfield fence.
- `median_distance`: The median distance from home plate to the outfield fence.

### Angles
- `angles`: List of angles at each vertex of the polygon that outlines the baseball park. More angular parks will have shorter lists, while more rounded parks will have longer lists.
- `max_angle`: The maximum angle among the vertices of the polygon.
- `min_angle`: The minimum angle among the vertices of the polygon.
- `avg_angle`: The average angle among the vertices of the polygon.
- `median_angle`: The median angle among the vertices of the polygon.

### Derived Metrics
- `shape_complexity`: A measure of how complex the shape of the park is.
- `elongation`: A measure of how elongated the park is.
- `orientation`: The orientation of the park.

### Scores
- `score`: An old scoring system based on field parameters.
- `score2`: Another old scoring system based on field parameters.
- `offense_score`: A new score representing how beneficial the park is for offense, normalized between 1 and 100.
- `defense_score`: A new score representing how beneficial the park is for defense, normalized between 1 and 100.
- `offense_score_normalized`: The offense score normalized between -5 and +5.
- `defense_score_normalized`: The defense score normalized between -5 and +5.

### Area
- `foul_area_sqft`: The total area of the foul territory in square feet.
- `fop_area_sqft`: The total area of the field of play in square feet.
- `field_area_sqft`: The total area of the baseball field in square feet.
- `foul_area_per`: The percentage of the total field area that is foul territory.
- `fair_to_foul`: The ratio of the fair area to the foul area.

### Deviation
- `total_deviation`: The sum of the deviations of each section of the field from the mean distance of the corresponding section of all fields.
- `{section}_deviation`: The deviations of each section of the field from the mean distance of the corresponding section of all fields.
- `total_avg_deviation`: The average of the deviations of each section of the field from the mean distance of the corresponding section of all fields.
- `{section}_avg_deviation`: The average deviations of each section of the field from the mean distance of the corresponding section of all fields.
- `{section}_max_deviation`: The maximum deviation of each section of the field from the mean distance of the corresponding section of all fields.
- `{section}_min_deviation`: The minimum deviation of each section of the field from the mean distance of the corresponding section of all fields.

Where `{section}` is one of: `dtl1`, `left`, `l_gap`, `center`, `r_gap`, `right`, `dtl2`

### Other
- `foul`, `fop`: Flags indicating whether the foul area and field of play were included in the analysis.
- `file_path`: The path to the plot for the field.
