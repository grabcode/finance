(function (document, angular, io) {

  angular.module('App', ['ui.bootstrap', 'btford.socket-io'])

  .config(function (socketProvider) {
    //socketProvider.prefix('socket:');
  })

  .factory('yql', function($q, $http) {

    return {
      getPairs: function(pairs) {
        var deferred = $q.defer();

        var format = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK';
        var query = 'select * from yahoo.finance.xchange where pair in (' + pairs + ')';
        var url   = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + format;

        $http.jsonp(url).success(function(json) {
            var results = json.query.results;
            deferred.resolve(results);
        });
        return deferred.promise;
      }
      /*getHistoricalData: function(symbol, start, end) {
          var deferred = $q.defer();
          var format = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK';
          var query = 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + start + '" and endDate = "' + end + '"';
          var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + format;

          $http.jsonp(url).success(function(json) {
              var quotes = json.query.results.quote;
              // filter + format quotes here if you want
              deferred.resolve(quotes);
          });
          return deferred.promise;
      }*/
    };
  })


  .controller('AppController', function($scope, $http, yql, socket){

    var currentPanel = 'dash-001-pane-001';

    $scope.state = {
      message: 'hello',
      'dash-001-pane-001': {
        tab: {
          active: 'USDEUR',
          list: [
            /*{id: 'USDEUR', title: "USD/EUR", disabled: false, chart: undefined},*/
            {id: 'EURAUD', title: "EUR/AUD", disabled: false, chart: undefined}
          ]
        }
      }
    };

    //socket.emit('subscribe', {channel: 'USDEUR'});

    /*var chart = $('.container').highcharts({
            chart: {
                zoomType: 'x',
                spacingRight: 20
            },
            title: {
                text: 'USD to EUR exchange rate'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' :
                    'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                maxZoom: 1000, //14 * 24 * 3600000, // fourteen days
                title: {
                    text: null
                }
            },
            yAxis: {
                title: {
                    text: 'Exchange rate'
                }
            },
            tooltip: {
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'USD to EUR',
                pointInterval: 1000, //24 * 3600 * 
                pointStart: new Date().getTime(),//Date.UTC(2013, 0, 01),
                data: []
            }]
        });

    var chart = $('.container').highcharts(),
        serie = chart.series[0],
        setIntervalId;*/

    socket.forward('message', $scope);
    socket.forward('rate', $scope);

    $scope.$on('socket:message', function (ev, data) {
      console.log(data);
    });

    $scope.$on('socket:rate', function (ev, data){
      $scope.state[currentPanel].tab.list[1].chart.series[0].addPoint(Number(data.rate), true);
      //serie.addPoint(Number(data.rate), true);
    });

    $scope.selectTab = function(tab){
      console.log(tab);
    };

    $scope.addChart = function (pair){

      var from  = pair.substring(0,3),
          to    = pair.substring(3,6),
          chart = undefined;

      $scope.state[currentPanel].tab.list.push({
        id: pair,
        title: from+'/'+to,
        disabled: false,
        chart: chart
      });
      $scope.state[currentPanel].tab.active = pair;

      setTimeout(function() {
        var chart = $('#'+currentPanel+'_'+pair).highcharts({
            chart: {
                zoomType: 'x',
                spacingRight: 20
            },
            title: {
                text: 'USD to EUR exchange rate'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' :
                    'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                maxZoom: 1000, //14 * 24 * 3600000, // fourteen days
                title: {
                    text: null
                }
            },
            yAxis: {
                title: {
                    text: 'Exchange rate'
                }
            },
            tooltip: {
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'USD to EUR',
                pointInterval: 1000, //24 * 3600 * 
                pointStart: new Date().getTime(),//Date.UTC(2013, 0, 01),
                data: []
            }]
        });
        //$scope.state[currentPanel].tab.list[$scope.state[currentPanel].tab.list.length-1].chart = chart;
        socket.emit('subscribe', {channel: pair});
      }, 300);
    };

    $scope.removeChart = function (pair){
      socket.emit('unsubscribe', {channel: pair});
    };

  })
  ;

  angular.bootstrap(document, ['App']);

  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }

})(window.document, window.angular, window.io);
