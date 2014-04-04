
/**
 * Chat controllers
 */

// module dependencies

/**
 * Show chat web application
 * @param req Express request object
 * @param res Express response object
 */
exports.show = function (req, res) {
  req.models.groups.getReqAuthGroup(req)
    .then(function (group) {
      res.render('chat/show', {
        title: group.title,
        group: group
      });
    })
    .fail(function (error) {
      // TODO: show flash instead of send
      res.send(error.message);
    })
    .done();
};

