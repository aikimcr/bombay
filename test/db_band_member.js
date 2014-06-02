var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('band_member_table', function() {
  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var band_member;
    it('should get the band_member object', function(done) {
      band_member = dbh.band_member();
      should.exist(band_member);
      done();
    });

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should get all the band_members', function(done) {
      var expected = [{
	id: 1, band_id: 1, person_id: 1, band_admin: false
      }, {
	id: 5, band_id: 1, person_id: 3, band_admin: false
      }, {
	id: 2, band_id: 2, person_id: 1, band_admin: true
      }, {
	id: 3, band_id: 3, person_id: 2, band_admin: false
      }, {
	id: 6, band_id: 3, person_id: 5, band_admin: true
      }, {
	id: 4, band_id: 4, person_id: 2, band_admin: true
      }];
      band_member.getAll(function(result) {
        test_util.check_list(result, expected, 'all_band_members', ['id', 'band_id', 'person_id', 'band_admin']);
        done();
      });
    });
  });

  describe('#CreateAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var band_member;
    it('should get the band_member object', function(done) {
      band_member = dbh.band_member();
      should.exist(band_member);
      done();
    });

    var band_member_id;
    var other_band_member_id;
    it('should return an error message', function(done) {
      var data = {
        person_id: 1,
        band_admin: true
      };
      band_member.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Band Member Create missing key(s): band_id');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
        band_admin: true
      };
      band_member.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Band Member Create missing key(s): person_id,band_id');
        done();
      });
    });

    it('should create the band_member', function(done) {
      var data = {
        band_id: 1,
        person_id: 1,
        band_admin: true
      };
      band_member.create(data, function(result) {
        band_member_id = test_util.check_result(result, 'band_member_id');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
        band_id: 1,
        person_id: 1,
        band_admin: false
      };
      band_member.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Band Member \'admin\' in \'Wild At Heart\' already exists');
        done();
      });
    });

    it('should create another band_member', function(done) {
      var data = {
        band_id: 2,
        person_id: 1,
        band_admin: false
      };
      band_member.create(data, function(result) {
        other_band_member_id = test_util.check_result(result, 'band_member_id');
        done();
      });
    });

    it('should create another band_member', function(done) {
      var data = {
        band_id: 1,
        person_id: 2,
        band_admin: false
      };
      band_member.create(data, function(result) {
        other_band_member_id = test_util.check_result(result, 'band_member_id');
        done();
      });
    });

    it('should get the first band_member', function(done) {
      var expected = {
        id: band_member_id,
        band_id: 1,
        person_id: 1,
        band_admin: true
      };
      band_member.getById(band_member_id, function(result) {
        test_util.check_item(
          result, expected, 'band_member',
          ['id', 'band_id', 'person_id', 'band_admin']
        );
        done();
      });
    });

    it('should update the band_member', function(done) {
      band_member.update({id: band_member_id, band_admin: false}, function(result) {
        test_util.check_result(result, 'band_member');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
        id: other_band_member_id,
        band_id: 1,
        person_id: 1
      };
      band_member.update(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Band Member \'admin\' in \'Wild At Heart\' already exists');
        done();
      });
    });

    it('should get the band_member again', function(done) {
      var expected = {
        id: band_member_id,
        band_id: 1,
        person_id: 1,
        band_admin: false
      };
      band_member.getById(band_member_id, function(result) {
        test_util.check_item(
          result, expected, 'band_member',
          ['id', 'band_id', 'person_id', 'band_admin']
        );
        done();
      });
    });

    it('should delete the band_member', function(done) {
      band_member.deleteById(band_member_id, function(result) {
        should.exist(result);
        should.exist(result.band_member);
        result.band_member.should.eql(3);
        done();
      });
    });
  });
});
