
/*
 * GET Login
 */

exports.login = function(req, res) {
  res.render('login', {
    title: 'Login',
    errors: req.flash('error')
  });
};