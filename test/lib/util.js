/*
 * Test Utilities
 */
var should = require('should');
var util = require('util');

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

exports.check_request = function(result, expected, now) {
  exports.check_item(result, expected, 'request', [
    'id', 'description', 'request_type',
    'status', 'band_id', 'person_id'
  ]);

  var request_time = new Date(result.request.timestamp + ' UTC');
  should.exist(request_time);
  var request_timestring = util.format(
    '%s-%s-%s %s:%s',
    request_time.getFullYear(),
    request_time.getMonth(),
    request_time.getDay(),
    request_time.getHours(),
    request_time.getMinutes()
  );
  request_time = new Date(request_timestring);

  var now_time = new Date(now);
  var now_timestring = util.format(
    '%s-%s-%s %s:%s',
    now_time.getFullYear(),
    now_time.getMonth(),
    now_time.getDay(),
    now_time.getHours(),
    now_time.getMinutes()
  );
  now_time = new Date(now_timestring);

  var now_epoch = parseInt(now_time.valueOf());
  var request_epoch = parseInt(request_time.valueOf());
  request_epoch.should.eql(now_epoch, 'Request time is ' + result.request.timestamp);
};

exports.check_request_list = function(result, expected, now) {
  should.exist(result);
  result.length.should.eql(expected.length);
  for(var i=0; i < result.length; i++) {
    exports.check_request({request: result[i]}, expected[i], now);
  }
};
