// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

console.log("start maps javascript");

let map, heatmap;
var markers =  [];
var loc = "GLOBAL"; // GLOBAL or C5
var debug = false;
var c5overlay;

console.log("start maps javascript2");


function initMap() {

  console.log("start init!")
  console.log(google)
  console.log("printed google!")
  map = new google.maps.Map(document.getElementById("map") , {
    // google.maps.MapOptions interface
    zoom: 17,
    maxZoom: 22,
    minZoom: 6,
    center: { lat: 36.01244, lng: 129.32384 },
    rotateControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
    mapId: "8127806e1dd5ef98",
    heading: 0,
  });
  setView("GLOBAL");

  const buttons = [
    ["<", "rotate", 10, google.maps.ControlPosition.LEFT_CENTER],
    [">", "rotate", -10, google.maps.ControlPosition.RIGHT_CENTER],
  ];
  buttons.forEach(([text, mode, amount, position]) => {
    const controlDiv = document.createElement("div");
    const controlUI = document.createElement("button");

    controlUI.classList.add("ui-button");
    controlUI.innerText = `${text}`;
    controlUI.addEventListener("click", () => {
      adjustMap(mode, amount);
    });
    controlDiv.appendChild(controlUI);
    map.controls[position].push(controlDiv);
  });
  const adjustMap = function (mode, amount) {
    switch (mode) {
      case "rotate":
        map.setHeading(map.getHeading() + amount);
        break;
      default:
        break;
    }
  };

  callUpdate();
  console.log('init done!');
}

function setView(ll) {

  if( ll == "C5") {

    loc = "C5"
    //geojson indoor map layer
    map.data.loadGeoJson(
      "https://raw.githubusercontent.com/citd3-2021f-jhsj/dist/main/c5-1.geojson"
    );
    map.data.setStyle( function(feature) {
      // var isBkg = feature.getProperty("isBackground");
      // console.log(feature);
      // var zidx = isBkg == true ? 0 : 1;
      return {
        fillColor: "#FFFFFF",
        fillOpacity: 1.0,
      };
    });
    document.getElementById("currentView").textContent = loc
    document.getElementById("currentView2").textContent = loc
    document.getElementById("currentFloor").textContent = 1
    document.getElementById("totalPerson").textContent = 10

    //setC5Map();

    map.setHeading(67);
    map.setZoom(20);
    map.setCenter({ lat: 36.01436, lng: 129.32573 });
    return;
  }

  loc = "GLOBAL"
  map.data.forEach( f => map.data.remove(f) );

  document.getElementById("currentView").textContent = "Campus"
  document.getElementById("currentView2").textContent = "Campus"
  document.getElementById("totalPerson").textContent = "-"
  document.getElementById("currentFloor").textContent = "-"
  map.setHeading(0);
  map.setZoom(17);
  map.setCenter({ lat: 36.01244, lng: 129.32384 });

  return;
}

function setC5Map() {
  const imageBounds = {
    north: 36.01394, // bigger
    south: 36.01221,
    east: 129.32544, // bigger
    west: 129.322655,
  };
  // const imageBounds = {
  //   north: 36.01144,
  //   south: 36.01280,
  //   east: 129.32284,
  //   west: 129.32480,
  // };
  c5overlay = new google.maps.GroundOverlay(
    "https://raw.githubusercontent.com/citd3-2021f-jhsj/dist/main/test2.png",    
    // "https://storage.googleapis.com/geo-devrel-public-buckets/newark_nj_1922-661x516.jpeg",
    imageBounds
  )
  c5overlay.setMap(map)
  console.log(c5overlay.getBounds())

}

function toggleDebug() {
  debug = ~debug;
}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

function toggleHeatmap() {
  console.log("toggleheatmap!")
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  const gradient = [
    "rgba(0, 255, 255, 0)",
    "rgba(0, 255, 255, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(0, 127, 255, 1)",
    "rgba(0, 63, 255, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(0, 0, 223, 1)",
    "rgba(0, 0, 191, 1)",
    "rgba(0, 0, 159, 1)",
    "rgba(0, 0, 127, 1)",
    "rgba(63, 0 , 91, 1)",
    "rgba(127, 0, 63, 1)",
    "rgba(191, 0, 31, 1)",
    "rgba(255, 0, 0, 1)",
  ];

  heatmap.set("gradient", heatmap.get("gradient") ? null : gradient);
}

function changeRadius() {
  // heatmap.set("radius", heatmap.get("radius") ? null : 5);
}

function changeOpacity() {
  heatmap.set("opacity", heatmap.get("opacity") ? null : 0.8);
}

function pos2coord(pos) {
  // parse pos
  // angle 22, rotate clockwise
  // mult 10.7
  // https://i.stack.imgur.com/mAexq.jpg
  const bx = 36.014265; // 0
  const by = 129.325665;  // 0
  const sin = 0.374606;
  const cos = 0.921184;

  const ox = pos[0];
  const oy = 6.6 - pos[1];
  const x = cos*ox + sin*oy;
  const y = - sin*ox + cos*oy;

  return [ x*8.0/1000000.0 + bx , y*10.1/1000000.0 + by ];
}

function coord2pos(coord) {
  // parse coord
  // angle 22, rotate counterclock
  const bx = 36.014265; // 0
  const by = 129.325665;  // 0
  const c = [ coord[0] - bx, coord[1] - by]; 
  const sin = 0.374606;
  const cos = 0.921184;
  const x = cos*c[0] - sin*c[1];
  const y = - sin*c[0] + cos*c[1];
  return [ x/8.0*1000000, y/10.1*1000000];

}

async function callUpdate() {
  setInterval( updatePoints, 1000, );
}

function updatePoints() {
    console.log('update');

    // remove original points
    removeAllMarkers();

    // check if C5
    if( loc != "C5" ) {
      return;
    }

    // get data
    const pos = pos2coord([4.4,3.3])
    const pos2 = pos2coord([3.3,2.2])
    
    // add points
    const labelPoint = new google.maps.Point(0, 3)
    const marker = new google.maps.Marker({
      position: { lat : pos[0], lng: pos[1]},
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: 1.0,
        strokeColor: 'red',
        scale: 5,
        labelOrigin: labelPoint
      },
      label: ( debug ? { text: "B001 | .03" } : {}),
      map: map,
    });

    const marker2 = new google.maps.Marker({
      position: { lat : pos2[0], lng: pos2[1]},
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'green',
        fillOpacity: 1.0,
        strokeColor: 'green',
        scale: 5,
        labelOrigin: labelPoint
      },
      label: ( debug ? { text: "B002 | .03" } : {}),
      map: map,
    });

    markers.push(marker)
    markers.push(marker2)    
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function hideMarkers() {
  setMapOnAll(null);
}

function removeAllMarkers() { 
  hideMarkers();
  markers = [];
}


initMapOuter = initMap;
