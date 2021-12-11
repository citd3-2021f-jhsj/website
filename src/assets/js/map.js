// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

let map, heatmap;
var markers =  [];
var markerMap = {};
var loc = "GLOBAL"; // GLOBAL or C5
var debug = false;
var c5overlay;

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
  const imageBounds = {
    north: 36.014791, // bigger
    south: 36.013860,
    east: 129.326302, // bigger
    west: 129.325173,
  };

  c5overlay = new google.maps.GroundOverlay(
    "/assets/img/c5-tilt.png",    
    // "https://storage.googleapis.com/geo-devrel-public-buckets/newark_nj_1922-661x516.jpeg",
    imageBounds
  )

  
  setView("GLOBAL");





  callUpdate();

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
    document.getElementById("currentView").textContent = loc
    document.getElementById("currentView2").textContent = loc
    document.getElementById("currentFloor").textContent = 1
    document.getElementById('congest-table').style.visibility='visible';

    

    map.setHeading(67);
    map.setZoom(20);
    map.setCenter({ lat: 36.01436, lng: 129.32573 });

    setC5Map();
    return;
  }

  loc = "GLOBAL"
  map.data.forEach( f => map.data.remove(f) );

  document.getElementById("currentView").textContent = "Campus"
  document.getElementById("currentView2").textContent = "Campus"
  document.getElementById("totalPerson").textContent = "-"
  document.getElementById("currentFloor").textContent = "-"
  document.getElementById('congest-table').style.visibility='hidden';

  map.setHeading(0);
  map.setZoom(17);
  map.setCenter({ lat: 36.01244, lng: 129.32384 });

  c5overlay.setMap(null);

  return;
}

function setC5Map() {
  
  // const imageBounds = {
  //   north: 36.01144,
  //   south: 36.01280,
  //   east: 129.32284,
  //   west: 129.32480,
  // };
  
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
  //setInterval( testUpdatePoints, 1000) ;
  setInterval( updatePoints, 1000, );
}

var getPoints = new XMLHttpRequest();

function pingDB() {
  var ping = new XMLHttpRequest();
  queryStr = 'http://server1.jinhoko.com:30006/ping'
  console.log(queryStr)
  ping.open('GET', queryStr)
  ping.onload = function() {
    console.log(ping.responseType)
    console.log(ping.responseText)
  }
  ping.send()

}

function testUpdatePoints() {
  const labelPoint = new google.maps.Point(0, 3)
  pos = pos2coord([0,0])

  
  marker = new google.maps.Marker({
    position: { lat : pos[0], lng: pos[1]},
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'black',
      fillOpacity: 1.0,
      strokeColor: 'black',
      scale: 5,
      labelOrigin: labelPoint
    },
    map: map,
  });
  marker.setMap(null);

  marker = new google.maps.Marker({
    position: { lat : pos[0], lng: pos[1]},
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'black',
      fillOpacity: 1.0,
      strokeColor: 'black',
      scale: 5,
      labelOrigin: labelPoint
    },
    map: map,
  });



}

var prevMarkers = { };

function updatePoints() {

    // remove original points
    //removeAllMarkers();
    //pingDB();

    // check if C5
    if( loc != "C5" ) {
      var keys = Object.keys(prevMarkers);
      console.log(keys)
      console.log(prevMarkers)
      for(var i = 0 ; i < keys.length; i++) {
        prevMarkers[keys[i]].setMap(null);
      }
      return;
    }
    const labelPoint = new google.maps.Point(0, 3)
    lpArray = { 'B001': new google.maps.Point(2, 2),  'B002': new google.maps.Point(-2, -2),  'B003': new google.maps.Point(2, 2),  'B004': new google.maps.Point(-2, -2),  'B005': new google.maps.Point(2, 2),   }

    queryStr = 'http://server1.jinhoko.com:30006/query?db=sensor&q=select * from pos order by time desc limit 5' // TODO modify the query
    // https://archive.docs.influxdata.com/influxdb/v1.2/tools/api/#query-string-parameters
    console.log(queryStr)
    getPoints.open('GET', queryStr)
    var done = false;
    var data;

    getPoints.onload = function() {
      //console.log(getPoints.responseText)
      // TODO check if error
      done = true;
      data = getPoints.responseText;

      // async update
      const posData = JSON.parse(data);
      // console.log(posData['results'][0]['series'][0]['values'])
      arr = posData['results'][0]['series'][0]['values']

      document.getElementById("totalPerson").textContent = arr.length

      console.log(arr)
      for( var i = 0; i < arr.length; i++) {
        it = arr[i]
        //console.log(it)
        time = it[0] 
        n = it[1]
        p = it[2]
        x = it[3]
        y = it[4]

        pos = pos2coord([x,y])
        marker = new google.maps.Marker({
          position: { lat : pos[0], lng: pos[1]},
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: probToColor(p),
            fillOpacity: 1.0,
            strokeColor: 'black',
            strokeWeight: 3,
            scale: 8,
            labelOrigin: lpArray[n]
          },
          label: ( debug ? { text: n+ " | "+parseInt(p*100.0).toString()+"%" } : {}),
          map: map,
        });
        setTimeout( function(nn, mm) {
          // delete original marker
          if( prevMarkers[nn] != null ) {
            prevMarkers[nn].setMap(null)
          }
          // register this marker to prevMarker
          prevMarkers[nn] = mm
        }, 30,n,marker);
        // markers.push(marker)
      }
    }
    getPoints.send()
    
}

function probToColor(p) {
  return rgbToHex( Math.min(255,2*255*(p)), Math.min(255,2*255*(1.0-p)), 50 )
  // return rgbToHex( (1.0-p)*255 , p*255, 127  )
}

function rgbToHex ( r,g,b ){ 

  var rgb = [r.toString(),g.toString(),b.toString()]
  
  rgb.forEach(function (str, x, arr){ 
        
      str = parseInt( str, 10 ).toString( 16 ); 
      if ( str.length === 1 ) str = "0" + str; 
      
      arr[ x ] = str; 
  }); 
  
  return "#" + rgb.join( "" ); 
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
