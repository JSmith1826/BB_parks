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

