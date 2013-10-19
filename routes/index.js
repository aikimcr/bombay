
/*
 * GET home page.
 */
var db = require('lib/db');
var app_title = 'All Night Music Band Manager';

exports.index = function(req, res){
  var person_id = req.session.passport.user;
  var dbh = new db.Handle();
  dbh.band().getsByPersonId(person_id, function(result) {
    res.render('index', {
      title: app_title,
      'messages': req.flash('info'),
      'bands': result.person_bands
    });
  });
};
