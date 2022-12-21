#### Mismatched between mhsaa enrollment and field name. need to name better in source file
## Threashold 90
Gross Pointe South High School	
Detroit Catholic Central HS - Field 2	
Jackson Lumen Christi HS	Jackson HS
Jackson Northwest HS	Jackson HS
Hudson high School	Jackson Christian School
Hudsonville Christian HS	Hudsonville HS
Marine City Cardinal Mooney Field 2	Marine City HS
Marine City Cardinal Mooney HS	Marine City HS
Martin HS	Detroit - Martin Luther King HS
New Haven Merritt Academy HS	New Haven HS
Novi Christian Academy HS	Novi HS
MISSPELLING - PellsonPelson High School	Jackson Christian School
Portland St. Pats HS	Portland HS
Saginaw Nouvel HS	Saginaw HS
Troy - Athens HS	Troy HS






### NEXT TO DO
take list of all high schools that competed in 2022 playoffs

use fuzzy match to get a list of high schools I haven't plotted (not in hs_df)
############# DONE


# Fields in need of Attention

### Outliers from the first distance measurements done on 12/18/22

field	min_distance	max_distance	avg_distance

X - Bath High School	46.15160407	456.1376634	285.246197
x - Canton High School	40.07794875	325.8097336	137.1573717
x - The Corner - Detroit PAL - Muni	1.031638185	434.1195236	255.5273073
X - East Lansing High School	50.58703058	484.9487741	286.7170485
x - Haslett High School	1.224287647	432.9383237	251.9801562
x - STILL NOT SURE IF THIS IS HOME FIELD _ CRAZY SMALL -Homer HS	265.5397509	314.5701658	306.7157025 - had a question when I did this it seemed really small like a 14u field
CAN'T FIND HOME FIELD - Kingston high School	280.1883296	334.6474322	305.1932136
X - Lansing Catholic HS	15.81197803	433.3988186	257.5456244
x - Mason High School	6.844635693	443.6789979	256.4183216
X- Kircher Municipal Field - Lansing - muni	1.169639451	365.260492	230.3856396
x - Okemos HS	16.56500807	461.671535	248.790134
x -MSU - Old College Field	17.28453684	451.0253762	288.2351108
x - Olds Park - Lansing Lugnuts - pro	41.12590677	431.1748346	238.1440463
x 269.6659607	328.4812635	309.3692606
x - Shrine HS Royal Oak	263.9839651	390.228614	364.7340091
x - USA - unionville - Youth 1	28.95715638	218.9708988	144.1588436
x - Waverly High School	68.14221345	442.8736951	267.4343459
x - Whiteford High School - Ottawa Lake	377.6789289	471.2160041	426.4735047

#### ABOVE DOONE 12/19/22 Directly in google earth




## Unmapped
XX - DONE -* Robert L Nichols Field - Battle Creek in Bailey Park 
* Mt. Pleasant HS has a second field - practice field that I didn't plot
* Portland St. Pats field should just be retired. not even sure if it is still in use + the matching got screwed up 

## Monday 12-19-22
Problems with these fields after new ETL process
All have a problem with min distance
    Homer High School
    Battle Creek Robert L Nichols Field
    Royal Oak Memorial Park
    Eaton Park - muni
    Rochester Hills Lutheran Northwest HS


### NIGHT 12-15
    Made some good progress in Tableau, made some nice graphics, didn't post anything
    scraped the mhsaa website to get a list of all HS that competed in the 2022 state tournment
    total schools is 595 so my 155 plotted HS fields is over a quarter of them

    - also have a table of all college teams with their divisions in the school_info folder
        - roughly 60 college programs, some are probably outdated
        - I have 10-15 college stadiums already plotted


