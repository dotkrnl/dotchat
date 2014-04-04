
/**
 * dotchat global settings
 */

// module dependencies
var sessionStore = require('./models/session').store;

/**
 * dotchat global settings hash
 */
module.exports = {
  // global website name
  website: '.chat',
  // messages count per query
  perQuery: 20,
  // gravatar settings, see documentation of gravatar
  gravatar: {
    s: 50, // avatar size
    r: 'g', // rating
    d: 'identicon' // default
  },

  // server listen host IP
  host: '127.0.0.1',
  // server listen host port
  // null for process.env.PORT
  port: '3000',

  // secret word for cookie encoding
  cookieSecret: '.chat secret',
  // setting for session, pass to express.session
  // see documentations of express.js
  session: {
    store: sessionStore,
    secret: '.chat secret'
  },
  // database setup
  // see documentations of node-orm2
  database: {
    // mysql, postgresql, sqlite, mongodb supported
    protocol : 'postgresql',
    // database hostname or IP
    host     : 'localhost',
    // database server port
    port     : '5432',
    // database user name
    user     : 'your username',
    // password of your user
    password : 'your password',
    // database used for dotchat
    database : 'your database name',
    // true for query pool
    query    : { pool: true }
  },

  // socket.io settings
  // array pass to server.set
  // see documentations of socket.io
  socketIO: [
    ['browser client minification', true],
    ['browser client etag', true]
  ]
};
