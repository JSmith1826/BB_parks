Notes Sunday Afternoon



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

