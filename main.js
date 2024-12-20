//initialize
let map = L.map("map", {
  center: [-2.4465, 40.6997],
  zoom: 18,
});
let lakeAmu_boundary;
let landUse2023;
let land_parcels;
let proposed_landUse;
let proposed_roads;

// add base maps
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy: OpenStreetMap",
}).addTo(map);

let esriImagery = L.tileLayer(
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: `Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, 
      IGN, IGP, UPR-EGP, and the GIS User Community`,
  }
);

let baseMaps = {
  OpenStreetMap: osm,
  "ESRI World Imagery": esriImagery,
};

// styles
let proposed_landUseStyles = (feature) => {
  let styles = {
    Commercial: { color: "#232323", fillColor: "#f1130c", fillOpacity: 0.5 },
    Educational: { color: "#232323", fillColor: "#ff7e09", fillOpacity: 0.5 },
    Industrial: { color: "#232323", fillColor: "#110ef7", fillOpacity: 0.5 },
    MixedUse: { color: "#232323", fillColor: "#e16817", fillOpacity: 0.5 },
    Recreational: { color: "#232323", fillColor: "#11f009", fillOpacity: 0.5 },
    Residential: { color: "#232323", fillColor: "#c7450c", fillOpacity: 0.5 },
    Transportation: {
      color: "#232323",
      fillColor: "#b3b2a8",
      fillOpacity: 0.5,
    },
    PublicUtility: { color: "#232323", fillColor: "#4cc2d0", fillOpacity: 0.5 },
    PublicPurpose: { color: "#232323", fillColor: "#fdfb27", fillOpacity: 0.5 },
    Default: { color: "#232323", fillColor: "#f0f0f0", fillOpacity: 0.3 },
  };
  return styles[feature.properties.LAND_USE] || styles.Default;
};
let existing_landUse2023Styles = (feature) => {
  let styles = {
    Commercial: { color: "#232323", fillColor: "#f1130c", fillOpacity: 0.5 },
    Underdeveloped: {
      color: "#232323",
      fillColor: "#666560",
      fillOpacity: 0.5,
    },
    Agricultural: { color: "#232323", fillColor: "#4e780e", fillOpacity: 0.5 },
    Residential: { color: "#232323", fillColor: "#c7450c", fillOpacity: 0.5 },
    Transport: {
      color: "#232323",
      fillColor: "#b3b2a8",
      fillOpacity: 0.5,
    },
    PublicPurpose: { color: "#232323", fillColor: "#fdfb27", fillOpacity: 0.5 },
    Default: { color: "#232323", fillColor: "#f0f0f0", fillOpacity: 0.3 },
  };
  return styles[feature.properties.land_use] || styles.Default;
};
let lakeAmu_boundaryStyle = (feature) => {
  return { color: "#232323", fillOpacity: 0 };
};

Promise.all([
  fetch("data/lakeAmu_boundary.geojson").then((response) => {
    return response.json();
  }),
  fetch("data/existing_landUse2023.geojson").then((response) => {
    return response.json();
  }),
  fetch("data/land_parcels.geojson").then((response) => {
    return response.json();
  }),
  fetch("data/proposed_landUse.geojson").then((response) => {
    return response.json();
  }),
  fetch("data/proposed_roads.geojson").then((response) => {
    return response.json();
  }),
])
  .then((data) => {
    console.log(data);
    lakeAmu_boundary = L.geoJSON(data[0], {
      style: lakeAmu_boundaryStyle,
    }).addTo(map);
    landUse2023 = L.geoJSON(data[1], {
      style: existing_landUse2023Styles,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div>
          <b>Land Use:</b>  ${feature.properties.land_use} <br />
          </div>
        `);
      },
    });
    land_parcels = L.geoJSON(data[2]);
    proposed_landUse = L.geoJSON(data[3], {
      style: proposed_landUseStyles,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div>
          <b>Land Use:</b>  ${feature.properties.LAND_USE} <br />
          <b>Area:</b>  ${feature.properties.Area_HA.toFixed(3)} Ha
          </div>
        `);
      },
    }).addTo(map);
    proposed_roads = L.geoJSON(data[4]);

    let overlays = {
      "Lake Amu Boundary": lakeAmu_boundary,
      "Exisiting Land Use 2023": landUse2023,
      "Land Parcels": land_parcels,
      "Proposed Land Use": proposed_landUse,
      "Proposed Roads": proposed_roads,
    };

    //add a layer control button to the map
    L.control.layers(baseMaps, overlays).addTo(map);
  })
  .catch((err) => console.error(err));

// map elements
// Title
let titleControl = L.control({ position: "topleft" });
titleControl.onAdd = function () {
  const div = L.DomUtil.create("div", "map-title");
  div.innerHTML = "<h1>Lake Amu Proposed Land Use Development Plan</h1>";
  return div;
};
titleControl.addTo(map);
// map legend
let legend = L.control({
  position: "bottomleft",
});
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  const categories = {
    Commercial: "#f1130c",
    Educational: "#ff7e09",
    Industrial: "#110ef7",
    MixedUse: "#e16817",
    Recreational: "#11f009",
    Residential: "#c7450c",
    Transportation: "#b3b2a8",
    "Public Utility": "#4cc2d0",
    "Public Purpose": "#fdfb27",
    Underdeveloped: "#666560",
    Agricultural: "#4e780e",
  };
  div.innerHTML = "<h4>Land Use Classes</h4>";
  for (let [category, color] of Object.entries(categories)) {
    div.innerHTML += `
      <i style="background:${color}; border:1px solid #232323;"></i> ${category}<br>
    `;
  }
  return div;
};
legend.addTo(map);
// map description
let description = L.control({
  position: "bottomright",
});
description.onAdd = function () {
  let div = L.DomUtil.create("div", "description");
  div.innerHTML =
    "<p><b>Lake Amu Proposed Land Use Development Plan</b></p><hr>" +
    "<p>This map shows a project which was aimed at designing a Land Use Development Plan for Lake Amu Trading Centre in Bahari Ward</p>" +
    "It compromises of the following layers: <br />" +
    "<p><ul>" +
    "<li>Lake Amu Trading Centre Boundary</li>" +
    "<li>Existing Land Use as of 2023</li>" +
    "<li>Land Parcels within the trading centre</li>" +
    "<li>Proposed Land Use</li>" +
    "<li>Proposed Roads</li>" +
    "</ul></p>" +
    '<img src="images/leaflet.png">';

  return div;
};
description.addTo(map);
