var myApp = angular.module('plunker', ['ui.bootstrap']);
var forecast = [];

myApp.factory("GeolocationService", ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {
    return function () {
        var deferred = $q.defer();

        if (!$window.navigator) {
            $rootScope.$apply(function() {
                deferred.reject(new Error("Geolocation is not supported"));
            });
        } else {
            $window.navigator.geolocation.getCurrentPosition(function (position) {
                $rootScope.$apply(function() {
                    deferred.resolve(position);
                });
            }, function (error) {
                $rootScope.$apply(function() {
                    deferred.reject(error);
                });
            });
        }

        return deferred.promise;
    }
}]);

myApp.controller('sideContoller',function($scope,$http,GeolocationService,$rootScope){
GeolocationService().then(function(position){
  $http.get('http://api.openweathermap.org/data/2.5/find',{params:{lon:position.coords.longitude,lat:position.coords.latitude,cnt:'1'}}).then(function(res){
  $rootScope.cities=[];
  $rootScope.cities.push(res.data.list[0].name);
  $scope.cities=$rootScope.cities;
  $scope.selectedCity = $rootScope.cities[0];
  getForeCastData();

  });

});

var scope11 = angular.element(Sizzle('.sidebar li.list-group-item:first-child')[0]).scope();

//scope11.myStyle = {'background-color' : '#FFA500'};
$scope.hello1 = function(value){
Sizzle('.sidebar ul li:contains("'+this.city+'")')[0].style['background-color']='#FFA500';

}

$scope.hello2 = function(value){
Sizzle('.sidebar ul li:contains("'+this.city+'")')[0].style['background-color']='#FF8300';
Sizzle('.sidebar ul li:contains("'+$scope.selectedCity+'")')[0].style['background-color'] = '#FFA500'
}

$scope.hello = function(value){

 $scope.selectedCity = value;
var eles = Sizzle('.sidebar ul li');

 for(var i=0;i<eles.length;i++)
  {
    eles[i].style['background-color'] = '#FF8300';
 
 }
console.log('Sizzle is');
console.log(Sizzle('.sidebar ul li:contains("'+this.city+'")').length);
  Sizzle('.sidebar ul li:contains("'+this.city+'")')[0].style['background-color'] = '#FFA500';
 getForeCastData();

}

 getForeCastData = function(){
   
    $http.get('http://api.openweathermap.org/data/2.5/forecast/daily',

{ params:{q:$scope.selectedCity,cnt:14}}).then(function(res){
 
for(var i=0;i<res.data.list.length;i++)
  {var obj = {};
    obj[i] = res.data.list[i];
    forecast[i] = obj;
  }
  forecast = res.data.list;
  for(var i=0;i<forecast.length;i++)
{
 var dd= new Date(1970,0,1);
  dd.setSeconds(parseFloat(forecast[i].dt)); 
  var dd1 = dd.toDateString();
  var dd2 = dd1.split(' ');
forecast[i].date = dd2[1]+' '+dd2[2];

}

$rootScope.selectedDay = forecast[0];
$rootScope.forecasts = forecast;
console.log('forecasts are');
console.log($scope.forecasts);
});

}

/*$scope.clickListHandler = function(city){

  $scope.selectedCity = city ;

}
*/

$scope.class='glyphicon glyphicon-chevron-right';

$scope.myFunc = function(value){
 
  $scope.cities.push($scope.asyncSelected);
  $scope.addNew = false;
  $scope.asyncSelected = '';

};

$scope.clickHandler = function(){

  var flt = parseFloat(Sizzle('div.sidebar')[0].style.left);
  console.log(flt);

  if( flt > -1 )
  {   Sizzle('div.sidebar')[0].style.left = '-70px';
  $scope.class = 'glyphicon glyphicon-chevron-right';
  
  }

else{
  Sizzle('div.sidebar')[0].style.left = '0px';
  $scope.class = 'glyphicon glyphicon-chevron-left';

}

};

$scope.cities = [];
$scope.addNew = false;
$scope.showForm = function(){
//console.log('coming here');
$scope.addNew = true;

};

$scope.getLocation = function(val) {
    return $http.get('http://api.openweathermap.org/data/2.5/find', {
      params: {
       q: val,
       type:'like'
      }
    }).then(function(res){
      var addresses = [];
      if(res.data.list)
    { for(var i=0;i<res.data.list.length;i++)
      addresses.push(res.data.list[i].name)
    
  //    console.log(addresses);
    }
          return addresses;

  });

  };
});

myApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                  console.log('coming here also');
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});

