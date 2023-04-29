// use D3 to extract earthquake information from json url
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

//overlays
var earthquakeLayer = new L.layerGroup();
var overlays = {
    Earthquakes: earthquakeLayer
}

// tile layer
var geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
})

// base layers
var baseLayers = {
    Outdoor: geoLayer
} 


// map object
var myMap = L.map("map", {
    center: [37.6000, -95.6650],
    zoom: 5, 
    // Display on load
    layers: [geoLayer, earthquakeLayer]
});


// defining colors
function getColor(depth) {
    return depth >= 90 ? "#FF0000" :
        depth < 90 && depth >= 70 ? "#EE7419" :
        depth < 70 && depth >= 50 ? "#FFB833" :
        depth < 50 && depth >= 30 ? "#FFD433" :
        depth < 30 && depth >= 10 ? "#BEFF33" :
                                    "#8DFF33";
}

// leaflet circles
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

// popup info
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}


d3.json(url).then((data) => {
    var features = data.features;
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Depth:<br></strong>'];
        grades = [-10, 10, 30, 50, 70, 90];
        div.innerHTML = labels.join('<br>');
    
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        
        return div;
    };
    legend.addTo(myMap);
});