
/**
 * dotchat server main file
 */

// module dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var Q = require('q');

var controllers = require('./controllers');
var socket = require('./socket');
var settings = require('./settings');
var helpers = require('./utils/helpers');

app = express(); // GLOBAL variable

// all environments
app.set('host', settings.host || '127.0.0.1');
app.set('port', settings.port || process.env.PORT || '3000');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
if ('development' === (process.env.NODE_ENV || 'development')) {
  app.use(require('morgan')());
}
app.use(require('body-parser')());
app.use(require('method-override')());
app.use(require('cookie-parser')(settings.cookieSecret));
app.use(require('./models/database'));  // TODO: function style
app.use(require('cookie-session')(settings.session));
app.use(require('connect-flash')());
for (var key in helpers) {
  if (helpers.hasOwnProperty(key)) {
    app.use(helpers[key]);
  }
}
controllers.attach(app);
app.use(require('less-middleware')(path.join(__dirname, 'public'),
  null, null, {
    compress: true
  }));
app.use(require('serve-static')(path.join(__dirname, 'public')));
if ('development' === (process.env.NODE_ENV || 'development')) {
  app.use(require('errorhandler')());
}

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
