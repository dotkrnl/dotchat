
/**
 * Database initialization
 */

// get configurations
var config = require('../settings').database;
var commonUtils = require('../utils/common');
var messagesMethods = require('./methods/messages');
var groupMethods = require('./methods/groups');

/**
 * Database node-orm2 connection
 */
module.exports = require('orm').express(config, {
  /**
   * Define database schemas
   * @param db database instance
   * @param models models instance
   */
  define: function (db, models) {
    module.exports.db = db;
    models.messages = db.define('messages', require('./schemas/messages'),
      { methods: messagesMethods.instance });
    models.groups = db.define('groups', require('./schemas/groups'),
      { methods: groupMethods.instance });
    // TODO: models.users = db.define('users', require('./schema/users'));
    // define static methods
    commonUtils.copyObject(models.messages, messagesMethods.static);
    commonUtils.copyObject(models.groups, groupMethods.static);
    // create associations
    models.messages.hasOne('group', models.groups, {reverse: 'messages'});
    // create database structure if not exist
    db.sync();
  }
});
