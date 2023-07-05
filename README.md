# Baseball Park Project

## Project Links
[2023 Michigan High School Baseball Tournament Host Site Map](https://jsmith1826.github.io/BB_parks/data/html/mhsaa/)

[2023 NCAA Baseball Tournament Host Site Map](https://jsmith1826.github.io/BB_parks/data/html/NCAA_REG/)

## Intro
In the realm of major American sports, the distinctive nature of baseball's field of play sets it apart from its counterparts. Sports like basketball, football, and hockey all adhere to rigidly defined dimensions and markings, ensuring a consistent playing experience across various venues. Baseball, however, deviates from this pattern, embracing the unique character of its stadiums. While infields must conform to certain specifications, the outfield is left to the discretion of stadium designers. This freedom results in a diverse array of ballpark configurations, imbuing each venue with its own distinct atmosphere and playing conditions, and further distinguishing baseball from its more regimented counterparts.

## Tools Used. 
### Google Maps, Google Earth Pro
Fields were ploted using the Google MyMaps web interface and output as a KML (Keyhole Markup Language) file. The KML files were passed to Google Earth pro to be quality checked. Earth Pro's access to additional imagery was useful when the satelite imagery available in Google Map posed a problem. Then the fields were combined into a single kml structure and exported.

Google Maps API is also used to create custom maps to showcase the data

### Python
ETL (Extract, Transform, Load) is performed by Python using the BeautifulSoup to parse the KML file, Pandas for data tranformation, and numpy to perform some spacial calulations.

The restructured data can then be stored as a JSON that can be fed back to Google Maps API to create our custom display

### Javascript
HTML pages with extensive use of Javascript were created to showcase the hosts sites of both the 2023 NCAA and MHSAA postseason tournaments. 

### ChatGPT
ChatGPT, both model 3.5 and 4, were used to assist in writing code.


## Project Scope
Total Fields: 716

### Fields by level:
-High School                   494
-Youth                          78
-College                        57
-Major League                   23
-Unknown                        18
-Professional                   17
-International                  15
-State / County / Municipal     14

### AREA CALCS:
-Total Fair Territory: 3.732 square miles
-Total Foul Territory: 1.136 square miles
-Total Territory: 4.868 square miles


### LENGTH OF BOUNDRIES:
-Total FOP distance: 156.691 miles
-Total Foul distance: 185.420 miles
-Total distance: 342.111 miles