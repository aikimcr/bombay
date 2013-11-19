
/*
 * GET home page.
 */
var db = require('lib/db');
var app_title = 'All Night Music Band Manager';

exports.index = function(req, res){
  var person_id = req.session.passport.user;
  res.render('index', {
    title: app_title,
    'messages': req.flash('info'),
  });
};
