var FIND_CITY_URL = 'http://api.openweathermap.org/data/2.5/find';
var myApp = angular.module('SideModule', ['ngAnimate',]);

myApp.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});


myApp.factory("GeolocationService", ['$q', '$window', '$rootScope',
    function($q, $window, $rootScope) {
        return function() {
            var deferred = $q.defer();

            if (!$window.navigator) {

                $rootScope.$apply(function() {
                    deferred.reject(new Error("Geolocation is not supported"));
                });

            } else {
                $window.navigator.geolocation.getCurrentPosition(function(position) {
                    $rootScope.$apply(function() {
                        deferred.resolve(position);
                    });
                }, function(error) {

                    $rootScope.$apply(function() {
                        deferred.reject(error);
                    });
                });
            }

            return deferred.promise;
        }
    }
]);

myApp.factory('AddDateService', function() {
    return function(res) {
        for (var i = 0; i < res.data.list.length; i++) {
            var iniDate = new Date(1970, 0, 1);
            iniDate.setSeconds(parseFloat(res.data.list[i].dt));
            var dateStr = iniDate.toDateString();
            var dateParts = dateStr.split(' ');
            res.data.list[i].date = dateParts[1] + ' ' + dateParts[2];

        }
        return res.data.list;
    }
});

myApp.factory('ConvertTempService',function(){
return function(res){
    console.log(res);
for(var i=0;i<res.length;i++)
{res[i].temp.min = parseInt(res[i].temp.min -273.15);  
res[i].temp.max =parseInt(res[i].temp.max -273.15);
res[i].temp.day = parseInt(res[i].temp.day -273.15);
res[i].temp.night = parseInt(res[i].temp.night -273.15);
res[i].temp.morn = parseInt(res[i].temp.morn -273.15);
res[i].temp.eve = parseInt(res[i].temp.eve - 273.15);
}
return res;
}
});

myApp.directive('sidebarHandler', ['$http'
    ,function($http) {
        return function(scope, element, attrs) {
            scope.cities = [];
            scope.selectedCity = {};
            
            var ulSidebar = Sizzle('.sidebar ul')[0];
jQuery('div.sidebar').perfectScrollbar({suppressScrollX : true});
            scope.hoverHandler = function() {
                var cityli = Sizzle('li[city-id = '+this.city.Id+']', ulSidebar)[0];
                cityli.style['background-color'] = '#FFA500';
                Sizzle('a.glyphicon-remove-sign', cityli)[0].style.visibility = 'visible';

            };

            scope.leaveHandler = function() {
               
                var cityli = Sizzle('li[city-id='+this.city.Id+']', ulSidebar)[0];
                cityli.style['background-color'] = '#FF8300';
                Sizzle('li[city-id='+this.selectedCity.Id+']', ulSidebar)[0].style['background-color'] = '#FFA500';
                Sizzle('a.glyphicon-remove-sign', cityli)[0].style.visibility = 'hidden';

            }

            scope.clickHandler1 = function() {

                var flt = parseInt(Sizzle('div.sidebar')[0].style.left);

                if (flt > -1) {
                    Sizzle('div.sidebar')[0].style.left = '-70px';
                    scope.class = 'glyphicon glyphicon-chevron-right';

                } else {
                    Sizzle('div.sidebar')[0].style.left = '0px';
                    scope.class = 'glyphicon glyphicon-chevron-left';
                }

            };

            scope.showSidebar = function() {
                
                return (scope.locRes && scope.isSidebar);

            }

            scope.showMessage = function() {
                return (scope.locRes && scope.isMessage);

            }

            scope.clickPlus = function() {
                Sizzle('a.glyphicon-plus')[0].style.display = 'none';
                Sizzle('span#addLabel')[0].style.display = 'none';
                Sizzle('input#locInput')[0].style.display = 'inline';
                Sizzle('a.glyphicon-remove')[0].style.display = 'inline';
            }

        }

    }
]);

