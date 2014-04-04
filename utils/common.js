
/**
 * Some utils for common usage
 */

// module dependencies
var Q = require('q');
var moment = require('moment');

/**
 * Format a time with format string or 'MM/DD HH:mm';
 * @param {Date} time Time
 * @param {string|undefined} format Format string or 'MM/DD HH:mm';
 * @returns string
 */
exports.formatTime = function (time, format) {
  // TODO: format configurable
  if (!format) {
    format = 'MM/DD HH:mm';
  }
  return moment(time).format(format);
};

/**
 * Copy content of a object to another
 * @param dest destination object
 * @param src source object
 */
exports.copyObject = function (dest, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
};

/**
 * Append result of promiseB to promiseA with operation +
 * @param {Q.promise} promiseA Q promise which result goes first
 * @param {Q.promise} promiseB Q promise which result goes last
 * @returns {Q.promise} Q promise with promiseA result + promiseB result resolve
 */
exports.promiseAppender = function (promiseA, promiseB) {
  return promiseA.then(function (valueA) {
    return promiseB.then(function (valueB) {
      return valueA + valueB;
    });
  });
};
