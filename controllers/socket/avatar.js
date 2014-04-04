
/**
 * socket route for get gravatar action
 */

// module dependencies
var Q = require('q');
var settings = require('../../settings');

/**
 * Route for joining group to get broadcasting
 * @param {socket} socket socket.io socket
 * @param {group} group group instance
 * @param info Object author:(author name) or token:(user auth token)
 */
module.exports = function (socket, group, info) {
  // TODO: user token support
  // TODO: Same code with Model.Message.toHTML
  socket.emit('avatar', {
    url: require('gravatar')
      .url('name:' + (info.author || ''), settings.gravatar)
  });
};
