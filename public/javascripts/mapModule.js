var myApp = angular.module('MapModule', []);
/*
directive for creating map and handling map
*/
myApp.directive('mapDirective', function($http, $rootScope, $interval, $timeout) {
    return {
        restrict: 'A',
        link: function(scope, ele, attrs, ctrl) {

            var sideScope = angular.element($("div.sidebar")[0]).scope();
            //creating openlayer map
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
                ],
                zoom: 10
            });
            // style for weather station layer map
            var styleMap = new OpenLayers.Style({
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
                        /*for creating icon to represent weather condition reported by weather station.
                        here is a little immaturity in apis.in condition they are not giving numeric number instead providing 
                        a short notation in English alphabet.which word refer to which condition i didn't fund in apis docs
                        because its a sample app thats why i am providing icons for normal weather conditions.but temp is
                        correct icon may be or may not be correct.
                        */
                        if (!feature.attributes.station.clouds)
                            return "http://openweathermap.org/img/w/01d.png";

                        if (feature.attributes.station.clouds[0].condition == 'FEW')
                            return "http://openweathermap.org/img/w/02d.png";
                        if (feature.attributes.station.clouds[0].condition == 'SCT')
                            return "http://openweathermap.org/img/w/04d.png";
                        if (feature.attributes.station.clouds[0].condition == 'OVC')
                            return "http://openweathermap.org/img/w/04d.png";
                        if (feature.attributes.station.clouds[0].condition == 'BKN')
                            return "http://openweathermap.org/img/w/04d.png";
                        //for CAVOK
                        return 'http://openweathermap.org/img/w/01d.png';

                    },
                    myCustomLabel: function(feature) {
                        return parseInt(feature.attributes.station.main.temp - 273.15) + 'c';
                    }
                }
            });
            //creating weather stations layer
            var stations = new OpenLayers.Layer.Vector.OWMStations("Stations", {
                styleMap: styleMap
            });
            //adding marker layer
            var markers = new OpenLayers.Layer.Markers("Markers");
            map.addLayers([stations, markers]);
            var e = angular.element($('div#map')[0]);
            scope.$watch(function() {
                return e.height();
            }, function() {
                map.updateSize();
            });

            sideScope.$watch('selectedCity', function() {

                if ($('.olForeignContainer').length > 0) {
                    var myNode = $('div#map')[0];
                    //removing previous map and adding new 
                    while (myNode.firstChild)
                        myNode.removeChild(myNode.firstChild);
                }

                $('div#map').append("<a class='glyphicon.glyphicon-fullscreen' href='#'></a>");

                var selectedCity = sideScope.selectedCity;
                //button for making screen full screen and revert back;
                var button = new OpenLayers.Control.Button({
                    autoActivate: true,
                    displayClass: "olControlButton",
                    trigger: function() {
                        if ($('.olControlButtonItemActive').hasClass('glyphicon-fullscreen')) {
                            $('.olControlButtonItemActive').removeClass('glyphicon-fullscreen').addClass('glyphicon-resize-small');
                            $('div#map').css('position', 'absolute');
                            $('div#map').css('height', '100%');
                            if ($(window).width() > 768)
                                $('div#map').css('left', '200px');
                            else $('div#map').css('left', '0px');
                            $('div#map').css('top', '0px');
                            var width = $('div#container').width();
                            $('div#map').width(width);
                        } else {
                            $('div#map').css('position', 'static');
                            $('div#map').css('height', '250px');
                            $('div#map').css('width', '100%');

                            $('.olControlButtonItemActive').removeClass('glyphicon-resize-small').addClass('glyphicon-fullscreen');

                        }


                        $timeout(function() {
                            map.updateSize();

                        }, 1000);
                    }
                });

                var panel = new OpenLayers.Control.Panel({
                    defaultControl: button
                });

                panel.addControls([button]);
                map.addControl(panel);

                $('.olControlButtonItemActive').addClass('glyphicon glyphicon-fullscreen');
                markers.clearMarkers();
                //set center of map
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
});