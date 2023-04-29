// use D3 to extract earthquake information from json url
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Adding overlays
var earthquakeLayer = new L.layerGroup();
var overlays = {
    Earthquakes: earthquakeLayer
}

// Adding the tile layer
var geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
})

// base layers
var baseLayers = {
    Outdoor: geoLayer
} 


// Creating the map object
var myMap = L.map("map", {
    center: [37.6000, -95.6650],
    zoom: 5, 
    // Display on load
    layers: [geoLayer, earthquakeLayer]
});


// Getting the colors for the circles and legend based on depth
function getColor(depth) {
    return depth >= 90 ? "#FF0000" :
        depth < 90 && depth >= 70 ? "#EE7419" :
        depth < 70 && depth >= 50 ? "#FFB833" :
        depth < 50 && depth >= 30 ? "#FFD433" :
        depth < 30 && depth >= 10 ? "#BEFF33" :
                                    "#8DFF33";
}

// Drawing the circles
function drawCircle(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
            fillOpacity: 1,
            color: 'black',
            weight: 0.5,
            fillColor: getColor(depth),
            radius: mag * 20000
    })
}

// Displaying info when the feature is clicked
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}


d3.json(url).then((data) => {
    var features = data.features;
     // Creating a GeoJSON layer with the retrieved data
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // Setting up the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Depth:<br></strong>'];
        grades = [-10, 10, 30, 50, 70, 90];
        div.innerHTML = labels.join('<br>');
        // Looping through our intervals and generating a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        
        return div;
    };
    legend.addTo(myMap);
});