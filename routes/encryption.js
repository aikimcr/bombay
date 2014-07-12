/*
 * Encryption methods;
 */
var util = require('lib/util');

exports.encryption = function(req, res) {
  if (req.query.action == 'pubkey') {
    var pem = util.get_pem_file('crypto/rsa_public.pem');
    var key = util.parse_pem(pem);
    res.json(200, {public_key: key});
  } else if (req.query.action == 'check') {
    var pem = util.get_pem_file('crypto/rsa_private.pem');
    try {
      var decrypted = util.decrypt(pem, req.query.encrypted);
      //console.log(req.query.clear + ", " + decrypted);
      if (decrypted = req.query.clear) {
        res.json(200, {match: true});
      } else {
        res.json(200, {match:false});
      }
    } catch(e) {
      console.log(e);
      res.json(500, 'decryption failed');
    }
  } else {
    res.json(500, 'Invalid encryption action');
  }
};
