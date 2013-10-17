# Finance POC app: forex trading

This app allows to visualize financial data in realtime. In the current state, we don't provide historical data.

Status: prototype showing a server cooked with NodeJS (express+socket.io), and an AngularJS client + JQuery plugin Highchart

---------------
## Architecture

This is a Web stack based solution, realtime, based on a Pub/Sub architecture.


### Modules

Data pulling bot: pull data from sources (YQL), and ingest in our own DB (Redis? Mongo?)

Feed module: manage pub/sub, and access to data, oldest and newest



### Client/Server

Server: scrap the financial data (source agnostic), and dispatch to app clients

Client: subscribe to financial data 'feed', and manage views


## Dive in the stack

Server side
	node.js: wrap the solution (express+socket.io), and consume Yahoo Query Langage
	express.js: serving static content
	socket.io: messaging layer

Cient side
	angularjs
	plot the graph with highchart
