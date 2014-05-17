/*
 * Define constants to be used in all modules.
 */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var constants_js = fs.readFileSync(
  path.join(
    path.dirname(__dirname),
    'public',
    'javascripts',
    'constants.js'
  ),
  {encoding: 'utf8'}
);

vm.runInThisContext(constants_js);

exports.request_type = constants.request_type;
exports.request_status = constants.request_status;
