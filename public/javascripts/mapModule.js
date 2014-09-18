var myApp = angular.module('MapModule', []);
myApp.directive('mapDirective', function($http,$rootScope,$interval,$timeout) {
    return {
        restrict: 'EA',
        link: function(scope, ele, attrs, ctrl) {

            var sideScope = angular.element(Sizzle("div.sidebar")[0]).scope();
            var map = new OpenLayers.Map('map', {
                projection: 'EPSG:3857',
                layers: [
                    new OpenLayers.Layer.Google(
                        "Google Physical", {
                            type: google.maps.MapTypeId.TERRAIN
                        }
                    ),
                    new OpenLayers.Layer.Google(
                        "Google Streets", // the default
                        {
                            numZoomLevels: 20
                        }
                    ),
                    new OpenLayers.Layer.Google(
                        "Google Hybrid", {
                            type: google.maps.MapTypeId.HYBRID,
                            numZoomLevels: 20
                        }
                    ),
                    new OpenLayers.Layer.Google(
                        "Google Satellite", {
                            type: google.maps.MapTypeId.SATELLITE,
                            numZoomLevels: 22
                        }
                    )
                ],zoom : 10
            });

var StyleMap = new OpenLayers.Style({
                fontColor: "black",
                fontSize: "14px",
                fontFamily: "Arial, Courier New",
                labelAlign: "lt",
                labelXOffset: "-15",
                labelYOffset: "-17",
                labelOutlineColor: "white",
                labelOutlineWidth: 3,
                externalGraphic: "${icon}",
                graphicWidth: 60,
                label: "${myCustomLabel}"
            }, {
                context: {
                    icon: function(feature) {
                        //console.log(feature);
                        if (!feature.attributes.station.clouds)
                            return "http://openweathermap.org/img/w/01d.png";

                        if (feature.attributes.station.clouds[0].condition == 'FEW')
                            return "http://openweathermap.org/img/w/02d.png";
                        if (feature.attributes.station.clouds[0].condition == 'SCT')
                            return "http://openweathermap.org/img/w/04d.png";
                        if (feature.attributes.station.clouds[0].condition == 'OVC')
                            return "http://openweathermap.org/img/w/04d.png";
                        if(feature.attributes.station.clouds[0].condition == 'BKN')
                           return "http://openweathermap.org/img/w/04d.png";
//for CAVOK
                        return 'http://openweathermap.org/img/w/01d.png';

                    },
                    myCustomLabel: function(feature) {
                        return Math.round(feature.attributes.station.main.temp - 273.15) + 'c';
                    }
                }
            });

var stations = new OpenLayers.Layer.Vector.OWMStations("Stations",{styleMap :StyleMap});
            var markers = new OpenLayers.Layer.Markers("Markers");
            map.addLayers([stations,markers]); 

           sideScope.$watch('selectedCity', function() {
                               
                if (Sizzle('.olForeignContainer').length > 0) {
                    var myNode = Sizzle('div#map')[0];
                            while (myNode.firstChild)
                                myNode.removeChild(myNode.firstChild);
                        }
jQuery('div#map').append("<a class='glyphicon.glyphicon-fullscreen' style='position:absolute;left:0px;top:0px' href='#'></a>");
                var selectedCity = sideScope.selectedCity;
                zb = new OpenLayers.Control.ZoomBox(
                {title:"Zoom box: Selecting it you can zoom on an area by clicking and dragging."});
            function myFunction(){
                console.log('coming here');
            }
            var button = new OpenLayers.Control.Button({autoActivate: true,
    displayClass: "olControlButton", trigger: function(){console.log('coming here');
if(jQuery('.olControlButtonItemActive').hasClass('glyphicon-fullscreen'))
{jQuery('.olControlButtonItemActive').removeClass('glyphicon-fullscreen').addClass('glyphicon-resize-small');
jQuery('div#selectedDay').css('display','none');
jQuery('div#container-fluid').css('display','none');
jQuery('div#map').css('position','absolute');
jQuery('div#map').css('height','100%');
jQuery('div#map').css('width',(jQuery('div.container-fluid').width())-10);
}else {
    jQuery('div#selectedDay').css('display' , 'block');
$('div#container-fluid').css('display','block');
$('div#map').css('position','static');
$('div#map').css('height','256px');

    jQuery('.olControlButtonItemActive').removeClass('glyphicon-resize-small').addClass('glyphicon-fullscreen');

  }


$timeout(function(){
    console.log('update size is');
    console.log(map.updateSize());},1000);
}});
    var panel = new OpenLayers.Control.Panel({defaultControl:button});
panel.addControls([button]);
map.addControl(panel);
jQuery('.olControlButtonItemActive').addClass('glyphicon glyphicon-fullscreen');
markers.clearMarkers();    
                    
                            map.setCenter(new OpenLayers.LonLat(sideScope.selectedCity.lon, sideScope.selectedCity.lat)
                                // Google.v3 uses web mercator as p
                                .transform(
                                    new OpenLayers.Projection("EPSG:4326", "EPSG:3857"), // transform from WGS 1984
                                    map.getProjectionObject()
                                ), 5);

                            var lonLat = new OpenLayers.LonLat(sideScope.selectedCity.lon, sideScope.selectedCity.lat)
                                .transform(
                                    new OpenLayers.Projection("EPSG:4326", "EPSG:3857"), // transform from WGS 1984
                                    map.getProjectionObject() // to Spherical Mercator Projection
                                );

                            markers.addMarker(new OpenLayers.Marker(lonLat));
          

            }); 
        }
    }
}
);