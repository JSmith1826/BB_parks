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