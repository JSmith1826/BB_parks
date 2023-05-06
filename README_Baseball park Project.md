# Baseball park Project

## Intro
In the realm of major American sports, the distinctive nature of baseball's field of play sets it apart from its counterparts. Sports like basketball, football, and hockey all adhere to rigidly defined dimensions and markings, ensuring a consistent playing experience across various venues. Basketball courts, for instance, are standardized at 94 feet in length and 50 feet in width, while football fields maintain a uniform 120 yards in length, including end zones. Hockey rinks, too, boast strict dimensions, with an NHL regulation rink measuring 200 feet in length and 85 feet in width. Baseball, however, deviates from this pattern, embracing the unique character of its stadiums. While infields must conform to certain specifications, such as 90-foot base paths and a 60-foot-6-inch distance between the pitcher's mound and home plate, the outfield is left to the discretion of stadium designers. This freedom results in a diverse array of ballpark configurations, imbuing each venue with its own distinct atmosphere and playing conditions, and further distinguishing baseball from its more regimented counterparts.

## Tools Used. 
### Google Maps, Google Earth Pro
fields were traced / ploted using the Google MyMaps web interface and output as a KML (Keyhole Markup Language) file. The KML files were passed to Google Earth pro to be quality checked (Earth Pro's acess to additional imagery was useful when the satelite imagery available in Google Map posed a problem, some fields were multiuse and had temporary fences set up during baseball season that aren't visable in the Maps images. Then the fields were combined into a single kml structure and exported.

As of 5/4/2023 - ### many fields have been plotted
Break down: youth fields , high school fields, college fields, professional , major league , and international
Fields in Michigan: ###
Fields outside of Michigan:

### Python
ETL (Extract, Transform Load) is performed by python using the BeautifulSoup to parse the kml file, pandas for data tranformation, and numpy to proform some spacial calulations.

The restructured data is then stored as a JSON (JavaScript Object Notation) file that can be fed back to Google Maps to create our custom display

### ChatGPT
ChatGPT, both model 3.5 and 4, were used to assist in writing code.




### STATISTICS (As of 5/5/23)
Total Fields: 716
Fields by level:
High School                   494
Youth                          78
College                        57
Major League                   23
Unknown                        18
Professional                   17
International                  15
State / County / Municipal     14

AREA CALCS:
Total Fair Territory: 3.732 square miles
Total Foul Territory: 1.136 square miles
Total Territory: 4.868 square miles
----------------------------------------------
Total Fair Territory: 2388.288 acres
Total Foul Territory: 727.338 acres
Total Territory: 3115.626 acres


LENGTH OF BOUNDRIES:
Total FOP distance: 827325.8418373435 feet
Total Foul distance: 979017.6771751307 feet
Total FOP distance: 156.691 miles
Total Foul distance: 185.420 miles
Total distance: 342.111 miles