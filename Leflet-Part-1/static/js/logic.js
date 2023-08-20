//geoData source
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//read in data
d3.json(geoData).then(function(data) {
    createFeatures(data.features); //pass data to createFeature function
});

//creates the data points
function createFeatures(data) {

    //modifies and creates the popups to show data on earthquakes when clicked
    function onEachFeature(feature,layer) {
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3><hr>
            <p>Date: ${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag} mwr</p>
            <p>Depth: ${feature.geometry.coordinates[2]} km</p>
            <p>More Info: <a href="${feature.properties.url}" target="_blank">Click here</a></p> `)
    };
    
    //modifies the data points to be circles
    function pointToLayer(feature, latlng) {
        //call function to determine the fill color of the data points
        let color = getColor(feature.geometry.coordinates[2]) //color is based off of depth of the earthquake
        //defines circle marker
        return L.circleMarker(latlng, {
                    radius: feature.properties.mag *3, //change to desired scale
                    fillColor: color,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
    };

    //function to define fill color based on depth
    function getColor(depth) {
        let colors = [
            "#1a9850",//green
            "#a6d96a",
            "#fee08b",
            "#fdae61",
            "#f46d43",
            "#d73027"]//red

        //return coloor based on depth --green for negative to low depth, red for high depth
        if (depth < 10) {
            return colors[0]
        }
        else if (depth < 30) {
            return colors[1]
        }
        else if (depth < 50) {
            return colors[2]
        }
        else if (depth < 70) {
            return colors[3]
        }
        else if (depth < 90) {
            return colors[4]
        }
        else {
            return colors[5]
        }
    };

    //call functions to be used
    let earthquakes = L.geoJSON(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
        
    });

    //pass the earthquake data to function to create the map
    createMap(earthquakes);
}

function createMap(eqData) {

    //base layer
    let baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    //create overlays
    let overLayMaps = {
        Earthquakes: eqData
    }

    //define layers
    let baseMaps = {
        "Base Map": baseLayer
    }

    //define map and starting coordinates
    let myMap = L.map("map", {
        center: [39.983160, -101.734474], //set to center of US
        zoom: 5,
        layers: [baseLayer, eqData]
      });
    
    //define control for layers and overlays
    L.control.layers(baseMaps, overLayMaps, {
        collapsed:false
    }).addTo(myMap)


    //creates the legend for the map
    let legend = L.control({ position: 'bottomright' }); //bottom right position
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'), //add div 
            grades = [-10, 10, 30, 50, 70, 90], //define grades
            labels = ["-10-10 km", "10-30 km", "30-50 km", "50-70 km", "70-90 km", "90+ km"], //define labels
            colors = [
                "#1a9850",//green
                "#a6d96a",
                "#fee08b",
                "#fdae61",
                "#f46d43",
                "#d73027"]; //define colors
        
        // add a label to the legend
        div.innerHTML = '<strong>Depth Scale:</strong><br>';
        // Loop through the legend labels and colors
        for (i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                labels[i] + '<br>';
        }
        return div;
    };
    legend.addTo(myMap);

    //add a title to the map
    let titleControl = L.control({ position: 'topleft' });

// Function to generate the HTML for the title
    titleControl.onAdd = function (myMap) {
        let div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = '<h2>Recent Earthquakes: Last 7 Days</h2>';
        return div;
    };
    titleControl.addTo(myMap);
}

