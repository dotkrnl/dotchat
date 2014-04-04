
/**
 * dotchat controllers
 */

// module dependencies
var home = require('./home');
var chat = require('./chat');

/*
 * Setup controllers for app
 * @param app Express app to setup
 */
exports.attach = function (app) {
  app.get('/', home.homepage);

  app.get('/g/:group', chat.show);
  app.get('/g/:group/auth/:secret', chat.show);
};
