var FIND_CITY_URL = 'http://api.openweathermap.org/data/2.5/find';
var myApp = angular.module('SideModule', ['ngAnimate']);

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
                },{ enableHighAccuracy: true });
            }

            return deferred.promise;
        }
    }
]);


myApp.factory('ProcessResponseService',function(){
    return function(res){
        for (var i = 0; i < res.data.list.length; i++) {
            res.data.list[i].temp.min = parseInt(res.data.list[i].temp.min - 273.15);
            res.data.list[i].temp.max = parseInt(res.data.list[i].temp.max - 273.15);
            res[i].temp.day = parseInt(res.data.list[i].temp.day - 273.15);
            res[i].temp.night = parseInt(res.data.list[i].temp.night - 273.15);
            res[i].temp.morn = parseInt(res.data.list[i].temp.morn - 273.15);
            res[i].temp.eve = parseInt(res.data.list[i].temp.eve - 273.15);
        var iniDate = new Date(1970, 0, 1);
            iniDate.setSeconds(parseFloat(res.data.list[i].dt));
            var dateStr = iniDate.toDateString();
            var dateParts = dateStr.split(' ');
            res.data.list[i].date = dateParts[1] + ' ' + dateParts[2];

        }
    }
});

myApp.directive('sidebarHandler', ['$http',
    function($http) {
        return function(scope, element, attrs) {
            
            scope.cities = [];
            scope.selectedCity = {};
            var ulSidebar = $('.sidebar ul');
            
            $('div.sidebar').perfectScrollbar({
                suppressScrollX: true
            });

            scope.clickHandler1 = function() {
                var flt = parseInt($('div.sidebar').css('left'));

                if (flt > -1) {
                    $('div.sidebar').css('left', '-70px');
                    scope.class = 'glyphicon glyphicon-chevron-right';

                } else {
                    $('div.sidebar').css('left', '0px');
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
                $('a.glyphicon-plus').css('display', 'none');
                $('span#addLabel').css('display', 'none');
                $('input#locInput').css('display', 'inline');
                $('a.glyphicon-remove').css('display', 'inline');
            
            };

        }

    }
]);

myApp.controller('manageCitiesCont', ['$rootScope', '$scope', 'GeolocationService', '$http',
     '$timeout', 'ProcessResponseService',
    function($rootScope, $scope, GeolocationService, $http, $timeout, processRes) {
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
                $rootScope.locRes = true;
                $rootScope.isSidebar = true;
                $rootScope.isMessage = false;
                $('div#map').css('visibility', 'visible');
                getForecastData($scope.selectedCity);

            });
        }, function(reason) {

            var divScope = angular.element($('div.sample-show-hide')[0]).scope();
            $rootScope.locRes = true;
            $rootScope.isMessage = true;
            if ((typeof reason).toUpperCase() == 'OBJECT')
                divScope.errMsg = reason.message;
            else divScope.errMsg = reason;

            $timeout(function() {
                    $rootScope.isMessage = false;
                    $rootScope.isSidebar = true;
            
            }, 2000);
        });

        $scope.addCity = function(context) {

            var newCity = $('input#locInput').val();
            var city = {};
        
            var cityPresent = false;
            if ($scope.selection)
                if (newCity == $scope.selection.name) {
                    city.Id = $scope.selection.id;
                    cityPresent = true;
                  city = checkAndInsertCity(city)                
                }

            if (!cityPresent)
                for (var i = 0; i < $scope.addresses.length; i++) {
                    if ($scope.addresses[i].name == newCity) {
                        city.Id = $scope.addresses[i].id;
                        city = checkAndInsertCity(city);
                        break;
                    }
                }

            if (!cityPresent) {
                $scope.message = 'Location Not available';
            }

            if (!city.city)
                $('span#notAvail').css('display', 'inline');
            else {
                $('input#locInput').val('');
                $('input#locInput').css('display', 'none');
                $('a.glyphicon-plus').css('display', 'inline');
                $('span#addLabel').css('display', 'inline');
                $('span#notAvail').css('display', 'none');
                $('a.glyphicon-remove').css('display', 'none');
            }
        
        };

function checkAndInsertCity(city){
    if (checkForDuplicate(city)) {
                        city.city = newCity;
                        city.lat = $scope.selection.coord.lat;
                        city.lon = $scope.selection.coord.lon;
                        $scope.cities.push(city);
                        if ($scope.cities.length == 1) {
                            $scope.$parent.selectedCity = $scope.cities[0];
                            getForecastData($scope.selectedCity);
                            $("div#map").css('visibility', 'visible');
                        }
                    } else $scope.message = 'Location already in the list';
return city;

}


function checkForDuplicate(city) {
            for (var i = 0; i < $scope.cities.length; i++) {
                if ($scope.cities[i].Id == city.Id) {
                    return false;

                }
            }
            return true;
        }


        $scope.removeInput = function() {
            $('input#locInput').css('display', 'none');
            $('a.glyphicon-remove').css('display', 'none');
            $('a.glyphicon-plus').css('display', 'inline');
            $('span#notAvail').css('display', 'none');
            $('span#addLabel').css('display', 'inline');
        
        };

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
                return $scope.addresses;

            });
        };

        
        $scope.crossHandler = function() {
            for (var i = 0; i < $scope.cities.length; i++)
                if ($scope.cities[i] == this.city)
                    $scope.cities.splice(i, 1);
        };

        $scope.clickHandler = function() {
            var ulSidebar = $('.sidebar ul');
            $('li[city-id = ' + $scope.selectedCity.Id + ']', ulSidebar).css('background-color', '#FF8300');
            var currCity = this.city;
            $scope.$parent.selectedCity = currCity;

            getForecastData(currCity);
            $('li[city-id=' + currCity.Id + '])', ulSidebar).css('background-color', '#FFA500');

        };

        $scope.selectionFunc = function(item) {
            $scope.selection = item;

        }


        function getForecastData(city) {
            var fScope = angular.element($('div#selectedDay')[0]).scope();
            if (!fScope.forecasts)
                fScope.forecasts = [];

            var FORECAST_URL = 'http://api.openweathermap.org/data/2.5/forecast/daily';

            $http.get(FORECAST_URL, {
                params: {
                    id: city.Id,
                    cnt: '14'
                }
            }).then(function(res) {
                fScope.forecasts = processRes(res);
    
                fScope.selectedDay = fScope.forecasts[0];
                fScope.selectedDay1 = fScope.forecasts[0];

            });
        }
    }
]);