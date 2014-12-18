
/*
 * GET Login
 */
var util = require('../lib/util');

exports.login = function(req, res) {
  var pem = util.get_pem_file('crypto/rsa_public.pem');
  var base64_key = util.parse_pem(pem);
  res.render('login', {
    title: 'Login',
    pubkey: base64_key,
    errors: req.flash('error')
  });
};
