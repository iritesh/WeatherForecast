var myApp = angular.module('SlideModule', ['ui.bootstrap']);

/* directive for handling forecast days
 */
myApp.directive('slideHandler', ['$interval', '$timeout', '$window',
    function($interval, $timeout, $window) {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                scope.forecasts = [];
                var left = 0;
                var evtHandler = new Hammer($('div#forecast-data ul')[0]);

                //for zooming first element
                var stopId = $interval(function() {
                        var firstliScope = angular.element($('div#forecast-data li div')[0]).scope();

                        if (firstliScope) {
                            firstliScope.zoom1 = '115%';
                            $interval.cancel(stopId);
                        }
                    },
                    500);

                var w = angular.element($window);

                //on widows width change
                scope.$watch(function() {
                    return w.width();
                }, function() {
                    //if viewport is of desktop size
                    if (w.width() > 768) {
                        $('div.sidebar').css('left', '0px');
                        $('#sidebutton').css('left', '200px');
                        scope.class = 'glyphicon glyphicon-chevron-left';

                        $('div#container').css('width', ($(window).width() - $('div.sidebar').width()) + 'px');
                        $('div#map').width($('div#container').width());

                    } //if viewport is of mobile size then these instructions get called
                    else {
                        $timeout(function() {

                            $('div#container').css('width', '100%');

                            $('div#map').width($('div#container').width());
                        }, 1000);

                    }
                    /*if all forecast days list length is smaller than alloted screen
                        then no need of evt handler else evtHandler get enabled */
                    $timeout(function() {

                        if (scope.forecasts.length > 0 && ($('div#forecast-data').width() < ($('div#forecast-data li').width() * 14))) {
                            evtHandler.set({
                                enable: true
                            });

                        } else {
                            evtHandler.set({
                                enable: false
                            });
                            $('div#forecast-data li').css('left', '0px');

                        }

                    }, 1000);

                });

                var isHover = false;
                //function get called when mouse leave forecast day list
                scope.releaseHandler = function() {
                    scope.selectedDay = scope.permSelectedDay;
                    isHover = false;
                    var selectedItemScope = angular.element($('li div:contains(' + scope.selectedDay.date + ')')[0]).scope();
                    selectedItemScope.zoom1 = '115%';

                };
                //when any day get clicked this function get called
                scope.dayClick = function(day) {
                    scope.permSelectedDay = day;

                };
                //if forecast data is available then returns true  
                scope.showForecasts = function() {

                    if (scope.forecasts.length > 0)
                        return true;
                    else return false;

                };


                //if forecast data get changed this function get called
                scope.$watch('forecasts', function() {

                    $timeout(function() {

                        evtHandler.on('pan', function(event) {
                            var dayList = $('div#forecast-data li');
                            dayList.css('left', event.deltaX + left + 'px');
                            for (var i = 0; i < dayList.length; i++) {
                                var dayScope = angular.element(dayList[i]).scope();
                                dayScope.zoom1 = '100%';

                            }
                        });

                        evtHandler.on('panend', function(event) {
                            var dayList = $('div#forecast-data li');
                            left = parseFloat(dayList.css('left'));

                            if (left > 0)
                                left = 0;

                            if (left < 0) {

                                var dayWidth = dayList.width();
                                var containerWidth = $('div#forecast-data').width() + ((-1) * left);
                                var totalslides = scope.forecasts.length;
                                var extraSpace = totalslides * dayWidth - containerWidth;

                                if (extraSpace < 0) {

                                    if (extraSpace < (left))
                                        left = 0;
                                    else
                                        left += (-1) * extraSpace;

                                }
                            }

                            dayList.css('left', left + 'px');
                        });
                        if (scope.forecasts.length > 0 && ($('div#forecast-data').width() < ($('div#forecast-data li').width() * 14))) {
                            evtHandler.set({
                                enable: true
                            });

                        }

                    }, 1000);
                });
                //when on any day list mouse pointer come over it.it get zoomed
                scope.dayHoverHandler = function(eve) {
                    if (!isHover) {
                        isHover = true;
                        scope.permSelectedDay = scope.selectedDay;
                    }
                    var selectedDayScope = $('div#forecast-data div:contains(' + scope.selectedDay.date + ')').scope();
                    selectedDayScope.zoom1 = '100%';
                    this.zoom1 = '115%';
                    scope.selectedDay = eve;

                };
                //when mouse leave it again come to normal zoom level
                scope.dayLeaveHandler = function() {

                    this.zoom1 = '100%';

                };
            }
        }
    }
]);