### Goals for today Thursday 12-15
    Produce charts and post on r/dataisbeautiful
        XX DONE- Chart 1 - all HS fields (+ Muni) with HS fields sized according to enrollment, color on division. add MLB stadiums for context (with team logos)
        XX DONE - Chart 2 - map of all high school and muni fields
            base location on home plate - need to seperate those into lat and long columns
        - Chart 3 - Pro and college fields in the state with the DI, pro, and MLB team logos
            - currently don't have all of the college teams. 
                XXX DONE - SEE ABOVE - compile list of all colleges in state with baseball teams
                    break them down by level
                        start new table for
                    --------->   start mapping the unmapped fields
    
    
    Write stack overflow post to ask for help with measuring geometries
        need help understanding if my projection is correct when using the shapely.distance method
        help understanding the hausdorff_distance and how to use it
            migh need to double check line strings to see if their are any vertices on the foul line that is distoriting the fop outfield line I am trying to use



##### Clean Up field data

    went through and verified the format eof the google earth folders that outputs kml file
    deleted many duplicates
    renamed many fields/folders
        spelled out HS or high school on the fields on HS property and classified that way
        tagged - college, pro, youth in title of all other fields
            this should make building the initial data frame easier
                should be able to filter and add a new column to hold the 'level'
        Hopefully adding the HS tag to those fields will make it easier to match them against the mhsaaa enrollment and get them school id numbers
        

#### Wednesday notes
    * made good progress on the data matching. matched > 150 out of 222 maped fields in the high school class
    * got somewhere in the wiki scraping - got a list of conference names with relative links to the wiki pages
    ** next to work on there is pulling a table from a conference page and turning it into a dataframe

    ** output a what I think is a pretty clean and feature packed table with field size - going to put it in tab and see what I can do

    ** Geometry
        write a stack overflow or stack exchange post about my problems measuring geometry
            the min distance seems to be on the right track but the distance is a little wonky - may be a projection issue

        need all kinds of help understanding the haudorff_distance and the different ways there are out there to use it in python



### Idea to start with

convert all of the negative values in the coordinates to positive
    should be able to do it with a lambda function
    this may be whats causing the issue with the max distance calculation
    the min distance function if working though I need to check the projection and ration again because the distances seem a little shorter than expected


## End of the night Tuesday 12-13


## Idea for how to calculate distances

Need to convert my fop polygons into linestrings that only have the points from the outside wall.
    The outfield wall line should just be the polygon with the first and last points dropped
        The first point of each polygon is home plate, the last value is also home pate. as long as there are no point on the foul line than the string minus the first and last coordinates will be a line tracing the outfield wall


## Notes from Tuesday night

I want to work on visualizations but I need to connect the data from the manual book I did with the python output file.

Happy with the output file for the most part. there is some kind of issue with the Calvin College field. I think it is just being counted twice

Firgure out how to parse the enrolment from that mhsaa pdf file. enrollment number should be easy to roll into current data




- recreate the earlier tableau viz with the new dataset

- scrape wikipedia for conferences, school enrollment.
    probably an easier source for school enrollment
        state school info database
    HAVE A PDF FROM MHSAA SITE, just been unable to parse it so far



IDEA - revisit river town map and get any data I can from Paul's point of sale system to make a cool visualization.
    all routes are basically the same
    viz ideas
        heatmap with just raw number of trips on each route
        something over the course of time

        SCRATCH SHEET - NOTES
___________________

12-6-22

Goals
    DONE!!!! - finish last stadiums from top 20 lists

    DONE --- clean up MLB and pro team levels

    find custom icons 
        what is the ideal size?
        DONE!!!! - MLB - Boston, Detroit, Colorado
        College - All I can find
            Have D1 Logos, - find a generic one for smaller schools
    !!! Create a map of all the locations in the state of michigan
        need to simplify the location data to render quickly on a map 

            just grab a single point from each row 
            try making map in tableau
            use beautifulsoup to to get the coordinates of a polygon for each layer and grab the first point from that list
                this will be home plate for distance measurements and is a single point to plot fields on map
                
    
BIG PROJECTS

* figure out how to measure distances, want the min and max distance for each field
probably need to define a point to measure from - the homeplate point 
    should be pretty easy to know which point that is programatically. it should be the first point in the line string for each polygon
        all of the later plots were drawn in that manner. 

