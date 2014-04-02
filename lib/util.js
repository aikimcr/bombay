
/*
 * Assorted utilities
 */

// Node standard modules
var fs = require('fs');
var util = require('util');
var path = require('path');

// Third party modules
var ursa = require('ursa');

// Bombay Modules
var db = require('lib/db');
var path_util = require('lib/path_util');

exports.obj_merge = function(a, b) {
  var result = {};
  Object.keys(a).forEach(function (key) {
    var a_value = a[key];
    
    if (key in b) {
      var b_value = b[key];
      if (a_value === Object(a_value) && b_value === Object(b_value)) {
        result[key] = exports.obj_merge(a_value, b_value);
      } else {
        result[key] = b_value;
      }
    } else {
      result[key] = a_value;
    }
  });
  
  Object.keys(b).forEach(function(key) {
      if (!(key in result)) {
        result[key] = b[key];
      }
  });
  
  return result;
};

exports.strMapCharsToStr = function(str1, str2) {
  var pi = 0;
  var result = '';

  for (var si = 0; si < str2.length; si++) {
    var cc = str1.charCodeAt(pi) ^ str2.charCodeAt(si);
    result += String.fromCharCode(cc);
    pi++;
    if (pi >= str1.length) pi = 0;
  }

  return result;
};

exports.encrypt = function(key_in, input) {
  var key = ursa.createPublicKey(key_in);
  return key.encrypt(input, 'utf8', 'base64', ursa.RSA_PKCS1_PADDING);
};

exports.decrypt = function(key_in, input) {
  var key = ursa.createPrivateKey(key_in);
  var decrypted_key = '';
  try {
    decrypted_key = key.decrypt(input, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
  } catch(e) {
    console.log(e);
    console.log('Unable to decrypt key \'' + input + '\'');
  }
  return decrypted_key;
};

exports.get_pem_file = function(key_file) {
  var file_text = fs.readFileSync(key_file);
  return file_text.toString();
};

exports.parse_pem = function(pem) {
  var key_array = pem.split(/\n/);
  key_array.shift();
  key_array.pop();
  key_array.pop();
  return key_array.join('');
};

exports.get_public_pem = function() {
  return exports.get_pem_file(path.join(path_util.crypto_path(), 'rsa_public.pem'));
};

exports.get_private_pem = function() {
  return exports.get_pem_file(path.join(path_util.crypto_path(), 'rsa_private.pem'));
};

exports.get_mail_file = function() {
  var file_text = fs.readFileSync(path_util.mail_info_path());
  return file_text.toString();
};

exports.inherits = function(target, source) {
  for (var k in source.prototype)
    target.prototype[k] = source.prototype[k];
};

exports.getUser = function(req) {
  if (req.session.passport.user) {
    return JSON.parse(req.session.passport.user);
  }
  return null;
};

exports.getBandMember = function(person_id, band_id, callback) {
  if (person_id == null) {
    callback(null);
  } else if (band_id == null) {
    callback(null);
  } else {
    var dbh = new db.Handle();
    dbh.band_member().getAllWithArgs({
      fields: ['id', 'band_admin'],
      where: {band_id: band_id, person_id: person_id}
    }, function(result) {
      if (result.err) {
        console.log(node_util.inspect(result));
        callback(null);
      } else {
        callback(result.all_band_members[0]);
      }
    });
  }
};
