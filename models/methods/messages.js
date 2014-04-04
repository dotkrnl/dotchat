
/**
 * Messages model methods file
 */

// module dependencies
var Q = require('q');
var settings = require('../../settings');
var socketsLib = require('../../socket');
var commonUtils = require('../../utils/common');

/**
 * Messages model static methods
 */
exports.static = {
  /**
   * Create message instance with author and content
   * @param {string} author Author name (TODO: or user model)
   * @param {string} content Content of message
   * @returns {Q.promise} Q promise with message instance resolve
   */
  createWith: function (author, content) {
    return Q.ninvoke(this, 'create', {
      author: author,
      create: new Date(),
      content: content
    });
  },

  /**
   * Convert messages to one HTML in reverse order
   * @param {messages[]} messages Array of messages
   * @returns {Q.promise} Q promise with html content resolve
   */
  getBatchHTML: function (messages) {
    var promise = Q('');
    for (var i = messages.length - 1; i >= 0; i--) {
      promise = commonUtils.promiseAppender(promise, messages[i].getHTML());
    }
    return promise;
  }
};

/**
 * Messages model instance methods
 */
exports.instance = {
  /**
   * Emit a message to group and broadcast it
   * @param {group} group Group instance
   */
  emitTo : function (group) {
    var message = this;
    Q.ninvoke(message, 'setGroup', group)
      .invoke('getHTML')
      .then(function (html) {
        // TODO: this is logic of socket
        socketsLib.server.sockets
          .in(group.name).emit('message', {
            id: message.id,
            html: html
          });
      })
      .done();
  },

  /**
   * Convert message instance to HTML format with chat/message
   * @returns {Q.promise} Q promise with html resolve
   */
  getHTML : function () {
    // TODO: user_id support
    var message = this;
    return Q.ninvoke(app, 'render', 'chat/message', {
      content: require('markdown').markdown.toHTML(message.content),
      author: message.author,
      create: message.create,
      format: require('../../utils/common').formatTime,
      avatar: require('gravatar').url('name:'+message.author, settings.gravatar)
    });
  }
};
