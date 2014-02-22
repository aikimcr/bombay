var should = require('should');

var fs = require('fs');
var util = require('util');

var test_util = require('test/lib/util');

var constants = require('lib/constants');
var db = require('lib/db');
var dbh;

var request = require('lib/request');

describe('manage_requests', function() {
  describe('make a request to join a band', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    it('should load all the records into the db', function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8') + '\n' +
        fs.readFileSync('./test/support/addPeople.sql', 'utf8') + '\n' +
        'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (1,2,1);';

      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      dbh.band_member().getAllWithArgs({
        where: { band_id: 1, person_id: 3}
      }, function(result) {
        should.exist(result);
        result.should.have.property('all_band_members');
        result.all_band_members.should.eql([]);
        done();
      });
    });

    var request_id;
    it('should create the request', function(done) {
      request.join_band({band_id: 1, person_id: 3}, function(result) {
        should.exist(result);
        result.should.not.have.property('err');
        result.should.have.property('request');
        result.request.should.have.property('id');
        request_id = result.request.id;
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      dbh.band_member().getAllWithArgs({
        where: { band_id: 1, person_id: 3}
      }, function(result) {
        should.exist(result);
        result.should.have.property('all_band_members');
        result.all_band_members.should.eql([]);
        done();
      });
    });

    var last_req;
    var now = new Date();
    it('should get the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      };
      request.getById(request_id, function(result) {
        check_request(result, expected, 'JoinBandRequest', now);
        last_req = result.request;
        done();
      });
    });

    it('should reject the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.rejected,
        band_id: 1,
        person_id: 3,
      };
      last_req.reject(function(result) {
        check_request(result, expected, 'JoinBandRequest', now);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      dbh.band_member().getAllWithArgs({
        where: { band_id: 1, person_id: 3}
      }, function(result) {
        should.exist(result);
        result.should.have.property('all_band_members');
        result.all_band_members.should.eql([]);
        done();
      });
    });

    it('should reopen the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      };
      last_req.reopen(function(result) {
        check_request(result, expected, 'JoinBandRequest', now);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      dbh.band_member().getAllWithArgs({
        where: { band_id: 1, person_id: 3}
      }, function(result) {
        should.exist(result);
        result.should.have.property('all_band_members');
        result.all_band_members.should.eql([]);
        done();
      });
    });

    it('should accept the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.accepted,
        band_id: 1,
        person_id: 3,
      };
      last_req.accept(function(result) {
        check_request(result, expected, 'JoinBandRequest', now);
        done();
      });
    });

    it('should find a matching band_member', function(done) {
      var expected = [{
        band_id: 1,
        person_id: 3,
        band_admin: false
      }];
      dbh.band_member().getAllWithArgs({
        where: { band_id: 1, person_id: 3}
      }, function(result) {
        test_util.check_list(
          result, expected, 'all_band_members',
          ['band_id', 'person_id', 'band_admin']
        );
        done();
      });
    });
  });
});

function check_request(result, expected, request_type, now) {
  test_util.check_item(result, expected, 'request', [
    'id', 'description', 'request_type',
    'status', 'band_id', 'person_id'
  ]);

  var request_type = typeof result.request;
  request_type.should.eql(request_type);
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
}
