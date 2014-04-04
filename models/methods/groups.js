
/**
 * Groups model methods file
 */

// module dependencies
var Q = require('q');
var constant = require('../constants/groups');
var orm = require('orm');

/**
 * Groups model static methods
 */
exports.static = {
  /**
   * Check group permission with information
   * and then resolve a group instance or reject with reason
   * @param info Requested params, group and secret required
   * @return {Q.promise} Q promise with group instance resolve
   */
  getAuthGroup: function (info) {
    var groupName = info.group;
    var authSecret = info.secret;
    // find group model where name matched
    // name unique promised so limit 1 is ok
    return Q.ninvoke(this, 'find', {name: groupName}, 1)
      .then(function (found) {
        // TODO: different error type: server error or client error
        var group = found[0]; // just one/zero result
        if (!group) {
          throw new Error('Group not found'); // TODO: i18n
        } else if (!group.isSecretOK(authSecret)) {
          // TODO: authSecret is '' and fail auth
          throw new Error('Bad secret'); // TODO: i18n
        } else {
          return group;
        }
      });
  },

  /**
   * Check group permission with Express request object
   * and then resolve a group instance or reject with reason
   * @param req Express request object with params
   * @return {Q.promise} Q promise with group instance resolve
   */
  getReqAuthGroup: function (req) {
    // TODO: Check req.session for user
    return this.getAuthGroup({
      group: req.params.group,
      secret: req.params.secret
    });
  }
};

/**
 * Groups model instance methods
 */
exports.instance = {
  /**
   * Check secret code for group instance
   * @param {string} secret Secret code provided by user
   * @returns {boolean} True if group auth successful
   */
  isSecretOK: function(secret) {
    // group is public or secret code matched
    return (this.secret === constant.PUBLIC_SECRET ||
      this.secret === secret);
  },

  /**
   * Fetch old messages with lastID
   * or last messages when lastID is null
   * @param {int} lastID Last fetched ID
   * @param {int} perQuery Count of return items
   * @returns {Q.promise} Q promise with messages list resolve
   */
  getMessagesWithLastID: function(lastID, perQuery) {
    var query = this.getMessages();
    if (lastID) { // if fetched
      query = query.find({id: orm.lt(lastID)});
    } // else if is first query, select last messages
    query = query.order('-id').limit(perQuery);
    return Q.ninvoke(query, 'run');
  }
};
