/*
 * Test Utilities
 */
var should = require('should');
var util = require('util');

var db = require('lib/db');
var fs = require('fs');
exports.db = require('./db');

exports.check_record = function(got_record, expected_record, fields) {
  should.exist(got_record, 'Got null record');
  fields.forEach(function(f) {
    got_record.should.have.property(f);
    should.exist(got_record[f], f + ' is undefined');
    got_record[f].should.eql(expected_record[f], util.format(
      '%s not equal\nGot %s\nExpected %s\n',
      f,
      util.inspect(JSON.parse(JSON.stringify(got_record))),
      util.inspect(expected_record)
    ));
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

exports.check_rows = function(got_rows, expected_rows, fields) {
  should.exist(got_rows);
  for(var i = 0; i < expected_rows.length; i++) {
    var got = got_rows[i];
    var exp = expected_rows[i];
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

exports.check_request = function(err, result, expected) {
  should.not.exist(err);
  should.exist(result, 'Got null request');
  exports.check_item({request: result}, expected, 'request', [
    'id', 'description', 'request_type',
    'status', 'band_id', 'person_id'
  ]);

  var request_time = new Date(result.timestamp);
  should.exist(request_time);
  var request_timestring = util.format(
    '%s-%s-%s %s:%s',
    request_time.getUTCFullYear(),
    request_time.getUTCMonth(),
    request_time.getUTCDay(),
    request_time.getUTCHours(),
    request_time.getUTCMinutes()
  );

  var now = new Date();
  var now_timestring = util.format(
    '%s-%s-%s %s:%s',
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDay(),
    now.getUTCHours(),
    now.getUTCMinutes()
  );

  var now_epoch = parseInt(now.valueOf());
  var request_epoch = parseInt(request_time.valueOf());
  request_epoch.should.be.within(now_epoch - 300, request_epoch + 300, util.format(
    'Request timestamp \'%s\' should be within five minutes of \'%s\'',
    request_time.toString(),
    now.toString()
  ));
};

exports.check_request_list = function(err, result, expected) {
  should.not.exist(err);
  should.exist(result);
  result.length.should.eql(expected.length);
  for(var i=0; i < result.length; i++) {
    exports.check_request(null, result[i], expected[i]);
  }
};
