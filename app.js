/**
 * Module dependencies.
 */
var express = require('express'),
  http = require('http'),
  path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3009);

  app.use(express.logger('dev')); //default dev

  app.use(express.compress());

  app.use(express.static(path.join(__dirname, '/')));

  app.use(app.router);
});

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});