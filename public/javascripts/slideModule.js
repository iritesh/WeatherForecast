var myApp = angular.module('SlideModule', ['ui.bootstrap']);

myApp.directive('slideHandler', ['$interval', '$timeout',
    function($interval, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                scope.forecasts = [];
                var left = 0;
                var evtHandler = new Hammer($('div#forecast-data ul')[0]);
                var stopId = $interval(function() {
                        var firstliScope = angular.element($('div#forecast-data li div')[0]).scope();

                        if (firstliScope) {
                            firstliScope.zoom1 = '115%';
                            $interval.cancel(stopId);
                        }
                    },
                    500);

                var isHover = false;

                scope.releaseHandler = function() {
                    scope.selectedDay = scope.permSelectedDay;
                    isHover = false;
                    var selectedItemScope = angular.element($('li div:contains(' + scope.selectedDay.date + ')')[0]).scope();
                    selectedItemScope.zoom1 = '115%';

                };

                scope.dayClick = function(day) {
                    scope.permSelectedDay = day;

                };

                scope.showForecasts = function() {
                    if (scope.forecasts.length > 0)
                        return true;
                    else return false;
                };

                scope.$watch('forecasts', function() {

                    $timeout(function() {

                        if (scope.forecasts.length > 0 && ($('div#forecast-data').width() < ($('div#forecast-data li').width() * 14))) {
                            evtHandler.on('pan', function(event) {
                                var dayList = $('div#forecast-data li');
                                dayList.css('left', event.deltaX + left + 'px');
                                for (var i = 0; i < listItems.length; i++) {
                                    var dayScope = angular.element(listItems[i]).scope();
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
                        }

                    }, 1000);
                });

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

                scope.dayLeaveHandler = function() {

                    this.zoom1 = '100%';

                };
            }
        }
    }
]);