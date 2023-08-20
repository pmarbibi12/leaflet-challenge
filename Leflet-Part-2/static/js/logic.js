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
        // Popup content for earthquake data
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3><hr>
            <p>Date: ${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag} mwr</p>
            <p>Depth: ${feature.geometry.coordinates[2]} km</p>
            <p>More Info: <a href="${feature.properties.url}" target="_blank">Click here</a></p> `);
    }
    
    //modifies the data points to be circles
    function pointToLayer(feature, latlng) {
        //call function to determine the fill color of the data points
        let color = getColor(feature.geometry.coordinates[2]) //color is based off of depth of the earthquake
        //defines circle marker
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 3, //change to desired scale
            fillColor: color,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }

    //function to define fill color based on depth
    function getColor(depth) {
        let colors = [
            "#1a9850", //green
            "#a6d96a",
            "#fee08b",
            "#fdae61",
            "#f46d43",
            "#d73027" //red
        ];

        //return color based on depth --green for negative to low depth, red for high depth
        if (depth < 10) {
            return colors[0];
        } else if (depth < 30) {
            return colors[1];
        } else if (depth < 50) {
            return colors[2];
        } else if (depth < 70) {
            return colors[3];
        } else if (depth < 90) {
            return colors[4];
        } else {
            return colors[5];
        }
    }

    //call functions to be used
    let earthquakes = L.geoJSON(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Fetch tectonic plate data
    let tectonicPlateDataUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    d3.json(tectonicPlateDataUrl).then(function(tectonicData) {
        // Create a Leaflet GeoJSON layer for tectonic plates
        let tectonicPlates = L.geoJSON(tectonicData, {
            style: function(feature) {
                return { color: "orange", weight: 2 }; // Customize the style for tectonic plates
            }
        });

        // Pass the earthquake and tectonic plate data to function to create the map
        createMap(earthquakes, tectonicPlates);
    });
}

//function to create the map
function createMap(eqData, tectonicPlates) {

    //street layer
    let street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    //set grayscale layer
    let Jawg_Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        subdomains: 'abcd',
        accessToken: 'gAwlY5UWawCRhenF3ar88lWTxNvG5IwzIVkFf1cBZoRM45ksFAq2XoiCz8AIWM7K'
    });

    //set satellite layer
    var USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    //create overlays
    let overLayMaps = {
        Earthquakes: eqData,
        "Tectonic Plates": tectonicPlates // Add the tectonic plates overlay here
    };

    //define layers
    let baseMaps = {
        "Satelite" : USGS_USImagery,
        "Street": street,
        "Grayscale": Jawg_Dark
    };

    //define map and starting coordinates
    let myMap = L.map("map", {
        center: [0,0], 
        zoom: 3,
        layers: [USGS_USImagery, eqData, tectonicPlates]
    });

    //define control for layers and overlays
    L.control.layers(baseMaps, overLayMaps, {
        collapsed: false
    }).addTo(myMap);

    //creates the legend for the map
    let legend = L.control({ position: 'bottomright' }); //bottom right position
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'), //add div
            grades = [-10, 10, 30, 50, 70, 90], //define grades
            labels = ["-10-10 km", "10-30 km", "30-50 km", "50-70 km", "70-90 km", "90+ km"], //define labels
            colors = [
                "#1a9850", //green
                "#a6d96a",
                "#fee08b",
                "#fdae61",
                "#f46d43",
                "#d73027"
            ]; //define colors

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

}
