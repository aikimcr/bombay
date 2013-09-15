
/*
 * GET home page.
 */
var db = require('./db');
var app_title = 'All Night Music Band Manager';

exports.index = function(req, res){
  var band_member_id = req.session.passport.user;
  db.getBandsForMenu(band_member_id, function(bands) {
    res.render('index', {
      title: app_title,
      'messages': req.flash('info'),
      'bands': bands
    });
  });
};
