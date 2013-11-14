/*
 * Test Utilities
 */
var should = require('should');

exports.check_list = function(got_list, expected_list, data_key, fields) {
  should.exist(got_list);
  should.exist(got_list[data_key]);
  got_list[data_key].length.should.eql(expected_list.length);
  for(var i = 0; i < expected_list.length; i++) {
    var got = got_list[data_key][i];
    var exp = expected_list[i];

    fields.forEach(function(f) {
      should.exist(got[f]);
      got[f].should.eql(exp[f]);
    });
  }
};
