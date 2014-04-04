
/**
 * Homepage controllers
 */

/*
 * Show dotchat homepage
 * @param req Express request object
 * @param res Express response object
 */
exports.homepage = function (req, res) {
  res.render('home/homepage', {
  });
};
