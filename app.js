'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var path = require('path');
var utils = require('./server/utils');
var app = express();
var port = 3000;

// For gzip compression
app.use(express.compress());

// Locate the assets
app.use(express.static(__dirname + '/public'));

/*
 * Routes
 */
utils.getGlobbedFiles(__dirname + '/server/routes/**/*.js').forEach(function (routePath) {
	require(path.resolve(routePath))(app);
});

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
