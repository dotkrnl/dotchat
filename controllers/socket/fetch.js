
/**
 * socket route for fetch action
 */

// module dependencies
var Q = require('q');
var settings = require('../../settings');
var database = require('../../models/database');

/**
 * Route for joining group to get broadcasting
 * @param {socket} socket socket.io socket
 * @param {group} group group instance
 * @param info Object with lastID
 *  group: group name, secret: secret code,
 *  lastID: last fetched message ID needed
 */
module.exports = function (socket, group, info) {
  // get messages
  group.getMessagesWithLastID(info.lastID, settings.perQuery)
    .then(function (messages) {
      return [messages, database.db.models.messages.getBatchHTML(messages)];
    })
    .spread(function (messages, html) {
      socket.emit('fetch', {
        html: html,
        queryID: info.lastID,
        lastID: messages.length ?
            messages[messages.length - 1].id :
            info.lastID
      });
    })
    .done();
};
