# Finance POC app

App allows first to visualize financial data in realtime, and secondly apply strategy.


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
	plot the graph with ?


---------------
## Steps

1. test YQL
2. get YQL working on node.js
3. get YQL pulling every sec
4. wired client to server
5. get YQL data to client
6. subscribe to specific YQL feed
7. 



Rate Limits:
 	Public	OAuth with API Key
YQL Endpoint	/v1/public/*	/v1/yql/*
Hourly Cap	2,000 requests/hour per IP	20,000 requests/hour per IP

Daily Cap	None	100,000 total requests/day per API Key