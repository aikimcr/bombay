var should = require('should');

var fs = require('fs');
var util = require('util');

var test_util = require('./lib/util');

var constants = require('../lib/constants');
var db_orm = require('../lib/db_orm');
var request = require('../lib/request');

describe('manage_requests', function() {
  describe('make a request to join a band', function() {
    before(function(done) { test_util.db.resetDb(done); });

    before(function(done) {
      test_util.db.loadSql([
        {file: './test/support/addBands.sql'},
        {file: './test/support/addPeople.sql'},
        'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (1,2,1);'
      ], done);
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    var request_id;
    it('should create the request', function(done) {
      request.joinBand({band_id: 1, person_id: 3}, function(err, request) {
        should.not.exist(err);
        should.exist(request);
        request.should.have.property('id');
        request_id = request.id;
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    var last_req;
    it('should get the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      };
      request.getById(request_id, function(err, result) {
        test_util.check_request(err, result, expected);
        last_req = result;
        done();
      });
    });

    it('should get the request', function(done) {
      var expected = [{
        id: request_id,
        description: 'Danny Drums is asking to join Wild At Heart',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      }];
      request.getMyRequests(2, function(err, result) {
        test_util.check_request_list(err, result, expected);
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
      last_req.reject(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
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
      last_req.reopen(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
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
      last_req.accept(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should find a matching band_member', function(done) {
      var expected = [{
        band_id: 1,
        person_id: 3,
        band_admin: false
      }];
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        test_util.check_rows(rows, expected, ['band_id', 'person_id', 'band_admin']);
        done();
      });
    });
  });

  describe('make a request to add a member', function() {
    before(function(done) { test_util.db.resetDb(done); });

    before(function(done) {
      test_util.db.loadSql([
        {file: './test/support/addBands.sql'},
        {file: './test/support/addPeople.sql'},
        'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (1,2,1);'
      ], done);
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    var request_id;
    it('should create the request', function(done) {
      request.addBandMember({band_id: 1, person_id: 3}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('id');
        request_id = result.id;
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    var last_req;
    var now = new Date();
    it('should get the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      };
      request.getById(request_id, function(err, result) {
        test_util.check_request(err, result, expected);
        last_req = result;
        done();
      });
    });

    it('should get the request', function(done) {
      var expected = [{
        id: request_id,
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      }];
      request.getMyRequests(2, function(err, result) {
        test_util.check_request_list(err, result, expected);
        done();
      });
    });

    it('should reject the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.rejected,
        band_id: 1,
        person_id: 3,
      };
      last_req.reject(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    it('should reopen the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      };
      last_req.reopen(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should not find a matching band_member', function(done) {
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        done();
      });
    });

    it('should accept the request', function(done) {
      var expected = {
        id: request_id,
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.accepted,
        band_id: 1,
        person_id: 3,
      };
      last_req.accept(function(err, result) {
        test_util.check_request(err, result, expected);
        done();
      });
    });

    it('should find a matching band_member', function(done) {
      var expected = [{
        band_id: 1,
        person_id: 3,
        band_admin: false
      }];
      db_orm.BandMember.find({ band_id: 1, person_id: 3}, function(err, rows) {
        should.not.exist(err);
        test_util.check_rows(rows, expected, ['band_id', 'person_id', 'band_admin']);
        done();
      });
    });
  });

  describe('Get request lists', function() {
    before(function(done) { test_util.db.resetDb(done); });

    before(function(done) {
      test_util.db.loadSql([
        {file: './test/support/addBands.sql'},
        {file: './test/support/addPeople.sql'},
        'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (1,2,1);',
        'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (2,3,1);'
      ], done);
    });

    var request_id = [];
    var now = new Date();
    it('should create a request to add Danny Drums to Wild At Heart', function(done) {
      request.addBandMember({band_id: 1, person_id: 3}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('id');
        request_id.push(result.id);
        done();
      });
    });

    it('should create a request for Alan Poser to join Live! Dressed! Girls!', function(done) {
      request.joinBand({band_id: 2, person_id: 2}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('id');
        request_id.push(result.id);
        done();
      });
    });

    it('should create a request for Johnny Guitar to join Live! Dressed! Girls!', function(done) {
      request.joinBand({band_id: 2, person_id: 4}, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('id');
        request_id.push(result.id);
        done();
      });
    });

    it('should get the requests for Alan Poser', function(done) {
      var expected = [{
        id: request_id[1],
        description: 'Alan Poser is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 2,
      }, {
        id: request_id[0],
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      }];
      request.getMyRequests(2, function(err, result) {
        test_util.check_request_list(err, result, expected);
        done();
      });
    });

    it('should get the requests for Danny Drums', function(done) {
      var expected = [{
        id: request_id[1],
        description: 'Alan Poser is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 2,
      }, {
        id: request_id[2],
        description: 'Johnny Guitar is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 4,
      }, {
        id: request_id[0],
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      }];
      request.getMyRequests(3, function(err, result) {
        test_util.check_request_list(err, result, expected);
        done();
      });
    });

    it('should get the requests for Johnny Guitar', function(done) {
      var expected = [{
        id: request_id[2],
        description: 'Johnny Guitar is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 4,
      }];
      request.getMyRequests(4, function(err, result) {
        test_util.check_request_list(err, result, expected);
        done();
      });
    });

    it('should get the requests for System Admin User', function(done) {
      var expected = [{
        id: request_id[1],
        description: 'Alan Poser is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 2,
      }, {
        id: request_id[2],
        description: 'Johnny Guitar is asking to join Live! Dressed! Girls!',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 4,
      }, {
        id: request_id[0],
        description: 'Wild At Heart is inviting Danny Drums to join',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: 1,
        person_id: 3,
      }];
      request.getMyRequests(1, function(err, result) {
        test_util.check_request_list(err, result, expected);
        done();
      });
    });
  });
});
