var FIND_CITY_URL = 'http://api.openweathermap.org/data/2.5/find';
angular.module('Weather', ['SideModule', 'SlideModule', 'MapModule']);
var myApp = angular.module('SideModule', ['ngAnimate']);

/*a directive when a user presses enter it calls a function provided in 
directive declaration
*/
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

/*a service for providing Current Geolocation

*/
myApp.factory("GeolocationService", ['$q', '$window', '$rootScope',
    function($q, $window, $rootScope) {
        return function() {
            var deferred = $q.defer();

            //if browser doesn't support navigator api
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
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000
                });
            }

            return deferred.promise;
        }
    }
]);

/*A service which do some changes in res get from openWeatherMap api
1.Changing temperature in to celcius from Kelvein
2.adding date attribute in desired format.
*/
myApp.factory('ProcessResponseService', function() {
    return function(res) {
        for (var i = 0; i < res.data.list.length; i++) {
            res.data.list[i].temp.min = parseInt(res.data.list[i].temp.min - 273.15);
            res.data.list[i].temp.max = parseInt(res.data.list[i].temp.max - 273.15);
            res.data.list[i].temp.day = parseInt(res.data.list[i].temp.day - 273.15);
            res.data.list[i].temp.night = parseInt(res.data.list[i].temp.night - 273.15);
            res.data.list[i].temp.morn = parseInt(res.data.list[i].temp.morn - 273.15);
            res.data.list[i].temp.eve = parseInt(res.data.list[i].temp.eve - 273.15);
            var iniDate = new Date(1970, 0, 1);
            iniDate.setSeconds(parseFloat(res.data.list[i].dt));
            var dateStr = iniDate.toDateString();
            var dateParts = dateStr.split(' ');
            res.data.list[i].date = dateParts[1] + ' ' + dateParts[2];

        }
        return res.data.list;
    }
});

/* creating a city object.adding desired attributes
 */
myApp.factory('CreateCityService', function() {
    return function(newCity) {
        var city = {};
        city.city = newCity.name;
        city.lat = newCity.coord.lat;
        city.lon = newCity.coord.lon;
        city.Id = newCity.id;
        return city;

    }
});

/*
Getting forecast data and updating it in desired scope of selectedDay div 
element.
*/
myApp.factory('GetForecastService', ['$http', 'ProcessResponseService',
    function($http, processRes) {
        return function(city) {
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
                fScope.permSelectedDay = fScope.forecasts[0];

            });

        }
    }
]);

/*for first time when we add an element all elements should render according to 
browsers windows size
*/
myApp.factory('SetElementsSizeService', ['$timeout', '$window',
    function($timeout, $window) {
        return function(city) {
            /*timeout is used because window windth changes when we before and after 
            addition of city.so let it be stable thatss why i used timeout
            */
            $timeout(function() {

                var selCityScope = angular.element($('li.hover-effect[cityid=' + city.Id + ']')[0]).scope();
                selCityScope.bgColor = {};
                selCityScope.bgColor['background-color'] = '#FFA500';
                var w = angular.element($window);

                if (w.width() < 768) {
                    $('div#container').css('width', (w.width() + 'px'));
                } else {
                    $('div#container').css('width', (w.width() - $('div.sidebar').width()) + 'px');
                }

                $('div#map').width($('div#container').width());
                $('div#map').css('height', '250px');

            }, 1000);

        };
    }
]);

