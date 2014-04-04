
/**
 * socket route for message action
 */

// module dependencies
var Q = require('q');
var database = require('../../models/database');

/**
 * Route for sending a message to a group
 * @param {socket} socket socket.io socket
 * @param {group} group group instance
 * @param info Object
 *   group: group name, secret: secret code,
 *   token: user auth token (optional),
 *   message: message HTML to send needed
 */
module.exports = function (socket, group, info) {
  // TODO: info.token support
  database.db.models.messages
    .createWith(info.author, info.content)
    .invoke('emitTo', group)
    .done();
};