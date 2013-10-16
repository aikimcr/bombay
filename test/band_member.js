var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('band_member_table', function() {
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
  it('should create the band_member', function(done) {
    band_member.create({
      band_id: 1,
      person_id: 1,
      band_admin: true,
    }, function(result) {
      should.exist(result);
      should.exist(result.band_member_id);
      should.not.exist(result.err);
      band_member_id = result.band_member_id;
      done();
    });
  });

  it('should get the band_member', function(done) {
    band_member.getById(band_member_id, function(result) {
      should.exist(result);
      should.exist(result.band_member);
      result.band_member.id.should.eql(band_member_id);
      result.band_member.band_id.should.eql(1);
      result.band_member.person_id.should.eql(1);
      result.band_member.band_admin.should.eql(true);
      done();
    });
  });

  it('should delete the band_member', function(done) {
    band_member.deleteById(band_member_id, function(result) {
      should.exist(result);
      should.exist(result.band_member);
      result.band_member.should.eql(1);
      done();
    });
  });

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the band_members', function(done) {
    band_member.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_band_members);
      result.all_band_members.should.eql([{
	id: 1, band_id: 1, person_id: 1, band_admin: false
      }, {
	id: 5, band_id: 1, person_id: 3, band_admin: false
      }, {
	id: 2, band_id: 2, person_id: 1, band_admin: true
      }, {
	id: 3, band_id: 3, person_id: 2, band_admin: false
      }, {
	id: 4, band_id: 4, person_id: 2, band_admin: true
      }]);
      done();
    });
  });
});
