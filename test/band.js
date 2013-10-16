var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('band_table', function() {
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    dbh = new db.Handle()
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    dbh.doSqlExec([sql], done);
  });

  var band;
  it('should get the band object', function(done) {
    band = dbh.band();
    should.exist(band);
    done();
  });

  var band_id;
  it('should create the band', function(done) {
    band.create({name: 'Looney Tunes'}, function(result) {
      should.exist(result);
      should.exist(result.band_id);
      should.not.exist(result.err);
      band_id = result.band_id;
      done();
    });
  });

  it('should get the band', function(done) {
    band.getById(band_id, function(result) {
      should.exist(result);
      should.exist(result.band);
      result.band.id.should.eql(band_id);
      result.band.name.should.eql('Looney Tunes');
      done();
    });
  });

  it('should delete the band', function(done) {
    band.deleteById(band_id, function(result) {
      should.exist(result);
      should.exist(result.band);
      result.band.should.eql(1);
      done();
    });
  });

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the bands', function(done) {
    band.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_bands);
      result.all_bands.should.eql([{
	id: 1, name: 'band1',
      }, {
	id: 2, name: 'band2',
      }, {
	id: 3, name: 'band3',
      }, {
	id: 4, name: 'band4',
      }]);
      done();
    });
  });
});
