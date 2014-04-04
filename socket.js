
/**
 * Socket.io chat sockets file
 */

// module dependencies
var socketIO = require('socket.io');
var settings = require('./settings');
var routes = require('./controllers/socket/index');

/**
 * dotchat Socket.IO library
 */
module.exports = {
  /**
   * Initialize socket.io server
   * @param {http.createServer} server get from http.createServer
   */
  attach: function (server) {
    this.server = socketIO.listen(server);
    this.setup();
  },

  /**
   * Setup socket.io server settings and messages controllers
   */
  setup: function () {
    // apply socket settings in application settings
    for (var i = 0; i < settings.socketIO.length; i++) {
      this.server.set(settings.socketIO[i][0], settings.socketIO[i][1]);
    }
    // setup server controllers
    routes(this.server.sockets);
  },

  /**
   * Socket.io server or null
   */
  server: null
};