myApp.controller('manageCitiesCont', ['$rootScope', '$scope', 'GeolocationService', '$http',
    'AddDateService', '$timeout', 'ConvertTempService',
    function($rootScope, $scope, GeolocationService, $http, addDate, $timeout,convertTemp) {
        GeolocationService().then(function(position) {

            var params = {
                lon: position.coords.longitude,
                lat: position.coords.latitude,
                cnt: '1'
            };

            $http.get(FIND_CITY_URL, {
                params: params
            }).then(function(res) {
                var city = {};
                city.city = res.data.list[0].name;
                city.lat = res.data.list[0].coord.lat;
                city.lon = res.data.list[0].coord.lon;
                city.Id = res.data.list[0].id;
                $scope.cities.push(city);
                $scope.$parent.selectedCity = $scope.cities[0];
                $rootScope.timeout = true;
                $rootScope.fCityAdded = true;
                $rootScope.locRes = true;
                $rootScope.isSidebar = true;
                $rootScope.isMessage = false;
                Sizzle('div.sidebar')[0].style['z-index'] = 10000;
                Sizzle('div#map')[0].style.visibility = 'visible';
                getForecastData($scope.selectedCity);

            });

        }, function(reason) {

            var divScope = angular.element(Sizzle('div.sample-show-hide')[0]).scope();
            $rootScope.locRes = true;
            $rootScope.isSidebar = false;
            $rootScope.isMessage = true;
            if ((typeof reason).toUpperCase() == 'OBJECT')
                divScope.errMsg = reason.message;
            else divScope.errMsg = reason;

            $timeout(function() {

                $rootScope.$apply(function() {
                    $rootScope.isMessage = false;
                    $rootScope.isSidebar = true;
                    Sizzle('div.sidebar')[0].style['z-index'] = 10000;

                });


            }, 2000);
        });

        $scope.addCity = function(context) {
            console.log('context is');
//console.log(context)
var newCity = Sizzle('input#locInput')[0].value;
            var city = {};
            var cityPresent = false;
/*console.log('new city is')
console.log($scope.newCity);
console.log($scope.cities); */
            var cityPushed = false;
            if ($scope.selection)
                if (newCity == $scope.selection.name) {
                    city.Id = $scope.selection.id;
                    cityPushed = true;
                    cityPresent = true;
                    if (checkForDuplicate(city)) {
                        city.city = newCity;
                        city.lat = $scope.selection.coord.lat;
                        city.lon = $scope.selection.coord.lon;
                        $scope.cities.push(city);
                        if ($scope.cities.length == 1) {
                            $scope.$parent.selectedCity = $scope.cities[0];
                            $rootScope.fCityAdded = true;
                            getForecastData($scope.selectedCity);
                            Sizzle("#map")[0].style.visibility = 'visible';
                        }
                    } else $scope.message = 'Location already in the list';

                }

            if (!cityPushed)
                for (var i = 0; i < $scope.addresses.length; i++) { 

                    if ($scope.addresses[i].name == newCity) {
                        cityPresent = true;
                        city.Id = $scope.addresses[i].id;

                        if (checkForDuplicate(city)) {

                            city.city = newCity;
                            city.lat = $scope.addresses[i].coord.lat;
                            city.lon = $scope.addresses[i].coord.lon;
                            $scope.cities.push(city);
                            if ($scope.cities.length == 1) {
                                $scope.$parent.selectedCity = $scope.cities[0];
                                $rootScope.fCityAdded = true;
                                getForecastData($scope.selectedCity);
                                Sizzle("#map")[0].style.visibility = 'visible';
                            }
                        } else {
                            $scope.message = 'Location already in the list';
                        }

                        break;
                    }

                }
            if (!cityPresent) {
                $scope.message = 'Location Not available';

            }


            if (!city.city)
                Sizzle('span#notAvail')[0].style.display = 'inline';
            else {
                Sizzle('input#locInput')[0].value = '';
                Sizzle('input#locInput')[0].style.display = 'none';
                Sizzle('a.glyphicon-plus')[0].style.display = 'inline';
                Sizzle('span#addLabel')[0].style.display = 'inline';
                Sizzle('span#notAvail')[0].style.display = 'none';
                Sizzle('a.glyphicon-remove')[0].style.display = 'none';
            }

//jQuery('div.sidebar').perfectScrollbar();

        };
        $scope.removeInput = function() {
            Sizzle('input#locInput')[0].style.display = 'none';
            Sizzle('a.glyphicon-remove')[0].style.display = 'none';
            Sizzle('a.glyphicon-plus')[0].style.display = 'inline';
            Sizzle('span#notAvail')[0].style.display = 'none';
            Sizzle('span#addLabel')[0].style.display = 'inline';
        }


        $scope.getLocations = function(val) {
            return $http.get(FIND_CITY_URL, {
                params: {
                    q: val,
                    type: 'like'
                }
            }).then(function(res) {

                    if (res.data.list)
                        $scope.addresses = res.data.list;
                    else $scope.addresses = [];

/*if($scope.addresses.length >0)
    $timeout(function(){
        console.log('coming in timeout');
},1500); */
            console.log('addresses are');
            console.log($scope.addresses);
                    return $scope.addresses;
                }
            );
        };

        function checkForDuplicate(city) {

            for (var i = 0; i < $scope.cities.length; i++) {
                if ($scope.cities[i].Id == city.Id) {
                    return false;

                }
            }
            return true;
        }

        $scope.crossHandler = function() {

            for (var i = 0; i < $scope.cities.length; i++)
                if ($scope.cities[i] == this.city)
                    $scope.cities.splice(i, 1);
        };

        $scope.clickHandler = function() {
           
            var ulSidebar = Sizzle('.sidebar ul')[0];
            Sizzle('li[city-id = '+$scope.selectedCity.Id+']', ulSidebar)[0].style['background-color'] = '#FF8300';
            var currCity = this.city;
  $scope.$parent.selectedCity = currCity;
         
getForecastData(currCity);
Sizzle('li[city-id='+currCity.Id+'])', ulSidebar)[0].style['background-color'] = '#FFA500';

        };

        $scope.selectionFunc = function(item) {
            $scope.selection = item;

        }


        function getForecastData(city) {
            var fScope = angular.element(Sizzle('div#selectedDay')[0]).scope();
            if (!fScope.forecasts)
                fScope.forecasts = [];

            var FORECAST_URL = 'http://api.openweathermap.org/data/2.5/forecast/daily';

            $http.get(FORECAST_URL, {
                params: {
                    id: city.Id,
                    cnt: '14'
                }
            }).then(function(res) {
                //console.log('res is');
                //console.log(res);
                fScope.forecasts = addDate(res);
                fScope.forecasts = convertTemp(fScope.forecasts);
                fScope.selectedDay = fScope.forecasts[0];
            fScope.selectedDay1 = fScope.forecasts[0]; 

            });
        }


    }

]);