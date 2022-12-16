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

