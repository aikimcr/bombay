var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var constants = require('lib/constants').constants;
var db = require('lib/db');
var dbh;

function insert_test_requests(band_id) {
  var req_defs = [{
    description: 'Let me join your band',
    timestamp: '2014-01-12 15:33:20', request_type: constants.request_type.join_band,
    status: constants.request_status.pending, band_id: band_id, person_id: 2
  }, {
    description: 'Please join my band',
    timestamp: '2014-01-13 15:33:20', request_type: constants.request_type.add_band_member,
    status: constants.request_status.pending, band_id: band_id, person_id: 3
  }, {
    description: 'Let me join your band',
    timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.join_band,
    status: constants.request_status.ignored, band_id: band_id, person_id: 2
  }, {
    description: 'Please join my band',
    timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.add_band_member,
    status: constants.request_status.resolved, band_id: band_id, person_id: 4
  }];

  var field_list = '(description, timestamp, request_type, status, band_id, person_id)';
  var insert_cmd = 'INSERT INTO request ' + field_list + ' VALUES (';
  var sql_cmds = [];

  req_defs.forEach(function(def) {
    var values = [def['description'], def['timestamp'], def['request_type'],
                  def['status'], def['band_id'], def['person_id']];
    var values_str = values.map(function(value) {
      return '\'' + value + '\'';
    }).toString();
    sql_cmds.push(insert_cmd + values_str + ');');
  });

  return sql_cmds.join('\n');
}

describe('request_table', function() {
  describe('#createAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    var request;
    it('should get the request object', function(done) {
      request = dbh.request();
      should.exist(request);
      done();
    });

    var request_id;
    it('should create an request', function(done) {
      var data = {
        description: 'Bugs Bunny wants to join Cover Story',
        timestamp: '2014-01-12 19:34:03',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 1
      };
      request.create(data, function(result) {
        request_id = test_util.check_result(result, 'request_id');
        done();
      });
    });

    it('should get an request', function(done) {
      var expected = {
        id: request_id,
        description: 'Bugs Bunny wants to join Cover Story',
        timestamp: '2014-01-12 19:34:03',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,        band_id: 1,
        person_id: 1
      };
      request.getById(request_id, function(result) {
        test_util.check_item(result, expected, 'request', [
          'id', 'description', 'timestamp', 'request_type',
          'status', 'band_id', 'person_id'
        ]);
        done();
      });
    });

    it('should delete the request', function(done) {
      request.deleteById(request_id, function(result) {
        should.exist(result);
        result.should.have.property('request');
        result.request.should.eql(1);
        done();
      });
    });
  });

  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = insert_test_requests(1) + '\n' + insert_test_requests(2);
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var request;
    it('should get the request object', function(done) {
      request = dbh.request();
      should.exist(request);
      done();
    });

    it('should get all the requests sorted by timestamp', function(done) {
      var expected = [{
        id: 3, description: 'Let me join your band',
        timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.join_band,
        status: 3, band_id: 1, person_id: 2
      }, {
        id: 4, description: 'Please join my band',
        timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.add_band_member,
        status: 2, band_id: 1, person_id: 4
      }, {
        id: 7, description: 'Let me join your band',
        timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.join_band,
        status: 3, band_id: 2, person_id: 2
      }, {
        id: 8, description: 'Please join my band',
        timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.add_band_member,
        status: 2, band_id: 2, person_id: 4
      }, {
        id: 1, description: 'Let me join your band',
        timestamp: '2014-01-12 15:33:20', request_type: constants.request_type.join_band,
        status: 1, band_id: 1, person_id: 2
      }, {
        id: 5, description: 'Let me join your band',
        timestamp: '2014-01-12 15:33:20', request_type: constants.request_type.join_band,
        status: 1, band_id: 2, person_id: 2
      }, {
        id: 2, description: 'Please join my band',
        timestamp: '2014-01-13 15:33:20', request_type: constants.request_type.add_band_member,
        status: 1, band_id: 1, person_id: 3
      }, {
        id: 6, description: 'Please join my band',
        timestamp: '2014-01-13 15:33:20', request_type: constants.request_type.add_band_member,
        status: 1, band_id: 2, person_id: 3
      }];
      request.getAll(function(result) {
        test_util.check_list(result, expected, 'all_requests', [
          'id', 'description', 'timestamp', 'request_type', 'status', 'band_id', 'person_id'
        ]);
        done();
      });
    });

    // Using SqlGenerator syntax.
    it('should get all the join requests for band_id 2', function(done) {
      var expected = [{
        id: 7, description: 'Let me join your band',
        timestamp: '2014-01-10 15:33:20', request_type: constants.request_type.join_band,
        status: 3, band_id: 2, person_id: 2
      }, {
        id: 5, description: 'Let me join your band',
        timestamp: '2014-01-12 15:33:20', request_type: constants.request_type.join_band,
        status: 1, band_id: 2, person_id: 2
      }];
      request.getAllWithArgs({where: {
        request_type: constants.request_type.join_band,
        band_id: 2,
      }, sort: { order: 'timestamp' } }, function(result) {
        test_util.check_list(result, expected, 'all_requests', [
          'id', 'description', 'timestamp', 'request_type', 'status', 'band_id', 'person_id'
        ]);
        done();
      });
    });
  });
});


