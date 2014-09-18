var map;

function init() {
    map = new OpenLayers.Map('map', {
        projection: 'EPSG:3857',
        layers: [
            new OpenLayers.Layer.Google(
                "Google Physical",
                {type: google.maps.MapTypeId.TERRAIN}
            ),
            new OpenLayers.Layer.Google(
                "Google Streets", // the default
                {numZoomLevels: 20}
            ),
            new OpenLayers.Layer.Google(
                "Google Hybrid",
                {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
            ),
            new OpenLayers.Layer.Google(
                "Google Satellite",
                {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
            )
        ],
        center: new OpenLayers.LonLat(10.2, 48.9)
            // Google.v3 uses web mercator as projection, so we have to
            // transform our coordinates
            .transform('EPSG:4326', 'EPSG:3857'),
        zoom: 5
    });
    console.log('zoom level is');
    console.log(map.getZoom());
var StyleMap = new OpenLayers.Style({
            fontColor: "blue",
            fontSize: "20px",
            fontFamily: "Arial, Courier New",
            labelAlign: "lt",
            labelXOffset: "-15",
            labelYOffset: "-17",
            labelOutlineColor: "white",
            labelOutlineWidth: 3,
            externalGraphic: "${icon}",
            graphicWidth: 60,
                    label : "${myCustomLabel}"
            },
            {
            context: 
            {
                icon:  function(feature) {
                    if(!feature.attributes.station.clouds)
                    return "http://openweathermap.org/img/w/01d.png"

                    if(feature.attributes.station.clouds[0]== 'FEW')
                     return "http://openweathermap.org/img/w/02d.png ";
                    if(feature.attributes.station.clouds[0] == 'SCT')
                     return "http://openweathermap.org/img/w/04d.png";
                    if(feature.attributes.station.clouds[0] == 'OVC')
                    return "http://openweathermap.org/img/w/04d.png" ;
                    
return 'http://openweathermap.org/img/w/01d.png' ;

                },
                    myCustomLabel:  function(feature) {
                    
                        return Math.round(feature.attributes.station.main.temp-273.15) + 'c';
                    }
            }
            }

        );
    var stations = new OpenLayers.Layer.Vector.OWMStations("Stations", { styleMap: StyleMap });

  //var stations = new OpenLayers.Layer.Vector.OWMStations("Stations");

   map.addLayers([stations]);
  //  map.addControl(new OpenLayers.Control.LayerSwitcher());
    
    // add behavior to html
  /*  var animate = document.getElementById("animate");
    animate.onclick = function() {
        for (var i=map.layers.length-1; i>=0; --i) {
            map.layers[i].animationEnabled = this.checked;
        }
    }; */
}
