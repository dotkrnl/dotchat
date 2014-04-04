
/**
 * socket controllers main file
 */

/**
 * Install controllers on socket.io sockets
 * @param sockets socket.io sockets to install
 */
module.exports = function (sockets) {
  sockets.on('connection', function (socket) {
    socket.on('join', authHelper(socket, require('./join')));
    socket.on('message', authHelper(socket, require('./message')));
    socket.on('fetch', authHelper(socket, require('./fetch')));
    socket.on('avatar', authHelper(socket, require('./avatar')));
  });
};

/**
 * Auth group and call param function
 * @param socket Socket.io socket
 * @param {function|exports} real_function Call after auth, send return value
 * @returns {Function} Wrapped function
 */
function authHelper(socket, real_function) {
  return function (info, callback) {
    var database = require('../../models/database');
    database.db.models.groups.getAuthGroup(info)
      .then(function (group) {
        return real_function(socket, group, info);
      })
      .then(function (data) {
        if (typeof(callback) !== 'undefined') {
          callback({ok: true, data: data});
        }
      })
      .fail(function (error) {
        if (typeof(callback) !== 'undefined') {
          callback({ok: false, error: error});
        }
        console.log(error.stack);
        console.log(info);
      })
      .done();
  };
}
