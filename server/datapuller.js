/*global define */
'use strict';
define(['request'], function (request){

	return function (logger) {
		var self = this,
				setIntervalId,
				currentStartCb,
				currentStopCb;


		var pairs = [];

		var format = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

	  /* expected body:
			{"query":{"count":1,"created":"2013-10-15T03:09:49Z","lang":"en-US
			","results":{"rate":{"id":"USDEUR","Name":"USD to EUR","Rate":"0.7376","Date":"1
			0/15/2013","Time":"11:09pm","Ask":"0.7378","Bid":"0.7375"}}}}
		*/
	  function yql(cb){
	  	var query  = 'select * from yahoo.finance.xchange where pair in (' + pairs.join(',') + ')',
	  			url    = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + format;

	  	console.log(url);

	  	var rep = request.get(url, function(err, res, body){
				if(err){
					cb({
						lastaction: {name: 'datapuller.yql', arguments: arguments},
						error: {
							'ERR-MDP-001': {
							'message': 'error executing request',
							'err': err
							}
						},
						success: undefined});
				}else{
					cb({lastaction: {name: 'datapuller.yql', arguments: arguments}, error: undefined, success: {payload: JSON.parse(body)}});
				}
			});
	  };

	  function process(result){
	  	if(result.error){
	  		logger.info('error:'+result.error.err);
	  	}else{
	  		logger.info(JSON.stringify(result.success.payload));
	  	}
	  }

	  this.addPair = function(newpair) {
	  	if(! pairs[newpair]){
	  		pairs.push("'"+newpair+"'");
	  		self.stop(function(){
	  			console.log('stopping puller');
	  		});
	  		self.start(currentStartCb);
	  	}
	  };

		this.start = function (cb){
			if(typeof currentStartCb == 'undefined'){
				currentStartCb = cb;
			}

			setIntervalId = setInterval(
			  function(){
			  	yql(cb);
			  },
			  1000);
		};

		this.stop = function (cb){
			if(typeof currentStopCb == 'undefined'){
				currentStopCb = cb;
			}

			if(setIntervalId){
				clearInterval(setIntervalId);
				cb({lastaction: {name: 'datapuller.stop', arguments: arguments}, error: undefined, success: true});
			}else{
				cb({lastaction: {name: 'datapuller.stop', arguments: arguments}, error: {
							'ERR-MDP-002': {
							'message': 'datapuller not currently working',
							'err': {}
							}
						}, success: true});
			}
		};

	}//return

});