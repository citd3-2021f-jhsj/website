let map, heatmap;
var markers =  [];
var loc = "GLOBAL"; // GLOBAL or C5
var debug = false;
var c5overlay;
var timeData = {};

var curPbar = 0;

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

  prepareData(0);
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

function setPbar(val) {
  curPbar = val;
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

function sliderChange(val) {
  // val from 0 to 100

  removeAllMarkers();
  console.log("sliderchange!")

  if( val >= 40 ) {
    document.getElementById("totalPerson").textContent = 2
  } else {
    document.getElementById("totalPerson").textContent = 3
  }

  // query pos data from prev queried data
  arr = timeData[val]
  donebeacon = {}
  tsUpdated = false;
  for( var i = 0; i < arr.length; i++) {
      
      it = arr[i]
      //console.log(it)
      time = it[0] 
      n = it[1]
      p = it[2]
      x = it[3]
      y = it[4]

      // if in donebeacon pass
      if( donebeacon[n] ) { continue; }
      // pass beacon4, 5
      if( n == 'B004' || n == 'B005') {continue;}
      // from sval 43 pass 2
      if( val>=40 && n == 'B002' ) { continue; }

      // update timestamp if not updated
      if(!tsUpdated) {
        document.getElementById("timeStamp").textContent = time.substr(0,19)
        
        tsUpdated = true
      }
      // markers
      lpArray = { 'B001': new google.maps.Point(0,0),  'B002': new google.maps.Point(-2, -2),  'B003': new google.maps.Point(2, 2),  'B004': new google.maps.Point(-2, -2),  'B005': new google.maps.Point(2, 2),   }
      pos = pos2coord([x,y])
      var ic; var lb;
      if( n == 'B001') {
        lb = null
        ic = "/assets/img/warning2.png"
      }
      else {
        ic = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: probToColor(p),
          fillOpacity: 1.0,
          strokeColor: 'black',
          strokeWeight: 3,
          scale: 8,
          labelOrigin: lpArray[n]
        }
        lb = ( debug ? { text: n+ " | "+parseInt(p*100.0).toString()+"%" } : {})
      }

        marker = new google.maps.Marker({
          position: { lat : pos[0], lng: pos[1]},
          icon: ic,
          label: lb,
          map: map,
        });
        // TODO if n is infection different marker
      
      // append to donemarker
      donebeacon[n] = true
      
      if( n == 'B001' ) {

      } else if (n == 'B002') {
        prob = parseInt(p*100.0)
        if( prob >= 30 ) {
          document.getElementById("close-b002prob").textContent = parseInt(p*100.0).toString()+"%"
          document.getElementById("close-b002").textContent = "B002"
          document.getElementById("button2").style = "visibility:visible"

          document.getElementById("low-b002").textContent = ""
          document.getElementById("low-b002prob").textContent = ""

        } else {
          document.getElementById("low-b002").textContent = "B002"
          document.getElementById("low-b002prob").textContent = parseInt(p*100.0).toString()+"%"
          document.getElementById("button2").style = "visibility:hidden"

          document.getElementById("close-b002prob").textContent = ""
          document.getElementById("close-b002").textContent = ""
        }

      } else { // b003
        document.getElementById("low-b003prob").textContent = parseInt(p*100.0).toString()+"%"
      }

      // append to markers
      markers.push(marker)

  }

}


function getTimestamp(sliderVal) {

  return 1638923072 + parseInt( (1638923327-1638923072)*sliderVal/100.0  )

}

var getPoints = new XMLHttpRequest();

function prepareData(sval) {
  if(sval == 101) {
    console.log(timeData)
    return;
  }
  t = getTimestamp(sval)
  queryStr = 'http://server1.jinhoko.com:30006/query?db=sensor&q=select * from pos where time>' + (t-2)+ '000000000 and time<=' + t+'000000000 order by time desc'
  console.log(queryStr)
  getPoints.open('GET', queryStr)
  getPoints.onload = function() {

    // parse data
    data = getPoints.responseText;
    
    console.log(sval, data)
    
    posData = JSON.parse(data);
    arr = posData['results'][0]['series'][0]['values']

    // save
    timeData[sval] = arr
    // call next
    prepareData(sval+1)
  }
  getPoints.send()

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