/* this directive contains all the functionality
related to sidebar except last row
*/
myApp.directive('sidebarHandler', ['$http', '$rootScope', 'GeolocationService',
    '$timeout', 'ProcessResponseService', 'CreateCityService', 'GetForecastService', '$window',
    'SetElementsSizeService',
    function($http, $rootScope, GeolocationService, $timeout, processRes, createCity, foreCast, $window, setElementsSize) {
        return function(scope, element, attrs) {
            //cities in side bar
            scope.cities = [];
            // selectedCity
            scope.selectedCity = {};
            /*boolean variables for checking whether to show 
             or not sidebar  */
            $rootScope.isMessage = true;
            $rootScope.isSidebar = false;
            //due to visibility-xs-inline display is used with important!
            //thats why when sidebar become visible it should also become 
            //visible

            var clear = $rootScope.$watch('isSidebar', function() {
                if ($rootScope.isSidebar) {
                    $('button#sidebutton').css('visibility', 'visible');
                    clear();
                }
            });

            var ulSidebar = $('.sidebar ul');
            //for creating scrollbar in sidebar 
            $('div.sidebar').perfectScrollbar({
                suppressScrollX: true
            });

            $('button#sidebutton').addClass('show-hide-transition');

            GeolocationService().then(function(position) {
                var params = {
                    lon: position.coords.longitude,
                    lat: position.coords.latitude,
                    cnt: '1'
                };

                $http.get(FIND_CITY_URL, {
                    params: params
                }).then(function(res) {
                    var city = createCity(res.data.list[0]);
                    scope.cities.push(city);
                    scope.selectedCity = scope.cities[0];
                    $rootScope.isSidebar = true;
                    $rootScope.isMessage = false;
                    $('div#map').css('visibility', 'visible');
                    setElementsSize(city);

                    foreCast(scope.selectedCity);
                });
            }, function(reason) {

                var divScope = angular.element($('div.alert.alert-warning')[0]).scope();
                $rootScope.isMessage = true;
                if ((typeof reason).toUpperCase() == 'OBJECT')
                    divScope.errMsg = reason.message;
                else divScope.errMsg = reason;

                $timeout(function() {
                    $rootScope.isMessage = false;
                    $rootScope.isSidebar = true;

                }, 2000);
            });

            scope.clickHandler1 = function() {
                var flt = parseInt($('div.sidebar').css('left'));

                if (flt > -1) {
                    $('div.sidebar').css('left', '-200px');
                    $('#sidebutton').css('left', '0px');
                    scope.class = 'glyphicon glyphicon-chevron-right';

                } else {
                    $('div.sidebar').css('left', '0px');
                    $('#sidebutton').css('left', '200px');
                    scope.class = 'glyphicon glyphicon-chevron-left';
                }

            };

            /*function get called when any city is clicked*/
            scope.cityClickHandler = function() {

                var ulSidebar = $('.sidebar ul');
                var selCityScope = angular.element($('li[cityid="' + scope.selectedCity.Id + '"]', ulSidebar)[0]).scope();

                selCityScope.bgColor = {};
                var currCity = this.city;
                scope.selectedCity = currCity;
                foreCast(currCity);

                selCityScope = angular.element($('li[cityid="' + currCity.Id + '"]', ulSidebar)[0]).scope();
                selCityScope.bgColor = {};
                selCityScope.bgColor['background-color'] = '#FFA500';

            };
            /*when cross icon get clicked*/
            scope.crossHandler = function() {
                for (var i = 0; i < scope.cities.length; i++)
                    if (scope.cities[i] == this.city)
                        scope.cities.splice(i, 1);
            };

        }

    }
]);

/*for handling last row of sidebar*/
myApp.controller('manageCitiesCont', ['$rootScope', '$scope', '$http', '$timeout', 'CreateCityService', 'GetForecastService',
    '$window', 'SetElementsSizeService',
    function($rootScope, $scope, $http, $timeout, createCity, foreCast, $window, setElementsSize) {
        /*for showing autocomplete suggestions*/
        $scope.getLocations = function(val) {
            return $http.get(FIND_CITY_URL, {
                params: {
                    q: val,
                    type: 'like'
                }
            }).then(function(res) {

                if (res.data.list)
                    $scope.$parent.addresses = res.data.list;
                else $scope.$parent.addresses = [];
                return $scope.$parent.addresses;

            });
        };
        /*when enter is clicked for adding city this function get called*/
        $scope.addCity = function() {
            var city = {};
            var cityPresent = false;
            if (!$scope.addresses) {
                $scope.message = 'Location not available';
                return;
            }
            if ($scope.selection)
                if ($scope.newCity == $scope.selection.name) {
                    cityPresent = true;
                    city = checkAndInsertCity($scope.selection);
                }

            if (!cityPresent)
                for (var i = 0; i < $scope.addresses.length; i++) {
                    if ($scope.addresses[i].name == $scope.newCity) {
                        cityPresent = true;
                        city = checkAndInsertCity($scope.addresses[i]);
                        break;
                    }
                }

            if (!cityPresent)
                $scope.message = 'Location Not available';
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

         /*function for handling city insertion*/
        function checkAndInsertCity(newCity) {
            var city = {};
            if (checkForDuplicate(newCity)) {
                city = createCity(newCity);
                $scope.cities.push(city);
                if ($scope.cities.length == 1) {
                    $scope.$parent.selectedCity = $scope.cities[0];
                    setElementsSize($scope.cities[0]);

                    foreCast($scope.selectedCity);
                    $("div#map").css('visibility', 'visible');
                }
            } else $scope.message = 'Location already in the list';

            return city;
        };

        /*when plus glyphicon get clicked*/
        $scope.clickPlus = function() {
            $('a.glyphicon-plus').css('display', 'none');
            $('span#addLabel').css('display', 'none');
            $('input#locInput').css('display', 'inline');
            $('a.glyphicon-remove').css('display', 'inline');

        };
        /*when any autocomplete suggestion is selected from drop down list
        this function get called */
        $scope.selectionFunc = function(item) {
            $scope.selection = item;
        };

        /* function for checking if city is preciously added or not.
         */
        function checkForDuplicate(city) {
            for (var i = 0; i < $scope.cities.length; i++) {
                if ($scope.cities[i].Id == city.id) {
                    return false;

                }
            }
            return true;
        };

        /* when remove icon near to input box get clicked*/
        $scope.removeInput = function() {
            $('input#locInput').css('display', 'none');
            $('a.glyphicon-remove').css('display', 'none');
            $('a.glyphicon-plus').css('display', 'inline');
            $('span#notAvail').css('display', 'none');
            $('span#addLabel').css('display', 'inline');

        };

       
    }
]);