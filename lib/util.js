
/*
 * Assorted utilities
 */

// Node standard modules
var fs = require('fs');
var util = require('util');

// Third party modules
var ursa = require('ursa');
 
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
  return key.decrypt(input, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
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

exports.format_sql_timestamp = function(timestamp) {
  var stamp_array = timestamp.split(/\s/);
  var date_array = stamp_array[0].split(/-/);
  var time_array = stamp_array[1].split(/:/);

  var month_names = [
    '',
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ];

  var hour12 = parseInt(time_array[0]);
  var am_pm = 'am';

  if (hour12 > 12) {
    hour12 %= 12;
  }

  if (hour12 == 0) am_pm = 'am';
  if (hour12 == 12) am_pm = 'pm';

  if (hour12 < 10) {
    hour12 = '0' + hour12;
  } else {
    hour12 = hour12.toString();
  }

  var time_obj = {
    year: date_array[0],
    month: date_array[1],
    month_name: month_names[parseInt(date_array[1])],
    day: date_array[2],
    hour: time_array[0],
    hour12: hour12,
    minute: time_array[1],
    second: time_array[2],
    am_pm: am_pm
  };

  time_obj.formatted = util.format(
    '%s %s, %s %s:%s %s',
    time_obj.month_name,
    time_obj.day,
    time_obj.year,
    time_obj.hour12,
    time_obj.minute,
    time_obj.am_pm
  );

  return time_obj;
};
