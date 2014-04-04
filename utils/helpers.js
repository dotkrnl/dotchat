
/**
 * Application helper file
 */

// module dependencies
var settings = require('../settings');
var commonUtils = require('./common');

/**
 * Some helpers for application
 * all helpers here will be automatically
 * used by invoking common.installHelpers(app)
 */
module.exports = {
  /**
   * Website name helper, use #{website} to access global settings
   * @param req Express request object
   * @param res Express response object
   * @param {function} next Callback function after complete
   */
  websiteName: function (req, res, next) {
    res.locals.website = settings.website;
    next();
  },

  /**
   * Flash messages helper, use #{flash} to access flash messages
   * @param req Express request object
   * @param res Express response object
   * @param {function} next Callback function after complete
   */
  flashMessages: function (req, res, next) {
    res.locals.flash = {
      success: req.flash('success'),
      error: req.flash('error')
    };
    next();
  },

  /**
   * Time formatting helper, use #{format(time, format)} to format
   * @param req Express request object
   * @param res Express response object
   * @param {function} next Callback function after complete
   */
  timeFormatting: function (req, res, next) {
    res.locals.format = commonUtils.formatTime;
    next();
  }

};
