
/*
 * Assorted utilities
 */
var ursa = require('ursa');
var fs = require('fs');
 
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
  return key.encrypt(input, 'utf8', 'base64');
};

exports.decrypt = function(key_in, input) {
  var key = ursa.createPrivateKey(key_in);
  return key.decrypt(input, 'base64', 'utf8');
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
