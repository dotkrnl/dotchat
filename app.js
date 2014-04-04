
/**
 * dotchat server main file
 */

// module dependencies
var express = require('express');
var flash = require('connect-flash');
var http = require('http');
var path = require('path');
var Q = require('q');

var controllers = require('./controllers');
var database = require('./models/database');
var socket = require('./socket');
var settings = require('./settings');
var helpers = require('./utils/helpers');

app = express(); // GLOBAL variable

// all environments
app.set('host', settings.host || '127.0.0.1');
app.set('port', settings.port || process.env.PORT || '3000');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(settings.cookieSecret));
app.use(database);
app.use(express.session(settings.session));
app.use(flash());
for (var key in helpers) {
  if (helpers.hasOwnProperty(key)) {
    app.use(helpers[key]);
  }
}
app.use(app.router);
app.use(require('less-middleware')({
  src: path.join(__dirname, 'public'),
  compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// initialize application controllers
controllers.attach(app);

// attach socket.io to server
var server = http.createServer(app);
socket.attach(server);

// start server
Q.ninvoke(server, 'listen', app.get('port'), app.get('host'))
  .then(function () {
    console.log('dotchat server listening on host ' + app.get('host') +
      ' port ' + app.get('port'));
  })
  .fail(function (err) {
    console.log('Error: failed to start dotchat server');
    console.log(err.message);
  });
