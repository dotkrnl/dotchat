
/**
 * socket route for join action
 */

// module dependencies
var Q = require('q');

/**
 * Route for joining group to get broadcasting
 * @param {socket} socket socket.io socket
 * @param {group} group group instance
 * @param info Hash group: group name, secret: secret code needed
 */
module.exports = function (socket, group, info) {
  // Ok to get broadcasting
  socket.join(group.name);
};
