var fs = require('fs');
var path = require('path');

exports.process_home = function() {
  var result = path.dirname(process.argv[1]);
  if (result.match('bin$')) {
    result = path.dirname(result);
  }
  return result;
};

exports.public_path = function() {
  return path.join(exports.process_home(), 'public');
};

exports.css_path = function() {
  return path.join(exports.public_path(), 'stylesheets');
};

exports.html_path = function() {
  return path.join(exports.public_path(), 'html');
};

exports.sql_path = function() {
  return path.join(exports.process_home(), 'sql');
};

exports.view_path = function() {
  return path.join(exports.process_home(), 'views');
};

exports.crypto_path = function() {
  return path.join(exports.process_home(), 'crypto');
};

exports.mail_info_path = function() {
  return path.join(exports.crypto_path(), 'mail_info.txt');
};

exports.reports_path = function(band_id) {
debugger;//XXX
  var result = path.join(exports.process_home(), 'reports');
  if (! fs.existsSync(result)) fs.mkdirSync(result, 0766);
  result = path.join(result, band_id.toString());
  if (! fs.existsSync(result)) fs.mkdirSync(result, 0766);
  return result;
};