myApp.directive('slideController',function(){
   return {
    restrict: 'EA',
    link:function (scope, ele, attrs, ctrl){
    var startCoor ,currCoor;
     
console.log(Sizzle('div#container-fluid ul'));
var mc = new Hammer(Sizzle('div#container-fluid ul')[0]);
var left = 0;
scope.releaseHandler = function(){
  console.log('releasing mouse');
};
var scope1 = angular.element(Sizzle('div#container-fluid li div')[0]).scope();
console.log(scope1);
if(scope1)
{
  scope1.zoom1 = '115%';
  scope1.$apply();

}

/*mc.on('panstart',function(event){
console.log('coming here panstart');
});
*/
mc.on('panend',function(event){
    var listItems = Sizzle('div#container-fluid li');
left = parseFloat(listItems[0].style.left);
 console.log('left is'+left);
if(left >0)
  left = 0;
if(left < 0)
 {console.log('coming in less');
  var var1 = Sizzle('div#container-fluid li')[0].offsetWidth;
var var2 = Sizzle('div#container-fluid')[0].offsetWidth +((-1) * left);
var totalslides = forecast.length;
var extraslides = totalslides - (var2/var1);
//console.log(extraslides);
if(extraslides <0)
{ 
  left = (-1)*((totalslides * var1) - Sizzle('div#container-fluid')[0].offsetWidth);

}

}

      for(var i=0;i<listItems.length;i++)
      {
       listItems[i].style.left =  left +'px';
      }


});

mc.on('pan',function(event){
      var listItems = Sizzle('div#container-fluid li');
//  console.log('calling pan event');
  
 var lm = Sizzle('div#container-fluid li div');
 
  for(var i=0;i< lm.length;i++)
  {  var scope = angular.element(lm[i]).scope();
  scope.zoom1 = '100%';
  scope.$apply();
  }

      for(var i=0;i<listItems.length;i++)
       { 
        if(event.srcEvent.type != 'mouseup')
         listItems[i].style.left = (event.deltaX + left) +'px' ;
 }
});
   
    }
   }

});


myApp.controller('TypeaheadCtrl',function($scope, $http,$rootScope,$interval) {
  
var stopId = $interval(function(){
var scope = angular.element(Sizzle('div#container-fluid li div')[0]).scope()
if(scope)
  {scope.zoom1 = '115%';
        $interval.cancel(stopId);

}
},500);

$scope.dummyFunc = function(eve){ 
var allli = Sizzle('div#container-fluid li');
for(var i=0;i<allli.length;i++)
 { var scope1 = angular.element(allli[i]).scope();
  scope1.zoom1 = '100%'; 
}
this.zoom1 = '115%';
$scope.prevSelDay = $rootScope.selectedDay;

$rootScope.selectedDay = eve;

};

$scope.dummyFunc1 = function(){
  console.log('coming here');

this.zoom1 = '100%';
$rootScope.selectedDay = $scope.prevSelDay;
}; 

 
});

myApp.directive('mapDirective',function($http)
{
  return {
    restrict: 'EA',
    link:function (scope, ele, attrs, ctrl){
      //console.log('side bar is');
      //console.log(angular.element(Sizzle("div.sidebar")[0]));
      var scope1 = angular.element(Sizzle("div.sidebar")[0]).scope();
      scope1.$watch('selectedCity',function(){

     // console.log(scope1);
     // console.log(scope1.selectedCity);

      var selectedCity = angular.element(Sizzle('div.sidebar')[0]).scope().selectedCity;
      $http.get('http://api.openweathermap.org/data/2.5/find',{params : {q:selectedCity,type:'like'}}).then(
    function(res){
  console.log('res is');
  console.log(res);
// console.log('Sizzle is');
console.log(Sizzle('.olForeignContainer').length)
//Sizzle('div#map')[0].innerHtml = '';
console.log(Sizzle('.olForeignContainer'));
   if(Sizzle('.olForeignContainer').length >0)
      {
     /*   var mapItems =Sizzle('.olForeignContainer');
        for(var i=0;i< mapItems.length;i++)
          Sizzle('div#map').remove(mapItems[i]);
*/
var myNode = Sizzle('div#map')[0];
//console.log('my node is');
//console.log(myNode);
while (myNode.firstChild) 
  myNode.removeChild(myNode.firstChild);


}
var map;

if(res.data.cod == '200')
{
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
        //center: new OpenLayers.LonLat(res.data[0].coord.lat,res.data[0].coord)
          center: new OpenLayers.LonLat(res.data.list[0].coord.lon,res.data.list[0].coord.lat)
            // Google.v3 uses web mercator as projection, so we have to
            // transform our coordinates
            .transform('EPSG:4326', 'EPSG:3857'),
        zoom: 5
    });

 var markers = new OpenLayers.Layer.Markers("Markers");
 
 var lonLat = new OpenLayers.LonLat( res.data.list[0].coord.lon ,res.data.list[0].coord.lat )
          .transform(
            new OpenLayers.Projection("EPSG:4326","EPSG:3857"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
          );

      map.addLayers([markers]);
      markers.addMarker(new OpenLayers.Marker(lonLat));

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
                     return "http://openweathermap.org/img/w/02d.png";
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
map.addLayers([stations]);

}

    });

      });
    }
}
});