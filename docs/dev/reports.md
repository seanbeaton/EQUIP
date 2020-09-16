# Reports

There are 5 different types of report on EQUIP, Interactive, Timeline, Heatmap, Student Histogram, and Group work.

One important part to note here is where the data is aggregated and processed to create the report. Right now, every report is set to request the completed data from the api, where the server will check the cache for a recent copy, create it if needed, and ship it back to the client. This is easily changeable to use client-side calculation via a code change, and in the future will be toggleable through site settings.

We use [d3.js](https://d3js.org/) for all of the visualizations - on Interactive and Timeline reports for the graphs, and on Heatmap, Student Histogram, and Group work reports for the coloring of the subject boxes.

Observation select via the timeline is done with a [vis.js](https://visjs.org/) timeline, the docs for which are available [here](https://visjs.github.io/vis-timeline/docs/timeline/).

 
