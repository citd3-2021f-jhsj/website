let map, heatmap;
var markers =  [];
var loc = "GLOBAL"; // GLOBAL or C5
var debug = false;
var c5overlay;

function initMap() {

  console.log("start init!")
  console.log(google)
  console.log("printed google!")
  map = new google.maps.Map(document.getElementById("map") , {
    // google.maps.MapOptions interface
    zoom: 21,
    maxZoom: 22,
    minZoom: 6,
    center: { lat: 36.01436, lng: 129.32573 },
    rotateControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
    mapId: "8127806e1dd5ef98",
    heading: 67,
  });
  setView("C5");

  //callUpdate();
  console.log('init done!');
}

function setView(ll) {

  if( ll == "C5") {

    loc = "C5"
    //geojson indoor map layer
    // map.data.loadGeoJson(
    //   "https://raw.githubusercontent.com/citd3-2021f-jhsj/dist/main/c5-1.geojson"
    // );
    // map.data.setStyle( function(feature) {
    //   // var isBkg = feature.getProperty("isBackground");
    //   // console.log(feature);
    //   // var zidx = isBkg == true ? 0 : 1;
    //   return {
    //     fillColor: "#EEEEEE",
    //     fillOpacity: 1.0,
    //   };
    // });

    setC5Map();

    return;
  }

  loc = "GLOBAL"
  map.data.forEach( f => map.data.remove(f) );

  map.setHeading(0);
  map.setZoom(17);
  map.setCenter({ lat: 36.01244, lng: 129.32384 });

  return;
}

function setC5Map() {
  const imageBounds = {
    north: 36.014791, // bigger
    south: 36.013860,
    east: 129.326302, // bigger
    west: 129.325173,
  };
  // const imageBounds = {
  //   north: 36.01144,
  //   south: 36.01280,
  //   east: 129.32284,
  //   west: 129.32480,
  // };
  c5overlay = new google.maps.GroundOverlay(
    "/assets/img/c5-tilt.png",    
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