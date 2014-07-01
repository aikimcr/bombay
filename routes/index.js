
/*
 * GET home page.
 */
var util = require('lib/util');

var app_title = 'All Night Music Band Manager';

exports.index = function(req, res){
  var user = util.getUser(req);
  var pem = util.get_pem_file('crypto/rsa_public.pem');
  var base64_key = util.parse_pem(pem);
  res.render('index', {
    title: app_title,
    pubkey: base64_key,
    user: user,
    'messages': req.flash('info'),
  });
};
