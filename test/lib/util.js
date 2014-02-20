/*
 * Test Utilities
 */
var should = require('should');

var db = require('lib/db');
var fs = require('fs');

exports.check_record = function(got_record, expected_record, fields) {
  should.exist(got_record);
  fields.forEach(function(f) {
    got_record.should.have.property(f);
    should.exist(got_record[f], f + ' is undefined');
    got_record[f].should.eql(expected_record[f], f + ' not equal');
  });
};

exports.check_item = function(got_item, expected_item, data_key, fields) {
  should.exist(got_item);
  got_item.should.have.property(data_key);
  exports.check_record(got_item[data_key], expected_item, fields);
};

exports.check_list = function(got_list, expected_list, data_key, fields) {
  should.exist(got_list);
  got_list.should.have.property(data_key);
  got_list[data_key].length.should.eql(expected_list.length);
  for(var i = 0; i < expected_list.length; i++) {
    var got = got_list[data_key][i];
    var exp = expected_list[i];
    exports.check_record(got, exp, fields);
  }
};

exports.check_result = function(result, data_key) {
  should.exist(result);
  result.should.have.property(data_key);
  result.should.not.have.property('err');
  return result[data_key];
};

exports.check_error_result = function(result, data_key) {
  should.exist(result);
  result.should.not.have.property(data_key);
  result.should.have.property('err');
  return result.err;
};
