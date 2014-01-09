
/*
 * GET home page.
 */
var db = require('lib/db');
var util = require('lib/util');

var app_title = 'All Night Music Band Manager';

exports.index = function(req, res){
  var person_id = req.session.passport.user;
  var pem = util.get_pem_file('crypto/rsa_public.pem');
  var base64_key = util.parse_pem(pem);
  res.render('index', {
    title: app_title,
    pubkey: base64_key,
    'messages': req.flash('info'),
  });
};
