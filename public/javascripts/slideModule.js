var myApp = angular.module('SlideModule', ['ui.bootstrap']);

myApp.directive('slideHandler', ['$interval', '$timeout','$window',
    function($interval, $timeout,$window) {
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
        var w = angular.element($window);


        scope.$watch(function(){
            return w.width();
        },function(){
    //console.log((scope.forecasts.length>0));
    if(w.width() > 768)
    {
           // console.log('coming here');
     
      $('div.sidebar').css('left','0px');

      $('div#container').css('width',($(window).width()-$('div.sidebar').width())+'px');
      $('div#map').css('width','100%');
//$('div#map').css('width','0px');
    }
    else { 
/*$timeout(function(){
     $('div#container').css('width','100%');
    //$('div#container').css('margin-left','0px');

$('div#map').css('width','100%');
},5000);
  */  

}
       $timeout(function(){
         if (scope.forecasts.length > 0 && ($('div#forecast-data').width() < ($('div#forecast-data li').width() * 14)))            
            { //console.log('coming in enablement');
                //console.log('coming here again');
                evtHandler.set({enable :true});

            }else evtHandler.set({enable : false});


        },1000);
       
         });

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