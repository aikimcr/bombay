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
