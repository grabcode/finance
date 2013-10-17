'use strict';

var requirejs = require('requirejs');

requirejs.config({
	nodeRequire: require
});

requirejs(['fs', 'http', 'express', 'winston', 'jade-amd', 'socket.io', 'server/datapuller'],function(Fs, http, Express, Winston, jadeAMD, socketio, Datapuller) {

	var settings = JSON.parse(Fs.readFileSync('server/config.json'));
	//todo: rotate log
	var logger   = new (Winston.Logger)({
		transports: [
			new (Winston.transports.Console)(),
			new (Winston.transports.File)({ filename: 'server/log/server.log' , level: settings.LOG_LEVEL })
		]
	});

	/**
	 * Express server
	 */
	var app = new Express();

	app.use(Express.bodyParser());
	app.use(Express.logger({ format: ':method :url :status' }));

	app.use( '/app/views/', jadeAMD.jadeAmdMiddleware({views:'www/app/jade'}) );
	app.use('/', Express.static('www/'));
	app.get('/', function(req, res) {
		//res.write(fs.readFileSync('www/index.html'));
		//res.end();
		res.sendfile(__dirname + '/index.html');
	});

	/**
	 * Socket.io 
	 */
	//todo: get socket.io log in logger
	var server = new (http).createServer(app),
			io     = new (socketio).listen(server);

	io.configure(function () {
		io.set('authorization', function (handshakeData, cb) {
			if (handshakeData.xdomain) {
				cb('Cross-domain connections are not allowed');
			} else {
				cb(null, true);
			}
		});
	});

	/**
	 * Server
	 */
	//todo: get sessions working, and shared between express and socketio
	server.listen(settings.HTTP_PORT);
	logger.info('SERVER STARTED');


	/**
	 * Data puller
	 */
	var dp = new Datapuller(logger);
	dp.start(function(data){
		//socket.emit('rate', { text : 'Welcome!' });
		if(data.success && data.success.payload.query){

			if(data.success.payload.query.results && data.success.payload.query.results.rate){

				var ts = data.success.payload.query.created;
				Array.prototype.forEach.call(data.success.payload.query.results.rate, function(rate){
					var payload = {
						time: ts,
						pair: rate.id,
						rate: rate.Rate
					};
					io.sockets.to(payload.pair).emit('rate', payload);
				});
			}

		}
	});

	io.sockets.on('connection', function (socket) {

		//on connect send a welcome message
		socket.emit('message', { text : 'Welcome!' });

		//on subscription request joins specified room
		//later messages are broadcasted on the rooms
		socket.on('subscribe', function (data) {
			socket.join(data.channel);
			if(data.channel.length===6) {
				dp.addPair(data.channel);
			}
		});

		socket.on('unsubscribe', function (data) {
			socket.leave(data.channel);
		});

	});

	/*
	setTimeout(function(){
		dp.stop(function(data){
			logger.info('stop pulling');
		});
	},10000);
*/

});