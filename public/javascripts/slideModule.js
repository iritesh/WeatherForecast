var myApp = angular.module('SlideModule', ['ui.bootstrap']);

myApp.directive('slideHandler', function($interval,$timeout) {
    return {
        restrict: 'EA',
        link: function(scope, ele, attrs) {
            var startCoor, currCoor;
            scope.forecasts = [];
            var evtHandler = new Hammer(Sizzle('div#container-fluid ul')[0]);
            var left = 0;

            var stopId = $interval(function() {
                var firstliScope = angular.element(Sizzle('div#container-fluid li div')[0]).scope()

                if (firstliScope) {
                    firstliScope.zoom1 = '115%';
                    $interval.cancel(stopId);
                }
            }, 500);
            //var prevSelectedDay;
            var firstTime = false;
            
            scope.releaseHandler = function() {

              scope.selectedDay =  scope.selectedDay1;
              var scope1 = angular.element(Sizzle('li div:contains('+scope.selectedDay.date+')')[0]).scope();  
              scope1.zoom1 = '115%';
            
            };

            scope.enterHandler= function(){
              
              //console.log('entering');
              firstTime = true;
             // prevSelectedDay = scope.selectedDay;
            
            };

            scope.clickHandler2 = function(day){
                console.log('clicking');
                scope.selectedDay1= day;
            };

            scope.$watch('forecasts', function() {
                console.log('container width is');
                console.log(Sizzle('div#container-fluid')[0].offsetWidth);
                $timeout(function(){
            
            if (scope.forecasts.length == 14 && (Sizzle('div#container-fluid')[0].offsetWidth < (Sizzle('div#container-fluid li')[1].offsetWidth * 14)))
                 {
                    evtHandler.on('pan', function(event) {
                        var listItems = Sizzle('div#container-fluid li');

                        for (var i = 0; i < listItems.length; i++) {
                            var scope1 = angular.element(listItems[i]).scope();
                            scope1.zoom1 = '100%';
                            listItems[i].style.left = (event.deltaX + left) + 'px';

                        }
                    });

                    evtHandler.on('panend', function(event) {
                        var listItems = Sizzle('div#container-fluid li');
                        left = parseFloat(listItems[0].style.left);

                        if (left > 0)
                            left = 0;

                        if (left < 0) {

                            var itemWidth = listItems[0].offsetWidth;
                            var divWidth = Sizzle('div#container-fluid')[0].offsetWidth + ((-1) * left);
                            var totalslides = scope.forecasts.length;
                            var extraslides = totalslides * itemWidth - divWidth;

                            if (extraslides < 0) {

                                if ((extraslides) < (left))
                                    left = 0;
                                else
                                    left += (-1) * extraslides;

                            }
                        }

                        for (var i = 0; i < listItems.length; i++)
                            listItems[i].style.left = left + 'px';
                    });
                }

            },1000);
            });


            scope.hoverHandler1 = function(eve) {

                var ss = angular.element(Sizzle('div#selectedDay')[0]).scope();
                var allli = Sizzle('div#container-fluid li');

                for (var i = 0; i < allli.length; i++) {
                    var scope1 = angular.element(allli[i]).scope();
                    scope1.zoom1 = '100%';
                }
             /*   if(firstTime)
                { console.log('selectedday is');
                    console.log(scope.selectedDay);
                    scope.prevSelectedDay = scope.selectedDay ;
                firstTime = false;
                } */
                this.zoom1 = '115%';
                scope.selectedDay = eve;

            };

            scope.leaveHandler1 = function() {

                this.zoom1 = '100%';

            };
        }
    }
});